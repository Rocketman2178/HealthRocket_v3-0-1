import { registerWebPlugin } from 'expo';

// Platform polyfill for web
if (typeof window !== 'undefined') {
  // Ensure Platform is available globally for web
  if (!global.Platform) {
    global.Platform = {
      OS: 'web',
      Version: undefined,
      isTVOS: false,
      constants: {}
    };
  }

  // Ensure React Native modules are available
  if (!global.__expo_module_map) {
    global.__expo_module_map = {};
  }

  // Add any other global polyfills needed for web
  if (!global.HermesInternal) {
    global.HermesInternal = undefined;
  }
}

// Register any required Expo web plugins
if (typeof window !== 'undefined') {
  // Web-specific initialization
}

export {};