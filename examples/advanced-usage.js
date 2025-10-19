const mineflayer = require('mineflayer');
const AIGunner = require('../src/ai-gunner');
const ConfigLoader = require('../src/config-loader');
const PluginLoader = require('../src/plugin-loader');

// Advanced usage example with custom configuration
class AdvancedAIGunner {
  constructor() {
    this.configLoader = new ConfigLoader();
    this.bot = null;
    this.aiGunner = null;
  }

  async start() {
    // Load configuration
    const serverConfig = this.configLoader.getServerConfig();
    const aiSettings = this.configLoader.getAIConfig();

    // Add connection timeout
    const connectionTimeout = setTimeout(() => {
      console.error('Connection timeout. Server may not be responding.');
      console.error('Check if the server is running and accessible.');
      process.exit(1);
    }, 10000); // 10 second timeout

    // Create bot with custom settings
    const botOptions = {
      host: serverConfig.host,
      port: serverConfig.port,
      username: serverConfig.username,
      password: serverConfig.password,
      auth: serverConfig.auth,
      
      // Additional bot options
      hideErrors: false,
      checkTimeoutInterval: 60000,
      keepAlive: true
    };

    // Only add version if it's valid and not auto-detect
    if (serverConfig.version && 
        serverConfig.version !== 'auto' && 
        typeof serverConfig.version === 'string' &&
        serverConfig.version.match(/^\d+\.\d+(\.\d+)?$/)) {
      botOptions.version = serverConfig.version;
    }

    this.bot = mineflayer.createBot(botOptions);

    // Load plugins using the plugin loader
    PluginLoader.loadPluginsWithLogging(this.bot);

    // Initialize AI Gunner
    this.aiGunner = new AIGunner(this.bot, aiSettings);

    // Set up event handlers
    this.setupEventHandlers();

    console.log(`Starting Advanced AI Gunner on ${serverConfig.host}:${serverConfig.port}`);
  }

  setupEventHandlers() {
    this.bot.on('spawn', () => {
      console.log(`[${this.bot.username}] Spawned in world`);
      this.aiGunner.initialize();
      
      // Additional spawn logic
      this.setupAdvancedFeatures();
    });

    this.bot.on('chat', (username, message) => {
      if (username === this.bot.username) return;
      
      // Handle commands
      if (message.startsWith('!')) {
        const command = message.slice(1).toLowerCase();
        this.handleAdvancedCommand(command, username);
      }
    });

    this.bot.on('health', () => {
      if (this.bot.health < 20) {
        console.log(`[${this.bot.username}] Health: ${this.bot.health}/20`);
        this.aiGunner.handleLowHealth();
      }
    });

    this.bot.on('death', () => {
      console.log(`[${this.bot.username}] Died! Respawning...`);
      this.aiGunner.shutdown();
      
      // Restart AI after respawn
      setTimeout(() => {
        this.aiGunner.initialize();
      }, 5000);
    });

    this.bot.on('error', (err) => {
      console.error(`[${this.bot.username}] Error:`, err);
      
      // Handle version detection errors
      if (err.message && err.message.includes('version')) {
        console.error('Version detection error. This may be due to:');
        console.error('1. Server not responding to version ping');
        console.error('2. Server running on different Minecraft version');
        console.error('3. Server not accessible or not running');
        console.error('Try specifying a version in config.json (e.g., "1.20.1")');
      }
    });

    this.bot.on('kicked', (reason) => {
      console.error(`[${this.bot.username}] Kicked:`, reason);
    });

    this.bot.on('end', () => {
      console.log(`[${this.bot.username}] Disconnected`);
    });
  }

  setupAdvancedFeatures() {
    // Custom AI behaviors can be added here
    console.log('[AdvancedAIGunner] Advanced features initialized');
    
    // Example: Custom mob detection
    this.bot.on('entitySpawn', (entity) => {
      if (entity.type === 'mob' && this.isHostileMob(entity.name)) {
        console.log(`[AdvancedAIGunner] Hostile mob spawned: ${entity.name}`);
      }
    });

    // Example: Custom item detection
    this.bot.on('itemDrop', (item) => {
      if (this.isGunItem(item.name)) {
        console.log(`[AdvancedAIGunner] Gun item dropped: ${item.name}`);
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
      default:
        // Fall back to basic commands
        this.aiGunner.handleCommand(command, username);
    }
  }

  isHostileMob(mobName) {
    return this.aiGunner.hostileMobs.has(mobName);
  }

  isGunItem(itemName) {
    return this.aiGunner.isGunItem(itemName);
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
module.exports = AdvancedAIGunner;

// Usage (only run if this file is executed directly)
if (require.main === module) {
  const advancedAI = new AdvancedAIGunner();
  advancedAI.start();

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('Shutting down Advanced AI Gunner...');
    advancedAI.shutdown();
    process.exit(0);
  });
}