// Script test để kiểm tra việc lấy departments
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testGetDepartments() {
    try {
        console.log('🧪 Testing get departments...');
        
        console.log('📡 Sending get departments request...');
        const response = await axios.get(`${API_BASE_URL}/departments`);
        
        if (response.data.success) {
            console.log('✅ Get departments successful!');
            console.log('🏢 Departments data:', JSON.stringify(response.data.data, null, 2));
            
            // Kiểm tra departments
            if (response.data.data && response.data.data.length > 0) {
                console.log('🏷️ Departments found:');
                response.data.data.forEach(dept => {
                    console.log(`   - ${dept.DepartmentName} (ID: ${dept.DepartmentID})`);
                    if (dept.ManagerID) {
                        console.log(`     Manager ID: ${dept.ManagerID}`);
                    }
                });
            } else {
                console.log('❌ No departments found');
            }
            
        } else {
            console.log('❌ Get departments failed:', response.data.error);
        }
        
    } catch (error) {
        if (error.response) {
            console.log('❌ Server responded with error:', error.response.status, error.response.data);
        } else if (error.request) {
            console.log('❌ No response received:', error.message);
            console.log('🔍 Make sure the backend server is running on http://localhost:5000');
        } else {
            console.log('❌ Error setting up request:', error.message);
        }
    }
}

async function testGetDepartmentById() {
    try {
        console.log('\n🧪 Testing get department by ID...');
        
        const departmentId = 1; // Test với department ID = 1
        console.log(`📡 Sending get department by ID request (ID: ${departmentId})...`);
        const response = await axios.get(`${API_BASE_URL}/departments/${departmentId}`);
        
        if (response.data.success) {
            console.log('✅ Get department by ID successful!');
            console.log('🏢 Department data:', JSON.stringify(response.data.data, null, 2));
            
            const dept = response.data.data;
            console.log(`🏷️ Department details:`);
            console.log(`   - Name: ${dept.DepartmentName}`);
            console.log(`   - ID: ${dept.DepartmentID}`);
            if (dept.ManagerID) {
                console.log(`   - Manager ID: ${dept.ManagerID}`);
            }
            
        } else {
            console.log('❌ Get department by ID failed:', response.data.error);
        }
        
    } catch (error) {
        if (error.response) {
            console.log('❌ Server responded with error:', error.response.status, error.response.data);
            if (error.response.status === 404) {
                console.log('💡 Department not found - this might be expected if no department with ID 1 exists');
            }
        } else if (error.request) {
            console.log('❌ No response received:', error.message);
            console.log('🔍 Make sure the backend server is running on http://localhost:5000');
        } else {
            console.log('❌ Error setting up request:', error.message);
        }
    }
}

async function testCreateDepartment() {
    try {
        console.log('\n🧪 Testing create department...');
        
        const newDepartment = {
            DepartmentName: 'Test Department ' + Date.now(),
            ManagerID: null // Hoặc có thể set một user ID hợp lệ
        };
        
        console.log('📡 Sending create department request...');
        console.log('📋 Department data to create:', JSON.stringify(newDepartment, null, 2));
        
        const response = await axios.post(`${API_BASE_URL}/departments`, newDepartment);
        
        if (response.data.success) {
            console.log('✅ Create department successful!');
            console.log('🏢 Created department:', JSON.stringify(response.data.data, null, 2));
            
            const dept = response.data.data;
            console.log(`🎉 New department created:`);
            console.log(`   - Name: ${dept.DepartmentName}`);
            console.log(`   - ID: ${dept.DepartmentID}`);
            
            return dept.DepartmentID; // Return ID for further testing
            
        } else {
            console.log('❌ Create department failed:', response.data.error);
            return null;
        }
        
    } catch (error) {
        if (error.response) {
            console.log('❌ Server responded with error:', error.response.status, error.response.data);
        } else if (error.request) {
            console.log('❌ No response received:', error.message);
            console.log('🔍 Make sure the backend server is running on http://localhost:5000');
        } else {
            console.log('❌ Error setting up request:', error.message);
        }
        return null;
    }
}

async function testUpdateDepartment(departmentId) {
    if (!departmentId) {
        console.log('\n⚠️ Skipping update test - no department ID provided');
        return;
    }
    
    try {
        console.log('\n🧪 Testing update department...');
        
        const updateData = {
            DepartmentName: 'Updated Test Department ' + Date.now(),
            ManagerID: null
        };
        
        console.log(`📡 Sending update department request (ID: ${departmentId})...`);
        console.log('📋 Update data:', JSON.stringify(updateData, null, 2));
        
        const response = await axios.put(`${API_BASE_URL}/departments/${departmentId}`, updateData);
        
        if (response.data.success) {
            console.log('✅ Update department successful!');
            console.log('🏢 Updated department:', JSON.stringify(response.data.data, null, 2));
            
        } else {
            console.log('❌ Update department failed:', response.data.error);
        }
        
    } catch (error) {
        if (error.response) {
            console.log('❌ Server responded with error:', error.response.status, error.response.data);
        } else if (error.request) {
            console.log('❌ No response received:', error.message);
        } else {
            console.log('❌ Error setting up request:', error.message);
        }
    }
}

async function testDeleteDepartment(departmentId) {
    if (!departmentId) {
        console.log('\n⚠️ Skipping delete test - no department ID provided');
        return;
    }
    
    try {
        console.log('\n🧪 Testing delete department...');
        
        console.log(`📡 Sending delete department request (ID: ${departmentId})...`);
        const response = await axios.delete(`${API_BASE_URL}/departments/${departmentId}`);
        
        if (response.data.success) {
            console.log('✅ Delete department successful!');
            console.log('🗑️ Department deleted successfully');
            
        } else {
            console.log('❌ Delete department failed:', response.data.error);
        }
        
    } catch (error) {
        if (error.response) {
            console.log('❌ Server responded with error:', error.response.status, error.response.data);
        } else if (error.request) {
            console.log('❌ No response received:', error.message);
        } else {
            console.log('❌ Error setting up request:', error.message);
        }
    }
}

// Chạy tất cả các test
async function runDepartmentTests() {
    console.log('🚀 Starting department API tests...\n');
    
    // Test 1: Get all departments
    await testGetDepartments();
    
    // Test 2: Get department by ID
    await testGetDepartmentById();
    
    // Test 3: Create new department
    const createdDepartmentId = await testCreateDepartment();
    
    // Test 4: Update department (sử dụng department vừa tạo)
    await testUpdateDepartment(createdDepartmentId);
    
    // Test 5: Delete department (sử dụng department vừa tạo)
    await testDeleteDepartment(createdDepartmentId);
    
    console.log('\n✨ Department tests completed!');
}

// Chạy test
runDepartmentTests();
