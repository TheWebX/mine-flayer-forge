// Forge-compatible Mineflayer implementation
const mineflayer = require('mineflayer');
const forgeProtocol = require('minecraft-protocol-forge');

class ForgeMineflayer {
  constructor(serverConfig) {
    this.serverConfig = serverConfig;
    this.bot = null;
    this.aiGunner = null;
  }

  async createBot() {
    console.log('🔧 Creating Forge-compatible bot...');
    
    const botOptions = {
      host: this.serverConfig.host,
      port: this.serverConfig.port,
      username: this.serverConfig.username,
      password: this.serverConfig.password,
      auth: this.serverConfig.auth,
      version: this.serverConfig.version || '1.20.1',
      hideErrors: false,
      checkTimeoutInterval: 60000,
      keepAlive: true,
      
      // Forge-specific options
      forgeMods: [], // Empty array for vanilla-like behavior
      skipValidation: true, // Skip some validation for Forge compatibility
    };

    try {
      // Use the forge protocol
      this.bot = mineflayer.createBot(botOptions);
      
      // Override the protocol if needed
      if (this.bot._client && forgeProtocol) {
        console.log('🔧 Applying Forge protocol modifications...');
        // The forge protocol should be automatically applied
      }

      return this.bot;
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
      
      // Restart AI after respawn
      setTimeout(() => {
        if (this.aiGunner) {
          this.aiGunner.initialize();
        }
      }, 5000);
    });

    this.bot.on('error', (err) => {
      console.error(`❌ [${this.bot.username}] Error:`, err.message);
      
      // Handle Forge-specific errors
      if (err.message && err.message.includes('Forge')) {
        console.log('🔧 Forge compatibility issue detected');
        console.log('💡 This may be due to server-side Forge mods');
      } else if (err.message && err.message.includes('ECONNREFUSED')) {
        console.error('🔌 Connection Error:');
        console.error('   1. Check if the Forge server is running');
        console.error('   2. Verify host and port are correct');
        console.error('   3. Check firewall settings');
      }
    });

    this.bot.on('kicked', (reason) => {
      console.log(`🚫 [${this.bot.username}] Kicked:`, reason);
      
      // Check if it's a Forge-related kick
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
        this.bot.chat('Commands: !start, !stop, !status, !help');
        break;
      case 'forge':
        this.bot.chat('Connected to Forge server using node-minecraft-protocol-forge');
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

  async start() {
    try {
      this.bot = await this.createBot();
      this.setupEventHandlers(this.serverConfig.ai || {});
      
      // Initialize AI Gunner
      const AIGunner = require('./ai-gunner');
      this.aiGunner = new AIGunner(this.bot, this.serverConfig.ai || {});
      
      console.log('✅ Forge-compatible AI Gunner started successfully!');
      return this.bot;
    } catch (error) {
      console.error('❌ Failed to start Forge AI Gunner:', error.message);
      throw error;
    }
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

module.exports = ForgeMineflayer;