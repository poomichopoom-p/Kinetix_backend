
const BASE_URL = 'http://localhost:5000/api';
let accessToken = '';

async function runTest() {
  console.log('--- Starting E2E Verification ---');

  try {
    // 1. Login
    console.log('\n1. Testing Login...');
    const loginRes = await fetch(`${BASE_URL}/user/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testuser@kinetix.com',
        password: 'password123'
      })
    });
    const loginData = await loginRes.json();
    if (!loginData.success) throw new Error('Login failed: ' + JSON.stringify(loginData));
    accessToken = loginData.accessToken;
    console.log('✅ Login successful');

    const authHeaders = {
      'Authorization': `Bearer ${accessToken}`,
      'Cookie': `accessToken=${accessToken}`,
      'Content-Type': 'application/json'
    };

    // 2. Fetch Catalog
    console.log('\n2. Testing Product Catalog...');
    const prodRes = await fetch(`${BASE_URL}/products`);
    const prodData = await prodRes.json();
    if (!prodData.success) throw new Error('Fetch products failed');
    console.log(`✅ Fetched ${prodData.data.length} products`);

    // 3. Fetch Stats
    console.log('\n3. Testing User Stats...');
    const statsRes = await fetch(`${BASE_URL}/user/profile/stats`, { headers: authHeaders });
    const statsData = await statsRes.json();
    if (!statsData.success) throw new Error('Fetch stats failed');
    console.log('✅ Stats:', statsData.data);

    // 4. Fetch Active Rentals
    console.log('\n4. Testing Active Rentals...');
    const activeRes = await fetch(`${BASE_URL}/rentals/active`, { headers: authHeaders });
    const activeData = await activeRes.json();
    if (!activeData.success) throw new Error('Fetch active rentals failed');
    console.log(`✅ Fetched ${activeData.data.length} active rentals`);

    // 5. Fetch Rental History
    console.log('\n5. Testing Rental History...');
    const historyRes = await fetch(`${BASE_URL}/rentals/history`, { headers: authHeaders });
    const historyData = await historyRes.json();
    if (!historyData.success) throw new Error('Fetch history failed');
    console.log(`✅ Fetched ${historyData.data.length} historical items`);
    if (historyData.data.length > 0) {
        console.log('   Sample entry:', historyData.data[0]);
    }

    // 6. Fetch Rewards
    console.log('\n6. Testing Rewards...');
    const rewardsRes = await fetch(`${BASE_URL}/rewards/points`, { headers: authHeaders });
    const rewardsData = await rewardsRes.json();
    if (!rewardsData.success) throw new Error('Fetch rewards failed');
    console.log('✅ Rewards:', rewardsData.data);

    // 7. Test CSV Export
    console.log('\n7. Testing CSV Export...');
    const exportRes = await fetch(`${BASE_URL}/rentals/history/export`, { headers: authHeaders });
    const contentType = exportRes.headers.get('content-type');
    console.log(`   Status: ${exportRes.status}, Content-Type: ${contentType}`);
    if (exportRes.status !== 200 || !contentType.includes('text/csv')) {
        throw new Error(`CSV Export failed. Status: ${exportRes.status}, Type: ${contentType}`);
    }
    console.log('✅ CSV Export verified');

    console.log('\n--- E2E Verification Completed Successfully! ---');
  } catch (err) {
    console.error('\n❌ Verification Failed:', err.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

runTest();
