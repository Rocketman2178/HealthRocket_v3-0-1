import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import {
  TestTube,
  User,
  Zap,
  Target,
  Trophy,
  Calendar,
  MessageCircle,
  Settings,
  Activity,
  Award,
} from 'lucide-react-native';
import TestUserSelector from '@/components/test/TestUserSelector';
import DatabaseTest from '@/components/test/DatabaseTest';
import UserJourneyTest from '@/components/test/UserJourneyTest';
import SecurityTest from '@/components/test/SecurityTest';
import { TestUser } from '@/utils/testUsers';
import { useAuth } from '@/lib/supabase/auth';
import { supabase } from '@/lib/supabase/client';
import { runFullTestSuite } from '@/test/AuthenticatedTestSuite';

interface FunctionalTest {
  id: string;
  name: string;
  description: string;
  icon: any;
  status: 'idle' | 'running' | 'success' | 'error';
  result?: string;
}

export default function TestingDashboard() {
  const [currentTestUser, setCurrentTestUser] = useState<TestUser | null>(null);
  const [functionalTests, setFunctionalTests] = useState<FunctionalTest[]>([
    {
      id: 'fp-earning',
      name: 'FP Earning System',
      description: 'Test earning Fuel Points from various sources',
      icon: Zap,
      status: 'idle',
    },
    {
      id: 'challenge-flow',
      name: 'Challenge Workflow',
      description: 'Test challenge start, progress, and completion',
      icon: Target,
      status: 'idle',
    },
    {
      id: 'contest-entry',
      name: 'Contest Entry',
      description: 'Test contest registration and verification',
      icon: Trophy,
      status: 'idle',
    },
    {
      id: 'quest-participation',
      name: 'Quest Participation',
      description: 'Test quest enrollment and weekly progress',
      icon: Calendar,
      status: 'idle',
    },
    {
      id: 'health-assessment',
      name: 'Health Assessment',
      description: 'Test health assessment completion and scoring',
      icon: Activity,
      status: 'idle',
    },
    {
      id: 'boost-redemption',
      name: 'Boost Code Redemption',
      description: 'Test boost code validation and redemption',
      icon: Award,
      status: 'idle',
    },
    {
      id: 'chat-system',
      name: 'Chat System',
      description: 'Test real-time messaging and verification posts',
      icon: MessageCircle,
      status: 'idle',
    },
    {
      id: 'profile-updates',
      name: 'Profile Management',
      description: 'Test user profile updates and data integrity',
      icon: User,
      status: 'idle',
    },
  ]);

  const { user } = useAuth();

  const updateTestStatus = (testId: string, status: FunctionalTest['status'], result?: string) => {
    setFunctionalTests(prev => prev.map(test => 
      test.id === testId 
        ? { ...test, status, result }
        : test
    ));
  };

  const runFunctionalTest = async (test: FunctionalTest) => {
    if (!user) {
      Alert.alert('Error', 'Please login with a test user first');
      return;
    }

    updateTestStatus(test.id, 'running');

    try {
      switch (test.id) {
        case 'fp-earning':
          await testFPEarning();
          break;
        case 'challenge-flow':
          await testChallengeFlow();
          break;
        case 'contest-entry':
          await testContestEntry();
          break;
        case 'quest-participation':
          await testQuestParticipation();
          break;
        case 'health-assessment':
          await testHealthAssessment();
          break;
        case 'boost-redemption':
          await testBoostRedemption();
          break;
        case 'chat-system':
          await testChatSystem();
          break;
        case 'profile-updates':
          await testProfileUpdates();
          break;
        default:
          throw new Error('Unknown test');
      }
    } catch (error) {
      updateTestStatus(test.id, 'error', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const testFPEarning = async () => {
    // Test FP earning through RPC function
    const { data, error } = await supabase.rpc('earn_fuel_points', {
      p_user_id: user!.id,
      p_source: 'daily_boost',
      p_amount: 10,
      p_source_id: 'test-boost',
      p_metadata: { test: true }
    });

    if (error) throw error;
    
    updateTestStatus('fp-earning', 'success', `Earned 10 FP. New total: ${data.new_total}`);
  };

  const testChallengeFlow = async () => {
    // Test challenge enrollment and progress
    const { data: challenges, error: challengeError } = await supabase
      .from('challenge_library')
      .select('*')
      .eq('is_active', true)
      .limit(1);

    if (challengeError) throw challengeError;
    if (!challenges || challenges.length === 0) throw new Error('No active challenges found');

    const challenge = challenges[0];
    
    // Check if user is already enrolled
    const { data: userChallenge, error: enrollError } = await supabase
      .from('user_challenges')
      .select('*')
      .eq('user_id', user!.id)
      .eq('challenge_id', challenge.id)
      .single();

    if (enrollError && enrollError.code !== 'PGRST116') throw enrollError;

    updateTestStatus('challenge-flow', 'success', `Challenge access verified: ${challenge.title}`);
  };

  const testContestEntry = async () => {
    // Test contest access and entry
    const { data: contests, error } = await supabase
      .from('contests')
      .select('*')
      .eq('status', 'active')
      .limit(1);

    if (error) throw error;
    
    updateTestStatus('contest-entry', 'success', `Found ${contests?.length || 0} active contests`);
  };

  const testQuestParticipation = async () => {
    // Test quest access
    const { data: quests, error } = await supabase
      .from('quest_library')
      .select('*')
      .eq('is_active', true)
      .limit(1);

    if (error) throw error;
    
    updateTestStatus('quest-participation', 'success', `Found ${quests?.length || 0} active quests`);
  };

  const testHealthAssessment = async () => {
    // Test health assessment creation
    const { data, error } = await supabase
      .from('health_assessments')
      .insert({
        user_id: user!.id,
        mindset_score: 8.0,
        sleep_score: 7.5,
        exercise_score: 8.5,
        nutrition_score: 7.0,
        biohacking_score: 6.5,
        overall_health_score: 7.5,
        healthspan_years: 75.5,
        expected_lifespan: 85,
        assessment_version: '1.0',
        responses: { test: true },
        fp_earned: 100
      })
      .select()
      .single();

    if (error) throw error;
    
    updateTestStatus('health-assessment', 'success', `Assessment created with ID: ${data.id}`);
  };

  const testBoostRedemption = async () => {
    // Test boost code validation (mock)
    const testCode = 'TEST123';
    const { data: codes, error } = await supabase
      .from('boost_codes')
      .select('*')
      .eq('is_active', true)
      .limit(1);

    if (error) throw error;
    
    updateTestStatus('boost-redemption', 'success', `Found ${codes?.length || 0} active boost codes`);
  };

  const testChatSystem = async () => {
    // Test chat message creation
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        chat_id: 'test-chat',
        user_id: user!.id,
        user_name: currentTestUser?.name || 'Test User',
        message: 'Test message from automated test',
        message_type: 'text'
      })
      .select()
      .single();

    if (error) throw error;
    
    updateTestStatus('chat-system', 'success', `Message created with ID: ${data.id}`);
  };

  const testProfileUpdates = async () => {
    // Test profile update
    const { data, error } = await supabase
      .from('users')
      .update({ 
        last_active_at: new Date().toISOString(),
        app_version: 'test-v1.0.0'
      })
      .eq('id', user!.id)
      .select()
      .single();

    if (error) throw error;
    
    updateTestStatus('profile-updates', 'success', `Profile updated for: ${data.user_name}`);
  };

  const runAllTests = async () => {
    if (!user) {
      Alert.alert('Error', 'Please login with a test user first');
      return;
    }

    for (const test of functionalTests) {
      await runFunctionalTest(test);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const getStatusColor = (status: FunctionalTest['status']) => {
    switch (status) {
      case 'success': return '#10B981';
      case 'error': return '#EF4444';
      case 'running': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: FunctionalTest['status']) => {
    switch (status) {
      case 'success': return '✓';
      case 'error': return '✗';
      case 'running': return '⟳';
      default: return '○';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TestTube size={28} color="#FF6B35" />
        <Text style={styles.headerTitle}>Testing Dashboard</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Test User Selector */}
        <TestUserSelector onUserChange={setCurrentTestUser} />

        {/* Database Tests */}
        <DatabaseTest />

        {/* User Journey Tests */}
        <UserJourneyTest />

        {/* Security Tests */}
        <SecurityTest />

        {/* Functional Tests */}
        <View style={styles.functionalTestsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Functional Tests</Text>
            <TouchableOpacity
              style={[styles.runAllButton, !user && styles.runAllButtonDisabled]}
              onPress={runAllTests}
              disabled={!user}
            >
              <Text style={styles.runAllButtonText}>Run All</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.runAllTestsButton, !user && styles.runAllButtonDisabled]}
            onPress={runFullTestSuite}
            disabled={!user}
          >
            <Text style={styles.runAllTestsButtonText}>Run Complete Test Suite</Text>
          </TouchableOpacity>

          {functionalTests.map((test) => {
            const IconComponent = test.icon;
            return (
              <TouchableOpacity
                key={test.id}
                style={styles.testCard}
                onPress={() => runFunctionalTest(test)}
                disabled={!user || test.status === 'running'}
              >
                <View style={styles.testCardHeader}>
                  <View style={styles.testCardIcon}>
                    <IconComponent size={20} color="#3B82F6" />
                  </View>
                  <View style={styles.testCardInfo}>
                    <Text style={styles.testCardName}>{test.name}</Text>
                    <Text style={styles.testCardDescription}>{test.description}</Text>
                  </View>
                  <View style={styles.testCardStatus}>
                    <Text style={[styles.statusIcon, { color: getStatusColor(test.status) }]}>
                      {getStatusIcon(test.status)}
                    </Text>
                  </View>
                </View>
                {test.result && (
                  <Text style={[styles.testResult, { color: getStatusColor(test.status) }]}>
                    {test.result}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginLeft: 12,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  functionalTestsContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  runAllButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  runAllButtonDisabled: {
    backgroundColor: '#64748B',
  },
  runAllButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  runAllTestsButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  runAllTestsButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  testCard: {
    backgroundColor: '#334155',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  testCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  testCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#475569',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  testCardInfo: {
    flex: 1,
  },
  testCardName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 2,
  },
  testCardDescription: {
    fontSize: 12,
    color: '#94A3B8',
  },
  testCardStatus: {
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  testResult: {
    fontSize: 12,
    marginTop: 8,
    marginLeft: 52,
  },
  bottomPadding: {
    height: 20,
  },
});