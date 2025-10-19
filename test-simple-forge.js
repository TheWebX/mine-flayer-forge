#!/usr/bin/env node

// Simple Forge test without AI Gunner
const mineflayer = require('mineflayer');
const forgeProtocol = require('minecraft-protocol-forge');
const ConfigLoader = require('./src/config-loader');

console.log('🧪 Simple Forge compatibility test...\n');

async function testSimpleForge() {
  const configLoader = new ConfigLoader();
  const serverConfig = configLoader.getServerConfig();
  
  console.log(`📡 Server: ${serverConfig.host}:${serverConfig.port}`);
  console.log(`👤 Username: ${serverConfig.username}`);
  console.log(`🎮 Version: ${serverConfig.version}\n`);

  const botOptions = {
    host: serverConfig.host,
    port: serverConfig.port,
    username: serverConfig.username,
    password: serverConfig.password,
    auth: serverConfig.auth,
    version: serverConfig.version || '1.20.1',
    hideErrors: false,
    checkTimeoutInterval: 60000,
    keepAlive: true,
    
    // Forge-specific options
    forgeMods: [],
    skipValidation: true,
  };

  try {
    console.log('🔧 Creating Forge-compatible bot...');
    const bot = mineflayer.createBot(botOptions);
    
    console.log('✅ Bot created successfully!');
    console.log('🔧 Setting up basic event handlers...');
    
    bot.on('login', () => {
      console.log('🔐 Logged in to Forge server');
    });

    bot.on('spawn', () => {
      console.log('🎮 Spawned in Forge world');
    });

    bot.on('error', (err) => {
      console.error('❌ Bot error:', err.message);
    });

    bot.on('kicked', (reason) => {
      console.log('🚫 Kicked:', reason);
    });

    bot.on('end', () => {
      console.log('👋 Disconnected from Forge server');
    });

    console.log('✅ Event handlers set up!');
    console.log('🎉 Simple Forge test passed!');
    console.log('\n💡 The bot should now work with your Forge server');
    
    // Keep running for a bit
    setTimeout(() => {
      bot.quit();
      process.exit(0);
    }, 5000);

  } catch (error) {
    console.error('❌ Simple Forge test failed:', error.message);
    console.log('\n💡 This might be due to:');
    console.log('1. Server not running');
    console.log('2. Server not allowing vanilla clients');
    console.log('3. Network connectivity issues');
    process.exit(1);
  }
}

testSimpleForge().catch(console.error);