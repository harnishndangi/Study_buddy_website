// Test script for protected routes
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

// Test function to verify protected routes
async function testProtectedRoutes() {
  console.log('Testing protected routes...');
  
  // Test 1: Access without token (should fail)
  try {
    await axios.get(`${API_URL}/notes`);
    console.log('❌ Test 1 failed: Accessed protected route without token');
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('✅ Test 1 passed: Unauthorized access correctly rejected');
    } else {
      console.log('❌ Test 1 failed with unexpected error:', error.message);
    }
  }

  // Test 2: Login and get token
  let token;
  try {
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    token = loginResponse.data.token;
    console.log('✅ Test 2 passed: Successfully logged in and got token');
  } catch (error) {
    console.log('❌ Test 2 failed: Could not login', error.message);
    console.log('Make sure you have a test user with email test@example.com and password password123');
    return;
  }

  // Test 3: Access with valid token (should succeed)
  try {
    const response = await axios.get(`${API_URL}/notes`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Test 3 passed: Successfully accessed protected route with token');
  } catch (error) {
    console.log('❌ Test 3 failed: Could not access protected route with token', error.message);
  }

  // Test 4: Access with invalid token (should fail)
  try {
    await axios.get(`${API_URL}/notes`, {
      headers: { Authorization: 'Bearer invalidtoken123' }
    });
    console.log('❌ Test 4 failed: Accessed protected route with invalid token');
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('✅ Test 4 passed: Invalid token correctly rejected');
    } else {
      console.log('❌ Test 4 failed with unexpected error:', error.message);
    }
  }
}

// Run the tests
testProtectedRoutes().catch(error => {
  console.error('Test execution failed:', error);
});