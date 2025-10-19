// Forge server compatibility wrapper
// This is an experimental approach to work with Forge servers

const mineflayer = require('mineflayer');

class ForgeWrapper {
  constructor(serverConfig) {
    this.serverConfig = serverConfig;
    this.bot = null;
    this.retryCount = 0;
    this.maxRetries = 3;
  }

  async connect() {
    console.log('🔧 Attempting to connect to Forge server...');
    
    try {
      // Try different approaches for Forge compatibility
      const approaches = [
        this.tryVanillaApproach.bind(this),
        this.tryForgeApproach.bind(this),
        this.tryLegacyApproach.bind(this)
      ];

      for (const approach of approaches) {
        try {
          console.log(`🔄 Trying approach: ${approach.name}...`);
          this.bot = await approach();
          if (this.bot) {
            console.log('✅ Successfully connected to Forge server!');
            return this.bot;
          }
        } catch (error) {
          console.log(`❌ ${approach.name} failed: ${error.message}`);
        }
      }

      throw new Error('All connection approaches failed');
    } catch (error) {
      console.error('❌ Failed to connect to Forge server:', error.message);
      throw error;
    }
  }

  async tryVanillaApproach() {
    // Try with vanilla settings
    const botOptions = {
      host: this.serverConfig.host,
      port: this.serverConfig.port,
      username: this.serverConfig.username,
      password: this.serverConfig.password,
      auth: this.serverConfig.auth,
      version: this.serverConfig.version || '1.20.1',
      hideErrors: false,
      checkTimeoutInterval: 60000,
      keepAlive: true
    };

    return new Promise((resolve, reject) => {
      const bot = mineflayer.createBot(botOptions);
      
      const timeout = setTimeout(() => {
        bot.quit();
        reject(new Error('Connection timeout'));
      }, 10000);

      bot.on('login', () => {
        clearTimeout(timeout);
        resolve(bot);
      });

      bot.on('error', (err) => {
        clearTimeout(timeout);
        bot.quit();
        reject(err);
      });

      bot.on('kicked', (reason) => {
        clearTimeout(timeout);
        bot.quit();
        reject(new Error(`Kicked: ${JSON.stringify(reason)}`));
      });
    });
  }

  async tryForgeApproach() {
    // Try with Forge-specific settings
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
      skipValidation: true,
      forgeMods: [],
      customPackets: true
    };

    return new Promise((resolve, reject) => {
      const bot = mineflayer.createBot(botOptions);
      
      const timeout = setTimeout(() => {
        bot.quit();
        reject(new Error('Connection timeout'));
      }, 10000);

      bot.on('login', () => {
        clearTimeout(timeout);
        resolve(bot);
      });

      bot.on('error', (err) => {
        clearTimeout(timeout);
        bot.quit();
        reject(err);
      });

      bot.on('kicked', (reason) => {
        clearTimeout(timeout);
        bot.quit();
        reject(new Error(`Kicked: ${JSON.stringify(reason)}`));
      });
    });
  }

  async tryLegacyApproach() {
    // Try with legacy version
    const botOptions = {
      host: this.serverConfig.host,
      port: this.serverConfig.port,
      username: this.serverConfig.username,
      password: this.serverConfig.password,
      auth: this.serverConfig.auth,
      version: '1.12.2', // Legacy version that might work
      hideErrors: false,
      checkTimeoutInterval: 60000,
      keepAlive: true
    };

    return new Promise((resolve, reject) => {
      const bot = mineflayer.createBot(botOptions);
      
      const timeout = setTimeout(() => {
        bot.quit();
        reject(new Error('Connection timeout'));
      }, 10000);

      bot.on('login', () => {
        clearTimeout(timeout);
        resolve(bot);
      });

      bot.on('error', (err) => {
        clearTimeout(timeout);
        bot.quit();
        reject(err);
      });

      bot.on('kicked', (reason) => {
        clearTimeout(timeout);
        bot.quit();
        reject(new Error(`Kicked: ${JSON.stringify(reason)}`));
      });
    });
  }

  setupEventHandlers() {
    if (!this.bot) return;

    this.bot.on('error', (err) => {
      console.error('❌ Bot error:', err.message);
    });

    this.bot.on('kicked', (reason) => {
      console.log('🚫 Kicked:', reason);
    });

    this.bot.on('end', () => {
      console.log('👋 Disconnected');
    });

    this.bot.on('login', () => {
      console.log('🔐 Logged in successfully');
    });

    this.bot.on('spawn', () => {
      console.log('🎮 Spawned in world');
    });
  }

  quit() {
    if (this.bot) {
      this.bot.quit();
    }
  }
}

module.exports = ForgeWrapper;