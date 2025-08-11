const axios = require('axios');

async function testDepartmentCreation() {
  try {
    console.log('🧪 Testing department creation API...');
    
    // First, let's try to authenticate and get a token
    console.log('🔐 Authenticating...');
    const authResponse = await axios.post('http://localhost:5001/api/v1/auth/login', {
      email: 'admin@saec.edu.in',
      password: 'admin123'
    });
    
    const token = authResponse.data.token;
    console.log('✅ Authentication successful');
    
    // Now test department creation
    console.log('🏗️ Creating test department...');
    const departmentData = {
      name: 'Test Software Engineering',
      code: 'TSE',
      description: 'Test department for software engineering',
      courseCategory: '6898b3016655e5040582e9b1' // PG category ID
    };
    
    const response = await axios.post('http://localhost:5001/api/v1/departments', departmentData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Department created successfully!');
    console.log('📊 Response status:', response.status);
    console.log('📋 Response data:', JSON.stringify(response.data, null, 2));
    
    // Clean up - delete the test department
    if (response.data.data && response.data.data.department && response.data.data.department._id) {
      console.log('🧹 Cleaning up test department...');
      await axios.delete(`http://localhost:5001/api/v1/departments/${response.data.data.department._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Test department deleted');
    }
    
  } catch (error) {
    console.error('❌ Error testing department creation:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message || error.message);
    console.error('Full error:', error.response?.data || error.message);
  }
}

testDepartmentCreation();
