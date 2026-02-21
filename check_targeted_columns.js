const mysql = require('mysql2/promise');
require('dotenv').config({ path: './backend/.env' });

async function checkSpecificColumns() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'realestate'
    });

    try {
        const [columns] = await connection.query("SHOW COLUMNS FROM properties");
        const fields = columns.map(c => c.Field);

        console.log("Column check for 'properties' table:");
        console.log("- is_active exists:", fields.includes('is_active'));
        console.log("- verification_status exists:", fields.includes('verification_status'));
        console.log("- is_verified exists:", fields.includes('is_verified'));
        console.log("- status exists:", fields.includes('status'));

        const [reqColumns] = await connection.query("SHOW COLUMNS FROM property_requests");
        const reqFields = reqColumns.map(c => c.Field);
        console.log("\nColumn check for 'property_requests' table:");
        console.log("- status exists:", reqFields.includes('status'));

    } catch (error) {
        console.error(error);
    } finally {
        await connection.end();
    }
}

checkSpecificColumns();
