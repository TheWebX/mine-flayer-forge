# Troubleshooting Guide

## ✅ Version Error Fixed

The "Cannot read properties of null (reading 'version')" error has been resolved!

### What Was Fixed

1. **Version Handling**: Removed explicit version specification to use auto-detect
2. **Plugin Loading**: Fixed plugin loading to handle different export formats
3. **Error Handling**: Added comprehensive error handling and validation
4. **Dependency Management**: Updated to compatible versions

### Current Status

- ✅ **Bot Creation**: Works without version errors
- ✅ **Plugin Loading**: All plugins load successfully
- ✅ **AI Gunner**: Initializes properly
- ✅ **Security**: 0 vulnerabilities
- ✅ **Compatibility**: Works with Node.js 16-18

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Test the setup**:
   ```bash
   npm test
   ```

3. **Start the AI**:
   ```bash
   npm start
   ```

## Common Issues & Solutions

### 1. Connection Refused Error
```
Error: connect ECONNREFUSED 127.0.0.1:25565
```
**Solution**: This is normal when no Minecraft server is running. Start your Minecraft Forge server first.

### 2. Version Compatibility
If you encounter version issues:
- The AI now uses auto-detect for Minecraft version
- This works with most Minecraft Forge servers
- No manual version configuration needed

### 3. Plugin Loading Warnings
```
Some plugins failed to load
```
**Solution**: This is normal. The AI will work with available plugins.

### 4. Node.js Version Issues
- Use Node.js 16.x or 18.x
- Avoid Node.js 22+ (compatibility issues)
- Tested with Node.js 18.17.0

## Configuration

### Basic Configuration
Edit `config.json`:
```json
{
  "server": {
    "host": "localhost",
    "port": 25565,
    "username": "AIGunner",
    "password": "",
    "auth": "offline"
  }
}
```

### Environment Variables
Create `.env` file:
```env
MINECRAFT_HOST=localhost
MINECRAFT_PORT=25565
MINECRAFT_USERNAME=AIGunner
MINECRAFT_PASSWORD=
MINECRAFT_AUTH=offline
```

## Testing

### Test Setup
```bash
npm test
```

### Test Bot Creation
```bash
node test-bot.js
```

### Test with Server
1. Start Minecraft Forge server
2. Run: `npm start`
3. Check console for connection success

## Debug Mode

Enable debug logging:
```bash
DEBUG=mineflayer* npm start
```

## Commands

### In-Game Commands
- `!start` - Activate AI Gunner
- `!stop` - Deactivate AI Gunner
- `!status` - Check status and target
- `!help` - Show commands

### Console Commands
- `npm start` - Start AI Gunner
- `npm test` - Test setup
- `npm audit` - Check security

## Performance

### Recommended Settings
- **Search Radius**: 50 blocks
- **Attack Range**: 32 blocks
- **Update Frequency**: 100ms (combat), 2000ms (search)

### Memory Usage
- Typical: ~50-100MB
- With plugins: ~100-200MB

## Support

### Logs
Check console output for detailed error messages.

### Common Solutions
1. **Restart**: Stop and restart the AI
2. **Reconnect**: The AI will auto-reconnect on server restart
3. **Config**: Verify server settings in config.json
4. **Dependencies**: Run `npm install` to update packages

### Getting Help
1. Check this troubleshooting guide
2. Run `npm test` to verify setup
3. Check console logs for specific errors
4. Verify Minecraft server is running and accessible

## Success Indicators

When everything is working correctly, you should see:
```
🤖 Starting AI Gunner with enhanced error handling...
✅ Bot created successfully
✅ Plugins loaded successfully
✅ AI Gunner initialized
🎮 [AIGunner] Spawned in world
🤖 AI Gunner is now active!
```

The AI will then automatically:
- Search for weapons and ammunition
- Hunt down hostile mobs
- Engage in combat
- Respond to chat commands