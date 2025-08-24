import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
import SignUpScreen from '../screens/onboarding/SignUpScreen';
import SignInScreen from '../screens/onboarding/SignInScreen';
import ProfileSetupScreen from '../screens/onboarding/ProfileSetupScreen';
import HealthAssessmentIntro from '../screens/onboarding/HealthAssessmentIntro';
import WelcomeDashboard from '../screens/onboarding/WelcomeDashboard';

const Stack = createStackNavigator();

interface OnboardingNavigatorProps {
  onComplete: () => void;
}

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill, 
            { width: `${(currentStep / totalSteps) * 100}%` }
          ]} 
        />
      </View>
      <Text style={styles.progressText}>
        Step {currentStep} of {totalSteps}
      </Text>
    </View>
  );
}

export default function OnboardingNavigator({ onComplete }: OnboardingNavigatorProps) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#0F172A' },
        animationEnabled: true,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="Welcome">
        {(props) => (
          <WelcomeScreen
            {...props}
            onGetStarted={() => props.navigation.navigate('SignUp')}
          />
        )}
      </Stack.Screen>
      
      <Stack.Screen name="SignUp">
        {(props) => (
          <>
            <ProgressIndicator currentStep={1} totalSteps={5} />
            <SignUpScreen
              {...props}
              onBack={() => props.navigation.goBack()}
              onSignUpSuccess={(user) => props.navigation.navigate('ProfileSetup', { user })}
              onSignInPress={() => props.navigation.navigate('SignIn')}
            />
          </>
        )}
      </Stack.Screen>
      
      <Stack.Screen name="SignIn">
        {(props) => (
          <SignInScreen
            {...props}
            onBack={() => props.navigation.goBack()}
            onSignInSuccess={(user) => props.navigation.navigate('ProfileSetup', { user })}
            onSignUpPress={() => props.navigation.navigate('SignUp')}
            onForgotPassword={() => {
              // Handle forgot password
              console.log('Forgot password pressed');
            }}
          />
        )}
      </Stack.Screen>
      
      <Stack.Screen name="ProfileSetup">
        {(props) => (
          <>
            <ProgressIndicator currentStep={2} totalSteps={5} />
            <ProfileSetupScreen
              {...props}
              user={props.route.params?.user}
              onComplete={() => props.navigation.navigate('HealthAssessmentIntro')}
              onSkip={() => props.navigation.navigate('WelcomeDashboard')}
            />
          </>
        )}
      </Stack.Screen>
      
      <Stack.Screen name="HealthAssessmentIntro">
        {(props) => (
          <>
            <ProgressIndicator currentStep={3} totalSteps={5} />
            <HealthAssessmentIntro
              {...props}
              onStartAssessment={() => {
                // Navigate to actual health assessment
                props.navigation.navigate('WelcomeDashboard');
              }}
              onSkip={() => props.navigation.navigate('WelcomeDashboard')}
            />
          </>
        )}
      </Stack.Screen>
      
      <Stack.Screen name="WelcomeDashboard">
        {(props) => (
          <>
            <ProgressIndicator currentStep={5} totalSteps={5} />
            <WelcomeDashboard
              {...props}
              onComplete={onComplete}
            />
          </>
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  progressContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 1000,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: 4,
    backgroundColor: '#FF6B35',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
});