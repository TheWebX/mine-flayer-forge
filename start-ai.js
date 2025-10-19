#!/usr/bin/env node

// Enhanced startup script with better error handling
const mineflayer = require('mineflayer');
const AIGunner = require('./src/ai-gunner');
const ConfigLoader = require('./src/config-loader');
const ErrorHandler = require('./src/error-handler');

console.log('🤖 Starting AI Gunner with enhanced error handling...\n');

// Load configuration
const configLoader = new ConfigLoader();
const serverConfig = configLoader.getServerConfig();
const aiSettings = configLoader.getAIConfig();

console.log('Configuration loaded:');
console.log(`  Server: ${serverConfig.host}:${serverConfig.port}`);
console.log(`  Username: ${serverConfig.username}`);
console.log(`  Version: ${serverConfig.version}`);
console.log(`  Auth: ${serverConfig.auth}\n`);

// Create bot with error handling
const botOptions = {
  host: serverConfig.host,
  port: serverConfig.port,
  username: serverConfig.username,
  password: serverConfig.password,
  auth: serverConfig.auth,
  hideErrors: false
};

// Add version with validation
if (serverConfig.version && 
    serverConfig.version !== 'auto' && 
    typeof serverConfig.version === 'string' &&
    serverConfig.version.match(/^\d+\.\d+(\.\d+)?$/)) {
  botOptions.version = serverConfig.version;
  console.log(`Using Minecraft version: ${serverConfig.version}`);
} else {
  console.log('Using auto-detect for Minecraft version');
}

// Validate options
if (!ErrorHandler.validateBotOptions(botOptions)) {
  console.error('❌ Configuration validation failed');
  process.exit(1);
}

let bot;
try {
  console.log('Creating bot...');
  bot = mineflayer.createBot(botOptions);
  console.log('✅ Bot created successfully\n');
} catch (error) {
  console.error('❌ Failed to create bot:');
  ErrorHandler.handleBotError(error, botOptions);
  process.exit(1);
}

// Load plugins
console.log('Loading plugins...');
try {
  const { pathfinder } = require('mineflayer-pathfinder');
  const pvp = require('mineflayer-pvp');
  const autoEat = require('mineflayer-auto-eat');
  const collectBlock = require('mineflayer-collectblock');
  const tool = require('mineflayer-tool');
  
  bot.loadPlugin(pathfinder);
  if (pvp.plugin) {
    bot.loadPlugin(pvp.plugin);
  }
  bot.loadPlugin(autoEat);
  bot.loadPlugin(collectBlock);
  bot.loadPlugin(tool);
  console.log('✅ Plugins loaded successfully\n');
} catch (error) {
  console.error('⚠️  Some plugins failed to load:', error.message);
  console.log('Continuing with available plugins...\n');
}

// Initialize AI Gunner
let aiGunner;
try {
  aiGunner = new AIGunner(bot, aiSettings);
  console.log('✅ AI Gunner initialized\n');
} catch (error) {
  console.error('❌ Failed to initialize AI Gunner:', error.message);
  process.exit(1);
}

// Bot event handlers
bot.on('spawn', () => {
  console.log(`🎮 [${bot.username}] Spawned in world`);
  try {
    aiGunner.initialize();
    console.log('🤖 AI Gunner is now active!');
    console.log('💬 Use chat commands: !start, !stop, !status, !help');
  } catch (error) {
    ErrorHandler.handleAIGunnerError(error, 'initialization');
  }
});

bot.on('login', () => {
  console.log(`🔐 [${bot.username}] Logged in successfully`);
});

bot.on('chat', (username, message) => {
  if (username === bot.username) return;
  
  if (message.startsWith('!')) {
    const command = message.slice(1).toLowerCase();
    try {
      aiGunner.handleCommand(command, username);
    } catch (error) {
      ErrorHandler.handleAIGunnerError(error, 'command handling');
    }
  }
});

bot.on('health', () => {
  if (bot.health < 20 && aiSettings.autoHeal) {
    console.log(`❤️  [${bot.username}] Health: ${bot.health}/20`);
    try {
      aiGunner.handleLowHealth();
    } catch (error) {
      ErrorHandler.handleAIGunnerError(error, 'health handling');
    }
  }
});

bot.on('error', (err) => {
  console.error(`❌ [${bot.username}] Error:`, err.message);
  ErrorHandler.handleBotError(err, botOptions);
});

bot.on('kicked', (reason) => {
  console.error(`🚫 [${bot.username}] Kicked:`, reason);
});

bot.on('end', () => {
  console.log(`👋 [${bot.username}] Disconnected`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down AI Gunner...');
  if (aiGunner) {
    aiGunner.shutdown();
  }
  if (bot) {
    bot.quit();
  }
  console.log('✅ Shutdown complete');
  process.exit(0);
});

console.log('🚀 AI Gunner startup complete!');
console.log('📡 Attempting to connect to server...\n');