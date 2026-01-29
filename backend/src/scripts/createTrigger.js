const pool = require('../config/db');

const createTrigger = async () => {
    try {
        console.log('Creating trigger for verified_at automatic update...');

        // Drop trigger if exists to avoid errors
        await pool.query("DROP TRIGGER IF EXISTS update_verified_at_timestamp");

        // Create the trigger
        await pool.query(`
            CREATE TRIGGER update_verified_at_timestamp
            BEFORE UPDATE ON builders
            FOR EACH ROW
            BEGIN
                IF NEW.verification_status = 'verified' AND (OLD.verification_status != 'verified' OR OLD.verification_status IS NULL) THEN
                    SET NEW.verified_at = CURRENT_TIMESTAMP;
                END IF;
            END;
        `);

        console.log('✅ Trigger created successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Failed to create trigger:', err);
        process.exit(1);
    }
};

createTrigger();
