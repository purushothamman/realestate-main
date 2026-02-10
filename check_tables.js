const mysql = require('mysql2/promise');
require('dotenv').config({ path: './backend/.env' });

async function checkBuildersTable() {
    console.log('🔌 Connecting to database...');
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'realestate'
    });

    try {
        console.log('✅ Connected!');

        console.log('\n🔍 Checking if "builders" table exists...');
        const [buildersTables] = await connection.query("SHOW TABLES LIKE 'builders'");
        if (buildersTables.length > 0) {
            console.log('   ✅ Table "builders" exists.');
            const [columns] = await connection.query("SHOW COLUMNS FROM builders");
            console.table(columns);
        } else {
            console.log('   ❌ Table "builders" does NOT exist.');
        }

        console.log('\n🔍 Checking if "builder" table exists...');
        const [builderTables] = await connection.query("SHOW TABLES LIKE 'builder'");
        if (builderTables.length > 0) {
            console.log('   ✅ Table "builder" exists.');
            const [columns] = await connection.query("SHOW COLUMNS FROM builder");
            console.table(columns);
        } else {
            console.log('   ❌ Table "builder" does NOT exist.');
        }

    } catch (error) {
        console.error('❌ Error checking DB:', error);
    } finally {
        await connection.end();
    }
}

checkBuildersTable();
