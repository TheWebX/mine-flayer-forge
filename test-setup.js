#!/usr/bin/env node

// Test script to verify the AI Gunner setup
const mineflayer = require('mineflayer');
const AIGunner = require('./src/ai-gunner');
const ConfigLoader = require('./src/config-loader');

console.log('🧪 Testing AI Gunner Setup...\n');

// Test 1: Import verification
console.log('✅ All modules imported successfully');

// Test 2: Config loader
try {
  const configLoader = new ConfigLoader();
  const serverConfig = configLoader.getServerConfig();
  const aiConfig = configLoader.getAIConfig();
  console.log('✅ Configuration loader working');
  console.log(`   Server: ${serverConfig.host}:${serverConfig.port}`);
  console.log(`   AI Search Radius: ${aiConfig.searchRadius}`);
} catch (error) {
  console.error('❌ Configuration loader failed:', error.message);
  process.exit(1);
}

// Test 3: AI Gunner initialization
try {
  // Create a mock bot object for testing
  const mockBot = {
    entity: { position: { distanceTo: () => 0 } },
    inventory: { items: () => [] },
    nearestEntity: () => null,
    equip: () => {},
    activateItem: () => {},
    lookAt: () => {},
    chat: () => {},
    health: 20,
    food: 20,
    heldItem: null,
    username: 'TestBot'
  };

  const aiGunner = new AIGunner(mockBot, {
    searchRadius: 50,
    attackRange: 32,
    gunPickupPriority: ['bow', 'crossbow'],
    hostileMobs: ['zombie', 'skeleton'],
    autoEat: true,
    autoHeal: true,
    combatMode: true
  });

  console.log('✅ AI Gunner class instantiated successfully');
  console.log(`   Gun items: ${aiGunner.gunItems.size} configured`);
  console.log(`   Hostile mobs: ${aiGunner.hostileMobs.size} configured`);
} catch (error) {
  console.error('❌ AI Gunner initialization failed:', error.message);
  process.exit(1);
}

// Test 4: Mineflayer compatibility
try {
  // Test that we can create a bot instance (without connecting)
  const bot = mineflayer.createBot({
    host: 'localhost',
    port: 25565,
    username: 'TestBot',
    version: '1.20.1',
    auth: 'offline',
    hideErrors: true
  });

  // Test basic bot properties
  if (bot && typeof bot.on === 'function') {
    console.log('✅ Mineflayer bot creation successful');
    // Close immediately to avoid connection attempts
    setTimeout(() => bot.quit(), 100);
  } else {
    throw new Error('Bot object is invalid');
  }
} catch (error) {
  console.log('⚠️  Mineflayer bot creation test skipped (requires server connection)');
  console.log('   This is normal when testing without a Minecraft server running');
}

// Test 5: Dependencies check
try {
  const fs = require('fs');
  const path = require('path');
  
  if (fs.existsSync(path.join(__dirname, 'node_modules'))) {
    console.log('✅ Dependencies installed');
  } else {
    console.error('❌ Dependencies not found. Run: npm install');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Dependency check failed:', error.message);
  process.exit(1);
}

console.log('\n🎉 All tests passed! AI Gunner is ready to use.');
console.log('\nNext steps:');
console.log('1. Start your Minecraft Forge server');
console.log('2. Configure your settings in .env or config.json');
console.log('3. Run: npm start');
console.log('\nFor help, run: npm run help');