const mysql = require('mysql2/promise');
require('dotenv').config({ path: './backend/.env' });

async function standardizeBuilderTable() {
    console.log('🔌 Connecting to database...');
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'realestate'
    });

    try {
        console.log('✅ Connected!');

        // Check if both tables exist
        const [builderTables] = await connection.query("SHOW TABLES LIKE 'builder'");
        const [buildersTables] = await connection.query("SHOW TABLES LIKE 'builders'");

        console.log('\n📊 Current state:');
        console.log(`   builder table exists: ${builderTables.length > 0}`);
        console.log(`   builders table exists: ${buildersTables.length > 0}`);

        if (builderTables.length > 0) {
            // Check if there's any data in builder table
            const [builderData] = await connection.query('SELECT COUNT(*) as count FROM builder');
            console.log(`   builder table has ${builderData[0].count} rows`);

            if (builderData[0].count > 0) {
                console.log('\n⚠️  WARNING: builder table has data!');
                console.log('   You should manually migrate this data to builders table first.');
            } else {
                console.log('\n🗑️  Dropping empty builder table...');
                await connection.query('DROP TABLE IF EXISTS builder');
                console.log('   ✅ Dropped builder table');
            }
        }

        if (buildersTables.length > 0) {
            console.log('\n🔍 Checking builders table structure...');
            const [columns] = await connection.query('SHOW COLUMNS FROM builders');
            console.table(columns.map(c => ({ Field: c.Field, Type: c.Type, Null: c.Null, Key: c.Key })));
        } else {
            console.log('\n❌ builders table does not exist! Need to create it.');
        }

        console.log('\n✨ Done!');

    } catch (error) {
        console.error('\n❌ Error:', error);
    } finally {
        await connection.end();
    }
}

standardizeBuilderTable();
