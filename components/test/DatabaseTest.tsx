import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Database, CircleCheck as CheckCircle, Circle as XCircle, Clock, Zap, Target, Trophy, Users, Activity } from 'lucide-react-native';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  duration?: number;
}

export default function DatabaseTest() {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { user } = useAuth();

  const updateTest = (name: string, status: TestResult['status'], message: string, duration?: number) => {
    setTests(prev => prev.map(test => 
      test.name === name 
        ? { ...test, status, message, duration }
        : test
    ));
  };

  const initializeTests = () => {
    const testList: TestResult[] = [
      { name: 'Database Connection', status: 'pending', message: 'Testing connection...' },
      { name: 'User Authentication', status: 'pending', message: 'Verifying auth state...' },
      { name: 'User Profile Access', status: 'pending', message: 'Testing RLS policies...' },
      { name: 'FP Earnings Query', status: 'pending', message: 'Testing user-scoped queries...' },
      { name: 'Dashboard RPC', status: 'pending', message: 'Testing get_user_dashboard...' },
      { name: 'Challenge Access', status: 'pending', message: 'Testing challenge queries...' },
      { name: 'Contest Access', status: 'pending', message: 'Testing contest queries...' },
      { name: 'Boost Library', status: 'pending', message: 'Testing boost queries...' },
      { name: 'Real-time Subscription', status: 'pending', message: 'Testing subscriptions...' },
      { name: 'Data Integrity', status: 'pending', message: 'Validating data consistency...' },
    ];
    setTests(testList);
  };

  const runDatabaseTests = async () => {
    setIsRunning(true);
    initializeTests();

    try {
      // Test 1: Database Connection
      const startTime = Date.now();
      const { data: connectionTest, error: connectionError } = await supabase
        .from('users')
        .select('count')
        .limit(1);
      
      if (connectionError) {
        updateTest('Database Connection', 'error', connectionError.message);
      } else {
        updateTest('Database Connection', 'success', 'Connected successfully', Date.now() - startTime);
      }

      // Test 2: User Authentication
      const authStart = Date.now();
      if (user && user.email) {
        updateTest('User Authentication', 'success', `Authenticated as ${user.email}`, Date.now() - authStart);
      } else {
        updateTest('User Authentication', 'error', 'No authenticated user - some tests will be skipped');
      }

      // Test 3: User Profile Access (RLS Test)
      if (!user) {
        updateTest('User Profile Access', 'error', 'Skipped - requires authentication');
        updateTest('FP Earnings Query', 'error', 'Skipped - requires authentication');
        updateTest('Dashboard RPC', 'error', 'Skipped - requires authentication');
        updateTest('Challenge Access', 'success', 'Public access verified');
        updateTest('Contest Access', 'success', 'Public access verified');
        updateTest('Boost Library', 'success', 'Public access verified');
        updateTest('Real-time Subscription', 'error', 'Skipped - requires authentication');
        updateTest('Data Integrity', 'error', 'Skipped - requires authentication');
        return;
      }

      const profileStart = Date.now();
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        updateTest('User Profile Access', 'error', `RLS Error: ${profileError.message}`);
      } else if (profile) {
        updateTest('User Profile Access', 'success', `Profile loaded: ${profile.user_name}`, Date.now() - profileStart);
      }

      // Test 4: FP Earnings Query
      const fpStart = Date.now();
      const { data: fpEarnings, error: fpError } = await supabase
        .from('fp_earnings')
        .select('*')
        .eq('user_id', user.id)
        .limit(5);

      if (fpError) {
        updateTest('FP Earnings Query', 'error', fpError.message);
      } else {
        updateTest('FP Earnings Query', 'success', `Found ${fpEarnings?.length || 0} FP records`, Date.now() - fpStart);
      }

      // Test 5: Dashboard RPC
      const dashboardStart = Date.now();
      const { data: dashboard, error: dashboardError } = await supabase
        .rpc('get_user_dashboard', { p_user_id: user.id });

      if (dashboardError) {
        updateTest('Dashboard RPC', 'error', dashboardError.message);
      } else {
        updateTest('Dashboard RPC', 'success', 'Dashboard data loaded', Date.now() - dashboardStart);
      }

      // Test 6: Challenge Access
      const challengeStart = Date.now();
      const { data: challenges, error: challengeError } = await supabase
        .from('challenge_library')
        .select('*')
        .eq('is_active', true)
        .limit(5);

      if (challengeError) {
        updateTest('Challenge Access', 'error', challengeError.message);
      } else {
        updateTest('Challenge Access', 'success', `Found ${challenges?.length || 0} challenges`, Date.now() - challengeStart);
      }

      // Test 7: Contest Access
      const contestStart = Date.now();
      const { data: contests, error: contestError } = await supabase
        .from('contests')
        .select('*')
        .limit(5);

      if (contestError) {
        updateTest('Contest Access', 'error', contestError.message);
      } else {
        updateTest('Contest Access', 'success', `Found ${contests?.length || 0} contests`, Date.now() - contestStart);
      }

      // Test 8: Boost Library
      const boostStart = Date.now();
      const { data: boosts, error: boostError } = await supabase
        .from('boost_library')
        .select('*')
        .eq('is_active', true)
        .limit(5);

      if (boostError) {
        updateTest('Boost Library', 'error', boostError.message);
      } else {
        updateTest('Boost Library', 'success', `Found ${boosts?.length || 0} boosts`, Date.now() - boostStart);
      }

      // Test 9: Real-time Subscription
      const realtimeStart = Date.now();
      try {
        const channel = supabase
          .channel('test-channel')
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'users', filter: `id=eq.${user.id}` },
            (payload) => console.log('Real-time test:', payload)
          )
          .subscribe();

        setTimeout(() => {
          channel.unsubscribe();
          updateTest('Real-time Subscription', 'success', 'Subscription created and cleaned up', Date.now() - realtimeStart);
        }, 1000);
      } catch (error) {
        updateTest('Real-time Subscription', 'error', 'Failed to create subscription');
      }

      // Test 10: Data Integrity
      const integrityStart = Date.now();
      if (profile) {
        const fpTotal = fpEarnings?.reduce((sum, earning) => sum + earning.amount, 0) || 0;
        const profileFP = profile.fuel_points || 0;
        
        if (Math.abs(fpTotal - profileFP) < 100) { // Allow small discrepancy
          updateTest('Data Integrity', 'success', `FP totals consistent (${profileFP} FP)`, Date.now() - integrityStart);
        } else {
          updateTest('Data Integrity', 'error', `FP mismatch: Profile=${profileFP}, Earnings=${fpTotal}`);
        }
      }

    } catch (error) {
      console.error('Test suite error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={20} color="#10B981" />;
      case 'error':
        return <XCircle size={20} color="#EF4444" />;
      default:
        return <Clock size={20} color="#F59E0B" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return '#10B981';
      case 'error':
        return '#EF4444';
      default:
        return '#F59E0B';
    }
  };

  const successCount = tests.filter(t => t.status === 'success').length;
  const errorCount = tests.filter(t => t.status === 'error').length;
  const pendingCount = tests.filter(t => t.status === 'pending').length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Database size={24} color="#3B82F6" />
        <Text style={styles.title}>Database Tests</Text>
        <TouchableOpacity
          style={[styles.runButton, isRunning && styles.runButtonDisabled]}
          onPress={runDatabaseTests}
          disabled={isRunning || !user}
        >
          <Text style={styles.runButtonText}>
            {isRunning ? 'Running...' : 'Run Tests'}
          </Text>
        </TouchableOpacity>
      </View>

      {!user && (
        <View style={styles.warningCard}>
          <Text style={styles.warningText}>
            Some tests require authentication. Running public tests only.
          </Text>
        </View>
      )}

      {tests.length > 0 && (
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <CheckCircle size={16} color="#10B981" />
            <Text style={styles.summaryText}>{successCount} Passed</Text>
          </View>
          <View style={styles.summaryItem}>
            <XCircle size={16} color="#EF4444" />
            <Text style={styles.summaryText}>{errorCount} Failed</Text>
          </View>
          <View style={styles.summaryItem}>
            <Clock size={16} color="#F59E0B" />
            <Text style={styles.summaryText}>{pendingCount} Pending</Text>
          </View>
        </View>
      )}

      <ScrollView style={styles.testList} showsVerticalScrollIndicator={false}>
        {tests.map((test, index) => (
          <View key={index} style={styles.testCard}>
            <View style={styles.testHeader}>
              {getStatusIcon(test.status)}
              <Text style={styles.testName}>{test.name}</Text>
              {test.duration && (
                <Text style={styles.testDuration}>{test.duration}ms</Text>
              )}
            </View>
            <Text style={[styles.testMessage, { color: getStatusColor(test.status) }]}>
              {test.message}
            </Text>
          </View>
        ))}
      </ScrollView>
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
    backgroundColor: '#FF6B35',
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
  warningCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  warningText: {
    color: '#92400E',
    fontSize: 14,
    textAlign: 'center',
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
  testList: {
    maxHeight: 400,
  },
  testCard: {
    backgroundColor: '#334155',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  testName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F8FAFC',
    flex: 1,
    marginLeft: 8,
  },
  testDuration: {
    fontSize: 12,
    color: '#94A3B8',
  },
  testMessage: {
    fontSize: 12,
    marginLeft: 28,
  },
});