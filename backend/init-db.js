const pool = require('./src/config/db');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
    try {
        console.log('🔧 Initializing database tables...\n');

        // Read SQL file
        const sqlFile = path.join(__dirname, 'create-missing-tables.sql');
        const sql = fs.readFileSync(sqlFile, 'utf8');

        // Split by semicolon and execute each statement
        const statements = sql.split(';').filter(stmt => stmt.trim());

        for (const statement of statements) {
            try {
                console.log(`Executing: ${statement.substring(0, 50)}...`);
                await pool.query(statement);
                console.log('✅ Success\n');
            } catch (err) {
                if (err.code === 'ER_TABLE_EXISTS_ERROR') {
                    console.log('⚠️  Table already exists\n');
                } else {
                    console.error('❌ Error:', err.message);
                    throw err;
                }
            }
        }

        console.log('\n✅ Database initialization completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('\n❌ Database initialization failed:', err);
        process.exit(1);
    }
}

initializeDatabase();
