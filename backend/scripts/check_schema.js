const pool = require('../src/config/db');

async function checkSchema() {
    try {
        const [rows] = await pool.query("DESCRIBE builders");
        console.log("Schema for builders table:");
        console.table(rows);
    } catch (error) {
        console.error("Error checking schema:", error);
    } finally {
        process.exit();
    }
}

checkSchema();
