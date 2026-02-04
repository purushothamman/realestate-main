const http = require('http');

// 1. First, we need a token. We'll try to register a unique user.
const uniqueId = Date.now();
const registerData = JSON.stringify({
    name: `Test User ${uniqueId}`,
    email: `test${uniqueId}@example.com`,
    phone: `${uniqueId}`.slice(0, 10),
    password: "TestPassword123",
    role: "builder",
    company_name: "Test Builders Inc."
});

console.log("🚀 STARTING AUTOMATED TEST");
console.log("----------------------------------------");

// Helper to make requests
function makeRequest(path, method, data, token = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data ? Buffer.byteLength(data) : 0
            }
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`; // Proper format
        }

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: body ? JSON.parse(body) : {}
                });
            });
        });

        req.on('error', (e) => reject(e));
        if (data) req.write(data);
        req.end();
    });
}

async function runTest() {
    try {
        // Step 1: Register
        console.log(`1️⃣  Registering user...`);
        const regRes = await makeRequest('/api/auth/register', 'POST', registerData);

        if (!regRes.body.token) {
            console.error("❌ Registration failed:", regRes.body);
            return;
        }

        const token = regRes.body.token;
        console.log("✅ Registration successful! Token acquired.");

        // Step 2: Test /add endpoint
        console.log(`\n2️⃣  Testing /api/properties/add endpoint...`);
        const propertyData = JSON.stringify({
            title: "Test Property Direct",
            description: "Direct API Test",
            price: 500000,
            listing_type: "sale",
            property_type_id: 1,
            address: "Direct Test",
            city: "Test City",
            state: "Test State"
        });

        const addRes = await makeRequest('/api/properties/add', 'POST', propertyData, token);

        console.log(`\n📊 RESULT: Status Code ${addRes.statusCode}`);
        console.log("Response Body:", JSON.stringify(addRes.body, null, 2));

        if (addRes.statusCode === 201 || addRes.statusCode === 200) {
            console.log("\n✅ SUCCESS: The route works!");
            console.log("👉 The issue is in your Postman configuration.");
        } else if (addRes.statusCode === 404) {
            console.log("\n❌ FAILED: Route still 404.");
            console.log("👉 The issue is definitely in the server code/routing.");
        } else {
            console.log("\n⚠️ OTHER ERROR: Check logs above.");
        }

    } catch (error) {
        console.error("❌ Test Script Error:", error.message);
    }
}

runTest();
