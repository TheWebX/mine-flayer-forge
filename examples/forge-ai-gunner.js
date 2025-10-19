#!/usr/bin/env node

// Forge-compatible AI Gunner using node-minecraft-protocol-forge
const ForgeMineflayer = require('../src/forge-mineflayer');
const ConfigLoader = require('../src/config-loader');
const PluginLoader = require('../src/plugin-loader');

class ForgeAIGunner {
  constructor() {
    this.configLoader = new ConfigLoader();
    this.forgeBot = null;
  }

  async start() {
    console.log('🚀 Starting Forge-compatible AI Gunner...');
    
    // Load configuration
    const serverConfig = this.configLoader.getServerConfig();
    const aiSettings = this.configLoader.getAIConfig();
    
    console.log(`📡 Server: ${serverConfig.host}:${serverConfig.port}`);
    console.log(`👤 Username: ${serverConfig.username}`);
    console.log(`🎮 Version: ${serverConfig.version}`);
    console.log('🔧 Using node-minecraft-protocol-forge for Forge compatibility\n');

    try {
      // Create Forge-compatible bot
      this.forgeBot = new ForgeMineflayer(serverConfig);
      await this.forgeBot.start();
      
      // Load plugins
      console.log('Loading plugins...');
      if (this.forgeBot.bot) {
        PluginLoader.loadPluginsWithLogging(this.forgeBot.bot);
      } else {
        console.log('⚠️  Bot not available for plugin loading');
      }
      
      console.log('✅ Forge AI Gunner is now running!');
      console.log('💬 Use chat commands: !start, !stop, !status, !help, !forge');
      console.log('🎯 The bot will hunt hostile mobs on your Forge server');
      
    } catch (error) {
      console.error('❌ Failed to start Forge AI Gunner:', error.message);
      console.log('\n💡 Troubleshooting:');
      console.log('1. Make sure your Forge server is running');
      console.log('2. Check that the server allows vanilla clients');
      console.log('3. Verify the host and port are correct');
      console.log('4. Try updating node-minecraft-protocol-forge');
      process.exit(1);
    }
  }

  shutdown() {
    if (this.forgeBot) {
      this.forgeBot.shutdown();
    }
  }
}

// Export the class
module.exports = ForgeAIGunner;

// Run if this file is executed directly
if (require.main === module) {
  const forgeAI = new ForgeAIGunner();
  forgeAI.start();

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down Forge AI Gunner...');
    forgeAI.shutdown();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down Forge AI Gunner...');
    forgeAI.shutdown();
    process.exit(0);
  });
}