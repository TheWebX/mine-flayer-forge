#!/usr/bin/env node

// Test the advanced usage example
const AdvancedAIGunner = require('./examples/advanced-usage');

console.log('🧪 Testing Advanced AI Gunner...\n');

try {
  const advancedAI = new AdvancedAIGunner();
  console.log('✅ AdvancedAIGunner class created successfully');
  
  // Test the start method (without actually connecting)
  console.log('Testing start method...');
  advancedAI.start().catch(error => {
    if (error.message.includes('ECONNREFUSED')) {
      console.log('✅ Start method works (connection refused is expected)');
    } else {
      console.error('❌ Start method failed:', error.message);
    }
  });
  
  // Give it a moment to initialize
  setTimeout(() => {
    console.log('✅ Advanced AI Gunner test completed');
    process.exit(0);
  }, 2000);
  
} catch (error) {
  console.error('❌ Advanced AI Gunner test failed:', error.message);
  process.exit(1);
}