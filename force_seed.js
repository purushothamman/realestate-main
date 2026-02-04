const mysql = require('mysql2/promise');
require('dotenv').config({ path: './backend/.env' });

async function forceSeed() {
    console.log('🔌 Connecting to database...');
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'realestate'
    });

    try {
        console.log('✅ Connected!');

        // 1. Disable FK checks to allow truncation
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');

        console.log('🗑️ Truncating property_types...');
        await connection.query('TRUNCATE TABLE property_types');

        console.log('🌱 Inserting property types with explicit IDs...');
        const propertyTypes = [
            { id: 1, name: 'Apartment', category: 'residential' },
            { id: 2, name: 'Villa', category: 'residential' },
            { id: 3, name: 'Plot', category: 'land' },
            { id: 4, name: 'Commercial', category: 'commercial' }
        ];

        for (const type of propertyTypes) {
            await connection.query(
                'INSERT INTO property_types (id, name, category) VALUES (?, ?, ?)',
                [type.id, type.name, type.category]
            );
            console.log(`   + Added ${type.name} (ID: ${type.id})`);
        }

        // 2. Re-enable FK checks
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log('\n✨ Force seed completed! IDs 1-4 are guaranteed.');

    } catch (error) {
        console.error('\n❌ Error force seeding:', error);
    } finally {
        await connection.end();
    }
}

forceSeed();
