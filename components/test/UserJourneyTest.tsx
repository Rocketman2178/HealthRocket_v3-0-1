import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MapPin, CircleCheck as CheckCircle, Circle as XCircle, Clock, User, Zap, Target, Trophy, Calendar, MessageCircle, Award, Activity } from 'lucide-react-native';
import { supabase } from '@/lib/supabase/client';
import { signUp, signIn } from '@/lib/supabase/auth';

interface JourneyStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'success' | 'error';
  result?: string;
  icon: any;
}

export default function UserJourneyTest() {
  const [journeySteps, setJourneySteps] = useState<JourneyStep[]>([
    {
      id: 'registration',
      name: 'User Registration',
      description: 'Create new account with launch code',
      status: 'pending',
      icon: User,
    },
    {
      id: 'first-login',
      name: 'First Login',
      description: 'Authenticate and load user profile',
      status: 'pending',
      icon: CheckCircle,
    },
    {
      id: 'health-assessment',
      name: 'Health Assessment',
      description: 'Complete initial health assessment',
      status: 'pending',
      icon: Activity,
    },
    {
      id: 'first-boost',
      name: 'First Daily Boost',
      description: 'Complete first daily boost activity',
      status: 'pending',
      icon: Zap,
    },
    {
      id: 'challenge-enrollment',
      name: 'Challenge Enrollment',
      description: 'Join first challenge',
      status: 'pending',
      icon: Target,
    },
    {
      id: 'contest-entry',
      name: 'Contest Entry',
      description: 'Enter first contest',
      status: 'pending',
      icon: Trophy,
    },
    {
      id: 'quest-start',
      name: 'Quest Participation',
      description: 'Start first quest',
      status: 'pending',
      icon: Calendar,
    },
    {
      id: 'community-interaction',
      name: 'Community Interaction',
      description: 'Send first chat message',
      status: 'pending',
      icon: MessageCircle,
    },
    {
      id: 'achievement-unlock',
      name: 'Achievement Unlock',
      description: 'Unlock first achievement',
      status: 'pending',
      icon: Award,
    },
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [testUserId, setTestUserId] = useState<string | null>(null);

  const updateStepStatus = (stepId: string, status: JourneyStep['status'], result?: string) => {
    setJourneySteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status, result }
        : step
    ));
  };

  const runUserJourney = async () => {
    setIsRunning(true);
    
    try {
      // Step 1: User Registration
      updateStepStatus('registration', 'running');
      const testEmail = `journey-test-${Math.random().toString(36).substring(2, 8)}@example.com`;
      const testPassword = 'JourneyTest123!';
      const testName = 'Journey Test User';
      
      // Try to sign up without launch code first
      const signUpResult = await signUp(testEmail, testPassword, testName);
      
      if (!signUpResult.success) {
        // If signup fails, try with a common launch code
        const signUpWithCodeResult = await signUp(testEmail, testPassword, testName, 'BETA2024');
        if (!signUpWithCodeResult.success) {
          updateStepStatus('registration', 'error', signUpWithCodeResult.error || 'Registration failed');
          return;
        }
      }
      
      const newUserId = signUpResult.data?.user?.id;
      if (!newUserId) {
        updateStepStatus('registration', 'error', 'No user ID returned');
        return;
      }
      
      setTestUserId(newUserId);
      updateStepStatus('registration', 'success', `User created: ${testEmail}`);

      // Step 2: First Login
      updateStepStatus('first-login', 'running');
      const signInResult = await signIn(testEmail, testPassword);
      
      if (!signInResult.success) {
        updateStepStatus('first-login', 'error', signInResult.error);
        return;
      }
      
      updateStepStatus('first-login', 'success', 'Successfully authenticated');

      // Step 3: Health Assessment
      updateStepStatus('health-assessment', 'running');
      const { data: assessment, error: assessmentError } = await supabase
        .from('health_assessments')
        .insert({
          user_id: newUserId,
          mindset_score: 8.0,
          sleep_score: 7.5,
          exercise_score: 8.5,
          nutrition_score: 7.0,
          biohacking_score: 6.5,
          overall_health_score: 7.5,
          healthspan_years: 75.5,
          expected_lifespan: 85,
          assessment_version: '1.0',
          responses: { journey_test: true },
          fp_earned: 100
        })
        .select()
        .single();

      if (assessmentError) {
        updateStepStatus('health-assessment', 'error', assessmentError.message);
      } else {
        updateStepStatus('health-assessment', 'success', `Assessment completed, earned 100 FP`);
      }

      // Step 4: First Daily Boost
      updateStepStatus('first-boost', 'running');
      const { data: fpResult, error: fpError } = await supabase.rpc('earn_fuel_points', {
        p_user_id: newUserId,
        p_source: 'daily_boost',
        p_amount: 10,
        p_source_id: 'morning-walk',
        p_metadata: { journey_test: true }
      });

      if (fpError) {
        updateStepStatus('first-boost', 'error', fpError.message);
      } else {
        updateStepStatus('first-boost', 'success', `Earned 10 FP from daily boost`);
      }

      // Step 5: Challenge Enrollment
      updateStepStatus('challenge-enrollment', 'running');
      const { data: challenges, error: challengeError } = await supabase
        .from('challenge_library')
        .select('*')
        .eq('is_active', true)
        .limit(1);

      if (challengeError || !challenges || challenges.length === 0) {
        updateStepStatus('challenge-enrollment', 'error', 'No active challenges found');
      } else {
        const challenge = challenges[0];
        const { error: enrollError } = await supabase
          .from('user_challenges')
          .insert({
            user_id: newUserId,
            challenge_id: challenge.id,
            status: 'active',
            start_date: new Date().toISOString().split('T')[0],
            required_verifications: challenge.duration_days
          });

        if (enrollError) {
          updateStepStatus('challenge-enrollment', 'error', enrollError.message);
        } else {
          updateStepStatus('challenge-enrollment', 'success', `Enrolled in: ${challenge.title}`);
        }
      }

      // Step 6: Contest Entry
      updateStepStatus('contest-entry', 'running');
      const { data: contests, error: contestError } = await supabase
        .from('contests')
        .select('*')
        .eq('status', 'active')
        .limit(1);

      if (contestError || !contests || contests.length === 0) {
        updateStepStatus('contest-entry', 'error', 'No active contests found');
      } else {
        const contest = contests[0];
        const { error: entryError } = await supabase
          .from('active_contests')
          .insert({
            user_id: newUserId,
            contest_id: contest.id,
            user_name: testName
          });

        if (entryError) {
          updateStepStatus('contest-entry', 'error', entryError.message);
        } else {
          updateStepStatus('contest-entry', 'success', `Entered contest: ${contest.title}`);
        }
      }

      // Step 7: Quest Participation
      updateStepStatus('quest-start', 'running');
      const { data: quests, error: questError } = await supabase
        .from('quest_library')
        .select('*')
        .eq('is_active', true)
        .limit(1);

      if (questError || !quests || quests.length === 0) {
        updateStepStatus('quest-start', 'error', 'No active quests found');
      } else {
        const quest = quests[0];
        const { error: questEnrollError } = await supabase
          .from('user_quests')
          .insert({
            user_id: newUserId,
            quest_id: quest.id,
            status: 'active',
            start_date: new Date().toISOString().split('T')[0]
          });

        if (questEnrollError) {
          updateStepStatus('quest-start', 'error', questEnrollError.message);
        } else {
          updateStepStatus('quest-start', 'success', `Started quest: ${quest.title}`);
        }
      }

      // Step 8: Community Interaction
      updateStepStatus('community-interaction', 'running');
      const { data: message, error: messageError } = await supabase
        .from('chat_messages')
        .insert({
          chat_id: 'general-discussion',
          user_id: newUserId,
          user_name: testName,
          message: 'Hello from the journey test! 👋',
          message_type: 'text'
        })
        .select()
        .single();

      if (messageError) {
        updateStepStatus('community-interaction', 'error', messageError.message);
      } else {
        updateStepStatus('community-interaction', 'success', 'First message sent to community');
      }

      // Step 9: Achievement Unlock (simulated)
      updateStepStatus('achievement-unlock', 'running');
      // In a real system, this would be triggered by the achievement system
      // For now, we'll simulate it by checking if the user has earned enough FP
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('fuel_points')
        .eq('id', newUserId)
        .single();

      if (profileError) {
        updateStepStatus('achievement-unlock', 'error', profileError.message);
      } else {
        const fpEarned = userProfile.fuel_points || 0;
        if (fpEarned >= 100) {
          updateStepStatus('achievement-unlock', 'success', `First Steps achievement unlocked (${fpEarned} FP)`);
        } else {
          updateStepStatus('achievement-unlock', 'error', `Insufficient FP for achievement (${fpEarned}/100)`);
        }
      }

    } catch (error) {
      console.error('Journey test error:', error);
      Alert.alert('Error', 'Journey test failed');
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: JourneyStep['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={20} color="#10B981" />;
      case 'error':
        return <XCircle size={20} color="#EF4444" />;
      case 'running':
        return <Clock size={20} color="#F59E0B" />;
      default:
        return <Clock size={20} color="#6B7280" />;
    }
  };

  const getStatusColor = (status: JourneyStep['status']) => {
    switch (status) {
      case 'success': return '#10B981';
      case 'error': return '#EF4444';
      case 'running': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const successCount = journeySteps.filter(s => s.status === 'success').length;
  const errorCount = journeySteps.filter(s => s.status === 'error').length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MapPin size={24} color="#8B5CF6" />
        <Text style={styles.title}>User Journey Test</Text>
        <TouchableOpacity
          style={[styles.runButton, isRunning && styles.runButtonDisabled]}
          onPress={runUserJourney}
          disabled={isRunning}
        >
          <Text style={styles.runButtonText}>
            {isRunning ? 'Running...' : 'Start Journey'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <CheckCircle size={16} color="#10B981" />
          <Text style={styles.summaryText}>{successCount} Completed</Text>
        </View>
        <View style={styles.summaryItem}>
          <XCircle size={16} color="#EF4444" />
          <Text style={styles.summaryText}>{errorCount} Failed</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryText}>
            {journeySteps.length} Total Steps
          </Text>
        </View>
      </View>

      <ScrollView style={styles.stepsList} showsVerticalScrollIndicator={false}>
        {journeySteps.map((step, index) => {
          const IconComponent = step.icon;
          return (
            <View key={step.id} style={styles.stepCard}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.stepIcon}>
                <IconComponent size={20} color="#3B82F6" />
              </View>
              <View style={styles.stepContent}>
                <View style={styles.stepHeader}>
                  <Text style={styles.stepName}>{step.name}</Text>
                  {getStatusIcon(step.status)}
                </View>
                <Text style={styles.stepDescription}>{step.description}</Text>
                {step.result && (
                  <Text style={[styles.stepResult, { color: getStatusColor(step.status) }]}>
                    {step.result}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {testUserId && (
        <View style={styles.testUserInfo}>
          <Text style={styles.testUserText}>Test User ID: {testUserId}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F8FAFC',
    flex: 1,
    marginLeft: 8,
  },
  runButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  runButtonDisabled: {
    backgroundColor: '#64748B',
  },
  runButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  summaryCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#334155',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  stepsList: {
    maxHeight: 400,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#334155',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#475569',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepContent: {
    flex: 1,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  stepDescription: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
  },
  stepResult: {
    fontSize: 11,
    fontWeight: '500',
  },
  testUserInfo: {
    backgroundColor: '#334155',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
  },
  testUserText: {
    fontSize: 10,
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
});