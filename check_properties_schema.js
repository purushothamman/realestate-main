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

        console.log('\n🔍 Checking "properties" table columns...');
        const [columns] = await connection.query("SHOW COLUMNS FROM properties");
        console.log(JSON.stringify(columns, null, 2));

        console.log('\n🔍 Checking "property_requests" table columns...');
        const [reqColumns] = await connection.query("SHOW COLUMNS FROM property_requests");
        console.log(JSON.stringify(reqColumns, null, 2));

    } catch (error) {
        console.error('❌ Error checking DB:', error);
    } finally {
        await connection.end();
    }
}

checkPropertiesTable();
