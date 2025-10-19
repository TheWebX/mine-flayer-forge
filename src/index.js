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

// Load configuration
const configLoader = new ConfigLoader();
const serverConfig = configLoader.getServerConfig();
const aiSettings = configLoader.getAIConfig();

// Create bot instance
const bot = mineflayer.createBot({
  host: serverConfig.host,
  port: serverConfig.port,
  username: serverConfig.username,
  password: serverConfig.password,
  version: serverConfig.version,
  auth: serverConfig.auth
});

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
  aiGunner.initialize();
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