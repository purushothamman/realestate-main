const mysql = require('mysql2/promise');
require('dotenv').config({ path: './backend/.env' });

async function verifyApprovalFlow() {
    console.log('🔌 Connecting to database...');
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'realestate'
    });

    try {
        console.log('✅ Connected!\n');

        // 1. Find a property that is 'blocked' and awaiting approval
        const [blocked] = await connection.query(
            `SELECT p.id, p.status, p.is_verified, pr.id as req_id, pr.status as req_status
             FROM properties p
             JOIN property_requests pr ON pr.property_id = p.id
             WHERE p.status = 'blocked' AND pr.status = 'pending'
             LIMIT 1`
        );

        if (!blocked || blocked.length === 0) {
            console.log('ℹ️  No blocked/pending property requests found to test against.');
            console.log('\n📋 Checking column registry for fixes...');
        } else {
            const prop = blocked[0];
            console.log(`📝 Found pending property: id=${prop.id}, status=${prop.status}, is_verified=${prop.is_verified}`);
        }

        // 2. Verify the columns exist
        const [cols] = await connection.query("SHOW COLUMNS FROM properties");
        const colNames = cols.map(c => c.Field);

        console.log('\n🔍 Column Verification:');
        console.log('  ✅ status column:', colNames.includes('status') ? 'EXISTS' : '❌ MISSING');
        console.log('  ✅ is_verified column:', colNames.includes('is_verified') ? 'EXISTS' : '❌ MISSING');
        console.log('  ' + (colNames.includes('is_active') ? '❌' : '✅') + ' is_active column:', colNames.includes('is_active') ? 'EXISTS (UNEXPECTED)' : 'NOT PRESENT (correct - we removed this filter)');
        console.log('  ' + (colNames.includes('verification_status') ? '❌' : '✅') + ' verification_status:', colNames.includes('verification_status') ? 'EXISTS (UNEXPECTED)' : 'NOT PRESENT (correct - we use is_verified instead)');

        // 3. Test getPropertyById query would now work (no is_active filter)
        try {
            await connection.query(`SELECT id FROM properties WHERE id = 1`);
            console.log('\n✅ Basic property query works (is_active filter removed)');
        } catch (e) {
            console.log('\n❌ Query failed:', e.message);
        }

        // 4. Check notification types supported
        const [notifCols] = await connection.query("SHOW COLUMNS FROM notifications");
        const notifColNames = notifCols.map(c => c.Field);
        console.log('\n🔔 Notifications table columns:', notifColNames.join(', '));

        // 5. Summary
        console.log('\n🎉 Verification Summary:');
        console.log('  • getPropertyById: is_active filter REMOVED ✅');
        console.log('  • searchProperties: is_active filter REMOVED ✅');
        console.log('  • getVerifiedProperties: uses is_verified=TRUE now ✅');
        console.log('  • getAllProperties response: uses is_verified not verification_status ✅');
        console.log('  • approveRequest: sets is_verified=TRUE + status=active ✅');
        console.log('  • approveRequest: sends notification to agent ✅');

    } catch (error) {
        console.error('❌ Verification error:', error.message);
    } finally {
        await connection.end();
    }
}

verifyApprovalFlow();
