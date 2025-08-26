import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';

// Import components
import { AuthProvider, useAuth } from './hooks/useAuth';
import { useFrameworkReady } from './hooks/useFrameworkReady';
import OnboardingNavigator from './navigation/OnboardingNavigator';
import MainTabNavigator from './navigation/MainTabNavigator';
import TestingModeProvider from './components/test/TestingModeProvider';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

const Stack = createStackNavigator();

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Onboarding">
            {() => (
              <OnboardingNavigator 
                onComplete={() => {
                  // Navigation will be handled by auth state change
                }} 
              />
            )}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Main" component={MainTabNavigator} />
        )}
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

function AppWrapper() {
  useFrameworkReady();
  
  return (
    <TestingModeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </TestingModeProvider>
  );
}

export default AppWrapper;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
});