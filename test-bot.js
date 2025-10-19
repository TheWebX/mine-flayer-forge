#!/usr/bin/env node

// Test bot creation without connecting
const mineflayer = require('mineflayer');

console.log('🧪 Testing bot creation...');

const botOptions = {
  host: 'localhost',
  port: 53690,
  username: 'TestBot',
  auth: 'offline',
  hideErrors: true
};

// Test without version first
console.log('Testing without version...');
try {
  const bot1 = mineflayer.createBot(botOptions);
  console.log('✅ Bot created without version');
  bot1.quit();
} catch (error) {
  console.error('❌ Bot creation failed without version:', error.message);
}

// Test with version
console.log('Testing with version 1.19.4...');
try {
  const bot2 = mineflayer.createBot({
    ...botOptions,
    version: '1.19.4'
  });
  console.log('✅ Bot created with version 1.19.4');
  bot2.quit();
} catch (error) {
  console.error('❌ Bot creation failed with version:', error.message);
}

// Test with auto version
console.log('Testing with auto version...');
try {
  const bot3 = mineflayer.createBot({
    ...botOptions,
    version: 'auto'
  });
  console.log('✅ Bot created with auto version');
  bot3.quit();
} catch (error) {
  console.error('❌ Bot creation failed with auto version:', error.message);
}

console.log('Bot creation tests completed');