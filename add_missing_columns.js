const mysql = require('mysql2/promise');
require('dotenv').config({ path: './backend/.env' });

async function addMissingColumns() {
    console.log('🔌 Connecting to database...');
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'realestate'
    });

    try {
        console.log('✅ Connected!');

        // Helper to add column if not exists
        const addColumnIfNotExists = async (table, column, definition) => {
            try {
                const [rows] = await connection.query(`SHOW COLUMNS FROM ${table} LIKE '${column}'`);
                if (rows.length === 0) {
                    console.log(`   + Adding ${column} to ${table}`);
                    await connection.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
                    console.log(`   ✅ Added ${column}`);
                } else {
                    console.log(`   ✓ ${column} already exists in ${table}`);
                }
            } catch (error) {
                console.error(`   ❌ Error adding ${column}:`, error.message);
            }
        };

        console.log('\n🛠️ Adding missing columns to users table...');
        await addColumnIfNotExists('users', 'last_login', 'TIMESTAMP NULL');
        await addColumnIfNotExists('users', 'profile_image', 'LONGTEXT');
        await addColumnIfNotExists('users', 'email_verified_at', 'TIMESTAMP NULL');

        console.log('\n✨ All missing columns added successfully!');

    } catch (error) {
        console.error('\n❌ Error:', error);
    } finally {
        await connection.end();
    }
}

addMissingColumns();
