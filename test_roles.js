// Script test để kiểm tra việc lấy roles khi login
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testLoginWithRoles() {
    try {
        console.log('🧪 Testing login to fetch user with roles...');
        
        // Test với user 'dat' (UserID=4) có role 'director'
        const loginData = {
            username: 'dat',
            password: '123'
        };
        
        console.log('📡 Sending login request...');
        const response = await axios.post(`${API_BASE_URL}/auth/login`, loginData);
        
        if (response.data.success) {
            console.log('✅ Login successful!');
            console.log('👤 User data:', JSON.stringify(response.data.data.user, null, 2));
            
            // Kiểm tra roles
            if (response.data.data.user.roles && response.data.data.user.roles.length > 0) {
                console.log('🏷️ User roles found:');
                response.data.data.user.roles.forEach(role => {
                    console.log(`   - ${role.RoleName} (ID: ${role.RoleID}): ${role.Description}`);
                });
            } else {
                console.log('❌ No roles found for user');
            }
            
        } else {
            console.log('❌ Login failed:', response.data.error);
        }
        
    } catch (error) {
        console.error('🚨 Error testing login:', error.response?.data || error.message);
    }
}

// Test với user có nhiều roles
async function testMultipleRoles() {
    try {
        console.log('\n🧪 Testing user with department leader role...');
        
        // Test với user 'mra' (UserID=5) có role 'department leader'
        const loginData = {
            username: 'mra',
            password: '111'
        };
        
        console.log('📡 Sending login request for mra...');
        const response = await axios.post(`${API_BASE_URL}/auth/login`, loginData);
        
        if (response.data.success) {
            console.log('✅ Login successful for mra!');
            console.log('👤 User data:', JSON.stringify(response.data.data.user, null, 2));
            
            // Kiểm tra roles
            if (response.data.data.user.roles && response.data.data.user.roles.length > 0) {
                console.log('🏷️ User roles found:');
                response.data.data.user.roles.forEach(role => {
                    console.log(`   - ${role.RoleName} (ID: ${role.RoleID}): ${role.Description}`);
                });
            } else {
                console.log('❌ No roles found for user');
            }
            
        } else {
            console.log('❌ Login failed:', response.data.error);
        }
        
    } catch (error) {
        console.error('🚨 Error testing login:', error.response?.data || error.message);
    }
}

// Chạy test
async function runTests() {
    console.log('🚀 Starting role tests...\n');
    await testLoginWithRoles();
    await testMultipleRoles();
    console.log('\n✨ Tests completed!');
}

runTests();
