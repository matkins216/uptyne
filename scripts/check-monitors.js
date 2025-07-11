// scripts/check-monitors.js
const https = require('https');
const http = require('http');

async function checkMonitors() {
  try {
    console.log('Starting monitor checks...');
    console.log('Make sure your development server is running on http://localhost:3000');
    
    const response = await fetch('http://localhost:3000/api/monitors/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Check results:', result);
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Connection refused. Please make sure your development server is running:');
      console.error('   npm run dev');
      console.error('   Then try running this script again.');
    } else {
      console.error('Error running monitor checks:', error.message);
    }
  }
}

// Run the checks
checkMonitors(); 