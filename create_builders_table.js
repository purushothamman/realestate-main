const mysql = require('mysql2/promise');
require('dotenv').config({ path: './backend/.env' });

async function createBuildersTable() {
    const c = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'realestate'
    });

    try {
        console.log('Creating builders table...');
        await c.query(`
            CREATE TABLE IF NOT EXISTS builders (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL UNIQUE,
                company_name VARCHAR(255),
                gst_no VARCHAR(20),
                pan_no VARCHAR(20),
                website VARCHAR(255),
                registration_certificate VARCHAR(500),
                description TEXT,
                experience_years INT,
                total_projects INT,
                address TEXT,
                city VARCHAR(100),
                state VARCHAR(100),
                pincode VARCHAR(10),
                profile_image VARCHAR(500),
                verification_status ENUM('pending','verified','rejected') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ builders table created/already exists');

        // Also ensure user_login_logs has optional user_id (for failed logins with unknown users)
        // Check the columns
        const [cols] = await c.query("SHOW COLUMNS FROM user_login_logs");
        console.log('user_login_logs columns:', cols.map(c => c.Field));

        // Check all tables now
        const [rows] = await c.query('SHOW TABLES');
        console.log('All tables:', rows.map(r => Object.values(r)[0]));

    } catch (e) {
        console.error('Error:', e.message, e.code);
    } finally {
        await c.end();
    }
}

createBuildersTable();
