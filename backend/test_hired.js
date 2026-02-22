const mysql = require('mysql2/promise');
require('dotenv').config({ path: './.env' }); // Adjust if needed

async function testHiredAgents() {
    try {
        const pool = mysql.createPool({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'realestate_app'
        });

        console.log("Checking builder_agents table:");
        const [baRows] = await pool.query('SELECT * FROM builder_agents');
        console.log("Builder Agents:", baRows);

        console.log("\nSimulating getHiredAgents for builder_id 2 (or pick one from above):");
        const builderId = baRows.length > 0 ? baRows[0].builder_id : 1;
        console.log("Using builder_id:", builderId);

        const [rows] = await pool.query(
            `SELECT u.id, u.name, u.email, u.phone, u.profile_image,
                ba.hired_at
         FROM builder_agents ba
         JOIN users u ON u.id = ba.agent_id
         WHERE ba.builder_id = ? AND u.role = 'agent' AND (u.is_blocked = FALSE OR u.is_blocked IS NULL)
         ORDER BY ba.hired_at DESC`,
            [builderId]
        );
        console.log("Results from getHiredAgents query:");
        console.log(rows);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

testHiredAgents();
