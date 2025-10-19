const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const pvp = require('mineflayer-pvp');
const autoEat = require('mineflayer-auto-eat');
const collectBlock = require('mineflayer-collectblock');
const tool = require('mineflayer-tool');
const { Vec3 } = require('vec3');

// Import our custom AI gunner class
const AIGunner = require('./ai-gunner');

// Configuration
const config = {
  host: process.env.MINECRAFT_HOST || 'localhost',
  port: process.env.MINECRAFT_PORT || 25565,
  username: process.env.MINECRAFT_USERNAME || 'AIGunner',
  password: process.env.MINECRAFT_PASSWORD || '',
  version: process.env.MINECRAFT_VERSION || '1.20.1',
  auth: process.env.MINECRAFT_AUTH || 'offline', // 'offline' or 'microsoft'
  
  // AI Gunner specific settings
  aiSettings: {
    searchRadius: 50, // Radius to search for guns and hostile mobs
    attackRange: 32,  // Maximum attack range
    gunPickupPriority: ['bow', 'crossbow', 'trident', 'snowball', 'egg', 'ender_pearl'],
    hostileMobs: [
      'zombie', 'skeleton', 'creeper', 'spider', 'cave_spider',
      'enderman', 'witch', 'blaze', 'ghast', 'magma_cube',
      'slime', 'zombie_pigman', 'piglin', 'hoglin', 'zoglin',
      'wither_skeleton', 'phantom', 'drowned', 'husk', 'stray',
      'vex', 'evoker', 'vindicator', 'pillager', 'ravager'
    ],
    autoEat: true,
    autoHeal: true,
    combatMode: true
  }
};

// Create bot instance
const bot = mineflayer.createBot({
  host: config.host,
  port: config.port,
  username: config.username,
  password: config.password,
  version: config.version,
  auth: config.auth
});

// Load plugins
bot.loadPlugin(pathfinder);
bot.loadPlugin(pvp);
bot.loadPlugin(autoEat);
bot.loadPlugin(collectBlock);
bot.loadPlugin(tool);

// Initialize AI Gunner
const aiGunner = new AIGunner(bot, config.aiSettings);

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
  if (bot.health < 20 && config.aiSettings.autoHeal) {
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
console.log(`[${bot.username}] Connecting to ${config.host}:${config.port}`);