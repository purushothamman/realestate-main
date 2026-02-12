const nodemailer = require('nodemailer');
require('dotenv').config();

/**
 * Email Service Configuration
 * Handles all email sending functionality for the application
 */

// Create email transporter
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    },
    tls: {
        rejectUnauthorized: false // For development only
    }
});

// Verify transporter configuration
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Email transporter configuration error:', error);
    } else {
        console.log('✅ Email service is ready');
    }
});

/**
 * Send OTP Email for Password Reset
 * @param {string} email - Recipient email address
 * @param {string} userName - User's full name
 * @param {string} otp - 6-digit OTP code
 * @returns {Promise<boolean>} - Success status
 */
const sendPasswordResetOTP = async (email, userName, otp) => {
    try {
        const mailOptions = {
            from: `"${process.env.APP_NAME || 'RealEstate Pro'}" <${process.env.EMAIL_FROM}>`,
            to: email,
            subject: 'Password Reset Code - RealEstate Pro',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            background-color: #f4f4f4;
                            margin: 0;
                            padding: 0;
                        }
                        .container {
                            max-width: 600px;
                            margin: 20px auto;
                            background: #ffffff;
                            border-radius: 8px;
                            overflow: hidden;
                            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                        }
                        .header {
                            background: #2D6A4F;
                            color: #ffffff;
                            padding: 30px;
                            text-align: center;
                        }
                        .header h1 {
                            margin: 0;
                            font-size: 24px;
                        }
                        .content {
                            padding: 30px;
                        }
                        .otp-box {
                            background: #f0f0f0;
                            border: 2px dashed #2D6A4F;
                            border-radius: 8px;
                            padding: 20px;
                            text-align: center;
                            margin: 20px 0;
                        }
                        .otp-code {
                            font-size: 32px;
                            font-weight: bold;
                            letter-spacing: 8px;
                            color: #2D6A4F;
                            font-family: monospace;
                        }
                        .warning {
                            background: #FFF3CD;
                            border-left: 4px solid #FFC107;
                            padding: 12px;
                            margin: 20px 0;
                            border-radius: 4px;
                        }
                        .footer {
                            background: #f8f9fa;
                            padding: 20px;
                            text-align: center;
                            font-size: 12px;
                            color: #6c757d;
                            border-top: 1px solid #dee2e6;
                        }
                        .button {
                            display: inline-block;
                            padding: 12px 24px;
                            background: #2D6A4F;
                            color: #ffffff;
                            text-decoration: none;
                            border-radius: 6px;
                            margin: 10px 0;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🔐 Password Reset Request</h1>
                        </div>
                        <div class="content">
                            <p>Hello <strong>${userName || 'User'}</strong>,</p>
                            
                            <p>We received a request to reset your password for your RealEstate Pro account.</p>
                            
                            <p>Use the verification code below to reset your password:</p>
                            
                            <div class="otp-box">
                                <div class="otp-code">${otp}</div>
                                <p style="margin: 10px 0 0 0; color: #6c757d; font-size: 14px;">
                                    This code will expire in 10 minutes
                                </p>
                            </div>
                            
                            <div class="warning">
                                <strong>⚠️ Security Notice:</strong>
                                <ul style="margin: 5px 0; padding-left: 20px;">
                                    <li>Never share this code with anyone</li>
                                    <li>RealEstate Pro will never ask for this code</li>
                                    <li>If you didn't request this reset, please ignore this email</li>
                                </ul>
                            </div>
                            
                            <p style="margin-top: 30px;">
                                If you didn't request this password reset, you can safely ignore this email. 
                                Your account remains secure.
                            </p>
                            
                            <p>
                                <strong>Need help?</strong> Contact our support team at 
                                <a href="mailto:${process.env.SUPPORT_EMAIL || 'support@realestatepro.com'}">
                                    ${process.env.SUPPORT_EMAIL || 'support@realestatepro.com'}
                                </a>
                            </p>
                        </div>
                        <div class="footer">
                            <p>© 2026 RealEstate Pro. All rights reserved.</p>
                            <p>This is an automated email. Please do not reply.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Password reset OTP sent to:', email);
        console.log('Message ID:', info.messageId);
        return true;

    } catch (error) {
        console.error('❌ Error sending password reset OTP:', error);
        throw error;
    }
};

/**
 * Send Password Change Notification Email
 * @param {string} email - Recipient email address
 * @param {string} userName - User's full name
 * @param {string} ipAddress - IP address where change was made
 * @param {string} timestamp - Timestamp of the change
 * @returns {Promise<boolean>} - Success status
 */
const sendPasswordChangedNotification = async (email, userName, ipAddress, timestamp) => {
    try {
        const mailOptions = {
            from: `"${process.env.APP_NAME || 'RealEstate Pro'}" <${process.env.EMAIL_FROM}>`,
            to: email,
            subject: '✅ Your Password Has Been Changed - RealEstate Pro',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            background-color: #f4f4f4;
                            margin: 0;
                            padding: 0;
                        }
                        .container {
                            max-width: 600px;
                            margin: 20px auto;
                            background: #ffffff;
                            border-radius: 8px;
                            overflow: hidden;
                            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                        }
                        .header {
                            background: #22C55E;
                            color: #ffffff;
                            padding: 30px;
                            text-align: center;
                        }
                        .content {
                            padding: 30px;
                        }
                        .info-box {
                            background: #f8f9fa;
                            border-left: 4px solid #22C55E;
                            padding: 15px;
                            margin: 20px 0;
                            border-radius: 4px;
                        }
                        .info-item {
                            margin: 8px 0;
                        }
                        .info-label {
                            font-weight: bold;
                            color: #2D6A4F;
                        }
                        .alert-box {
                            background: #FEE2E2;
                            border-left: 4px solid #DC2626;
                            padding: 15px;
                            margin: 20px 0;
                            border-radius: 4px;
                        }
                        .button {
                            display: inline-block;
                            padding: 12px 24px;
                            background: #DC2626;
                            color: #ffffff;
                            text-decoration: none;
                            border-radius: 6px;
                            margin: 10px 0;
                        }
                        .footer {
                            background: #f8f9fa;
                            padding: 20px;
                            text-align: center;
                            font-size: 12px;
                            color: #6c757d;
                            border-top: 1px solid #dee2e6;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>✅ Password Changed Successfully</h1>
                        </div>
                        <div class="content">
                            <p>Hello <strong>${userName || 'User'}</strong>,</p>
                            
                            <p>Your password for your RealEstate Pro account has been successfully changed.</p>
                            
                            <div class="info-box">
                                <h3 style="margin-top: 0;">Change Details:</h3>
                                <div class="info-item">
                                    <span class="info-label">📅 Date & Time:</span> 
                                    ${timestamp || new Date().toLocaleString()}
                                </div>
                                <div class="info-item">
                                    <span class="info-label">🌐 IP Address:</span> 
                                    ${ipAddress || 'Unknown'}
                                </div>
                                <div class="info-item">
                                    <span class="info-label">📧 Email:</span> 
                                    ${email}
                                </div>
                            </div>
                            
                            <div class="alert-box">
                                <h3 style="margin-top: 0;">⚠️ Didn't make this change?</h3>
                                <p style="margin: 10px 0;">
                                    If you did not authorize this password change, your account may be compromised. 
                                    Please take immediate action:
                                </p>
                                <ol style="margin: 10px 0; padding-left: 20px;">
                                    <li>Contact our support team immediately</li>
                                    <li>Reset your password again</li>
                                    <li>Review your recent account activity</li>
                                </ol>
                                <a href="mailto:${process.env.SUPPORT_EMAIL || 'support@realestatepro.com'}" 
                                   class="button">
                                    Contact Support Now
                                </a>
                            </div>
                            
                            <h3>Security Tips:</h3>
                            <ul>
                                <li>Use a strong, unique password for your account</li>
                                <li>Never share your password with anyone</li>
                                <li>Enable two-factor authentication if available</li>
                                <li>Regularly update your password</li>
                            </ul>
                            
                            <p style="margin-top: 30px;">
                                Thank you for using RealEstate Pro!
                            </p>
                        </div>
                        <div class="footer">
                            <p>© 2026 RealEstate Pro. All rights reserved.</p>
                            <p>This is an automated email. Please do not reply.</p>
                            <p>
                                Need help? Contact us at 
                                <a href="mailto:${process.env.SUPPORT_EMAIL || 'support@realestatepro.com'}">
                                    ${process.env.SUPPORT_EMAIL || 'support@realestatepro.com'}
                                </a>
                            </p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Password changed notification sent to:', email);
        console.log('Message ID:', info.messageId);
        return true;

    } catch (error) {
        console.error('❌ Error sending password change notification:', error);
        throw error;
    }
};

/**
 * Generic email sender
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 * @returns {Promise<boolean>} - Success status
 */
const sendEmail = async (to, subject, html) => {
    try {
        const mailOptions = {
            from: `"${process.env.APP_NAME || 'RealEstate Pro'}" <${process.env.EMAIL_FROM}>`,
            to,
            subject,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent to:', to);
        console.log('Message ID:', info.messageId);
        return true;

    } catch (error) {
        console.error('❌ Error sending email:', error);
        throw error;
    }
};

module.exports = {
    sendPasswordResetOTP,
    sendPasswordChangedNotification,
    sendEmail,
    transporter
};