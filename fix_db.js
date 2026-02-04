const mysql = require('mysql2/promise');
require('dotenv').config({ path: './backend/.env' });

async function fixDatabase() {
    console.log('🔌 Connecting to database...');

    // Create connection using env vars
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'realestate',
        multipleStatements: true
    });

    try {
        console.log('✅ Connected!');

        // 1. Create user_login_logs table if not exists
        console.log('🛠️ Checking/Creating user_login_logs table...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS user_login_logs (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT,
                login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                logout_time TIMESTAMP NULL,
                login_method VARCHAR(50) DEFAULT 'email',
                ip_address VARCHAR(45),
                user_agent LONGTEXT,
                device_type VARCHAR(50),
                browser VARCHAR(100),
                os VARCHAR(100),
                activity_type VARCHAR(100),
                description LONGTEXT,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_user_id (user_id),
                INDEX idx_login_time (login_time),
                INDEX idx_activity_type (activity_type)
            ) ENGINE=InnoDB;
        `);

        // 2. Create other missing tables
        console.log('🛠️ Checking/Creating otp_verifications table...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS otp_verifications (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT,
                email VARCHAR(255) NOT NULL,
                phone VARCHAR(20),
                otp VARCHAR(6) NOT NULL,
                purpose VARCHAR(50) DEFAULT 'email_verification',
                is_used BOOLEAN DEFAULT FALSE,
                attempts INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP,
                verified_at TIMESTAMP NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_email (email),
                INDEX idx_purpose (purpose)
            ) ENGINE=InnoDB;
        `);

        console.log('🛠️ Checking/Creating security_alerts table...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS security_alerts (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL,
                alert_type VARCHAR(100),
                severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
                ip_address VARCHAR(45),
                details LONGTEXT,
                is_resolved BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                resolved_at TIMESTAMP NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_user_id (user_id),
                INDEX idx_alert_type (alert_type),
                INDEX idx_severity (severity)
            ) ENGINE=InnoDB;
        `);

        console.log('🛠️ Checking/Creating blocked_ips table...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS blocked_ips (
                id INT PRIMARY KEY AUTO_INCREMENT,
                ip_address VARCHAR(45) UNIQUE NOT NULL,
                reason VARCHAR(255),
                blocked_until TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_ip_address (ip_address),
                INDEX idx_blocked_until (blocked_until)
            ) ENGINE=InnoDB;
        `);

        // 3. Add missing columns to properties table
        console.log('🛠️ Adding missing columns to properties table...');

        // Helper to add column if not exists
        const addColumnIfNotExists = async (table, column, definition) => {
            try {
                const [rows] = await connection.query(`SHOW COLUMNS FROM ${table} LIKE '${column}'`);
                if (rows.length === 0) {
                    console.log(`   + Adding ${column} to ${table}`);
                    await connection.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
                } else {
                    console.log(`   ✓ ${column} already exists in ${table}`);
                }
            } catch (error) {
                console.error(`   ❌ Error adding ${column}:`, error.message);
            }
        };

        await addColumnIfNotExists('properties', 'area_sqft', 'DECIMAL(10,2)');
        await addColumnIfNotExists('properties', 'bedrooms', 'INT');
        await addColumnIfNotExists('properties', 'bathrooms', 'INT');

        console.log('\n✨ Database fix completed successfully!');

    } catch (error) {
        console.error('\n❌ Error fixing database:', error);
    } finally {
        await connection.end();
    }
}

fixDatabase();
