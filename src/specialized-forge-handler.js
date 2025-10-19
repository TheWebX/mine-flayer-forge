// Specialized Forge handler for servers that require Forge client
const mineflayer = require('mineflayer');
const forgeProtocol = require('minecraft-protocol-forge');

class SpecializedForgeHandler {
  constructor(serverConfig) {
    this.serverConfig = serverConfig;
    this.bot = null;
  }

  async connect() {
    console.log('🔧 Attempting specialized Forge connection...');
    console.log('💡 This handler is designed for servers that require Forge client');
    
    try {
      this.bot = await this.createSpecializedForgeBot();
      return this.bot;
    } catch (error) {
      console.error('❌ Specialized Forge connection failed:', error.message);
      throw error;
    }
  }

  async createSpecializedForgeBot() {
    console.log('🔧 Creating specialized Forge-compatible bot...');
    
    // Try to mimic a Forge client as closely as possible
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
      
      // Specialized Forge options
      forgeMods: [], // Empty array to indicate no mods
      skipValidation: true,
      customPackets: true,
      // Try to appear as a Forge client
      brand: 'fml', // Forge Mod Loader
      // Additional Forge-specific settings
      forgeHandshake: true,
      forgeClient: true,
    };

    return new Promise((resolve, reject) => {
      const bot = mineflayer.createBot(botOptions);
      
      const timeout = setTimeout(() => {
        bot.quit();
        reject(new Error('Specialized Forge connection timeout'));
      }, 20000); // Longer timeout

      let connected = false;

      bot.on('login', () => {
        if (!connected) {
          connected = true;
          clearTimeout(timeout);
          console.log('✅ Successfully logged into Forge server with specialized handler!');
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
          console.log('🚫 Kicked by Forge server:', reasonText);
          
          if (reasonText.includes('Forge') || reasonText.includes('mods')) {
            console.log('🔧 This server requires a real Forge client');
            console.log('💡 Mineflayer cannot fully emulate a Forge client');
            console.log('💡 Consider using a vanilla server or Paper server instead');
            reject(new Error(`Forge server requires real Forge client: ${reasonText}`));
          } else {
            reject(new Error(`Kicked: ${reasonText}`));
          }
        }
      });

      // Handle Forge-specific events
      bot.on('forgeMods', (mods) => {
        console.log('🔧 Forge mods detected:', mods.map(mod => mod.name).join(', '));
      });

      // Try to handle Forge handshake
      bot.on('forgeHandshake', (data) => {
        console.log('🔧 Forge handshake received:', data);
      });
    });
  }

  setupEventHandlers() {
    if (!this.bot) return;

    console.log('🔧 Setting up specialized Forge event handlers...');

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

    this.bot.on('forgeHandshake', (data) => {
      console.log('🔧 Forge handshake:', data);
    });
  }

  quit() {
    if (this.bot) {
      this.bot.quit();
    }
  }
}

module.exports = SpecializedForgeHandler;