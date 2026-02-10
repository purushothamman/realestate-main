const mysql = require('mysql2/promise');
require('dotenv').config({ path: './backend/.env' });

async function createBuilderTable() {
    console.log('🔌 Connecting to database...');
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'realestate'
    });

    try {
        console.log('✅ Connected!');

        console.log('🛠️ Creating "builder" table...');

        await connection.query(`
            CREATE TABLE IF NOT EXISTS builder (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL,
                name VARCHAR(255),
                email VARCHAR(255),
                phone VARCHAR(20),
                password VARCHAR(255),
                profile_image LONGTEXT,
                company_name VARCHAR(255),
                gst_no VARCHAR(50),
                pan_no VARCHAR(50),
                website VARCHAR(255),
                registration_certificate LONGTEXT,
                description LONGTEXT,
                experience_years INT,
                total_projects INT,
                address TEXT,
                city VARCHAR(100),
                state VARCHAR(100),
                pincode VARCHAR(20),
                verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB;
        `);

        console.log('✨ "builder" table created successfully!');

    } catch (error) {
        console.error('❌ Error creating table:', error);
    } finally {
        await connection.end();
    }
}

createBuilderTable();
