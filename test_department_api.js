// Simple test to verify the department creation API fix
const http = require('http');

const testData = JSON.stringify({
  name: 'Test Department Fix',
  code: 'TDF',
  description: 'Testing the department creation fix',
  courseCategory: '507f1f77bcf86cd799439011' // Mock ObjectId
});

const options = {
  hostname: 'localhost',
  port: 5001,
  path: '/api/v1/departments',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(testData),
    // Note: This test will fail due to authentication, but we can see if the 500 error is fixed
    'Authorization': 'Bearer mock-token'
  }
};

console.log('🧪 Testing department creation API...');
console.log('📝 Test data:', JSON.parse(testData));

const req = http.request(options, (res) => {
  console.log(`📊 Status Code: ${res.statusCode}`);
  console.log(`📋 Headers:`, res.headers);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('📄 Response:', response);
      
      if (res.statusCode === 500) {
        console.log('❌ Still getting 500 error - need further investigation');
      } else if (res.statusCode === 401 || res.statusCode === 403) {
        console.log('✅ Good! No 500 error - getting expected auth error instead');
      } else {
        console.log('✅ API responding correctly');
      }
    } catch (error) {
      console.log('📄 Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error.message);
});

req.write(testData);
req.end();
