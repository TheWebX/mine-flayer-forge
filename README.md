# Mineflayer AI Gunner for Minecraft Forge

An intelligent AI player for Minecraft that automatically picks up nearby guns and weapons, then hunts down and eliminates hostile mobs. Built with Mineflayer for Minecraft Forge compatibility.

## Features

- 🤖 **Automatic Gun Detection**: Scans for nearby weapons and ammunition
- 🎯 **Smart Targeting**: Identifies and prioritizes hostile mobs
- ⚔️ **Combat AI**: Automatically engages enemies with appropriate weapons
- 🍎 **Auto-Healing**: Automatically eats food when health is low
- ⚙️ **Configurable**: Customizable settings for different playstyles
- 💬 **Chat Commands**: In-game control via chat commands
- 🔧 **Forge Compatible**: Works with Minecraft Forge mods

## Supported Weapons

- **Ranged Weapons**: Bow, Crossbow, Trident
- **Throwables**: Snowballs, Eggs, Ender Pearls
- **Ammunition**: Arrows, Spectral Arrows, Tipped Arrows
- **Special**: Firework Rockets

## Supported Hostile Mobs

The AI will automatically target and attack:
- Zombies, Skeletons, Creepers
- Spiders, Cave Spiders, Endermen
- Witches, Blazes, Ghasts
- Magma Cubes, Slimes
- Piglin variants, Wither Skeletons
- Phantoms, Drowned, Husks, Strays
- Vex, Evokers, Vindicators, Pillagers, Ravagers

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd mineflayer-ai-gunner
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure settings**:
   - Copy `.env.example` to `.env` and modify as needed
   - Or edit `config.json` directly

4. **Start the AI**:
   ```bash
   npm start
   ```

## Configuration

### Environment Variables

Create a `.env` file with your settings:

```env
# Minecraft Server Configuration
MINECRAFT_HOST=localhost
MINECRAFT_PORT=25565
MINECRAFT_USERNAME=AIGunner
MINECRAFT_PASSWORD=
MINECRAFT_VERSION=1.20.1
MINECRAFT_AUTH=offline

# AI Gunner Settings
AI_SEARCH_RADIUS=50
AI_ATTACK_RANGE=32
AI_AUTO_EAT=true
AI_AUTO_HEAL=true
AI_COMBAT_MODE=true
```

### Config File

Alternatively, edit `config.json`:

```json
{
  "server": {
    "host": "localhost",
    "port": 25565,
    "username": "AIGunner",
    "password": "",
    "version": "1.20.1",
    "auth": "offline"
  },
  "ai": {
    "searchRadius": 50,
    "attackRange": 32,
    "gunPickupPriority": ["bow", "crossbow", "trident"],
    "hostileMobs": ["zombie", "skeleton", "creeper"],
    "autoEat": true,
    "autoHeal": true,
    "combatMode": true
  }
}
```

## Usage

### Starting the AI

1. **Start your Minecraft Forge server**
2. **Run the AI**:
   ```bash
   npm start
   ```

The AI will automatically:
- Connect to your server
- Search for weapons and ammunition
- Hunt down hostile mobs
- Engage in combat

### Chat Commands

Use these commands in-game to control the AI:

- `!start` - Activate the AI Gunner
- `!stop` - Deactivate the AI Gunner
- `!status` - Check current status and target
- `!help` - Show available commands

### Example Session

```
[AIGunner] Starting AI Gunner...
[AIGunner] Connecting to localhost:25565
[AIGunner] Spawned in world
[AIGunner] Initializing AI Gunner...
[AIGunner] AI Gunner initialized and active
[AIGunner] Target acquired: zombie
[AIGunner] Equipped weapon: bow
[AIGunner] Attempting to pickup gun: arrow
[AIGunner] Picked up gun: arrow
```

## Advanced Configuration

### Custom Weapon Priority

Modify the `gunPickupPriority` array in your config to change weapon preferences:

```json
{
  "ai": {
    "gunPickupPriority": [
      "bow",           // Highest priority
      "crossbow", 
      "trident",
      "snowball",
      "egg"
    ]
  }
}
```

### Custom Hostile Mobs

Add or remove mobs from the `hostileMobs` array:

```json
{
  "ai": {
    "hostileMobs": [
      "zombie",
      "skeleton",
      "creeper",
      "custom_mob_name"  // Add custom mobs here
    ]
  }
}
```

### Combat Settings

Adjust combat behavior:

```json
{
  "ai": {
    "searchRadius": 50,      // How far to search for items/mobs
    "attackRange": 32,       // Maximum attack distance
    "attackCooldown": 1000,  // Milliseconds between attacks
    "autoEat": true,         // Automatically eat food
    "autoHeal": true         // Automatically heal when low health
  }
}
```

## Troubleshooting

### Common Issues

1. **Connection Failed**:
   - Check server host and port
   - Ensure server is running
   - Verify Minecraft version compatibility

2. **AI Not Attacking**:
   - Check if AI is active (`!status`)
   - Verify hostile mobs are in range
   - Ensure weapons are available

3. **Weapons Not Being Picked Up**:
   - Check search radius setting
   - Verify weapon names in config
   - Ensure items are within reach

### Debug Mode

Enable debug logging by setting environment variable:

```bash
DEBUG=mineflayer* npm start
```

## Development

### Project Structure

```
src/
├── index.js          # Main entry point
├── ai-gunner.js      # Core AI logic
├── config-loader.js  # Configuration management
└── utils/            # Utility functions
```

### Adding New Features

1. **New Weapons**: Add to `gunPickupPriority` array
2. **New Mobs**: Add to `hostileMobs` array
3. **New Commands**: Extend `handleCommand()` method
4. **New Behaviors**: Modify AI logic in `ai-gunner.js`

### Testing

Run the AI in development mode:

```bash
npm run dev
```

This will restart the AI automatically when files change.

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues and questions:
- Check the troubleshooting section
- Review the configuration options
- Open an issue on GitHub

## Changelog

### v1.0.0
- Initial release
- Basic AI gunner functionality
- Support for common weapons and mobs
- Chat command system
- Configuration management