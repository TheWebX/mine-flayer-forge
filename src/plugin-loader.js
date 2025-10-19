// Plugin loading utilities for Mineflayer

class PluginLoader {
  static loadPlugins(bot) {
    const plugins = [
      { name: 'pathfinder', module: require('mineflayer-pathfinder'), property: 'pathfinder' },
      { name: 'pvp', module: require('mineflayer-pvp'), property: 'plugin' },
      { name: 'auto-eat', module: require('mineflayer-auto-eat') },
      { name: 'collectblock', module: require('mineflayer-collectblock'), property: 'plugin' },
      { name: 'tool', module: require('mineflayer-tool'), property: 'plugin' }
    ];

    const loaded = [];
    const failed = [];

    for (const plugin of plugins) {
      try {
        let pluginFunction;
        
        if (plugin.property) {
          pluginFunction = plugin.module[plugin.property];
        } else {
          pluginFunction = plugin.module;
        }

        if (typeof pluginFunction === 'function') {
          bot.loadPlugin(pluginFunction);
          loaded.push(plugin.name);
        } else {
          failed.push(`${plugin.name} (not a function)`);
        }
      } catch (error) {
        failed.push(`${plugin.name} (${error.message})`);
      }
    }

    return { loaded, failed };
  }

  static loadPluginsWithLogging(bot) {
    console.log('Loading plugins...');
    const result = this.loadPlugins(bot);
    
    if (result.loaded.length > 0) {
      console.log(`✅ Loaded plugins: ${result.loaded.join(', ')}`);
    }
    
    if (result.failed.length > 0) {
      console.log(`⚠️  Failed to load: ${result.failed.join(', ')}`);
    }
    
    return result;
  }
}

module.exports = PluginLoader;