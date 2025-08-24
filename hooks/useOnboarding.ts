import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type OnboardingStep = 
  | 'welcome'
  | 'signup'
  | 'signin'
  | 'profile_setup'
  | 'health_assessment'
  | 'welcome_dashboard'
  | 'completed';

interface OnboardingState {
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  skippedSteps: OnboardingStep[];
  isComplete: boolean;
}

const ONBOARDING_STORAGE_KEY = '@health_rocket_onboarding';

const initialState: OnboardingState = {
  currentStep: 'welcome',
  completedSteps: [],
  skippedSteps: [],
  isComplete: false,
};

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>(initialState);
  const [loading, setLoading] = useState(true);

  // Load onboarding state from storage
  useEffect(() => {
    loadOnboardingState();
  }, []);

  // Save state to storage whenever it changes
  useEffect(() => {
    if (!loading) {
      saveOnboardingState();
    }
  }, [state, loading]);

  const loadOnboardingState = async () => {
    try {
      const stored = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (stored) {
        const parsedState = JSON.parse(stored);
        setState(parsedState);
      }
    } catch (error) {
      console.error('Error loading onboarding state:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveOnboardingState = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving onboarding state:', error);
    }
  };

  const setCurrentStep = (step: OnboardingStep) => {
    setState(prev => ({
      ...prev,
      currentStep: step,
    }));
  };

  const completeStep = (step: OnboardingStep) => {
    setState(prev => ({
      ...prev,
      completedSteps: [...prev.completedSteps.filter(s => s !== step), step],
      skippedSteps: prev.skippedSteps.filter(s => s !== step),
    }));
  };

  const skipStep = (step: OnboardingStep) => {
    setState(prev => ({
      ...prev,
      skippedSteps: [...prev.skippedSteps.filter(s => s !== step), step],
      completedSteps: prev.completedSteps.filter(s => s !== step),
    }));
  };

  const completeOnboarding = () => {
    setState(prev => ({
      ...prev,
      currentStep: 'completed',
      isComplete: true,
    }));
  };

  const resetOnboarding = () => {
    setState(initialState);
    AsyncStorage.removeItem(ONBOARDING_STORAGE_KEY);
  };

  const isStepCompleted = (step: OnboardingStep): boolean => {
    return state.completedSteps.includes(step);
  };

  const isStepSkipped = (step: OnboardingStep): boolean => {
    return state.skippedSteps.includes(step);
  };

  const getProgress = (): { current: number; total: number; percentage: number } => {
    const totalSteps = 6; // welcome, signup, profile_setup, health_assessment, welcome_dashboard, completed
    const completedCount = state.completedSteps.length;
    
    return {
      current: completedCount,
      total: totalSteps,
      percentage: Math.round((completedCount / totalSteps) * 100),
    };
  };

  const getNextStep = (): OnboardingStep | null => {
    const stepOrder: OnboardingStep[] = [
      'welcome',
      'signup',
      'profile_setup',
      'health_assessment',
      'welcome_dashboard',
      'completed',
    ];

    const currentIndex = stepOrder.indexOf(state.currentStep);
    if (currentIndex < stepOrder.length - 1) {
      return stepOrder[currentIndex + 1];
    }
    
    return null;
  };

  const canSkipStep = (step: OnboardingStep): boolean => {
    const skippableSteps: OnboardingStep[] = [
      'profile_setup',
      'health_assessment',
    ];
    
    return skippableSteps.includes(step);
  };

  return {
    // State
    currentStep: state.currentStep,
    completedSteps: state.completedSteps,
    skippedSteps: state.skippedSteps,
    isComplete: state.isComplete,
    loading,

    // Actions
    setCurrentStep,
    completeStep,
    skipStep,
    completeOnboarding,
    resetOnboarding,

    // Helpers
    isStepCompleted,
    isStepSkipped,
    getProgress,
    getNextStep,
    canSkipStep,
  };
}