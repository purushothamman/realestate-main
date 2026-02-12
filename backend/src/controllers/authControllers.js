// backend/src/controllers/authControllers.js
const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { OAuth2Client } = require('google-auth-library');
const { getRequestMetadata, getDeviceType, getBrowser, getOS } = require("../utils/requestUtils");
const {  sendPasswordResetOTP, sendPasswordChangedNotification } = require('../services/emailService');

// generate 6 digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// send OTP via email (implement actual email service later)
const sendOTP = async (email, phone, otp, purpose = "verification") => {
    console.log(`OTP for ${email || phone}: ${otp} (Purpose: ${purpose})`);
    // TODO: Implement actual email service (SendGrid, AWS SES, etc.)
    return true;
};

// Send email notification (implement actual email service later)
const sendEmailNotification = async (email, subject, message) => {
    try {
        // Implement your email sending logic here
        // Example using nodemailer or your preferred email service
        console.log(`Sending email to ${email}: ${subject}`);
        
        // Example implementation:
        // const mailOptions = {
        //     from: process.env.EMAIL_FROM,
        //     to: email,
        //     subject: subject,
        //     html: `<p>${message}</p>`
        // };
        // await transporter.sendMail(mailOptions);
        
    } catch (error) {
        console.error('Error sending email notification:', error);
    }
};

// const getRequestMetadata = (req) => {
//     return {
//         ipAddress: req.ip || req.connection.remoteAddress || 'Unknown',
//         userAgent: req.get('user-agent') || 'Unknown'
//     };
// };

// Helper function to log user activity
const logUserActivity = async (userId, activityType, ipAddress, userAgent, description = null, loginMethod = 'email') => {
    try {
        const deviceType = getDeviceType(userAgent);
        const browser = getBrowser(userAgent);
        const os = getOS(userAgent);

        await pool.query(
            `INSERT INTO user_login_logs 
            (user_id, login_time, login_method, ip_address, user_agent, device_type, browser, os, activity_type, description) 
            VALUES (?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, loginMethod, ipAddress, userAgent, deviceType, browser, os, activityType, description]
        );
    } catch (err) {
        console.error("Activity logging error:", err);
    }
};

// Helper function to check for suspicious activity
const checkSuspiciousActivity = async (userId, ipAddress) => {
    try {
        // Check failed login attempts in last 15 minutes
        const [recentFailures] = await pool.query(
            `SELECT COUNT(*) as count FROM user_login_logs 
            WHERE user_id = ? 
            AND activity_type = 'failed_login' 
            AND login_time > DATE_SUB(NOW(), INTERVAL 15 MINUTE)`,
            [userId]
        );

        // Check login from new IP
        const [knownIPs] = await pool.query(
            `SELECT COUNT(*) as count FROM user_login_logs 
            WHERE user_id = ? 
            AND ip_address = ? 
            AND activity_type = 'login' 
            AND login_time > DATE_SUB(NOW(), INTERVAL 30 DAY)`,
            [userId, ipAddress]
        );

        const isSuspicious = recentFailures[0].count >= 3 || knownIPs[0].count === 0;

        return {
            isSuspicious,
            reason: recentFailures[0].count >= 3 
                ? 'Multiple failed login attempts' 
                : knownIPs[0].count === 0 
                    ? 'Login from new IP address' 
                    : null
        };
    } catch (error) {
        console.error('Error checking suspicious activity:', error);
        return { isSuspicious: false };
    }
};

// Validate role
const validateRole = (role) => {
    const validRoles = ['buyer', 'builder', 'agent', 'admin'];
    return validRoles.includes(role.toLowerCase());
};

module.exports.verifyToken = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1] || req.body.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No token provided"
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch fresh user data
        const [users] = await pool.query(
            "SELECT id, name, email, phone, role, is_blocked, is_verified FROM users WHERE id = ?",
            [decoded.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const user = users[0];

        // Check if blocked
        if (user.is_blocked) {
            return res.status(403).json({
                success: false,
                message: "Account has been blocked"
            });
        }

        // Verify role matches token
        if (user.role.toLowerCase() !== decoded.role.toLowerCase()) {
            return res.status(403).json({
                success: false,
                message: "Role mismatch. Please login again."
            });
        }

        res.status(200).json({
            success: true,
            message: "Token is valid",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role.toLowerCase(),
                isVerified: user.is_verified
            }
        });

    } catch (err) {
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: "Invalid token"
            });
        }
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: "Token has expired"
            });
        }

        console.error("Token verification error:", err);
        res.status(500).json({
            success: false,
            message: "Server error during token verification"
        });
    }
};

// Helper function to check if account should be locked
// const checkAccountLockout = async (userId) => {
//     try {
//         const [attempts] = await pool.query(
//             `SELECT COUNT(*) as count FROM user_login_logs 
//              WHERE user_id = ? 
//              AND activity_type = 'failed_login' 
//              AND login_time > DATE_SUB(NOW(), INTERVAL 30 MINUTE)`,
//             [userId]
//         );

//         if (attempts[0].count >= 5) {
//             // Lock account temporarily
//             await pool.query(
//                 "UPDATE users SET account_locked_until = DATE_ADD(NOW(), INTERVAL 30 MINUTE) WHERE id = ?",
//                 [userId]
//             );
//             return true;
//         }
//         return false;
//     } catch (err) {
//         console.error("Account lockout check error:", err);
//         return false;
//     }
// };

// GOOGLE OAUTH LOGIN
module.exports.googleLogin = async (req, res) => {
    try {
        const { token: googleIdToken } = req.body;
        const { ipAddress, userAgent } = getRequestMetadata(req);

        if (!googleIdToken) {
            return res.status(400).json({
                success: false,
                message: "Google ID token is required"
            });
        }

        // Verify Google token (implement OAuth2Client verification)
        const { OAuth2Client } = require('google-auth-library');
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

        let googleUser;
        try {
            const ticket = await client.verifyIdToken({
                idToken: googleIdToken,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            googleUser = ticket.getPayload();
        } catch (verifyError) {
            console.error('Google token verification failed:', verifyError);
            return res.status(401).json({
                success: false,
                message: "Invalid Google token"
            });
        }

        const { email, name, picture, sub: googleId } = googleUser;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email not provided by Google"
            });
        }

        // Find or create user
        let [users] = await pool.query(
            "SELECT * FROM users WHERE email = ? OR google_id = ?",
            [email.toLowerCase(), googleId]
        );

        let user;
        let isNewUser = false;

        if (users.length === 0) {
            // Create new user
            const defaultRole = 'buyer'; // Default role for Google sign-ups
            
            const [result] = await pool.query(
                `INSERT INTO users 
                (email, name, google_id, profile_image, role, is_verified, created_at) 
                VALUES (?, ?, ?, ?, ?, 1, NOW())`,
                [email.toLowerCase(), name, googleId, picture, defaultRole]
            );

            // Fetch the newly created user
            [users] = await pool.query("SELECT * FROM users WHERE id = ?", [result.insertId]);
            user = users[0];
            isNewUser = true;

            await logUserActivity(user.id, 'google_signup', ipAddress, userAgent, 
                'New user registered via Google', 'google');
        } else {
            user = users[0];

            // Update Google ID and profile image if not set
            if (!user.google_id || user.google_id !== googleId) {
                await pool.query(
                    "UPDATE users SET google_id = ?, profile_image = ? WHERE id = ?",
                    [googleId, picture, user.id]
                );
                user.google_id = googleId;
                user.profile_image = picture;
            }
        }

        // Validate user role
        if (!validateRole(user.role)) {
            console.error(`Invalid role detected for user ${user.id}: ${user.role}`);
            return res.status(500).json({
                success: false,
                message: "Account configuration error. Please contact support."
            });
        }

        // Check if account is blocked
        if (user.is_blocked) {
            await logUserActivity(user.id, 'blocked_login_attempt', ipAddress, userAgent, 
                'Blocked user attempted Google login', 'google');

            return res.status(403).json({
                success: false,
                message: "Your account has been blocked. Please contact support."
            });
        }

        // Check for suspicious activity (only for existing users)
        if (!isNewUser) {
            const suspiciousCheck = await checkSuspiciousActivity(user.id, ipAddress);
            if (suspiciousCheck.isSuspicious) {
                await sendEmailNotification(
                    user.email,
                    'Suspicious Login Activity Detected',
                    `We detected unusual login activity on your account via Google from IP: ${ipAddress}`
                );
            }
        }

        // Fetch builder details if applicable
        let builderDetails = {};
        if (user.role === 'builder') {
            const [builder] = await pool.query(
                "SELECT * FROM builder WHERE user_id = ?",
                [user.id]
            );
            if (builder.length > 0) {
                builderDetails = builder[0];
            }
        }

        // Generate JWT token with role
        const tokenPayload = {
            id: user.id,
            role: user.role.toLowerCase(),
            email: user.email,
            iat: Math.floor(Date.now() / 1000)
        };

        const jwtToken = jwt.sign(
            tokenPayload,
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Log successful login
        await logUserActivity(
            user.id,
            isNewUser ? 'google_signup' : 'login',
            ipAddress,
            userAgent,
            isNewUser ? 'User signed up via Google' : 'User logged in successfully via Google',
            'google'
        );

        // Update last login
        await pool.query(
            "UPDATE users SET last_login = NOW() WHERE id = ?",
            [user.id]
        );

        // Prepare user response
        const userResponse = {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone || null,
            role: user.role.toLowerCase(),
            isVerified: user.is_verified || true, // Google users are auto-verified
            profileImage: user.profile_image || picture,
            lastLogin: new Date().toISOString()
        };

        // Add builder specific fields
        if (user.role === 'builder' && builderDetails.id) {
            userResponse.companyName = builderDetails.company_name;
            userResponse.gstNo = builderDetails.gst_no;
            userResponse.panNo = builderDetails.pan_no;
            userResponse.website = builderDetails.website;
            userResponse.verificationStatus = builderDetails.verification_status;
            userResponse.businessAddress = builderDetails.address;
            userResponse.city = builderDetails.city;
            userResponse.state = builderDetails.state;
            userResponse.pincode = builderDetails.pincode;
            userResponse.experienceYears = builderDetails.experience_years;
        }

        res.status(200).json({
            success: true,
            message: isNewUser ? "Account created successfully" : "Login successful",
            token: jwtToken,
            user: userResponse,
            isNewUser
        });

    } catch (err) {
        console.error("Google login error:", err);
        res.status(500).json({
            success: false,
            message: "Server error during Google login. Please try again.",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// MICROSOFT OAUTH LOGIN
module.exports.microsoftLogin = async (req, res) => {
    try {
        const { token } = req.body;
        const { ipAddress, userAgent } = getRequestMetadata(req);

        if (!token) {
            return res.status(400).json({
                message: "Microsoft token is required"
            });
        }

        // Fetch user info from Microsoft Graph API
        const axios = require('axios');
        const response = await axios.get('https://graph.microsoft.com/v1.0/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const { id: microsoftId, displayName, mail, userPrincipalName } = response.data;
        const email = mail || userPrincipalName;

        if (!email) {
            return res.status(400).json({
                message: "Could not retrieve email from Microsoft account"
            });
        }

        // Check if user exists
        const [users] = await pool.query(
            "SELECT * FROM users WHERE email = ?",
            [email.toLowerCase().trim()]
        );

        let user;
        let isNewUser = false;

        if (users.length > 0) {
            user = users[0];
        } else {
            // Create new user
            isNewUser = true;
            const [result] = await pool.query(
                `INSERT INTO users (name, email, role, is_verified, created_at) 
                 VALUES (?, ?, 'buyer', true, NOW())`,
                [displayName, email.toLowerCase().trim()]
            );

            user = {
                id: result.insertId,
                name: displayName,
                email: email.toLowerCase().trim(),
                role: 'buyer',
                is_verified: true,
                is_blocked: false
            };
        }

        // Check if account is blocked
        if (user.is_blocked) {
            await logUserActivity(user.id, 'blocked_login_attempt', ipAddress, userAgent, 'Blocked user attempted login', 'microsoft');
            return res.status(403).json({
                message: "Your account has been blocked. Please contact support."
            });
        }

        // Check for suspicious activity
        const suspiciousCheck = await checkSuspiciousActivity(user.id, ipAddress);
        if (suspiciousCheck.isSuspicious) {
            await sendEmailNotification(
                user.email,
                'Suspicious Login Activity Detected',
                `We detected unusual login activity on your account from IP: ${ipAddress}`
            );
        }

        // Generate JWT token
        const jwtToken = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Log successful login
        await logUserActivity(
            user.id,
            isNewUser ? 'registration' : 'login',
            ipAddress,
            userAgent,
            isNewUser ? 'New user registered via Microsoft' : 'User logged in via Microsoft',
            'microsoft'
        );

        // Update last login
        await pool.query(
            "UPDATE users SET updated_at = NOW() WHERE id = ?",
            [user.id]
        );

        res.json({
            message: isNewUser ? "Account created successfully via Microsoft" : "Login successful via Microsoft",
            token: jwtToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                isVerified: true
            }
        });

    } catch (err) {
        console.error("Microsoft login error:", err);
        res.status(500).json({
            message: "Server error during Microsoft login. Please try again.",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// REGULAR REGISTER 
module.exports.register = async (req, res) => {
    // Get a connection from the pool for transaction
    const connection = await pool.getConnection();

    try {
        // Start transaction
        await connection.beginTransaction();

        const {
            // Buyer (User) specific fields
            name,
            email,
            phone,
            password,
            role,
            profileImage,
            // Builder specific fields
            companyName,
            gstNo,
            panNo,
            registrationCertificate,
            website,
            description,
            experienceYears,
            totalProjects,
            address,
            city,
            state,
            pincode,
            // Agent specific fields
            licenseNumber,
            licenseIssuingAuthority,
            licenseState,
            licenseExpiryDate,
            licenseDocumentUrl,
            officeAddress,
            officeAddressCity,
            officeAddressState,
            officeAddressCountry,
            serviceRadiusKm
        } = req.body;

        const { ipAddress, userAgent } = getRequestMetadata(req);

        // Validate required fields
        if (!name || !email || !phone || !password || !role) {
            await connection.rollback();
            connection.release();
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        // Validate role
        const allowedRoles = ["buyer", "builder", "agent"];
        if (!allowedRoles.includes(role)) {
            await connection.rollback();
            connection.release();
            return res.status(400).json({
                message: "Invalid role selected. Must be buyer, builder, or agent"
            });
        }

        // Additional validation for builder
        if (role === "builder") {
            if (!companyName) {
                await connection.rollback();
                connection.release();
                return res.status(400).json({
                    message: "Company name is required for builder registration"
                });
            }
            if (!gstNo) {
                await connection.rollback();
                connection.release();
                return res.status(400).json({
                    message: "GST number is required for builder registration"
                });
            }
            if (!panNo) {
                await connection.rollback();
                connection.release();
                return res.status(400).json({
                    message: "PAN number is required for builder registration"
                });
            }
            const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
            if (!gstRegex.test(gstNo.trim())) {
                await connection.rollback();
                connection.release();
                return res.status(400).json({
                    message: "Invalid GST number format"
                });
            }
            const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
            if (!panRegex.test(panNo.trim())) {
                await connection.rollback();
                connection.release();
                return res.status(400).json({
                    message: "Invalid PAN number format"
                });
            }
        }

        // Additional validation for agent
        if (role === "agent") {
            if (!licenseNumber) {
                await connection.rollback();
                connection.release();
                return res.status(400).json({
                    message: "License number is required for agent registration"
                });
            }
            if (!licenseIssuingAuthority) {
                await connection.rollback();
                connection.release();
                return res.status(400).json({
                    message: "License issuing authority is required for agent registration"
                });
            }
            if (!licenseState) {
                await connection.rollback();
                connection.release();
                return res.status(400).json({
                    message: "License state is required for agent registration"
                });
            }
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            await connection.rollback();
            connection.release();
            return res.status(400).json({
                message: "Invalid email format"
            });
        }

        // Validate phone format (10-15 digits)
        const phoneRegex = /^[0-9]{10,15}$/;
        if (!phoneRegex.test(phone)) {
            await connection.rollback();
            connection.release();
            return res.status(400).json({
                message: "Phone number must be 10-15 digits"
            });
        }

        // Validate password strength
        if (password.length < 8) {
            await connection.rollback();
            connection.release();
            return res.status(400).json({
                message: "Password must be at least 8 characters long"
            });
        }
        if (!/[a-zA-Z]/.test(password)) {
            await connection.rollback();
            connection.release();
            return res.status(400).json({
                message: "Password must contain at least one letter"
            });
        }
        if (!/[0-9]/.test(password)) {
            await connection.rollback();
            connection.release();
            return res.status(400).json({
                message: "Password must contain at least one number"
            });
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            await connection.rollback();
            connection.release();
            return res.status(400).json({
                message: "Password must contain at least one special character"
            });
        }

        // Check if email already exists in users table
        const [existing] = await connection.query(
            "SELECT id FROM users WHERE email = ?",
            [email.toLowerCase().trim()]
        );

        if (existing.length > 0) {
            await connection.rollback();
            connection.release();
            return res.status(409).json({
                message: "This email is already registered. Please login instead.",
            });
        }

        // Check if phone already exists in users table
        const [existingPhone] = await connection.query(
            "SELECT id FROM users WHERE phone = ?",
            [phone]
        );

        if (existingPhone.length > 0) {
            await connection.rollback();
            connection.release();
            return res.status(409).json({
                message: "This phone number is already registered.",
            });
        }

        // For builders, check if GST or PAN already exists
        if (role === "builder") {
            const [existingGst] = await connection.query(
                "SELECT user_id FROM builders WHERE gst_no = ?",
                [gstNo.trim()]
            );

            if (existingGst.length > 0) {
                await connection.rollback();
                connection.release();
                return res.status(409).json({
                    message: "This GST number is already registered."
                });
            }

            const [existingPan] = await connection.query(
                "SELECT user_id FROM builders WHERE pan_no = ?",
                [panNo.trim()]
            );

            if (existingPan.length > 0) {
                await connection.rollback();
                connection.release();
                return res.status(409).json({
                    message: "This PAN number is already registered."
                });
            }
        }

        // For agents, check if license number already exists
        if (role === "agent") {
            const [existingLicense] = await connection.query(
                "SELECT id FROM agent WHERE license_number = ?",
                [licenseNumber.trim()]
            );

            if (existingLicense.length > 0) {
                await connection.rollback();
                connection.release();
                return res.status(409).json({
                    message: "This license number is already registered."
                });
            }
        }

        console.log("Register payload:", {
            name,
            email,
            phone,
            role,
            profileImage,
            companyName: role === 'builder' ? companyName : 'N/A',
            website: role === 'builder' ? website : null,
            registrationCertificate: role === 'builder' ? registrationCertificate : null,
            experienceYears: role === 'builder' ? experienceYears : null,
            address: role === 'builder' ? address : null,
            city: role === 'builder' ? city : null,
            state: role === 'builder' ? state : null,
            pincode: role === 'builder' ? pincode : null,
            description: role === 'builder' ? description : null,
            gstNo: role === 'builder' ? gstNo : 'N/A',
            panNo: role === 'builder' ? panNo : 'N/A',
            totalProjects: role === 'builder' ? totalProjects : null,
            licenseNumber: role === 'agent' ? licenseNumber : 'N/A',
            licenseIssuingAuthority: role === 'agent' ? licenseIssuingAuthority : null,
            licenseState: role === 'agent' ? licenseState : null,
            licenseExpiryDate: role === 'agent' ? licenseExpiryDate : null,
            officeAddress: role === 'agent' ? officeAddress : null,
            serviceRadiusKm: role === 'agent' ? serviceRadiusKm : null
        });

        // Hash password
        const hashed = await bcrypt.hash(password, 12);

        let userId;

        // Insert into users table first
        const [result] = await connection.query(
            "INSERT INTO users (name, email, phone, password, role, is_verified, created_at) VALUES (?,?,?,?,?, false, NOW())",
            [name.trim(), email.toLowerCase().trim(), phone, hashed, role]
        );
        userId = result.insertId;

        // If builder role, also insert into builder table
        if (role === "builder") {
            const parsedExperienceYears = experienceYears ? parseInt(experienceYears, 10) : null;
            const parsedTotalProjects = totalProjects ? parseInt(totalProjects, 10) : null;

            // Validate parsed numbers
            if (experienceYears && (isNaN(parsedExperienceYears) || parsedExperienceYears < 0)) {
                await connection.rollback();
                connection.release();
                return res.status(400).json({
                    message: "Experience years must be a valid positive number"
                });
            }

            if (totalProjects && (isNaN(parsedTotalProjects) || parsedTotalProjects < 0)) {
                await connection.rollback();
                connection.release();
                return res.status(400).json({
                    message: "Total projects must be a valid positive number"
                });
            }

            await connection.query(
                `INSERT INTO builders (
                    user_id, name, email, phone, password, profile_image,
                    company_name, gst_no, pan_no, website,
                    registration_certificate, description,
                    experience_years, total_projects,
                    address, city, state, pincode
                 ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    userId,
                    name?.trim() || null,
                    email?.toLowerCase().trim() || null,
                    phone?.trim() || null,
                    hashed,
                    profileImage?.trim() || null,
                    companyName?.trim() || null,
                    gstNo?.trim() || null,
                    panNo?.trim() || null,
                    website?.trim() || null,
                    registrationCertificate?.trim() || null,
                    description?.trim() || null,
                    parsedExperienceYears,
                    parsedTotalProjects,
                    address?.trim() || null,
                    city?.trim() || null,
                    state?.trim() || null,
                    pincode?.trim() || null
                ]
            );
        }

        // If agent role, also insert into agent table
        if (role === "agent") {
            const parsedYearsOfExperience = experienceYears ? parseInt(experienceYears, 10) : null;
            const parsedServiceRadiusKm = serviceRadiusKm ? parseFloat(serviceRadiusKm) : null;

            // Validate parsed numbers
            if (experienceYears && (isNaN(parsedYearsOfExperience) || parsedYearsOfExperience < 0)) {
                await connection.rollback();
                connection.release();
                return res.status(400).json({
                    message: "Years of experience must be a valid positive number"
                });
            }

            if (serviceRadiusKm && (isNaN(parsedServiceRadiusKm) || parsedServiceRadiusKm < 0)) {
                await connection.rollback();
                connection.release();
                return res.status(400).json({
                    message: "Service radius must be a valid positive number"
                });
            }

            await connection.query(
                `INSERT INTO agent (
                    email, password, name, phone, profile_image,
                    license_number, license_issuing_authority, license_state,
                    license_expiry_date, license_document_url,
                    verification_status, years_of_experience, account_status,
                    office_address, office_address_city, office_address_state,
                    office_address_country, service_radius_km
                 ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    email?.toLowerCase().trim() || null,
                    hashed,
                    name?.trim() || null,
                    phone?.trim() || null,
                    profileImage?.trim() || null,
                    licenseNumber?.trim() || null,
                    licenseIssuingAuthority?.trim() || null,
                    licenseState?.trim() || null,
                    licenseExpiryDate || null,
                    licenseDocumentUrl?.trim() || null,
                    'pending', // Default verification status
                    parsedYearsOfExperience,
                    'active', // Default account status
                    officeAddress?.trim() || null,
                    officeAddressCity?.trim() || null,
                    officeAddressState?.trim() || null,
                    officeAddressCountry?.trim() || null,
                    parsedServiceRadiusKm
                ]
            );
        }

        // Commit transaction
        await connection.commit();
        connection.release();

        // Generate JWT token
        const token = jwt.sign(
            {
                id: userId,
                role: role
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Log registration activity (outside transaction)
        try {
            await logUserActivity(userId, 'registration', ipAddress, userAgent, 'User registered successfully', 'email');
        } catch (logError) {
            console.error('Failed to log user activity:', logError);
            // Don't fail the registration if logging fails
        }

        // Prepare response based on role
        const userResponse = {
            id: userId,
            name: name.trim(),
            email: email.toLowerCase().trim(),
            phone,
            role: role
        };

        // Add builder-specific fields to response
        if (role === "builder") {
            userResponse.companyName = companyName?.trim() || null;
            userResponse.gstNo = gstNo?.trim() || null;
            userResponse.panNo = panNo?.trim() || null;
            userResponse.website = website?.trim() || null;
            userResponse.description = description?.trim() || null;
            userResponse.experienceYears = experienceYears ? parseInt(experienceYears) : null;
            userResponse.totalProjects = totalProjects ? parseInt(totalProjects) : null;
            userResponse.address = address?.trim() || null;
            userResponse.verificationStatus = 'pending';
            userResponse.city = city?.trim() || null;
            userResponse.state = state?.trim() || null;
        }

        // Add agent-specific fields to response
        if (role === "agent") {
            userResponse.licenseNumber = licenseNumber?.trim() || null;
            userResponse.licenseIssuingAuthority = licenseIssuingAuthority?.trim() || null;
            userResponse.licenseState = licenseState?.trim() || null;
            userResponse.licenseExpiryDate = licenseExpiryDate || null;
            userResponse.licenseDocumentUrl = licenseDocumentUrl?.trim() || null;
            userResponse.verificationStatus = 'pending';
            userResponse.accountStatus = 'active';
            userResponse.yearsOfExperience = experienceYears ? parseInt(experienceYears) : null;
            userResponse.officeAddress = officeAddress?.trim() || null;
            userResponse.officeAddressCity = officeAddressCity?.trim() || null;
            userResponse.officeAddressState = officeAddressState?.trim() || null;
            userResponse.officeAddressCountry = officeAddressCountry?.trim() || null;
            userResponse.serviceRadiusKm = serviceRadiusKm ? parseFloat(serviceRadiusKm) : null;
        }

        // Return success response
        let successMessage = "Registration successful";
        if (role === "builder") {
            successMessage = "Builder registration successful. Your account is pending verification.";
        } else if (role === "agent") {
            successMessage = "Agent registration successful. Your account is pending verification.";
        }

        res.status(201).json({
            message: successMessage,
            token,
            user: userResponse
        });

    } catch (err) {
        // Rollback transaction on error
        try {
            await connection.rollback();
            connection.release();
        } catch (rollbackError) {
            console.error('Rollback error:', rollbackError);
        }

        console.error("\n❌ REGISTRATION ERROR");
        console.error("Error Name:", err.name);
        console.error("Error Message:", err.message);
        console.error("Error Code:", err.code);
        console.error("SQL State:", err.sqlState);
        console.error("\nFull Error:", err);
        console.error("\n");

        // Provide detailed error in development mode
        let errorMessage = "Server error during registration. Please try again.";
        let errorDetails = undefined;

        if (process.env.NODE_ENV === 'development') {
            errorDetails = {
                name: err.name,
                message: err.message,
                code: err.code,
                sqlState: err.sqlState,
                sql: err.sql
            };

            // Provide helpful hints for common errors
            if (err.code === 'ER_NO_REFERENCED_ROW') {
                errorMessage = "Database reference error. Please check if all required tables exist.";
            } else if (err.code === 'ER_BAD_FIELD_ERROR' || err.code === 'ER_NO_SUCH_TABLE') {
                errorMessage = "Database table or column not found. Please check your database schema.";
            } else if (err.code === 'ER_DUP_ENTRY') {
                errorMessage = "Duplicate entry. Email, phone, or license number may already be registered.";
            } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
                errorMessage = "Database access denied. Check your credentials.";
            } else if (err.code === 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD') {
                errorMessage = "Invalid data type. Please check that numeric fields contain only numbers.";
            }
        }

        res.status(500).json({
            message: errorMessage,
            error: errorDetails
        });
    }
};

// REGULAR LOGIN
module.exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const { ipAddress, userAgent } = getRequestMetadata(req);

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // Find user by email or phone
        const [users] = await pool.query(
            "SELECT * FROM users WHERE email = ? OR phone = ?",
            [email.toLowerCase().trim(), email]
        );

        if (users.length === 0) {
            // Log failed login attempt for unknown user
            await pool.query(
                `INSERT INTO user_login_logs 
                (login_time, ip_address, user_agent, activity_type, description) 
                VALUES (NOW(), ?, ?, 'failed_login', ?)`,
                [ipAddress, userAgent, `Failed login attempt for unknown email: ${email}`]
            );

            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const user = users[0];

        // Validate user role
        if (!validateRole(user.role)) {
            console.error(`Invalid role detected for user ${user.id}: ${user.role}`);
            return res.status(500).json({
                success: false,
                message: "Account configuration error. Please contact support."
            });
        }

        // Check if account is blocked
        if (user.is_blocked) {
            await logUserActivity(user.id, 'blocked_login_attempt', ipAddress, userAgent, 
                'Blocked user attempted login', 'email');

            return res.status(403).json({
                success: false,
                message: "Your account has been blocked. Please contact support."
            });
        }

        // Verify password
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            // Log failed login attempt
            await logUserActivity(user.id, 'failed_login', ipAddress, userAgent, 
                'Invalid password', 'email');

            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // Check for suspicious activity
        const suspiciousCheck = await checkSuspiciousActivity(user.id, ipAddress);
        if (suspiciousCheck.isSuspicious) {
            await sendEmailNotification(
                user.email,
                'Suspicious Login Activity Detected',
                `We detected unusual login activity on your account from IP: ${ipAddress}. Reason: ${suspiciousCheck.reason}`
            );
        }

        // Fetch builder details if applicable
        let builderDetails = {};
        if (user.role === 'builder') {
            const [builder] = await pool.query(
                "SELECT * FROM builders WHERE user_id = ?",
                [user.id]
            );
            if (builder.length > 0) {
                builderDetails = builder[0];
            }
        }

        // Generate JWT token with role included in payload
        const tokenPayload = {
            id: user.id,
            role: user.role.toLowerCase(), // Normalize to lowercase
            email: user.email,
            iat: Math.floor(Date.now() / 1000)
        };

        const token = jwt.sign(
            tokenPayload,
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Log successful login
        try {
            await logUserActivity(
                user.id,
                'login',
                ipAddress,
                userAgent,
                'User logged in successfully via email/password',
                'email'
            );
        } catch (logError) {
            console.error("Failed to log user activity:", logError);
            // Continue execution - don't fail login due to logging error
        }



        // Prepare user response object
        const userResponse = {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role.toLowerCase(), // Normalize role
            isVerified: user.is_verified || false,
            profileImage: user.profile_image || null,
            lastLogin: new Date().toISOString()
        };

        // Add builder specific fields
        if (user.role === 'builder' && builderDetails.id) {
            userResponse.companyName = builderDetails.company_name;
            userResponse.gstNo = builderDetails.gst_no;
            userResponse.panNo = builderDetails.pan_no;
            userResponse.website = builderDetails.website;
            userResponse.verificationStatus = builderDetails.verification_status;
            userResponse.businessAddress = builderDetails.address;
            userResponse.city = builderDetails.city;
            userResponse.state = builderDetails.state;
            userResponse.pincode = builderDetails.pincode;
            userResponse.experienceYears = builderDetails.experience_years;
        }

        // Return success response
        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: userResponse
        });

    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({
            success: false,
            message: "Server error during login. Please try again.",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// LOGOUT
module.exports.logout = async (req, res) => {
    try {
        const { ipAddress, userAgent } = getRequestMetadata(req);

        if (req.user && req.user.id) {
            // Update the most recent login session with logout time
            await pool.query(
                "UPDATE user_login_logs SET logout_time = NOW() WHERE user_id = ? AND logout_time IS NULL ORDER BY login_time DESC LIMIT 1",
                [req.user.id]
            );

            // Log logout activity
            await logUserActivity(req.user.id, 'logout', ipAddress, userAgent, 'User logged out', 'email');
        }

        res.json({ message: "Logout successful" });
    } catch (err) {
        console.error("Logout error:", err);
        res.status(500).json({ message: "Server error during logout" });
    }
};

// GET PROFILE
module.exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch basic user info
        const [users] = await pool.query(
            "SELECT id, name, email, phone, role, is_verified FROM users WHERE id = ?",
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = users[0];

        // Fetch builder details if applicable
        let builderDetails = {};
        if (user.role === 'builder') {
            const [builder] = await pool.query(
                "SELECT * FROM builders WHERE user_id = ?",
                [userId]
            );
            if (builder.length > 0) {
                builderDetails = builder[0];
            }
        }

        // Prepare user response object
        const userResponse = {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            isVerified: user.is_verified,
            // profileImage: user.profile_image
        };

        // Add builder specific fields
        if (user.role === 'builder' && builderDetails.id) {
            userResponse.companyName = builderDetails.company_name;
            userResponse.gstNo = builderDetails.gst_no;
            userResponse.panNo = builderDetails.pan_no;
            userResponse.website = builderDetails.website;
            userResponse.description = builderDetails.description;
            userResponse.verificationStatus = builderDetails.verification_status;
            userResponse.address = builderDetails.address;
            userResponse.totalProjects = builderDetails.total_projects;
            userResponse.city = builderDetails.city;
            userResponse.state = builderDetails.state;
            userResponse.pincode = builderDetails.pincode;
            userResponse.experienceYears = builderDetails.experience_years;
        }

        res.json(userResponse);

    } catch (err) {
        console.error("Get Profile error:", err);
        res.status(500).json({
            message: "Server error fetching profile",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// OTP VERIFICATION
module.exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp, purpose = "email_verification" } = req.body;
        const { ipAddress, userAgent } = getRequestMetadata(req);

        // Validate required fields
        if (!email || !otp) {
            return res.status(400).json({
                message: "Email and OTP are required"
            });
        }

        // Find the most recent OTP for this email and purpose
        const [otpRecords] = await pool.query(
            `SELECT ov.*, u.id as user_id, u.name, u.email, u.phone, u.role, u.is_verified
             FROM otp_verifications ov
             JOIN users u ON ov.user_id = u.id
             WHERE ov.email = ? AND ov.purpose = ? AND ov.is_used = false
             ORDER BY ov.created_at DESC
             LIMIT 1`,
            [email.toLowerCase().trim(), purpose]
        );

        if (otpRecords.length === 0) {
            return res.status(400).json({
                message: "Invalid or expired OTP"
            });
        }

        const otpRecord = otpRecords[0];

        // Check if OTP has expired
        if (new Date() > new Date(otpRecord.expires_at)) {
            return res.status(400).json({
                message: "OTP has expired. Please request a new one."
            });
        }

        // Verify OTP
        if (otpRecord.otp !== otp) {
            // Increment attempt count
            await pool.query(
                "UPDATE otp_verifications SET attempts = attempts + 1 WHERE id = ?",
                [otpRecord.id]
            );

            // Log failed OTP verification
            await logUserActivity(otpRecord.user_id, 'failed_otp_verification', ipAddress, userAgent, `Failed OTP verification for ${purpose}`, 'email');

            return res.status(400).json({
                message: "Invalid OTP. Please try again."
            });
        }

        // Mark OTP as used
        await pool.query(
            "UPDATE otp_verifications SET is_used = true, verified_at = NOW() WHERE id = ?",
            [otpRecord.id]
        );

        // Update user verification status
        await pool.query(
            "UPDATE users SET is_verified = true, email_verified_at = NOW() WHERE id = ?",
            [otpRecord.user_id]
        );

        // Log successful verification
        await logUserActivity(otpRecord.user_id, 'email_verification', ipAddress, userAgent, 'Email verified successfully', 'email');

        // Generate JWT token
        const token = jwt.sign(
            { id: otpRecord.user_id, role: otpRecord.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Return success response
        res.json({
            message: "Email verified successfully",
            token,
            user: {
                id: otpRecord.user_id,
                name: otpRecord.name,
                email: otpRecord.email,
                phone: otpRecord.phone,
                role: otpRecord.role,
                // profileImage: otpRecord.profile_image,
                isVerified: true
            }
        });

    } catch (err) {
        console.error("OTP verification error:", err);
        res.status(500).json({
            message: "Server error during OTP verification. Please try again.",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// RESEND OTP
module.exports.resendOtp = async (req, res) => {
    try {
        const { email, purpose = "email_verification" } = req.body;
        const { ipAddress, userAgent } = getRequestMetadata(req);

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        const [users] = await pool.query(
            "SELECT id, email, phone, is_verified FROM users WHERE email = ?",
            [email.toLowerCase().trim()]
        );

        if (users.length === 0) {
            return res.status(404).json({
                message: "User not found with this email"
            });
        }

        const user = users[0];

        if (purpose === "email_verification" && user.is_verified) {
            return res.status(400).json({
                message: "Email is already verified"
            });
        }

        const [recentOtps] = await pool.query(
            `SELECT COUNT(*) as count FROM otp_verifications 
             WHERE email = ? AND purpose = ? AND created_at > DATE_SUB(NOW(), INTERVAL 5 MINUTE)`,
            [email.toLowerCase().trim(), purpose]
        );

        if (recentOtps[0].count >= 3) {
            return res.status(429).json({
                message: "Too many OTP requests. Please try again after 5 minutes."
            });
        }

        await pool.query(
            "UPDATE otp_verifications SET is_used = true WHERE email = ? AND purpose = ? AND is_used = false",
            [email.toLowerCase().trim(), purpose]
        );

        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await pool.query(
            "INSERT INTO otp_verifications (user_id, email, phone, otp, purpose, expires_at, created_at) VALUES (?,?,?,?,?, ?, NOW())",
            [user.id, email.toLowerCase().trim(), user.phone, otp, purpose, otpExpiry]
        );

        await sendOTP(email, user.phone, otp, purpose);

        // Log OTP resend activity
        await logUserActivity(user.id, 'otp_resend', ipAddress, userAgent, `OTP resent for ${purpose}`, 'email');

        res.json({
            message: "OTP has been resent successfully",
            email: email.toLowerCase().trim()
        });

    } catch (err) {
        console.error("Resend OTP error:", err);
        res.status(500).json({
            message: "Server error while resending OTP. Please try again.",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// FORGOT PASSWORD
module.exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const { ipAddress, userAgent } = getRequestMetadata(req);

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        const [users] = await pool.query(
            "SELECT id, email, phone, name, password FROM users WHERE email = ?",
            [email.toLowerCase().trim()]
        );

        if (users.length === 0) {
            // Log attempt for non-existent user
            await pool.query(
                `INSERT INTO user_login_logs 
                (login_time, ip_address, user_agent, activity_type, description) 
                VALUES (NOW(), ?, ?, 'password_reset_request', ?)`,
                [ipAddress, userAgent, `Password reset requested for non-existent email: ${email}`]
            );

            return res.json({
                message: "If an account exists with this email, you will receive a password reset OTP."
            });
        }

        const user = users[0];

        // User exists, proceed with password reset OTP

        const [recentOtps] = await pool.query(
            `SELECT COUNT(*) as count FROM otp_verifications 
             WHERE email = ? AND purpose = 'password_reset' AND created_at > DATE_SUB(NOW(), INTERVAL 15 MINUTE)`,
            [email.toLowerCase().trim()]
        );

        if (recentOtps[0].count >= 3) {
            return res.status(429).json({
                message: "Too many password reset requests. Please try again after 15 minutes."
            });
        }

        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);

        await pool.query(
            "INSERT INTO otp_verifications (user_id, email, phone, otp, purpose, expires_at, created_at) VALUES (?,?,?,?,?, ?, NOW())",
            [user.id, email.toLowerCase().trim(), user.phone, otp, "password_reset", otpExpiry]
        );

        await sendOTP(email, user.phone, otp, "password_reset");

        // Log password reset request
        await logUserActivity(user.id, 'password_reset_request', ipAddress, userAgent, 'Password reset OTP requested', 'email');

        res.json({
            message: "If an account exists with this email, you will receive a password reset OTP.",
            email: email.toLowerCase().trim()
        });

    } catch (err) {
        console.error("Forgot password error:", err);
        res.status(500).json({
            message: "Server error during password reset request. Please try again.",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

const validatePassword = (password) => {
    const errors = [];
    
    if (!password || password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[a-zA-Z]/.test(password)) {
        errors.push('Password must contain at least one letter');
    }
    
    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

// RESET PASSWORD
module.exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const { ipAddress, userAgent } = getRequestMetadata(req);

        // 1. Validate required fields
        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Email, OTP, and new password are required"
            });
        }

        // 2. Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
        }

        // 3. Validate OTP format (should be 6 digits)
        if (!/^\d{6}$/.test(otp.trim())) {
            return res.status(400).json({
                success: false,
                message: "OTP must be 6 digits"
            });
        }

        // 4. Validate password strength
        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters with letters and numbers",
                errors: passwordValidation.errors
            });
        }

        // 5. Retrieve OTP record from database
        const [otpRecords] = await pool.query(
            `SELECT ov.*, u.id as user_id, u.password as current_password, u.email as user_email
             FROM otp_verifications ov
             JOIN users u ON ov.user_id = u.id
             WHERE ov.email = ? AND ov.purpose = 'password_reset' AND ov.is_used = false
             ORDER BY ov.created_at DESC
             LIMIT 1`,
            [email.toLowerCase().trim()]
        );

        if (otpRecords.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired OTP. Please request a new password reset."
            });
        }

        const otpRecord = otpRecords[0];

        // 6. Check if OTP has expired
        if (new Date() > new Date(otpRecord.expires_at)) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new one."
            });
        }

        // 7. Check if maximum attempts exceeded (optional security feature)
        if (otpRecord.attempts >= 5) {
            return res.status(400).json({
                success: false,
                message: "Maximum OTP attempts exceeded. Please request a new password reset."
            });
        }

        // 8. Verify OTP code
        if (otpRecord.otp !== otp.trim()) {
            // Increment failed attempts
            await pool.query(
                "UPDATE otp_verifications SET attempts = attempts + 1 WHERE id = ?",
                [otpRecord.id]
            );

            // Log failed password reset attempt
            await logUserActivity(
                otpRecord.user_id, 
                'failed_password_reset', 
                ipAddress, 
                userAgent, 
                'Invalid OTP for password reset', 
                'email'
            );

            return res.status(400).json({
                success: false,
                message: "Invalid OTP. Please try again.",
                attemptsRemaining: 5 - (otpRecord.attempts + 1)
            });
        }

        // 9. Check if new password is same as current password
        if (otpRecord.current_password) {
            const isSamePassword = await bcrypt.compare(newPassword, otpRecord.current_password);
            if (isSamePassword) {
                return res.status(400).json({
                    success: false,
                    message: "New password cannot be the same as your current password"
                });
            }
        }

        // 10. Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 11. Update user's password in database
        await pool.query(
            "UPDATE users SET password = ?, password_changed_at = NOW(), updated_at = NOW() WHERE id = ?",
            [hashedPassword, otpRecord.user_id]
        );

        // 12. Mark OTP as used
        await pool.query(
            "UPDATE otp_verifications SET is_used = true, verified_at = NOW() WHERE id = ?",
            [otpRecord.id]
        );

        // 13. Invalidate any other unused OTPs for this user
        await pool.query(
            `UPDATE otp_verifications 
             SET is_used = true 
             WHERE user_id = ? AND is_used = false AND id != ?`,
            [otpRecord.user_id, otpRecord.id]
        );

        // 14. Log successful password reset
        await logUserActivity(
            otpRecord.user_id, 
            'password_reset', 
            ipAddress, 
            userAgent, 
            'Password was reset successfully', 
            'email'
        );

        // 15. Send email notification about password change
        await sendEmailNotification(
            otpRecord.user_email,
            'Password Changed Successfully',
            `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Password Changed Successfully</h2>
                    <p>Hello ${otpRecord.full_name || 'User'},</p>
                    <p>Your password was successfully changed on ${new Date().toLocaleString()}.</p>
                    <p><strong>IP Address:</strong> ${ipAddress}</p>
                    <p><strong>Device:</strong> ${userAgent.substring(0, 50)}...</p>
                    <p>If you did not make this change, please contact our support team immediately.</p>
                    <br>
                    <p>Best regards,<br>RealEstate Pro Team</p>
                </div>
            `
        );

        // 16. Send success response
        res.json({
            success: true,
            message: "Password has been reset successfully. Please login with your new password."
        });

    } catch (err) {
        console.error("Reset password error:", err);
        
        // Log error for debugging
        console.error("Error details:", {
            message: err.message,
            stack: err.stack
        });
        
        res.status(500).json({
            success: false,
            message: "Server error during password reset. Please try again.",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

module.exports.requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        const { ipAddress, userAgent } = getRequestMetadata(req);

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        // Check if user exists
        const [users] = await pool.query(
            "SELECT id, email, full_name FROM users WHERE email = ?",
            [email.toLowerCase().trim()]
        );

        if (users.length === 0) {
            // Don't reveal if email exists or not (security best practice)
            return res.json({
                success: true,
                message: "If an account exists with this email, you will receive a password reset code."
            });
        }

        const user = users[0];

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Store OTP in database
        await pool.query(
            `INSERT INTO otp_verifications (user_id, email, otp, purpose, expires_at, created_at)
             VALUES (?, ?, ?, 'password_reset', ?, NOW())`,
            [user.id, user.email, otp, expiresAt]
        );

        // Send OTP via email
        await sendEmailNotification(
            user.email,
            'Password Reset Code',
            `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Password Reset Request</h2>
                    <p>Hello ${user.full_name || 'User'},</p>
                    <p>You requested to reset your password. Use the code below:</p>
                    <div style="background: #f0f0f0; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
                        ${otp}
                    </div>
                    <p>This code will expire in 10 minutes.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                    <br>
                    <p>Best regards,<br>RealEstate Pro Team</p>
                </div>
            `
        );

        // Log activity
        await logUserActivity(
            user.id,
            'password_reset_requested',
            ipAddress,
            userAgent,
            'Password reset OTP sent',
            'email'
        );

        res.json({
            success: true,
            message: "If an account exists with this email, you will receive a password reset code."
        });

    } catch (err) {
        console.error("Request password reset error:", err);
        res.status(500).json({
            success: false,
            message: "Server error. Please try again."
        });
    }
};
