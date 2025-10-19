// Forge server compatibility handler
const mineflayer = require('mineflayer');

class ForgeHandler {
  static createForgeBot(serverConfig) {
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
      forgeMods: [], // Empty array to indicate no mods
      skipValidation: true, // Skip some validation for Forge compatibility
    };

    console.log('🔧 Creating bot with Forge compatibility...');
    return mineflayer.createBot(botOptions);
  }

  static setupForgeEventHandlers(bot) {
    // Handle Forge-specific events
    bot.on('forgeMods', (mods) => {
      console.log('🔧 Forge mods detected:', mods.map(mod => mod.name).join(', '));
    });

    // Handle the Forge kick message
    bot.on('kicked', (reason) => {
      const reasonText = typeof reason === 'string' ? reason : JSON.stringify(reason);
      
      if (reasonText.includes('Forge') || reasonText.includes('mods')) {
        console.log('🔧 Forge server detected - this is normal for modded servers');
        console.log('💡 The bot will work with vanilla Minecraft servers');
        console.log('💡 For Forge servers, you may need to use a different approach');
      } else {
        console.log('🚫 Kicked:', reasonText);
      }
    });

    // Handle connection errors
    bot.on('error', (err) => {
      if (err.message && err.message.includes('Forge')) {
        console.log('🔧 Forge compatibility issue detected');
        console.log('💡 This is expected when connecting to Forge servers');
      } else {
        console.error('❌ Bot error:', err.message);
      }
    });
  }

  static isForgeServer(kickReason) {
    const reasonText = typeof kickReason === 'string' ? kickReason : JSON.stringify(kickReason);
    return reasonText.includes('Forge') || reasonText.includes('mods');
  }

  static getForgeCompatibilityMessage() {
    return `
🔧 Forge Server Compatibility

The server you're trying to connect to is a Forge server (modded Minecraft).
Mineflayer bots are designed for vanilla Minecraft servers.

Options:
1. Connect to a vanilla Minecraft server instead
2. Use a different bot framework that supports Forge
3. Ask the server admin to allow vanilla clients

For testing, you can:
- Use a vanilla Minecraft server
- Use a Paper/Spigot server (usually compatible)
- Test with a local vanilla server
    `.trim();
  }
}

module.exports = ForgeHandler;