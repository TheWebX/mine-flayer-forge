// Version detection utilities for Minecraft servers

class VersionDetector {
  static SUPPORTED_VERSIONS = [
    '1.19.3',
    '1.19.4', 
    '1.20.1',
    '1.20.4',
    '1.21.0'
  ];

  static async detectServerVersion(host, port) {
    const minecraftProtocol = require('minecraft-protocol');
    
    try {
      console.log(`🔍 Detecting server version at ${host}:${port}...`);
      
      const ping = await minecraftProtocol.ping({
        host: host,
        port: port,
        version: 'auto'
      });
      
      if (ping && ping.version && ping.version.name) {
        const detectedVersion = ping.version.name;
        console.log(`✅ Detected server version: ${detectedVersion}`);
        
        // Check if it's a supported version
        if (this.SUPPORTED_VERSIONS.includes(detectedVersion)) {
          return detectedVersion;
        } else {
          console.warn(`⚠️  Unsupported version detected: ${detectedVersion}`);
          console.warn(`   Supported versions: ${this.SUPPORTED_VERSIONS.join(', ')}`);
          return '1.19.3'; // Fallback to a known working version
        }
      } else {
        console.warn('⚠️  Could not detect server version, using fallback');
        return '1.19.3';
      }
    } catch (error) {
      console.warn(`⚠️  Version detection failed: ${error.message}`);
      console.warn('   Using fallback version: 1.19.3');
      return '1.19.3';
    }
  }

  static async createBotWithVersionDetection(serverConfig) {
    let version = serverConfig.version;
    
    // If no version specified or auto-detect requested, try to detect
    if (!version || version === 'auto') {
      version = await this.detectServerVersion(serverConfig.host, serverConfig.port);
    }

    const botOptions = {
      host: serverConfig.host,
      port: serverConfig.port,
      username: serverConfig.username,
      password: serverConfig.password,
      auth: serverConfig.auth,
      version: version,
      hideErrors: false,
      checkTimeoutInterval: 60000,
      keepAlive: true
    };

    console.log(`🎮 Using Minecraft version: ${version}`);
    return botOptions;
  }

  static validateVersion(version) {
    if (!version) return false;
    
    // Check if it's a valid version format
    if (!version.match(/^\d+\.\d+(\.\d+)?$/)) {
      return false;
    }
    
    // Check if it's supported
    return this.SUPPORTED_VERSIONS.includes(version);
  }

  static getRecommendedVersion() {
    return '1.19.3'; // Most stable version
  }
}

module.exports = VersionDetector;