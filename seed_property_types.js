const mysql = require('mysql2/promise');
require('dotenv').config({ path: './backend/.env' });

async function seedPropertyTypes() {
    console.log('🔌 Connecting to database...');

    // Create connection using env vars
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'realestate'
    });

    try {
        console.log('✅ Connected!');

        // Define default property types matching the frontend map
        // 'apartment': 1, 'villa': 2, 'plot': 3, 'commercial': 4
        const propertyTypes = [
            { id: 1, name: 'Apartment', category: 'residential' },
            { id: 2, name: 'Villa', category: 'residential' },
            { id: 3, name: 'Plot', category: 'land' },
            { id: 4, name: 'Commercial', category: 'commercial' }
        ];

        console.log('🌱 Seeding property_types...');

        for (const type of propertyTypes) {
            // Check if exists
            const [rows] = await connection.query('SELECT id FROM property_types WHERE id = ?', [type.id]);

            if (rows.length === 0) {
                console.log(`   + Inserting ${type.name}...`);
                await connection.query(
                    'INSERT INTO property_types (id, name, category) VALUES (?, ?, ?)',
                    [type.id, type.name, type.category]
                );
            } else {
                console.log(`   ✓ ${type.name} (ID: ${type.id}) already exists`);
            }
        }

        console.log('\n✨ Seeding completed successfully!');

    } catch (error) {
        console.error('\n❌ Error seeding database:', error);
    } finally {
        await connection.end();
    }
}

seedPropertyTypes();
