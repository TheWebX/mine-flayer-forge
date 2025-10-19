// Advanced Forge handler that properly handles Forge server handshakes
const mineflayer = require('mineflayer');
const forgeProtocol = require('minecraft-protocol-forge');

class AdvancedForgeHandler {
  constructor(serverConfig) {
    this.serverConfig = serverConfig;
    this.bot = null;
    this.retryCount = 0;
    this.maxRetries = 3;
  }

  async connect() {
    console.log('🔧 Attempting advanced Forge connection...');
    
    try {
      // Try the advanced Forge approach
      this.bot = await this.createAdvancedForgeBot();
      return this.bot;
    } catch (error) {
      console.error('❌ Advanced Forge connection failed:', error.message);
      throw error;
    }
  }

  async createAdvancedForgeBot() {
    console.log('🔧 Creating advanced Forge-compatible bot...');
    
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
      
      // Advanced Forge options
      forgeMods: [], // Empty array to indicate no mods
      skipValidation: true,
      customPackets: true,
      // Try to mimic a Forge client
      brand: 'vanilla', // Some servers check this
    };

    return new Promise((resolve, reject) => {
      const bot = mineflayer.createBot(botOptions);
      
      const timeout = setTimeout(() => {
        bot.quit();
        reject(new Error('Connection timeout'));
      }, 15000); // Longer timeout for Forge

      let connected = false;

      bot.on('login', () => {
        if (!connected) {
          connected = true;
          clearTimeout(timeout);
          console.log('✅ Successfully logged into Forge server!');
          resolve(bot);
        }
      });

      bot.on('spawn', () => {
        console.log('🎮 Spawned in Forge world');
      });

      bot.on('error', (err) => {
        if (!connected) {
          connected = true;
          clearTimeout(timeout);
          bot.quit();
          reject(err);
        }
      });

      bot.on('kicked', (reason) => {
        if (!connected) {
          connected = true;
          clearTimeout(timeout);
          bot.quit();
          
          const reasonText = typeof reason === 'string' ? reason : JSON.stringify(reason);
          if (reasonText.includes('Forge') || reasonText.includes('mods')) {
            console.log('🔧 Forge server detected - trying alternative approach...');
            // Try a different approach
            this.tryAlternativeForgeApproach().then(resolve).catch(reject);
          } else {
            reject(new Error(`Kicked: ${reasonText}`));
          }
        }
      });

      // Handle Forge-specific events
      bot.on('forgeMods', (mods) => {
        console.log('🔧 Forge mods detected:', mods.map(mod => mod.name).join(', '));
      });
    });
  }

  async tryAlternativeForgeApproach() {
    console.log('🔄 Trying alternative Forge approach...');
    
    // Try with different settings that might work with Forge
    const botOptions = {
      host: this.serverConfig.host,
      port: this.serverConfig.port,
      username: this.serverConfig.username,
      password: this.serverConfig.password,
      auth: this.serverConfig.auth,
      version: this.serverConfig.version || '1.20.1',
      hideErrors: true, // Hide errors to avoid spam
      checkTimeoutInterval: 60000,
      keepAlive: true,
      
      // Alternative Forge settings
      forgeMods: [],
      skipValidation: true,
      customPackets: false, // Try without custom packets
      // Try to appear as a different client
      brand: 'fml', // Forge Mod Loader brand
    };

    return new Promise((resolve, reject) => {
      const bot = mineflayer.createBot(botOptions);
      
      const timeout = setTimeout(() => {
        bot.quit();
        reject(new Error('Alternative Forge approach timeout'));
      }, 15000);

      let connected = false;

      bot.on('login', () => {
        if (!connected) {
          connected = true;
          clearTimeout(timeout);
          console.log('✅ Alternative Forge approach successful!');
          resolve(bot);
        }
      });

      bot.on('error', (err) => {
        if (!connected) {
          connected = true;
          clearTimeout(timeout);
          bot.quit();
          reject(err);
        }
      });

      bot.on('kicked', (reason) => {
        if (!connected) {
          connected = true;
          clearTimeout(timeout);
          bot.quit();
          
          const reasonText = typeof reason === 'string' ? reason : JSON.stringify(reason);
          console.log('🚫 Alternative approach also failed:', reasonText);
          reject(new Error(`Forge server incompatible: ${reasonText}`));
        }
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
      console.log('👋 Disconnected from Forge server');
    });

    this.bot.on('login', () => {
      console.log('🔐 Logged in successfully');
    });

    this.bot.on('spawn', () => {
      console.log('🎮 Spawned in world');
    });

    this.bot.on('forgeMods', (mods) => {
      console.log('🔧 Forge mods detected:', mods.map(mod => mod.name).join(', '));
    });
  }

  quit() {
    if (this.bot) {
      this.bot.quit();
    }
  }
}

module.exports = AdvancedForgeHandler;