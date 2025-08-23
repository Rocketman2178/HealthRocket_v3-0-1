import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import TestingModeProvider from '@/components/test/TestingModeProvider';

export default function RootLayout() {
  useFrameworkReady();

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
