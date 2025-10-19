#!/usr/bin/env node

// Test Forge server detection
const ForgeHandler = require('./src/forge-handler');

console.log('🧪 Testing Forge server detection...\n');

// Test cases
const testCases = [
  {
    name: 'Forge server kick message',
    reason: {"text":"This server has mods that require Forge to be installed on the client. Contact your server admin for more details."},
    expected: true
  },
  {
    name: 'Regular kick message',
    reason: {"text":"You were kicked for cheating!"},
    expected: false
  },
  {
    name: 'String kick message with Forge',
    reason: "This server has mods that require Forge",
    expected: true
  },
  {
    name: 'String kick message without Forge',
    reason: "You were banned from this server",
    expected: false
  }
];

testCases.forEach((testCase, index) => {
  const result = ForgeHandler.isForgeServer(testCase.reason);
  const status = result === testCase.expected ? '✅' : '❌';
  
  console.log(`${status} Test ${index + 1}: ${testCase.name}`);
  console.log(`   Input: ${JSON.stringify(testCase.reason)}`);
  console.log(`   Expected: ${testCase.expected}, Got: ${result}`);
  console.log('');
});

console.log('🔧 Forge compatibility message:');
console.log(ForgeHandler.getForgeCompatibilityMessage());