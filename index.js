import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';

// Import the main App component
import App from './App';

// Register the main component
registerRootComponent(App);