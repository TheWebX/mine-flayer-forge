#!/usr/bin/env node

// Test Forge compatibility with node-minecraft-protocol-forge
const ForgeMineflayer = require('./src/forge-mineflayer');
const ConfigLoader = require('./src/config-loader');

console.log('🧪 Testing Forge compatibility with node-minecraft-protocol-forge...\n');

async function testForgeCompatibility() {
  const configLoader = new ConfigLoader();
  const serverConfig = configLoader.getServerConfig();
  
  console.log(`📡 Server: ${serverConfig.host}:${serverConfig.port}`);
  console.log(`👤 Username: ${serverConfig.username}`);
  console.log(`🎮 Version: ${serverConfig.version}\n`);

  const forgeBot = new ForgeMineflayer(serverConfig);

  try {
    console.log('🔧 Creating Forge-compatible bot...');
    const bot = await forgeBot.createBot();
    
    console.log('✅ Bot created successfully!');
    console.log('🔧 Setting up event handlers...');
    
    forgeBot.setupEventHandlers({});
    
    console.log('✅ Event handlers set up!');
    console.log('🎉 Forge compatibility test passed!');
    console.log('\n💡 The bot should now work with your Forge server');
    console.log('💡 Run: node examples/forge-ai-gunner.js');
    
    // Clean up
    setTimeout(() => {
      forgeBot.shutdown();
      process.exit(0);
    }, 2000);

  } catch (error) {
    console.error('❌ Forge compatibility test failed:', error.message);
    console.log('\n💡 This might be due to:');
    console.log('1. Server not running');
    console.log('2. Server not allowing vanilla clients');
    console.log('3. Network connectivity issues');
    console.log('4. Incompatible Forge server version');
    process.exit(1);
  }
}

testForgeCompatibility().catch(console.error);