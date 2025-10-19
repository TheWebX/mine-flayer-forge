#!/usr/bin/env node

// Test Forge server compatibility
const ForgeWrapper = require('../src/forge-wrapper');
const ConfigLoader = require('../src/config-loader');

class ForgeCompatibilityTest {
  constructor() {
    this.configLoader = new ConfigLoader();
  }

  async testForgeConnection() {
    console.log('🧪 Testing Forge server compatibility...\n');

    const serverConfig = this.configLoader.getServerConfig();
    console.log(`📡 Server: ${serverConfig.host}:${serverConfig.port}`);
    console.log(`👤 Username: ${serverConfig.username}`);
    console.log(`🎮 Version: ${serverConfig.version}\n`);

    const forgeWrapper = new ForgeWrapper(serverConfig);

    try {
      const bot = await forgeWrapper.connect();
      forgeWrapper.setupEventHandlers();
      
      console.log('✅ Successfully connected to Forge server!');
      console.log('🎉 The bot is now running on your Forge server');
      
      // Keep the bot running for a bit to test
      setTimeout(() => {
        console.log('🛑 Test completed, disconnecting...');
        forgeWrapper.quit();
        process.exit(0);
      }, 10000);

    } catch (error) {
      console.error('❌ Failed to connect to Forge server:', error.message);
      console.log('\n💡 Solutions:');
      console.log('1. Use a vanilla Minecraft server instead');
      console.log('2. Use a Paper/Spigot server (usually compatible)');
      console.log('3. Ask the server admin to allow vanilla clients');
      console.log('4. Use a different bot framework that supports Forge');
      process.exit(1);
    }
  }
}

// Run the test
if (require.main === module) {
  const test = new ForgeCompatibilityTest();
  test.testForgeConnection().catch(console.error);
}

module.exports = ForgeCompatibilityTest;