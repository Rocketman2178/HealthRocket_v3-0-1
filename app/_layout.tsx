import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import TestingModeProvider from '../components/test/TestingModeProvider';
import { AuthProvider } from '../hooks/useAuth';
import OnboardingNavigator from '../navigation/OnboardingNavigator';
import { useAuth } from '../hooks/useAuth';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  if (!user) {
    return (
      <OnboardingNavigator 
        onComplete={() => {
          // Navigation will be handled by auth state change
        }} 
      />
    );
  }

  return (
    <TestingModeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="+not-found" />
        <Stack.Screen name="testing" options={{ presentation: 'modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </TestingModeProvider>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  // Web-specific setup
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Ensure web compatibility
      const initializeWeb = () => {
        // Any web-specific initialization can go here
        console.log('Web platform initialized');
      };
      initializeWeb();
    }
  }, []);

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
});