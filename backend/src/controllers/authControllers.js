// backend/src/controllers/authControllers.js
const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
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
// controllers/authController.js - Google Login Method

// ==================== GOOGLE LOGIN FUNCTION ====================
// Add this to your existing authControllers.js file
// Replace the existing googleLogin function if you have one

module.exports.googleLogin = async (req, res) => {
    console.log('\n' + '='.repeat(70));
    console.log('🔐 GOOGLE LOGIN REQUEST RECEIVED');
    console.log('='.repeat(70));

    const startTime = Date.now();

    try {
        const { token } = req.body;
        const { ipAddress, userAgent } = getRequestMetadata(req); // Uses existing function

        console.log('📋 Request Details:');
        console.log(`  IP Address: ${ipAddress}`);
        console.log(`  User Agent: ${userAgent}`);
        console.log(`  Has Token: ${!!token}`);
        console.log('');

        // ==================== STEP 1: VALIDATE REQUEST ====================
        console.log('STEP 1: Validating Request...');

        if (!token) {
            console.error('❌ No token provided in request body');
            return res.status(400).json({
                message: "Google token is required"
            });
        }
        console.log(`✅ Token present (length: ${token.length})`);
        console.log(`   Preview: ${token.substring(0, 30)}...`);
        console.log('');

        // ==================== STEP 2: CHECK ENVIRONMENT ====================
        console.log('STEP 2: Checking Environment Configuration...');

        if (!process.env.GOOGLE_CLIENT_ID) {
            console.error('❌ GOOGLE_CLIENT_ID not configured in environment variables');
            console.error('   Please add GOOGLE_CLIENT_ID to your .env file');
            return res.status(500).json({
                message: "Google authentication is not properly configured on the server"
            });
        }

        console.log('✅ GOOGLE_CLIENT_ID found');
        console.log(`   Client ID: ${process.env.GOOGLE_CLIENT_ID.substring(0, 20)}...`);

        if (!process.env.JWT_SECRET) {
            console.error('❌ JWT_SECRET not configured');
            return res.status(500).json({
                message: "Server authentication is not properly configured"
            });
        }

        console.log('✅ JWT_SECRET found');
        console.log('');

        // ==================== STEP 3: VERIFY GOOGLE TOKEN ====================
        console.log('STEP 3: Verifying Google Token...');

        const { OAuth2Client } = require('google-auth-library');
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

        let ticket;
        let payload;

        try {
            console.log('   Calling Google token verification API...');
            ticket = await client.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });

            payload = ticket.getPayload();

            if (!payload) {
                throw new Error('No payload in verified token');
            }

            console.log('✅ Token verified successfully');
            console.log(`   Token issued for: ${payload.email}`);
            console.log(`   Issued at: ${new Date(payload.iat * 1000).toISOString()}`);
            console.log(`   Expires at: ${new Date(payload.exp * 1000).toISOString()}`);
            console.log('');

        } catch (verifyError) {
            console.error('❌ Token verification failed');
            console.error(`   Error: ${verifyError.message}`);
            console.error(`   Error code: ${verifyError.code || 'N/A'}`);

            // Check for common issues
            if (verifyError.message.includes('audience')) {
                console.error('   → Client ID mismatch: Token audience does not match server client ID');
                console.error('   → Ensure frontend and backend use the SAME Web Client ID');
            } else if (verifyError.message.includes('expired')) {
                console.error('   → Token has expired');
            } else if (verifyError.message.includes('invalid')) {
                console.error('   → Invalid token format or signature');
            }

            return res.status(401).json({
                message: "Invalid or expired Google token. Please try signing in again.",
                error: process.env.NODE_ENV === 'development' ? verifyError.message : undefined
            });
        }

        // ==================== STEP 4: EXTRACT USER INFO ====================
        console.log('STEP 4: Extracting User Information...');

        const { email, name, picture, sub: googleId } = payload;

        console.log('   User data from Google:');
        console.log(`     Email: ${email}`);
        console.log(`     Name: ${name || 'Not provided'}`);
        console.log(`     Google ID: ${googleId.substring(0, 15)}...`);
        console.log(`     Picture: ${picture ? 'Yes' : 'No'}`);
        console.log('');

        if (!email || !googleId) {
            console.error('❌ Missing required fields in Google payload');
            return res.status(400).json({
                message: "Invalid Google account information"
            });
        }

        console.log('✅ Required fields validated');
        console.log('');

        // ==================== STEP 5: CHECK DATABASE FOR USER ====================
        console.log('STEP 5: Checking Database for User...');

        const [users] = await pool.query(
            "SELECT * FROM users WHERE email = ?",
            [email.toLowerCase().trim()]
        );

        console.log(`   Query returned ${users.length} user(s)`);
        console.log('');

        let user;
        let isNewUser = false;

        if (users.length > 0) {
            // ==================== EXISTING USER ====================
            user = users[0];
            console.log('✅ Existing user found');
            console.log(`   User ID: ${user.id}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Role: ${user.role}`);
            console.log('');

        } else {
            // ==================== NEW USER ====================
            console.log('🆕 Creating new user account...');
            isNewUser = true;

            try {
                const [result] = await pool.query(
                    `INSERT INTO users (name, email, role, is_verified, created_at) 
                     VALUES (?, ?, 'buyer', true, NOW())`,
                    [name, email.toLowerCase().trim()]
                );

                console.log('✅ New user created');
                console.log(`   User ID: ${result.insertId}`);
                console.log(`   Email: ${email}`);
                console.log(`   Role: buyer (default)`);
                console.log('');

                user = {
                    id: result.insertId,
                    name,
                    email: email.toLowerCase().trim(),
                    role: 'buyer',
                    is_verified: true,
                    is_blocked: false,
                    phone: null
                };

            } catch (insertError) {
                console.error('❌ Failed to create user');
                console.error(`   Error: ${insertError.message}`);
                console.error(`   Code: ${insertError.code}`);

                if (insertError.code === 'ER_DUP_ENTRY') {
                    console.error('   → Duplicate email detected');
                    return res.status(409).json({
                        message: "An account with this email already exists"
                    });
                }

                throw insertError;
            }
        }

        // ==================== STEP 6: SECURITY CHECKS ====================
        console.log('STEP 6: Performing Security Checks...');

        // Check if account is blocked
        if (user.is_blocked) {
            console.log('⛔ Blocked user attempted login');

            // Use logUserActivity if it exists in your file
            if (typeof logUserActivity === 'function') {
                await logUserActivity(
                    user.id,
                    'blocked_login_attempt',
                    ipAddress,
                    userAgent,
                    'Blocked user attempted Google login',
                    'google'
                );
            }

            return res.status(403).json({
                message: "Your account has been blocked. Please contact support."
            });
        }
        console.log('✅ Account not blocked');
        console.log('');

        // Check for suspicious activity (non-blocking) - only if function exists
        try {
            if (typeof checkSuspiciousActivity === 'function') {
                const suspiciousCheck = await checkSuspiciousActivity(user.id, ipAddress);
                if (suspiciousCheck.isSuspicious) {
                    console.log('⚠️  Suspicious activity detected');

                    if (typeof sendEmailNotification === 'function') {
                        await sendEmailNotification(
                            user.email,
                            'Suspicious Login Activity Detected',
                            `We detected unusual login activity on your account from IP: ${ipAddress}`
                        );
                    }
                } else {
                    console.log('✅ No suspicious activity detected');
                }
            }
        } catch (suspiciousError) {
            console.warn('⚠️  Suspicious activity check failed:', suspiciousError.message);
            console.warn('   Continuing with login...');
        }
        console.log('');

        // ==================== STEP 7: GENERATE JWT TOKEN ====================
        console.log('STEP 7: Generating JWT Token...');

        const jwt = require('jsonwebtoken');
        const jwtToken = jwt.sign(
            {
                id: user.id,
                role: user.role,
                email: user.email
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        console.log('✅ JWT token generated');
        console.log(`   Expires in: 7 days`);
        console.log('');

        // ==================== STEP 8: LOG ACTIVITY ====================
        console.log('STEP 8: Logging User Activity...');

        // Use logUserActivity if it exists in your file
        if (typeof logUserActivity === 'function') {
            await logUserActivity(
                user.id,
                isNewUser ? 'registration' : 'login',
                ipAddress,
                userAgent,
                isNewUser ? 'New user registered via Google' : 'User logged in via Google',
                'google'
            );
            console.log('✅ Activity logged');
        } else {
            console.log('⚠️  logUserActivity function not found - skipping');
        }
        console.log('');

        // ==================== STEP 9: UPDATE LAST LOGIN ====================
        console.log('STEP 9: Updating Last Login...');

        await pool.query(
            "UPDATE users SET updated_at = NOW() WHERE id = ?",
            [user.id]
        );

        console.log('✅ Last login updated');
        console.log('');

        // ==================== STEP 10: NEW DEVICE NOTIFICATION ====================
        if (!isNewUser) {
            console.log('STEP 10: Checking for New Device...');

            try {
                const [recentLogins] = await pool.query(
                    `SELECT COUNT(*) as count FROM user_login_logs 
                     WHERE user_id = ? AND user_agent = ? AND login_time > DATE_SUB(NOW(), INTERVAL 30 DAY)`,
                    [user.id, userAgent]
                );

                if (recentLogins[0].count === 0) {
                    console.log('📧 New device detected');

                    // Only send notification if function exists
                    if (typeof sendEmailNotification === 'function') {
                        const deviceType = /mobile/i.test(userAgent) ? 'Mobile Device' : 'Desktop';
                        const browser = /chrome/i.test(userAgent) ? 'Chrome' :
                            /firefox/i.test(userAgent) ? 'Firefox' :
                                /safari/i.test(userAgent) ? 'Safari' : 'Unknown Browser';

                        await sendEmailNotification(
                            user.email,
                            'New Device Login Detected',
                            `A new login was detected from ${deviceType} using ${browser} at IP: ${ipAddress}`
                        );
                        console.log('✅ Notification sent');
                    } else {
                        console.log('⚠️  sendEmailNotification function not found - skipping');
                    }
                } else {
                    console.log('✅ Known device - no notification needed');
                }
            } catch (notificationError) {
                console.warn('⚠️  New device notification failed:', notificationError.message);
            }
            console.log('');
        } else {
            console.log('STEP 10: Skipping (new user)');
            console.log('');
        }

        // ==================== STEP 11: SEND RESPONSE ====================
        console.log('STEP 11: Sending Success Response...');

        const responseData = {
            message: isNewUser ? "Account created successfully via Google" : "Login successful via Google",
            token: jwtToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                isVerified: true
            }
        };

        console.log('Response data:');
        console.log(`  User ID: ${responseData.user.id}`);
        console.log(`  Email: ${responseData.user.email}`);
        console.log(`  Role: ${responseData.user.role}`);
        console.log(`  Has Token: Yes`);
        console.log('');

        const duration = Date.now() - startTime;
        console.log('='.repeat(70));
        console.log(`✅ GOOGLE LOGIN SUCCESSFUL (${duration}ms)`);
        console.log('='.repeat(70) + '\n');

        res.json(responseData);

    } catch (err) {
        const duration = Date.now() - startTime;

        console.error('\n' + '='.repeat(70));
        console.error('❌ GOOGLE LOGIN FAILED');
        console.error('='.repeat(70));
        console.error(`Error Type: ${err.name}`);
        console.error(`Error Message: ${err.message}`);
        console.error(`Error Code: ${err.code || 'N/A'}`);
        console.error(`Duration: ${duration}ms`);
        console.error('\nStack Trace:');
        console.error(err.stack);
        console.error('='.repeat(70) + '\n');

        res.status(500).json({
            message: "Server error during Google login. Please try again.",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// ==================== HELPER FUNCTIONS ====================

// function getRequestMetadata(req) {
//     const ipAddress = req.headers['x-forwarded-for']?.split(',')[0] || 
//                      req.connection?.remoteAddress || 
//                      req.socket?.remoteAddress || 
//                      'Unknown';

//     const userAgent = req.headers['user-agent'] || 'Unknown';

//     return { ipAddress, userAgent };
// }

// function getDeviceType(userAgent) {
//     if (/mobile/i.test(userAgent)) return 'Mobile Device';
//     if (/tablet/i.test(userAgent)) return 'Tablet';
//     return 'Desktop';
// }

// function getBrowser(userAgent) {
//     if (/chrome/i.test(userAgent)) return 'Chrome';
//     if (/firefox/i.test(userAgent)) return 'Firefox';
//     if (/safari/i.test(userAgent)) return 'Safari';
//     if (/edge/i.test(userAgent)) return 'Edge';
//     return 'Unknown Browser';
// }


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


module.exports.register = async (req, res) => {
    try {
        const {
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
            website,
            description,
            experienceYears,
            address,
            landmark,
            area,
            city,
            district,
            state,
            pincode
        } = req.body;

        const { ipAddress, userAgent } = getRequestMetadata(req);

        // Validate required fields
        if (!name || !email || !phone || !password || !role) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        // Validate role
        const allowedRoles = ["buyer", "builder", "agent"];
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                message: "Invalid role selected. Must be buyer, builder, or agent"
            });
        }

        // Additional validation for builder
        if (role === "builder") {
            if (!companyName) {
                return res.status(400).json({
                    message: "Company name is required for builder registration"
                });
            }
            if (!panNo) {
                return res.status(400).json({
                    message: "PAN number is required for builder registration"
                });
            }
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Invalid email format"
            });
        }

        // Validate phone format (10-15 digits)
        const phoneRegex = /^[0-9]{10,15}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({
                message: "Phone number must be 10-15 digits"
            });
        }

        // Validate password strength
        if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
            return res.status(400).json({
                message: "Password must be at least 8 characters with letters and numbers"
            });
        }

        // Check if email already exists in users table
        const [existing] = await pool.query(
            "SELECT id FROM users WHERE email = ?",
            [email.toLowerCase().trim()]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                message: "This email is already registered. Please login instead.",
            });
        }

        // Check if phone already exists in users table
        const [existingPhone] = await pool.query(
            "SELECT id FROM users WHERE phone = ?",
            [phone]
        );

        if (existingPhone.length > 0) {
            return res.status(409).json({
                message: "This phone number is already registered.",
            });
        }

        console.log("Register payload:", {
            name,
            email,
            phone,
            role,
            companyName: role === 'builder' ? companyName : 'N/A',
            panNo: role === 'builder' ? panNo : 'N/A'
        });

        // Hash password
        const hashed = await bcrypt.hash(password, 10);

        let userId;

        // Insert into users table first
        const [result] = await pool.query(
            "INSERT INTO users (name, email, phone, password, role, is_verified, created_at) VALUES (?,?,?,?,?, false, NOW())",
            [name.trim(), email.toLowerCase().trim(), phone, hashed, role]
        );
        userId = result.insertId;

        // If builder role, also insert into builders table
        // If builder role, also insert into builders table
        if (role === "builder") {
            await pool.query(
                `INSERT INTO builders (
                    user_id, company_name, gst_or_pan, pan_no, website, description, experience_years,   
                    address, landmark, area, city, district, state, pincode, verification_status
                ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                [
                    userId,
                    companyName?.trim() || null,
                    gstNo?.trim() || null,
                    panNo?.trim() || null,
                    website?.trim() || null,
                    description?.trim() || null,
                    experienceYears || null,
                    address?.trim() || null,
                    landmark?.trim() || null,
                    area?.trim() || null,
                    city?.trim() || null,
                    district?.trim() || null,
                    state?.trim() || null,
                    pincode?.trim() || null,
                    'pending'
                ]
            );
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: userId,
                role: role
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Log registration activity
        await logUserActivity(userId, 'registration', ipAddress, userAgent, 'User registered successfully', 'email');

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
            userResponse.gstNo = (typeof gstNo !== 'undefined' && gstNo) ? gstNo?.trim() : (gstOrPan?.trim() || null);
            userResponse.panNo = panNo?.trim() || null;
            userResponse.website = website?.trim() || null;
            userResponse.verificationStatus = 'pending';
            userResponse.city = city?.trim() || null;
            userResponse.state = state?.trim() || null;
        }

        // Return success response
        res.status(201).json({
            message: role === "builder"
                ? "Builder registration successful. Your account is pending verification."
                : "Registration successful",
            token,
            user: userResponse
        });

    } catch (err) {
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

        // Fetch builder details if applicable
        let builderDetails = {};
        if (user.role === 'builder') {
            const [builders] = await pool.query(
                "SELECT * FROM builders WHERE user_id = ?",
                [user.id]
            );
            if (builders.length > 0) {
                builderDetails = builders[0];
            }
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Log successful login
        await logUserActivity(user.id, 'login', ipAddress, userAgent, 'User logged in successfully', 'email');

        // Update last login timestamp
        await pool.query(
            "UPDATE users SET updated_at = NOW() WHERE id = ?",
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
        if (user.role === 'builder' && builderDetails.id) {
            userResponse.companyName = builderDetails.company_name;
            userResponse.gstNo = builderDetails.gst_or_pan; // Or separates if you prefer
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

        // Fetch basic user info
        const [users] = await pool.query(
            "SELECT id, name, email, phone, role, is_verified, profile_image FROM users WHERE id = ?",
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = users[0];

        // Fetch builder details if applicable
        let builderDetails = {};
        if (user.role === 'builder') {
            const [builders] = await pool.query(
                "SELECT * FROM builders WHERE user_id = ?",
                [userId]
            );
            if (builders.length > 0) {
                builderDetails = builders[0];
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
            profileImage: user.profile_image
        };

        // Add builder specific fields
        if (user.role === 'builder' && builderDetails.id) {
            userResponse.companyName = builderDetails.company_name;
            userResponse.gstNo = builderDetails.gst_or_pan;
            userResponse.panNo = builderDetails.pan_no;
            userResponse.website = builderDetails.website;
            userResponse.verificationStatus = builderDetails.verification_status;
            userResponse.businessAddress = builderDetails.address;
            userResponse.landmark = builderDetails.landmark;
            userResponse.area = builderDetails.area;
            userResponse.district = builderDetails.district;
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
            `SELECT ov.*, u.id as user_id, u.name, u.email, u.phone, u.role, u.profile_image, u.is_verified
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
                profileImage: otpRecord.profile_image,
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