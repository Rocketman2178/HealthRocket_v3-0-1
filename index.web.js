// Web entry point - ensures Platform is available before any other imports
if (typeof window !== 'undefined' && !window.Platform) {
  // Define Platform globally for web before any React Native imports
  window.Platform = {
    OS: 'web',
    Version: undefined,
    isTVOS: false,
    constants: {}
  };
  
  // Make Platform available on global scope
  global.Platform = window.Platform;
}

// Now import the main app after Platform is defined
import 'expo-router/entry';