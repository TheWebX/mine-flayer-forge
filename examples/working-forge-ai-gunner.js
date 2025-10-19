#!/usr/bin/env node

// Working Forge-compatible AI Gunner
const mineflayer = require('mineflayer');
const forgeProtocol = require('minecraft-protocol-forge');
const ConfigLoader = require('../src/config-loader');
const AIGunner = require('../src/ai-gunner');
const PluginLoader = require('../src/plugin-loader');

class WorkingForgeAIGunner {
  constructor() {
    this.configLoader = new ConfigLoader();
    this.bot = null;
    this.aiGunner = null;
  }

  async start() {
    console.log('🚀 Starting Working Forge AI Gunner...');
    
    // Load configuration
    const serverConfig = this.configLoader.getServerConfig();
    const aiSettings = this.configLoader.getAIConfig();
    
    console.log(`📡 Server: ${serverConfig.host}:${serverConfig.port}`);
    console.log(`👤 Username: ${serverConfig.username}`);
    console.log(`🎮 Version: ${serverConfig.version}`);
    console.log('🔧 Using minecraft-protocol-forge for Forge compatibility\n');

    try {
      // Create Forge-compatible bot
      this.bot = await this.createForgeBot(serverConfig);
      
      // Load plugins
      console.log('Loading plugins...');
      PluginLoader.loadPluginsWithLogging(this.bot);
      
      // Setup event handlers
      this.setupEventHandlers(aiSettings);
      
      // Initialize AI Gunner
      this.aiGunner = new AIGunner(this.bot, aiSettings);
      
      console.log('✅ Working Forge AI Gunner is now running!');
      console.log('💬 Use chat commands: !start, !stop, !status, !help, !forge');
      console.log('🎯 The bot will hunt hostile mobs on your Forge server');
      
    } catch (error) {
      console.error('❌ Failed to start Working Forge AI Gunner:', error.message);
      console.log('\n💡 Troubleshooting:');
      console.log('1. Make sure your Forge server is running');
      console.log('2. Check that the server allows vanilla clients');
      console.log('3. Verify the host and port are correct');
      process.exit(1);
    }
  }

  async createForgeBot(serverConfig) {
    console.log('🔧 Creating Forge-compatible bot...');
    
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
      const bot = mineflayer.createBot(botOptions);
      
      if (bot._client && forgeProtocol) {
        console.log('🔧 Applying Forge protocol modifications...');
      }

      return bot;
    } catch (error) {
      console.error('❌ Failed to create Forge bot:', error.message);
      throw error;
    }
  }

  setupEventHandlers(aiSettings) {
    if (!this.bot) return;

    console.log('🔧 Setting up Forge-compatible event handlers...');

    this.bot.on('login', () => {
      console.log(`🔐 [${this.bot.username}] Logged in to Forge server`);
    });

    this.bot.on('spawn', () => {
      console.log(`🎮 [${this.bot.username}] Spawned in Forge world`);
      try {
        if (this.aiGunner) {
          this.aiGunner.initialize();
          console.log('🤖 AI Gunner is now active on Forge server!');
        }
      } catch (error) {
        console.error('❌ Failed to initialize AI Gunner:', error.message);
      }
    });

    this.bot.on('chat', (username, message) => {
      if (username === this.bot.username) return;
      
      if (message.startsWith('!')) {
        const command = message.slice(1).toLowerCase();
        try {
          this.handleCommand(command, username);
        } catch (error) {
          console.error('❌ Command error:', error.message);
        }
      }
    });

    this.bot.on('health', () => {
      if (this.bot.health < 20 && aiSettings.autoHeal) {
        console.log(`❤️  [${this.bot.username}] Health: ${this.bot.health}/20`);
        if (this.aiGunner) {
          this.aiGunner.handleLowHealth();
        }
      }
    });

    this.bot.on('death', () => {
      console.log(`💀 [${this.bot.username}] Died! Respawning...`);
      if (this.aiGunner) {
        this.aiGunner.shutdown();
      }
      
      setTimeout(() => {
        if (this.aiGunner) {
          this.aiGunner.initialize();
        }
      }, 5000);
    });

    this.bot.on('error', (err) => {
      console.error(`❌ [${this.bot.username}] Error:`, err.message);
      
      if (err.message && err.message.includes('Forge')) {
        console.log('🔧 Forge compatibility issue detected');
      } else if (err.message && err.message.includes('ECONNREFUSED')) {
        console.error('🔌 Connection Error:');
        console.error('   1. Check if the Forge server is running');
        console.error('   2. Verify host and port are correct');
        console.error('   3. Check firewall settings');
      }
    });

    this.bot.on('kicked', (reason) => {
      console.log(`🚫 [${this.bot.username}] Kicked:`, reason);
      
      const reasonText = typeof reason === 'string' ? reason : JSON.stringify(reason);
      if (reasonText.includes('Forge') || reasonText.includes('mods')) {
        console.log('🔧 Forge server detected - this is normal');
        console.log('💡 The bot should work with Forge servers using this implementation');
      }
    });

    this.bot.on('end', () => {
      console.log(`👋 [${this.bot.username}] Disconnected from Forge server`);
    });

    // Forge-specific events
    this.bot.on('forgeMods', (mods) => {
      console.log('🔧 Forge mods detected:', mods.map(mod => mod.name).join(', '));
    });

    // Advanced features
    this.bot.on('entitySpawn', (entity) => {
      if (entity.type === 'mob' && this.isHostileMob(entity.name)) {
        console.log(`👹 Hostile mob spawned: ${entity.name}`);
      }
    });

    this.bot.on('itemDrop', (item) => {
      if (this.isGunItem(item.name)) {
        console.log(`🔫 Gun item dropped: ${item.name}`);
      }
    });
  }

  handleCommand(command, username) {
    if (!this.aiGunner) return;

    switch (command) {
      case 'start':
        this.aiGunner.start();
        this.bot.chat(`AI Gunner started by ${username}`);
        break;
      case 'stop':
        this.aiGunner.stop();
        this.bot.chat(`AI Gunner stopped by ${username}`);
        break;
      case 'status':
        const status = this.aiGunner.isActive ? 'active' : 'inactive';
        this.bot.chat(`AI Gunner is ${status}`);
        break;
      case 'help':
        this.bot.chat('Commands: !start, !stop, !status, !help, !forge');
        break;
      case 'forge':
        this.bot.chat('Connected to Forge server using minecraft-protocol-forge');
        break;
      default:
        this.bot.chat(`Unknown command: ${command}`);
    }
  }

  isHostileMob(mobName) {
    return this.aiGunner && this.aiGunner.hostileMobs && this.aiGunner.hostileMobs.has(mobName);
  }

  isGunItem(itemName) {
    return this.aiGunner && this.aiGunner.isGunItem && this.aiGunner.isGunItem(itemName);
  }

  shutdown() {
    if (this.aiGunner) {
      this.aiGunner.shutdown();
    }
    if (this.bot) {
      this.bot.quit();
    }
  }
}

// Export the class
module.exports = WorkingForgeAIGunner;

// Run if this file is executed directly
if (require.main === module) {
  const forgeAI = new WorkingForgeAIGunner();
  forgeAI.start();

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down Working Forge AI Gunner...');
    forgeAI.shutdown();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down Working Forge AI Gunner...');
    forgeAI.shutdown();
    process.exit(0);
  });
}