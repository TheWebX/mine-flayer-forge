#!/usr/bin/env node

// Comprehensive Forge compatibility test
const AdvancedForgeHandler = require('./src/advanced-forge-handler');
const ConfigLoader = require('./src/config-loader');

console.log('🧪 Comprehensive Forge compatibility test...\n');

async function testComprehensiveForge() {
  const configLoader = new ConfigLoader();
  const serverConfig = configLoader.getServerConfig();
  
  console.log(`📡 Server: ${serverConfig.host}:${serverConfig.port}`);
  console.log(`👤 Username: ${serverConfig.username}`);
  console.log(`🎮 Version: ${serverConfig.version}\n`);

  const forgeHandler = new AdvancedForgeHandler(serverConfig);

  try {
    console.log('🔧 Testing advanced Forge connection...');
    const bot = await forgeHandler.connect();
    
    console.log('✅ Advanced Forge connection successful!');
    console.log('🔧 Setting up event handlers...');
    
    forgeHandler.setupEventHandlers();
    
    console.log('✅ Event handlers set up!');
    console.log('🎉 Comprehensive Forge test passed!');
    console.log('\n💡 The bot should now work with your Forge server');
    console.log('💡 Run: node examples/working-forge-ai-gunner.js');
    
    // Keep running for a bit to test
    setTimeout(() => {
      forgeHandler.quit();
      process.exit(0);
    }, 5000);

  } catch (error) {
    console.error('❌ Comprehensive Forge test failed:', error.message);
    console.log('\n💡 This Forge server appears to be incompatible with Mineflayer');
    console.log('💡 Solutions:');
    console.log('1. Use a vanilla Minecraft server instead');
    console.log('2. Use a Paper/Spigot server (usually compatible)');
    console.log('3. Ask the server admin to allow vanilla clients');
    console.log('4. Use a different bot framework that supports Forge');
    console.log('5. Try a different Minecraft version');
    process.exit(1);
  }
}

testComprehensiveForge().catch(console.error);