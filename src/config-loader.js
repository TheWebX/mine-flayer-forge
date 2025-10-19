const fs = require('fs');
const path = require('path');

class ConfigLoader {
  constructor() {
    this.config = this.loadConfig();
  }

  loadConfig() {
    const configPath = path.join(__dirname, '..', 'config.json');
    
    try {
      if (fs.existsSync(configPath)) {
        const configData = fs.readFileSync(configPath, 'utf8');
        return JSON.parse(configData);
      }
    } catch (error) {
      console.error('Error loading config file:', error);
    }

    // Return default configuration
    return {
      server: {
        host: process.env.MINECRAFT_HOST || 'localhost',
        port: parseInt(process.env.MINECRAFT_PORT) || 25565,
        username: process.env.MINECRAFT_USERNAME || 'AIGunner',
        password: process.env.MINECRAFT_PASSWORD || '',
        version: process.env.MINECRAFT_VERSION || null,
        auth: process.env.MINECRAFT_AUTH || 'offline'
      },
      ai: {
        searchRadius: parseInt(process.env.AI_SEARCH_RADIUS) || 50,
        attackRange: parseInt(process.env.AI_ATTACK_RANGE) || 32,
        gunPickupPriority: [
          'bow', 'crossbow', 'trident', 'snowball', 'egg', 'ender_pearl',
          'arrow', 'spectral_arrow', 'tipped_arrow', 'firework_rocket'
        ],
        hostileMobs: [
          'zombie', 'skeleton', 'creeper', 'spider', 'cave_spider',
          'enderman', 'witch', 'blaze', 'ghast', 'magma_cube',
          'slime', 'zombie_pigman', 'piglin', 'hoglin', 'zoglin',
          'wither_skeleton', 'phantom', 'drowned', 'husk', 'stray',
          'vex', 'evoker', 'vindicator', 'pillager', 'ravager'
        ],
        autoEat: process.env.AI_AUTO_EAT === 'true' || true,
        autoHeal: process.env.AI_AUTO_HEAL === 'true' || true,
        combatMode: process.env.AI_COMBAT_MODE === 'true' || true,
        attackCooldown: 1000
      }
    };
  }

  getServerConfig() {
    return this.config.server;
  }

  getAIConfig() {
    return this.config.ai;
  }

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();
  }

  saveConfig() {
    const configPath = path.join(__dirname, '..', 'config.json');
    try {
      fs.writeFileSync(configPath, JSON.stringify(this.config, null, 2));
    } catch (error) {
      console.error('Error saving config file:', error);
    }
  }
}

module.exports = ConfigLoader;