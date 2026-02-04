const mysql = require('mysql2/promise');
require('dotenv').config({ path: './backend/.env' });

async function checkDb() {
    console.log('🔌 Connecting to database...');
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'realestate'
    });

    try {
        console.log('✅ Connected!');

        console.log('\n🔍 Checking property_types table:');
        const [types] = await connection.query('SELECT * FROM property_types');
        console.table(types);

        console.log('\n🔍 Checking users table (first 5):');
        const [users] = await connection.query('SELECT id, name, email, role FROM users LIMIT 5');
        console.table(users);

    } catch (error) {
        console.error('❌ Error checking DB:', error);
    } finally {
        await connection.end();
    }
}

checkDb();
