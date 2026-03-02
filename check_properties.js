const mysql = require('mysql2/promise');
require('dotenv').config({ path: './backend/.env' });

async function checkPropertiesTable() {
    console.log('🔌 Connecting to database...');
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'realestate'
    });

    try {
        console.log('✅ Connected!');
        const [columns] = await connection.query("SHOW COLUMNS FROM properties");
        console.table(columns);
    } catch (error) {
        console.error('❌ Error checking DB:', error);
    } finally {
        await connection.end();
    }
}

checkPropertiesTable();
