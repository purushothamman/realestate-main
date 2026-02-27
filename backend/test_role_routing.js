const pool = require('./src/config/db');

async function testRouting() {
    try {
        console.log('🧪 Starting Role-based Routing Verification...\n');

        // 1. Find a Builder and an Agent
        const [builderRows] = await pool.query("SELECT id, name FROM users WHERE role = 'builder' LIMIT 1");
        const [agentRows] = await pool.query("SELECT id, name FROM users WHERE role = 'agent' LIMIT 1");
        const [buyerRows] = await pool.query("SELECT id, name FROM users WHERE role = 'buyer' LIMIT 1");

        if (!builderRows.length || !agentRows.length || !buyerRows.length) {
            console.error('❌ Could not find required users (builder, agent, buyer) for testing.');
            process.exit(1);
        }

        const builder = builderRows[0];
        const agent = agentRows[0];
        const buyer = buyerRows[0];

        console.log(`👤 Test Users: Builder=${builder.name} (${builder.id}), Agent=${agent.name} (${agent.id}), Buyer=${buyer.name} (${buyer.id})`);

        // 2. Test Case 1: Builder-uploaded property
        console.log('\n--- Test Case 1: Builder-uploaded property ---');
        const [prop1Result] = await pool.query(
            "INSERT INTO properties (title, description, price, listing_type, property_type_id, address, city, state, uploaded_by, uploaded_by_role, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            ['Builder House', 'Test', 100000, 'sale', 1, 'Addr 1', 'City 1', 'State 1', builder.id, 'builder', 'active']
        );
        const prop1Id = prop1Result.insertId;

        // Simulate createInquiry logic
        const [p1Data] = await pool.query(
            "SELECT p.id, p.uploaded_by as builder_owned_id, pr.agent_id FROM properties p LEFT JOIN property_requests pr ON p.id = pr.property_id WHERE p.id = ?",
            [prop1Id]
        );
        const recipient1 = p1Data[0].agent_id || p1Data[0].builder_owned_id;

        if (recipient1 === builder.id) {
            console.log('✅ Success: Inquiry for Builder property routed to Builder.');
        } else {
            console.error(`❌ Failure: Inquiry for Builder property routed to ${recipient1} (expected ${builder.id}).`);
        }

        // 3. Test Case 2: Agent-uploaded property
        console.log('\n--- Test Case 2: Agent-uploaded property ---');
        const [prop2Result] = await pool.query(
            "INSERT INTO properties (title, description, price, listing_type, property_type_id, address, city, state, uploaded_by, uploaded_by_role, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            ['Agent House', 'Test', 200000, 'sale', 1, 'Addr 2', 'City 2', 'State 2', builder.id, 'builder', 'active']
        );
        const prop2Id = prop2Result.insertId;

        // Link agent to property via property_requests (simulating agent upload)
        await pool.query(
            "INSERT INTO property_requests (property_id, agent_id, builder_id, status) VALUES (?, ?, ?, ?)",
            [prop2Id, agent.id, builder.id, 'approved']
        );

        // Simulate createInquiry logic
        const [p2Data] = await pool.query(
            "SELECT p.id, p.uploaded_by as builder_owned_id, pr.agent_id FROM properties p LEFT JOIN property_requests pr ON p.id = pr.property_id WHERE p.id = ?",
            [prop2Id]
        );
        const recipient2 = p2Data[0].agent_id || p2Data[0].builder_owned_id;

        if (recipient2 === agent.id) {
            console.log('✅ Success: Inquiry for Agent property routed to Agent.');
        } else {
            console.error(`❌ Failure: Inquiry for Agent property routed to ${recipient2} (expected ${agent.id}).`);
        }

        // Cleanup
        console.log('\n🧹 Cleaning up test data...');
        await pool.query("DELETE FROM property_requests WHERE property_id IN (?, ?)", [prop1Id, prop2Id]);
        await pool.query("DELETE FROM properties WHERE id IN (?, ?)", [prop1Id, prop2Id]);

        console.log('\n🏁 Verification complete.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Verification Error:', err);
        process.exit(1);
    }
}

testRouting();
