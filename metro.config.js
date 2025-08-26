const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add web-specific resolver for platform modules
config.resolver.platforms = ['web', 'native', 'ios', 'android'];

// Handle platform-specific extensions
config.resolver.sourceExts.push('web.ts', 'web.tsx', 'web.js', 'web.jsx');

// Add alias for React Native modules on web
config.resolver.alias = {
  ...config.resolver.alias,
  'react-native$': 'react-native-web',
};

// Handle platform-specific modules
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config;