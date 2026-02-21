const mysql = require('mysql2/promise');
require('dotenv').config({ path: './backend/.env' });

async function getTableDesc() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'realestate'
    });

    try {
        const [columns] = await connection.query("DESC properties");
        console.log(JSON.stringify(columns, null, 2));
    } catch (error) {
        console.error(error);
    } finally {
        await connection.end();
    }
}

getTableDesc();
