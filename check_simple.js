const mysql = require('mysql2/promise');
require('dotenv').config({ path: './backend/.env' });

async function check() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'realestate'
    });
    const [cols] = await connection.query("SHOW COLUMNS FROM properties");
    const names = cols.map(c => c.Field);
    console.log("HAS_IS_ACTIVE:" + names.includes('is_active'));
    console.log("HAS_VERIFICATION_STATUS:" + names.includes('verification_status'));
    console.log("HAS_IS_VERIFIED:" + names.includes('is_verified'));
    await connection.end();
}
check();
