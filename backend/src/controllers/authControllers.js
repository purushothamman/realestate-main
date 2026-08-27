// backend/src/controllers/authControllers.js
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const fs = require("fs");
const { OAuth2Client } = require('google-auth-library');
const { getRequestMetadata, getDeviceType, getBrowser, getOS } = require("../utils/requestUtils");

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
    console.log(`Email to ${email}: ${subject} - ${message}`);
    // TODO: Implement actual email service
    return true;
};

// Helper function to log activity with device info
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
        // Check for multiple failed login attempts
        const [failedAttempts] = await pool.query(
            `SELECT COUNT(*) as count FROM user_login_logs 
             WHERE user_id = ? 
             AND activity_type = 'failed_login' 
             AND login_time > DATE_SUB(NOW(), INTERVAL 15 MINUTE)`,
            [userId]
        );

        // Check for logins from different IPs in short time
        const [differentIPs] = await pool.query(
            `SELECT COUNT(DISTINCT ip_address) as ip_count 
             FROM user_login_logs 
             WHERE user_id = ? 
             AND login_time > DATE_SUB(NOW(), INTERVAL 1 HOUR)`,
            [userId]
        );

        return {
            isSuspicious: failedAttempts[0].count >= 5 || differentIPs[0].ip_count >= 3,
            failedAttempts: failedAttempts[0].count,
            differentIPs: differentIPs[0].ip_count
        };
    } catch (err) {
        console.error("Suspicious activity check error:", err);
        return { isSuspicious: false, failedAttempts: 0, differentIPs: 0 };
    }
};

// Helper function to check if account should be locked
const checkAccountLockout = async (userId) => {
    try {
        const [attempts] = await pool.query(
            `SELECT COUNT(*) as count FROM user_login_logs 
             WHERE user_id = ? 
             AND activity_type = 'failed_login' 
             AND login_time > DATE_SUB(NOW(), INTERVAL 30 MINUTE)`,
            [userId]
        );

        if (attempts[0].count >= 5) {
            // Lock account temporarily
            await pool.query(
                "UPDATE users SET account_locked_until = DATE_ADD(NOW(), INTERVAL 30 MINUTE) WHERE id = ?",
                [userId]
            );
            return true;
        }
        return false;
    } catch (err) {
        console.error("Account lockout check error:", err);
        return false;
    }
};

// GOOGLE OAUTH LOGIN
// Supports two token types sent from the frontend:
//   id_token  (JWT, signed by Google) — verified with verifyIdToken()     [preferred]
//   access_token (opaque string)       — verified via tokeninfo endpoint   [fallback]
module.exports.googleLogin = async (req, res) => {
    console.log('\n' + '='.repeat(60));
    console.log('🔐 GOOGLE LOGIN REQUEST RECEIVED');
    console.log('='.repeat(60));
    const startTime = Date.now();

    try {
        // token    = id_token (JWT) OR access_token (opaque), sent by frontend
        // isIdToken = hint from frontend: true  → id_token path
        //                                 false → access_token path
        const { token, isIdToken } = req.body;
        const { ipAddress, userAgent } = getRequestMetadata(req);

        console.log(`📋 Token present: ${!!token}, type hint: ${isIdToken ? 'id_token' : 'access_token'}`);

        // ── STEP 1: Basic validation ────────────────────────────────────
        if (!token) {
            return res.status(400).json({ message: 'Google token is required' });
        }
        if (!process.env.GOOGLE_CLIENT_ID) {
            require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
        }
        if (!process.env.GOOGLE_CLIENT_ID) {
            console.error('❌ GOOGLE_CLIENT_ID missing from backend/.env');
            return res.status(500).json({ message: 'Google authentication is not configured on the server.' });
        }
        console.log('✅ GOOGLE_CLIENT_ID found:', process.env.GOOGLE_CLIENT_ID.substring(0, 20) + '...');

        const allowedAudiences = [
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_ANDROID_CLIENT_ID,
        ].filter(Boolean);

        // ── STEP 2: Verify with Google ──────────────────────────────────
        let email, name, picture, googleId;

        if (isIdToken) {
            // PATH A — id_token (JWT): verified cryptographically, fastest
            console.log('STEP 2A: Verifying id_token via google-auth-library...');
            try {
                const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
                const ticket = await client.verifyIdToken({
                    idToken: token,
                    audience: allowedAudiences.length === 1 ? allowedAudiences[0] : allowedAudiences,
                });
                const p = ticket.getPayload();
                if (!p) throw new Error('Empty payload from verifyIdToken');
                ({ email, name, picture, sub: googleId } = { email: p.email, name: p.name, picture: p.picture, sub: p.sub });
                googleId = p.sub;
                console.log('✅ id_token verified, email:', email);
            } catch (e) {
                console.error('❌ id_token verification failed:', e.message);
                if (e.message.includes('audience')) {
                    console.error('   → Audience mismatch: frontend Client ID ≠ GOOGLE_CLIENT_ID in .env');
                }
                return res.status(401).json({
                    message: 'Invalid or expired Google token. Please sign in again.',
                    error: process.env.NODE_ENV === 'development' ? e.message : undefined,
                });
            }
        } else {
            // PATH B — access_token: hit Google REST endpoints to get user info
            console.log('STEP 2B: Verifying access_token via Google tokeninfo + userinfo...');
            try {
                const axios = require('axios');

                // Validate token first
                const { data: tokenInfo } = await axios.get(
                    `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${token}`
                );
                if (tokenInfo.error) {
                    throw new Error(`tokeninfo error: ${tokenInfo.error_description || tokenInfo.error}`);
                }

                // Get full user profile
                const { data: userInfo } = await axios.get(
                    'https://www.googleapis.com/oauth2/v3/userinfo',
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                email = userInfo.email;
                name = userInfo.name;
                picture = userInfo.picture;
                googleId = userInfo.sub;
                console.log('✅ access_token verified via userinfo, email:', email);
            } catch (e) {
                console.error('❌ access_token verification failed:', e.message);
                return res.status(401).json({
                    message: 'Invalid or expired Google token. Please sign in again.',
                    error: process.env.NODE_ENV === 'development' ? e.message : undefined,
                });
            }
        }

        // ── STEP 3: Validate extracted info ────────────────────────────
        if (!email || !googleId) {
            return res.status(400).json({ message: 'Invalid Google account: missing email or user ID.' });
        }

        // ── STEP 4: Lookup / create user in DB ─────────────────────────
        console.log('STEP 4: Checking database for user...');
        const [users] = await pool.query(
            'SELECT * FROM users WHERE email = ?',
            [email.toLowerCase().trim()]
        );

        let user;
        let isNewUser = false;

        if (users.length > 0) {
            user = users[0];
            console.log(`✅ Existing user found — ID: ${user.id}, Role: ${user.role}`);
        } else {
            console.log('🆕 Creating new user...');
            isNewUser = true;
            try {
                const [result] = await pool.query(
                    `INSERT INTO users (name, email, role, is_verified, created_at)
                     VALUES (?, ?, 'buyer', true, NOW())`,
                    [name || email.split('@')[0], email.toLowerCase().trim()]
                );
                user = {
                    id: result.insertId,
                    name: name || email.split('@')[0],
                    email: email.toLowerCase().trim(),
                    role: 'buyer',
                    is_verified: true,
                    is_blocked: false,
                    phone: null,
                };
                console.log(`✅ New user created — ID: ${user.id}`);
            } catch (insertErr) {
                if (insertErr.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ message: 'An account with this email already exists.' });
                }
                throw insertErr;
            }
        }

        // ── STEP 5: Security checks ─────────────────────────────────────
        if (user.is_blocked) {
            await logUserActivity(user.id, 'blocked_login_attempt', ipAddress, userAgent,
                'Blocked user attempted Google login', 'google');
            return res.status(403).json({ message: 'Your account has been blocked. Please contact support.' });
        }

        try {
            const sc = await checkSuspiciousActivity(user.id, ipAddress);
            if (sc.isSuspicious) {
                await sendEmailNotification(user.email, 'Suspicious Login Activity',
                    `Unusual login from IP: ${ipAddress}`);
            }
        } catch (e) { console.warn('⚠️  Suspicious check skipped:', e.message); }

        // ── STEP 6: Issue JWT ────────────────────────────────────────────
        const jwtToken = jwt.sign(
            { id: user.id, role: user.role, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        console.log('✅ JWT token issued (7d expiry)');

        // ── STEP 7: Log activity + update last-login ────────────────────
        await logUserActivity(
            user.id,
            isNewUser ? 'registration' : 'login',
            ipAddress, userAgent,
            isNewUser ? 'New user registered via Google' : 'User logged in via Google',
            'google'
        );
        await pool.query('UPDATE users SET updated_at = NOW() WHERE id = ?', [user.id]);

        // ── STEP 8: Respond ─────────────────────────────────────────────
        const duration = Date.now() - startTime;
        console.log('='.repeat(60));
        console.log(`✅ GOOGLE LOGIN SUCCESS (${duration}ms)`);
        console.log('='.repeat(60) + '\n');

        return res.json({
            message: isNewUser ? 'Account created via Google' : 'Login successful via Google',
            token: jwtToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone || null,
                role: user.role,
                isVerified: true,
            },
        });

    } catch (err) {
        console.error('❌ GOOGLE LOGIN ERROR:', err.message);
        console.error(err.stack);
        return res.status(500).json({
            message: 'Server error during Google login.',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined,
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
            // Agent specific
            title,
            agency,
            reraId,
            about
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
            // GST and PAN are optional, but if provided, validate format
            if (gstNo && gstNo.trim()) {
                const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
                if (!gstRegex.test(gstNo.trim())) {
                    await connection.rollback();
                    connection.release();
                    return res.status(400).json({
                        message: "Invalid GST number format"
                    });
                }
            }
            if (panNo && panNo.trim()) {
                const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
                if (!panRegex.test(panNo.trim())) {
                    await connection.rollback();
                    connection.release();
                    return res.status(400).json({
                        message: "Invalid PAN number format"
                    });
                }
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
            // Agent details
            title: role === 'agent' ? title : null,
            agency: role === 'agent' ? agency : null,
            reraId: role === 'agent' ? reraId : null,
            about: role === 'agent' ? about : null
        });

        // Hash password
        const hashed = await bcrypt.hash(password, 12);

        let userId;

        // Insert into users table first (include profile_image)
        const [result] = await connection.query(
            "INSERT INTO users (name, email, phone, password, role, profile_image, is_verified, created_at) VALUES (?,?,?,?,?,?, true, NOW())",
            [name.trim(), email.toLowerCase().trim(), phone, hashed, role, profileImage?.trim() || null]
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
                    user_id,
                    company_name, gst_no, pan_no, website,
                    registration_certificate, description,
                    experience_years,
                    address, city, state, pincode,
                    profile_image
                 ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    userId,
                    companyName?.trim() || null,
                    gstNo?.trim() || null,
                    panNo?.trim() || null,
                    website?.trim() || null,
                    registrationCertificate?.trim() || null,
                    description?.trim() || null,
                    parsedExperienceYears,
                    address?.trim() || null,
                    city?.trim() || null,
                    state?.trim() || null,
                    pincode?.trim() || null,
                    profileImage?.trim() || null
                ]
            );
        } else if (role === "agent") {
            const parsedExperienceYears = experienceYears ? parseInt(experienceYears, 10) : null;

            await connection.query(
                `INSERT INTO agents (
                    user_id,
                    professional_title,
                    about_me,
                    agency_name,
                    license_id,
                    experience_years,
                    city
                 ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    userId,
                    title?.trim() || null,
                    about?.trim() || null,
                    agency?.trim() || null,
                    reraId?.trim() || null,
                    parsedExperienceYears,
                    city?.trim() || null
                ]
            );
        }

        // Move profile image to structured storage (images_rs/profiles/{role}/{userId}_{email}/)
        if (profileImage && profileImage.includes('/uploads/')) {
            try {
                const filename = profileImage.split('/').pop();
                const safeEmail = email.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
                const uploadsDir = path.join(__dirname, '..', '..', '..', 'uploads');

                // Determine role subfolder
                const roleFolder = role === 'builder' ? 'builders' : role === 'agent' ? 'agents' : 'users';
                const profileDir = path.join(__dirname, '..', '..', 'images_rs', 'profiles', roleFolder, `${userId}_${safeEmail}`);

                fs.mkdirSync(profileDir, { recursive: true });

                const sourcePath = path.join(uploadsDir, filename);
                const destPath = path.join(profileDir, 'profile.jpg');

                if (fs.existsSync(sourcePath)) {
                    fs.copyFileSync(sourcePath, destPath);
                    fs.unlinkSync(sourcePath);

                    const relativePath = `/images_rs/profiles/${roleFolder}/${userId}_${safeEmail}/profile.jpg`;
                    await connection.query("UPDATE users SET profile_image = ? WHERE id = ?", [relativePath, userId]);

                    console.log(`[profile_image] ✅ Moved to ${relativePath}`);
                } else {
                    console.warn(`[profile_image] ⚠️ Source not found: ${sourcePath}`);
                }
            } catch (moveErr) {
                console.error('[profile_image] Failed to move profile image:', moveErr.message);
                // Non-fatal: registration still succeeds with old URL
            }
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
        } else if (role === "agent") {
            userResponse.title = title?.trim() || null;
            userResponse.agency = agency?.trim() || null;
            userResponse.reraId = reraId?.trim() || null;
            userResponse.about = about?.trim() || null;
            userResponse.experienceYears = experienceYears ? parseInt(experienceYears) : null;
            userResponse.city = city?.trim() || null;
        }

        // Return success response
        res.status(201).json({
            message: role === "builder"
                ? "Builder registration successful. Your account is pending verification."
                : "Registration successful",
            token,
            user: userResponse
        });

    }
    catch (err) {
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
                errorMessage = "Duplicate entry. Email or phone may already be registered.";
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
                message: "Invalid credentials"
            });
        }

        const user = users[0];

        // Check if account is blocked
        if (user.is_blocked) {
            await logUserActivity(user.id, 'blocked_login_attempt', ipAddress, userAgent, 'Blocked user attempted login', 'email');

            return res.status(403).json({
                message: "Your account has been blocked. Please contact support."
            });
        }

        // Verify password
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            // Log failed login attempt
            await logUserActivity(user.id, 'failed_login', ipAddress, userAgent, 'Invalid password', 'email');

            return res.status(400).json({
                message: "Invalid credentials"
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

        // Fetch role details if applicable
        let roleDetails = {};
        if (user.role === 'builder') {
            const [builder] = await pool.query(
                "SELECT * FROM builders WHERE user_id = ?",
                [user.id]
            );
            if (builder.length > 0) {
                roleDetails = builder[0];
            }
        } else if (user.role === 'agent') {
            const [agent] = await pool.query(
                "SELECT * FROM agents WHERE user_id = ?",
                [user.id]
            );
            if (agent.length > 0) {
                roleDetails = agent[0];
            }
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, role: user.role },
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
                'User logged in successfully',
                'email'
            );
        } catch (logError) {
            console.error("Failed to log user activity:", logError);
            // Continue execution - don't fail registration due to logging error
        }

        // Update last login timestamp
        await pool.query(
            "UPDATE users SET last_login = NOW() WHERE id = ?",
            [user.id]
        );

        // Prepare user response object
        const userResponse = {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            isVerified: user.is_verified, // Assuming is_verified column exists
            profileImage: user.profile_image // Assuming profile_image column exists
        };

        // Add builder specific fields
        if (user.role === 'builder' && roleDetails.id) {
            userResponse.companyName = roleDetails.company_name;
            userResponse.gstNo = roleDetails.gst_no;
            userResponse.panNo = roleDetails.pan_no;
            userResponse.website = roleDetails.website;
            userResponse.verificationStatus = roleDetails.verification_status;
            userResponse.businessAddress = roleDetails.address;
            userResponse.city = roleDetails.city;
            userResponse.state = roleDetails.state;
            userResponse.pincode = roleDetails.pincode;
            userResponse.experienceYears = roleDetails.experience_years;
        } else if (user.role === 'agent' && (roleDetails.user_id || roleDetails.id)) {
            userResponse.title = roleDetails.professional_title;
            userResponse.about = roleDetails.about_me;
            userResponse.agency = roleDetails.agency_name;
            userResponse.reraId = roleDetails.license_id;
            userResponse.experienceYears = roleDetails.experience_years;
            userResponse.city = roleDetails.city;
        }

        // Return success response
        res.json({
            message: "Login successful",
            token,
            user: userResponse
        });

    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({
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

        // Fetch basic user info (include profile_image)
        const [users] = await pool.query(
            "SELECT id, name, email, phone, role, is_verified, profile_image FROM users WHERE id = ?",
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = users[0];

        // Fetch roleDetails if applicable
        let roleDetails = {};
        if (user.role === 'builder') {
            const [builder] = await pool.query(
                "SELECT * FROM builders WHERE user_id = ?",
                [userId]
            );
            if (builder.length > 0) roleDetails = builder[0];
        } else if (user.role === 'agent') {
            const [agent] = await pool.query(
                "SELECT * FROM agents WHERE user_id = ?",
                [userId]
            );
            if (agent.length > 0) roleDetails = agent[0];
        }

        // Prepare user response object
        const userResponse = {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            isVerified: user.is_verified,
            profileImage: user.profile_image || null
        };

        // Add role-specific fields
        if (user.role === 'builder' && roleDetails.id) {
            userResponse.companyName = roleDetails.company_name;
            userResponse.gstNo = roleDetails.gst_no;
            userResponse.panNo = roleDetails.pan_no;
            userResponse.website = roleDetails.website;
            userResponse.description = roleDetails.description;
            userResponse.verificationStatus = roleDetails.verification_status;
            userResponse.address = roleDetails.address;
            userResponse.totalProjects = roleDetails.total_projects;
            userResponse.city = roleDetails.city;
            userResponse.state = roleDetails.state;
            userResponse.pincode = roleDetails.pincode;
            userResponse.experienceYears = roleDetails.experience_years;
        } else if (user.role === 'agent' && (roleDetails.user_id || roleDetails.id)) {
            userResponse.title = roleDetails.professional_title;
            userResponse.about = roleDetails.about_me;
            userResponse.agency = roleDetails.agency_name;
            userResponse.reraId = roleDetails.license_id;
            userResponse.experienceYears = roleDetails.experience_years;
            userResponse.city = roleDetails.city;
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

// RESET PASSWORD
module.exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const { ipAddress, userAgent } = getRequestMetadata(req);

        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                message: "Email, OTP, and new password are required"
            });
        }

        if (newPassword.length < 8 || !/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
            return res.status(400).json({
                message: "Password must be at least 8 characters with letters and numbers"
            });
        }

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
                message: "Invalid or expired OTP"
            });
        }

        const otpRecord = otpRecords[0];

        if (new Date() > new Date(otpRecord.expires_at)) {
            return res.status(400).json({
                message: "OTP has expired. Please request a new one."
            });
        }

        if (otpRecord.otp !== otp) {
            await pool.query(
                "UPDATE otp_verifications SET attempts = attempts + 1 WHERE id = ?",
                [otpRecord.id]
            );

            // Log failed password reset attempt
            await logUserActivity(otpRecord.user_id, 'failed_password_reset', ipAddress, userAgent, 'Invalid OTP for password reset', 'email');

            return res.status(400).json({
                message: "Invalid OTP. Please try again."
            });
        }

        // Check if new password is same as current password
        if (otpRecord.current_password) {
            const isSamePassword = await bcrypt.compare(newPassword, otpRecord.current_password);
            if (isSamePassword) {
                return res.status(400).json({
                    message: "New password cannot be the same as your current password"
                });
            }
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await pool.query(
            "UPDATE users SET password = ?, password_changed_at = NOW() WHERE id = ?",
            [hashedPassword, otpRecord.user_id]
        );

        await pool.query(
            "UPDATE otp_verifications SET is_used = true, verified_at = NOW() WHERE id = ?",
            [otpRecord.id]
        );

        // Log successful password reset
        await logUserActivity(otpRecord.user_id, 'password_reset', ipAddress, userAgent, 'Password was reset successfully', 'email');

        // Send email notification about password change
        await sendEmailNotification(
            otpRecord.user_email,
            'Password Changed Successfully',
            `Your password was successfully changed from IP: ${ipAddress}. If you did not make this change, please contact support immediately.`
        );

        res.json({
            message: "Password has been reset successfully. Please login with your new password."
        });

    } catch (err) {
        console.error("Reset password error:", err);
        res.status(500).json({
            message: "Server error during password reset. Please try again.",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// UPDATE PROFILE
module.exports.updateProfile = async (req, res) => {
    console.log("\n" + "=".repeat(33) + " route handler" + "=".repeat(13));
    console.log("👤 updateProfile called for user:", req.user?.id);

    let connection;
    try {
        connection = await pool.getConnection();
    } catch (connErr) {
        console.error("❌ Database connection error:", connErr);
        return res.status(500).json({ message: "Database connection failed" });
    }

    try {
        await connection.beginTransaction();
        const userId = req.user.id;
        const {
            name, phone, profileImage,
            // Builder specific
            companyName, gstNo, panNo, website, description, totalProjects, experienceYears,
            address, city, state, pincode,
            // Agent specific
            title, agency, reraId, about
        } = req.body;

        const { ipAddress, userAgent } = getRequestMetadata(req);

        // Fetch current user role and email
        const [users] = await connection.query("SELECT role, email FROM users WHERE id = ?", [userId]);
        if (users.length === 0) {
            await connection.rollback();
            connection.release();
            return res.status(404).json({ message: "User not found" });
        }
        const userRole = users[0].role;

        // Update basic user info
        const userUpdates = [];
        const userParams = [];
        if (name) { userUpdates.push("name = ?"); userParams.push(name.trim()); }
        if (phone) { userUpdates.push("phone = ?"); userParams.push(phone.trim()); }
        if (profileImage) { userUpdates.push("profile_image = ?"); userParams.push(profileImage.trim()); }

        if (userUpdates.length > 0) {
            userParams.push(userId);
            await connection.query(
                `UPDATE users SET ${userUpdates.join(", ")}, updated_at = NOW() WHERE id = ?`,
                userParams
            );
        }

        // Update role-specific details
        if (userRole === 'builder') {
            const builderUpdates = [];
            const builderParams = [];

            if (companyName !== undefined) { builderUpdates.push("company_name = ?"); builderParams.push(companyName?.trim() || null); }
            if (gstNo !== undefined) { builderUpdates.push("gst_no = ?"); builderParams.push(gstNo?.trim() || null); }
            if (panNo !== undefined) { builderUpdates.push("pan_no = ?"); builderParams.push(panNo?.trim() || null); }
            if (website !== undefined) { builderUpdates.push("website = ?"); builderParams.push(website?.trim() || null); }
            if (description !== undefined) { builderUpdates.push("description = ?"); builderParams.push(description?.trim() || null); }
            if (totalProjects !== undefined) { builderUpdates.push("total_projects = ?"); builderParams.push(totalProjects || 0); }
            if (experienceYears !== undefined) { builderUpdates.push("experience_years = ?"); builderParams.push(experienceYears || 0); }
            if (address !== undefined) { builderUpdates.push("address = ?"); builderParams.push(address?.trim() || null); }
            if (city !== undefined) { builderUpdates.push("city = ?"); builderParams.push(city?.trim() || null); }
            if (state !== undefined) { builderUpdates.push("state = ?"); builderParams.push(state?.trim() || null); }
            if (pincode !== undefined) { builderUpdates.push("pincode = ?"); builderParams.push(pincode?.trim() || null); }
            // Note: profile_image is handled in users table, builders table doesn't have this column


            if (builderUpdates.length > 0) {
                builderParams.push(userId);
                await connection.query(
                    `UPDATE builders SET ${builderUpdates.join(", ")}, updated_at = NOW() WHERE user_id = ?`,
                    builderParams
                );
            }
        } else if (userRole === 'agent') {
            await connection.query(
                `INSERT INTO agents (user_id, professional_title, about_me, agency_name, license_id, experience_years, city, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                 ON DUPLICATE KEY UPDATE
                 professional_title = VALUES(professional_title),
                 about_me = VALUES(about_me),
                 agency_name = VALUES(agency_name),
                 license_id = VALUES(license_id),
                 experience_years = VALUES(experience_years),
                 city = VALUES(city),
                 updated_at = NOW()`,
                [userId, title?.trim() || null, about?.trim() || null, agency?.trim() || null, reraId?.trim() || null, experienceYears || 0, city?.trim() || null]
            );
        }

        // Move profile image to structured storage if it's a new upload
        if (profileImage && profileImage.includes('/uploads/')) {
            try {
                const email = users[0].email || '';
                const filename = profileImage.split('/').pop();
                const safeEmail = email.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
                const uploadsDir = path.join(__dirname, '..', '..', '..', 'uploads');

                // Determine role subfolder
                const roleFolder = userRole === 'builder' ? 'builders' : userRole === 'agent' ? 'agents' : 'users';
                const profileDir = path.join(__dirname, '..', '..', 'images_rs', 'profiles', roleFolder, `${userId}_${safeEmail}`);

                fs.mkdirSync(profileDir, { recursive: true });

                const sourcePath = path.join(uploadsDir, filename);
                const destPath = path.join(profileDir, 'profile.jpg');

                if (fs.existsSync(sourcePath)) {
                    // Remove old profile.jpg if it exists (replace in-place)
                    if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
                    fs.copyFileSync(sourcePath, destPath);
                    fs.unlinkSync(sourcePath);

                    const relativePath = `/images_rs/profiles/${roleFolder}/${userId}_${safeEmail}/profile.jpg`;

                    // Update profile_image in database (within transaction)
                    await connection.query("UPDATE users SET profile_image = ? WHERE id = ?", [relativePath, userId]);

                    console.log(`[profile_image] ✅ Updated to ${relativePath}`);
                } else {
                    console.warn(`[profile_image] ⚠️ Source not found: ${sourcePath}`);
                }
            } catch (moveErr) {
                console.error('[profile_image] Failed to move profile image on update:', moveErr.message);
                // Non-fatal
            }
        }

        await connection.commit();
        connection.release();

        // Log activity (optional, if logUserActivity is available)
        if (typeof logUserActivity === 'function') {
            await logUserActivity(userId, 'profile_update', ipAddress, userAgent, 'Profile updated successfully', 'email');
        }

        res.json({ message: "Profile updated successfully" });

    } catch (err) {
        if (connection) {
            await connection.rollback();
            connection.release();
        }
        console.error("Update Profile error:", err);
        res.status(500).json({
            message: "Server error updating profile",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};