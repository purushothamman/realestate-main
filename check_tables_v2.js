const mysql = require('mysql2/promise');
require('dotenv').config({ path: './backend/.env' });

async function checkAllTables() {
    console.log('🔌 Connecting to database...');
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'realestate'
    });

    try {
        console.log('✅ Connected!');
        const [rows] = await connection.query('SHOW TABLES');
        const tables = rows.map(r => Object.values(r)[0]);
        console.log('📋 Existing Tables:', tables);

        const requiredTables = [
            'users',
            'builders',
            'properties',
            'property_images',
            'inquiries',
            'chats',
            'messages',
            'property_requests'
        ];

        console.log('\n🔍 Verification:');
        requiredTables.forEach(table => {
            if (tables.includes(table)) {
                console.log(`   ✅ ${table}`);
            } else {
                console.log(`   ❌ ${table} (MISSING)`);
            }
        });

    } catch (error) {
        console.error('❌ Error checking DB:', error);
    } finally {
        await connection.end();
    }
}

checkAllTables();
