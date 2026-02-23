const mysql = require('mysql2/promise');
require('dotenv').config({ path: './backend/.env' });

async function listColumns() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'realestate'
    });

    try {
        const [props] = await connection.query("SHOW COLUMNS FROM properties");
        console.log("PROPERTIES COLUMNS:");
        props.forEach(c => console.log(c.Field));

        const [reqs] = await connection.query("SHOW COLUMNS FROM property_requests");
        console.log("\nPROPERTY_REQUESTS COLUMNS:");
        reqs.forEach(c => console.log(c.Field));
    } catch (error) {
        console.error(error);
    } finally {
        await connection.end();
    }
}

listColumns();
