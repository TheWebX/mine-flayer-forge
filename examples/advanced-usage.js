const mineflayer = require('mineflayer');
const AIGunner = require('../src/ai-gunner');
const ConfigLoader = require('../src/config-loader');

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

    // Create bot with custom settings
    this.bot = mineflayer.createBot({
      host: serverConfig.host,
      port: serverConfig.port,
      username: serverConfig.username,
      password: serverConfig.password,
      version: serverConfig.version,
      auth: serverConfig.auth,
      
      // Additional bot options
      hideErrors: false,
      checkTimeoutInterval: 60000,
      keepAlive: true
    });

    // Load plugins
    this.bot.loadPlugin(require('mineflayer-pathfinder').pathfinder);
    this.bot.loadPlugin(require('mineflayer-pvp'));
    this.bot.loadPlugin(require('mineflayer-auto-eat'));
    this.bot.loadPlugin(require('mineflayer-collectblock'));
    this.bot.loadPlugin(require('mineflayer-tool'));

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

// Usage
const advancedAI = new AdvancedAIGunner();
advancedAI.start();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down Advanced AI Gunner...');
  advancedAI.shutdown();
  process.exit(0);
});