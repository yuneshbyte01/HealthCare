#!/usr/bin/env node
/**
 * Test script for Analytics API endpoints
 * Tests all analytics routes to ensure they work correctly
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Test data - you'll need to replace with actual JWT token
const TEST_TOKEN = 'your-jwt-token-here'; // Replace with actual token from login

async function testAnalyticsEndpoints() {
  console.log('🧪 Testing Analytics API Endpoints');
  console.log('=' * 50);

  const headers = {
    'Authorization': `Bearer ${TEST_TOKEN}`,
    'Content-Type': 'application/json'
  };

  const endpoints = [
    {
      name: 'Trends',
      url: '/analytics/trends',
      method: 'GET'
    },
    {
      name: 'Alerts',
      url: '/analytics/alerts',
      method: 'GET'
    },
    {
      name: 'Geographic',
      url: '/analytics/geographic',
      method: 'GET'
    },
    {
      name: 'Performance',
      url: '/analytics/performance',
      method: 'GET'
    }
  ];

  for (const endpoint of endpoints) {
    console.log(`\n📊 Testing ${endpoint.name} endpoint...`);
    
    try {
      const response = await axios({
        method: endpoint.method,
        url: `${BASE_URL}${endpoint.url}`,
        headers: headers,
        timeout: 10000
      });

      console.log(`✅ ${endpoint.name}: ${response.status}`);
      console.log(`📈 Response:`, JSON.stringify(response.data, null, 2));

    } catch (error) {
      if (error.response) {
        console.log(`❌ ${endpoint.name}: ${error.response.status}`);
        console.log(`📝 Error:`, error.response.data);
      } else if (error.request) {
        console.log(`❌ ${endpoint.name}: Network Error`);
        console.log(`📝 Details:`, error.message);
      } else {
        console.log(`❌ ${endpoint.name}: ${error.message}`);
      }
    }
  }

  console.log('\n' + '=' * 50);
  console.log('🏁 Analytics API Testing Complete');
  console.log('\n💡 Note: Make sure to:');
  console.log('1. Start the backend server: npm run dev');
  console.log('2. Replace TEST_TOKEN with actual JWT token');
  console.log('3. Ensure you have some appointment data in the database');
}

// Run the test
testAnalyticsEndpoints().catch(console.error);
