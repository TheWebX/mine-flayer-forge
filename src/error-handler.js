// Error handling utilities for the AI Gunner

class ErrorHandler {
  static handleBotError(error, botOptions) {
    console.error('Bot Error:', error.message);
    
    if (error.message.includes('version')) {
      console.error('Version Error: Invalid or unsupported Minecraft version');
      console.error('Supported versions: 1.19.4, 1.20.1, 1.20.4');
      console.error('Current version:', botOptions.version || 'auto-detect');
      console.error('Try changing the version in config.json');
    } else if (error.message.includes('connection')) {
      console.error('Connection Error: Unable to connect to server');
      console.error('Check if the server is running and accessible');
      console.error('Server:', `${botOptions.host}:${botOptions.port}`);
    } else if (error.message.includes('auth')) {
      console.error('Authentication Error: Invalid credentials');
      console.error('Check username and password in config');
    } else {
      console.error('Unknown error:', error.message);
    }
    
    return false;
  }
  
  static handleAIGunnerError(error, context) {
    console.error(`AI Gunner Error in ${context}:`, error.message);
    
    if (error.message.includes('Cannot read properties of null')) {
      console.error('Null reference error - this may be due to version compatibility');
      console.error('Try updating the Minecraft version in config.json');
    }
    
    return false;
  }
  
  static validateBotOptions(options) {
    const errors = [];
    
    if (!options.host) errors.push('Host is required');
    if (!options.port) errors.push('Port is required');
    if (!options.username) errors.push('Username is required');
    
    if (options.version && !options.version.match(/^\d+\.\d+(\.\d+)?$/)) {
      errors.push('Version must be in format X.Y.Z (e.g., 1.20.1)');
    }
    
    if (errors.length > 0) {
      console.error('Configuration errors:');
      errors.forEach(error => console.error(`  - ${error}`));
      return false;
    }
    
    return true;
  }
}

module.exports = ErrorHandler;