const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const pvp = require('mineflayer-pvp');
const autoEat = require('mineflayer-auto-eat');
const collectBlock = require('mineflayer-collectblock');
const tool = require('mineflayer-tool');
const { Vec3 } = require('vec3');

// Import our custom classes
const AIGunner = require('./ai-gunner');
const ConfigLoader = require('./config-loader');
const ErrorHandler = require('./error-handler');

// Load configuration
const configLoader = new ConfigLoader();
const serverConfig = configLoader.getServerConfig();
const aiSettings = configLoader.getAIConfig();

// Create bot instance
const botOptions = {
  host: serverConfig.host,
  port: serverConfig.port,
  username: serverConfig.username,
  password: serverConfig.password,
  auth: serverConfig.auth,
  hideErrors: false
};

// Add version only if it's a valid version string
if (serverConfig.version && 
    serverConfig.version !== 'auto' && 
    typeof serverConfig.version === 'string' &&
    serverConfig.version.match(/^\d+\.\d+(\.\d+)?$/)) {
  botOptions.version = serverConfig.version;
}

// Validate bot options
if (!ErrorHandler.validateBotOptions(botOptions)) {
  process.exit(1);
}

let bot;
try {
  bot = mineflayer.createBot(botOptions);
  console.log(`[Bot] Created with options:`, {
    host: botOptions.host,
    port: botOptions.port,
    username: botOptions.username,
    version: botOptions.version || 'auto-detect'
  });
} catch (error) {
  if (!ErrorHandler.handleBotError(error, botOptions)) {
    process.exit(1);
  }
}

// Load plugins
bot.loadPlugin(pathfinder);
bot.loadPlugin(pvp);
bot.loadPlugin(autoEat);
bot.loadPlugin(collectBlock);
bot.loadPlugin(tool);

// Initialize AI Gunner
const aiGunner = new AIGunner(bot, aiSettings);

// Bot event handlers
bot.on('spawn', () => {
  console.log(`[${bot.username}] Spawned in world`);
  try {
    aiGunner.initialize();
  } catch (error) {
    ErrorHandler.handleAIGunnerError(error, 'initialization');
  }
});

bot.on('login', () => {
  console.log(`[${bot.username}] Logged in successfully`);
});

bot.on('chat', (username, message) => {
  if (username === bot.username) return;
  
  // Handle commands
  if (message.startsWith('!')) {
    const command = message.slice(1).toLowerCase();
    aiGunner.handleCommand(command, username);
  }
});

bot.on('health', () => {
  if (bot.health < 20 && aiSettings.autoHeal) {
    aiGunner.handleLowHealth();
  }
});

bot.on('error', (err) => {
  console.error(`[${bot.username}] Error:`, err);
  
  // Handle specific version errors
  if (err.message && err.message.includes('version')) {
    console.error('Version compatibility error. Try changing the version in config.json');
    console.error('Supported versions: 1.19.4, 1.20.1, 1.20.4');
  }
});

bot.on('kicked', (reason) => {
  console.error(`[${bot.username}] Kicked:`, reason);
});

bot.on('end', () => {
  console.log(`[${bot.username}] Disconnected`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log(`[${bot.username}] Shutting down...`);
  aiGunner.shutdown();
  bot.quit();
  process.exit(0);
});

console.log(`[${bot.username}] Starting AI Gunner...`);
console.log(`[${bot.username}] Connecting to ${serverConfig.host}:${serverConfig.port}`);