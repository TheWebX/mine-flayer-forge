const { Vec3 } = require('vec3');
const { pathfinder, goals } = require('mineflayer-pathfinder');

class AIGunner {
  constructor(bot, settings) {
    this.bot = bot;
    this.settings = settings;
    this.isActive = false;
    this.currentTarget = null;
    this.gunItems = new Set();
    this.hostileMobs = new Set();
    this.searchInterval = null;
    this.combatInterval = null;
    this.lastAttackTime = 0;
    this.attackCooldown = 1000; // 1 second cooldown between attacks
    
    // Initialize gun items set
    this.settings.gunPickupPriority.forEach(item => this.gunItems.add(item));
    
    // Initialize hostile mobs set
    this.settings.hostileMobs.forEach(mob => this.hostileMobs.add(mob));
  }

  initialize() {
    console.log('[AIGunner] Initializing AI Gunner...');
    this.isActive = true;
    
    // Start searching for guns and hostile mobs
    this.startSearching();
    
    // Start combat loop
    this.startCombatLoop();
    
    console.log('[AIGunner] AI Gunner initialized and active');
  }

  startSearching() {
    this.searchInterval = setInterval(() => {
      if (!this.isActive) return;
      
      this.searchForGuns();
      this.searchForHostileMobs();
    }, 2000); // Search every 2 seconds
  }

  startCombatLoop() {
    this.combatInterval = setInterval(() => {
      if (!this.isActive) return;
      
      this.updateCombat();
    }, 100); // Update combat every 100ms
  }

  searchForGuns() {
    const nearbyItems = this.bot.nearestEntity(entity => 
      entity.objectType === 'Item' && 
      entity.metadata && 
      entity.metadata[8] && 
      this.isGunItem(entity.metadata[8].itemId)
    );

    if (nearbyItems) {
      const distance = this.bot.entity.position.distanceTo(nearbyItems.position);
      if (distance <= this.settings.searchRadius) {
        this.pickupGun(nearbyItems);
      }
    }
  }

  searchForHostileMobs() {
    const nearbyHostiles = this.bot.nearestEntity(entity => 
      entity.type === 'mob' && 
      this.hostileMobs.has(entity.name) &&
      entity.position.distanceTo(this.bot.entity.position) <= this.settings.attackRange
    );

    if (nearbyHostiles && !this.currentTarget) {
      this.currentTarget = nearbyHostiles;
      console.log(`[AIGunner] Target acquired: ${nearbyHostiles.name}`);
    }
  }

  isGunItem(itemId) {
    const gunItems = [
      'bow', 'crossbow', 'trident', 'snowball', 'egg', 'ender_pearl',
      'arrow', 'spectral_arrow', 'tipped_arrow', 'firework_rocket'
    ];
    return gunItems.includes(itemId);
  }

  async pickupGun(itemEntity) {
    try {
      console.log(`[AIGunner] Attempting to pickup gun: ${itemEntity.metadata[8].itemId}`);
      
      // Use pathfinder to move to the item
      const path = this.bot.pathfinder.getPathTo(itemEntity.position);
      if (path) {
        await this.bot.pathfinder.goto(new goals.GoalNear(itemEntity.position, 2));
        
        // Wait a moment for the item to be picked up
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log(`[AIGunner] Picked up gun: ${itemEntity.metadata[8].itemId}`);
      }
    } catch (error) {
      console.error('[AIGunner] Error picking up gun:', error);
    }
  }

  updateCombat() {
    if (!this.currentTarget || !this.isActive) return;

    // Check if target is still valid
    if (!this.currentTarget.isValid || 
        this.currentTarget.position.distanceTo(this.bot.entity.position) > this.settings.attackRange) {
      this.currentTarget = null;
      return;
    }

    // Check attack cooldown
    const now = Date.now();
    if (now - this.lastAttackTime < this.attackCooldown) return;

    // Equip best weapon
    this.equipBestWeapon();

    // Attack the target
    this.attackTarget();
  }

  equipBestWeapon() {
    const inventory = this.bot.inventory;
    let bestWeapon = null;
    let bestPriority = -1;

    // Check inventory for weapons
    for (const item of inventory.items()) {
      if (this.isGunItem(item.name)) {
        const priority = this.settings.gunPickupPriority.indexOf(item.name);
        if (priority > bestPriority) {
          bestWeapon = item;
          bestPriority = priority;
        }
      }
    }

    if (bestWeapon) {
      try {
        this.bot.equip(bestWeapon, 'hand');
        console.log(`[AIGunner] Equipped weapon: ${bestWeapon.name}`);
      } catch (error) {
        console.error('[AIGunner] Error equipping weapon:', error);
      }
    }
  }

  attackTarget() {
    if (!this.currentTarget) return;

    try {
      // Look at the target
      this.bot.lookAt(this.currentTarget.position.offset(0, 1, 0));

      // Use the equipped weapon
      const equippedItem = this.bot.heldItem;
      if (equippedItem && this.isGunItem(equippedItem.name)) {
        this.useWeapon(equippedItem);
        this.lastAttackTime = Date.now();
      }
    } catch (error) {
      console.error('[AIGunner] Error attacking target:', error);
    }
  }

  useWeapon(weapon) {
    switch (weapon.name) {
      case 'bow':
      case 'crossbow':
        this.bot.activateItem();
        break;
      case 'trident':
        this.bot.activateItem();
        break;
      case 'snowball':
      case 'egg':
      case 'ender_pearl':
        this.bot.activateItem();
        break;
      default:
        // For other weapons, try to use them
        this.bot.activateItem();
    }
  }

  handleCommand(command, username) {
    switch (command) {
      case 'start':
        this.isActive = true;
        this.bot.chat(`AI Gunner activated by ${username}`);
        break;
      case 'stop':
        this.isActive = false;
        this.currentTarget = null;
        this.bot.chat(`AI Gunner deactivated by ${username}`);
        break;
      case 'status':
        const status = this.isActive ? 'Active' : 'Inactive';
        const target = this.currentTarget ? this.currentTarget.name : 'None';
        this.bot.chat(`Status: ${status}, Target: ${target}`);
        break;
      case 'help':
        this.bot.chat('Commands: !start, !stop, !status, !help');
        break;
      default:
        this.bot.chat('Unknown command. Use !help for available commands.');
    }
  }

  handleLowHealth() {
    if (this.settings.autoHeal) {
      // Try to eat food
      const food = this.bot.inventory.items().find(item => 
        item.name.includes('apple') || 
        item.name.includes('bread') || 
        item.name.includes('meat') ||
        item.name.includes('fish')
      );
      
      if (food) {
        try {
          this.bot.equip(food, 'hand');
          this.bot.activateItem();
          console.log('[AIGunner] Ate food for healing');
        } catch (error) {
          console.error('[AIGunner] Error eating food:', error);
        }
      }
    }
  }

  shutdown() {
    console.log('[AIGunner] Shutting down AI Gunner...');
    this.isActive = false;
    this.currentTarget = null;
    
    if (this.searchInterval) {
      clearInterval(this.searchInterval);
    }
    
    if (this.combatInterval) {
      clearInterval(this.combatInterval);
    }
    
    console.log('[AIGunner] AI Gunner shutdown complete');
  }
}

module.exports = AIGunner;