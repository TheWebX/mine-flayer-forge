const mineflayer = require('mineflayer');
const AIGunner = require('../src/ai-gunner');
const ConfigLoader = require('../src/config-loader');
const PluginLoader = require('../src/plugin-loader');

// Simple advanced usage example that works reliably
class SimpleAdvancedAIGunner {
  constructor() {
    this.configLoader = new ConfigLoader();
    this.bot = null;
    this.aiGunner = null;
  }

  async start() {
    // Load configuration
    const serverConfig = this.configLoader.getServerConfig();
    const aiSettings = this.configLoader.getAIConfig();

    console.log('🚀 Starting Simple Advanced AI Gunner...');
    console.log(`📡 Server: ${serverConfig.host}:${serverConfig.port}`);
    console.log(`👤 Username: ${serverConfig.username}`);

    try {
      await this.createBot(serverConfig);
      this.setupEventHandlers(aiSettings);
      console.log('✅ Bot created and configured successfully');
    } catch (error) {
      console.error('❌ Failed to create bot:', error.message);
      console.error('💡 Try specifying a version in config.json (e.g., "1.19.3")');
      process.exit(1);
    }
  }

  async createBot(serverConfig) {
    // Use a specific version to avoid auto-detection issues
    const version = serverConfig.version || '1.19.3';
    
    const botOptions = {
      host: serverConfig.host,
      port: serverConfig.port,
      username: serverConfig.username,
      password: serverConfig.password,
      auth: serverConfig.auth,
      version: version,
      hideErrors: false,
      checkTimeoutInterval: 60000,
      keepAlive: true
    };

    console.log(`🎮 Using Minecraft version: ${version}`);
    this.bot = mineflayer.createBot(botOptions);
    return this.bot;
  }

  setupEventHandlers(aiSettings) {
    // Load plugins using the plugin loader
    PluginLoader.loadPluginsWithLogging(this.bot);

    // Initialize AI Gunner
    this.aiGunner = new AIGunner(this.bot, aiSettings);

    this.bot.on('login', () => {
      console.log(`🔐 [${this.bot.username}] Logged in successfully`);
    });

    this.bot.on('spawn', () => {
      console.log(`🎮 [${this.bot.username}] Spawned in world`);
      try {
        this.aiGunner.initialize();
        console.log('🤖 AI Gunner is now active!');
        console.log('💬 Use chat commands: !start, !stop, !status, !help');
      } catch (error) {
        console.error('❌ Failed to initialize AI Gunner:', error.message);
      }
    });

    this.bot.on('chat', (username, message) => {
      if (username === this.bot.username) return;
      
      if (message.startsWith('!')) {
        const command = message.slice(1).toLowerCase();
        try {
          this.handleAdvancedCommand(command, username);
        } catch (error) {
          console.error('❌ Command error:', error.message);
        }
      }
    });

    this.bot.on('health', () => {
      if (this.bot.health < 20 && aiSettings.autoHeal) {
        console.log(`❤️  [${this.bot.username}] Health: ${this.bot.health}/20`);
        try {
          this.aiGunner.handleLowHealth();
        } catch (error) {
          console.error('❌ Health handling error:', error.message);
        }
      }
    });

    this.bot.on('death', () => {
      console.log(`💀 [${this.bot.username}] Died! Respawning...`);
      if (this.aiGunner) {
        this.aiGunner.shutdown();
      }
      
      // Restart AI after respawn
      setTimeout(() => {
        if (this.aiGunner) {
          this.aiGunner.initialize();
        }
      }, 5000);
    });

    this.bot.on('error', (err) => {
      console.error(`❌ [${this.bot.username}] Error:`, err.message);
      
      // Handle specific errors
      if (err.message && err.message.includes('version')) {
        console.error('🔧 Version Error Solutions:');
        console.error('   1. Add "version": "1.19.3" to config.json');
        console.error('   2. Check if server is running the expected version');
        console.error('   3. Try different versions: 1.19.3, 1.19.4, 1.20.1');
      } else if (err.message && err.message.includes('ECONNREFUSED')) {
        console.error('🔌 Connection Error:');
        console.error('   1. Check if the server is running');
        console.error('   2. Verify host and port are correct');
        console.error('   3. Check firewall settings');
      }
    });

    this.bot.on('kicked', (reason) => {
      console.error(`🚫 [${this.bot.username}] Kicked:`, reason);
    });

    this.bot.on('end', () => {
      console.log(`👋 [${this.bot.username}] Disconnected`);
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

  handleAdvancedCommand(command, username) {
    switch (command) {
      case 'config':
        this.bot.chat(`Search Radius: ${this.aiGunner.settings.searchRadius}`);
        this.bot.chat(`Attack Range: ${this.aiGunner.settings.attackRange}`);
        break;
      case 'weapons':
        const weapons = this.bot.inventory.items().filter(item => 
          this.aiGunner.isGunItem(item.name)
        );
        this.bot.chat(`Weapons: ${weapons.map(w => w.name).join(', ')}`);
        break;
      case 'mobs':
        const nearbyMobs = this.bot.nearestEntity(entity => 
          entity.type === 'mob' && this.aiGunner.hostileMobs.has(entity.name)
        );
        if (nearbyMobs) {
          this.bot.chat(`Nearby hostile: ${nearbyMobs.name}`);
        } else {
          this.bot.chat('No hostile mobs nearby');
        }
        break;
      case 'stats':
        this.bot.chat(`Health: ${this.bot.health}/20`);
        this.bot.chat(`Food: ${this.bot.food}/20`);
        this.bot.chat(`Position: ${this.bot.entity.position.toString()}`);
        break;
      case 'version':
        this.bot.chat(`Minecraft version: ${this.bot.version}`);
        break;
      default:
        // Fall back to basic commands
        this.aiGunner.handleCommand(command, username);
    }
  }

  isHostileMob(mobName) {
    return this.aiGunner && this.aiGunner.hostileMobs.has(mobName);
  }

  isGunItem(itemName) {
    return this.aiGunner && this.aiGunner.isGunItem(itemName);
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

// Export the class for use in other files
module.exports = SimpleAdvancedAIGunner;

// Usage (only run if this file is executed directly)
if (require.main === module) {
  const simpleAI = new SimpleAdvancedAIGunner();
  simpleAI.start();

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('🛑 Shutting down Simple Advanced AI Gunner...');
    simpleAI.shutdown();
    process.exit(0);
  });
}