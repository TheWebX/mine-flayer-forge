const mineflayer = require('mineflayer');
const AIGunner = require('../src/ai-gunner');

// Basic usage example
const bot = mineflayer.createBot({
  host: 'localhost',
  port: 25565,
  username: 'AIGunner',
  version: '1.20.1',
  auth: 'offline'
});

// Basic AI settings
const aiSettings = {
  searchRadius: 30,
  attackRange: 20,
  gunPickupPriority: ['bow', 'crossbow', 'trident'],
  hostileMobs: ['zombie', 'skeleton', 'creeper'],
  autoEat: true,
  autoHeal: true,
  combatMode: true
};

// Initialize AI Gunner
const aiGunner = new AIGunner(bot, aiSettings);

bot.on('spawn', () => {
  console.log('Bot spawned, starting AI...');
  aiGunner.initialize();
});

bot.on('chat', (username, message) => {
  if (username === bot.username) return;
  
  if (message.startsWith('!')) {
    const command = message.slice(1).toLowerCase();
    aiGunner.handleCommand(command, username);
  }
});

bot.on('error', (err) => {
  console.error('Bot error:', err);
});