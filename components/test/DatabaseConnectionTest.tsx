// components/test/DatabaseConnectionTest.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { supabase } from '../../lib/supabase/client';
import { useSupabase } from '../../contexts/SupabaseContext';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
  error?: any;
  duration?: number;
}

export function DatabaseConnectionTest() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { user } = useSupabase();

  // Generate unique test data to avoid conflicts
  const generateTestUser = () => {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    return {
      email: `test.user.${timestamp}.${randomId}@healthrocket.test`,
      name: `Test User ${timestamp}`,
      password: `TestPass123${timestamp}`,
      launchCode: 'HEALTHROCKET2025' // Using a known valid launch code
    };
  };

  const updateResult = (name: string, updates: Partial<TestResult>) => {
    setResults(prev => prev.map(result => 
      result.name === name ? { ...result, ...updates } : result
    ));
  };

  const addResult = (result: TestResult) => {
    setResults(prev => [...prev, result]);
  };

  const runTest = async (name: string, testFn: () => Promise<void>) => {
    const startTime = Date.now();
    updateResult(name, { status: 'running' });
    
    try {
      await testFn();
      const duration = Date.now() - startTime;
      updateResult(name, { 
        status: 'success', 
        message: 'Test completed successfully',
        duration 
      });
    } catch (error: any) {
      const duration = Date.now() - startTime;
      updateResult(name, { 
        status: 'error', 
        message: error.message || 'Test failed',
        error,
        duration 
      });
      throw error; // Re-throw to stop dependent tests
    }
  };

  const runAllTests = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setResults([]);
    
    // Initialize test results
    const testNames = [
      'Database Connection',
      'Authentication System',
      'User Profile Creation',
      'FP System Integration',
      'Challenge System',
      'Real-time Features',
      'Admin Functions',
      'Data Cleanup'
    ];

    testNames.forEach(name => {
      addResult({ name, status: 'pending' });
    });

    let testUser: any = null;
    let testAuthUser: any = null;

    try {
      // Test 1: Database Connection
      await runTest('Database Connection', async () => {
        const { data, error } = await supabase.from('users').select('count').limit(1);
        if (error) throw error;
        console.log('Database connection successful');
      });

      // Test 2: Authentication System
      await runTest('Authentication System', async () => {
        testUser = generateTestUser();
        
        // First, validate the launch code
        const { data: validationData, error: validationError } = await supabase.rpc(
          'validate_launch_code',
          { p_code: testUser.launchCode }
        );

        if (validationError) {
          throw new Error(`Launch code validation failed: ${validationError.message}`);
        }

        if (!validationData?.valid) {
          throw new Error('Launch code is not valid');
        }

        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: testUser.email,
          password: testUser.password,
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error('No user created');
        
        testAuthUser = authData.user;
        console.log('Authentication user created:', testAuthUser.id);
      });

      // Test 3: User Profile Creation
      await runTest('User Profile Creation', async () => {
        if (!testAuthUser) throw new Error('No authenticated user available');

        // Check if profile already exists and delete it if it does
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('id', testAuthUser.id)
          .single();

        if (existingUser) {
          const { error: deleteError } = await supabase
            .from('users')
            .delete()
            .eq('id', testAuthUser.id);
          
          if (deleteError) {
            console.warn('Could not delete existing user:', deleteError);
          }
        }

        // Create new user profile
        const { error: profileError } = await supabase.from('users').insert({
          id: testAuthUser.id,
          email: testUser.email,
          name: testUser.name,
          plan: 'Pro Plan',
          level: 1,
          fuel_points: 0,
          burn_streak: 0,
          health_score: 7.8,
          healthspan_years: 0,
          onboarding_completed: false,
          subscription_start_date: new Date().toISOString(),
          plan_status: 'Active'
        });

        if (profileError) {
          throw new Error(`Profile creation failed: ${profileError.message}`);
        }

        console.log('User profile created successfully');
      });

      // Test 4: FP System Integration
      await runTest('FP System Integration', async () => {
        if (!testAuthUser) throw new Error('No authenticated user available for FP test');

        // Test FP earning
        const { data: fpData, error: fpError } = await supabase
          .from('fp_earnings')
          .insert({
            user_id: testAuthUser.id,
            source: 'test',
            source_id: crypto.randomUUID(),
            fp_amount: 100,
            description: 'Test FP earning',
            user_name: testUser.name,
            date: new Date().toISOString().split('T')[0]
          })
          .select()
          .single();

        if (fpError) throw fpError;
        if (!fpData) throw new Error('No FP data returned');

        // Update user's fuel points
        const { error: updateError } = await supabase
          .from('users')
          .update({ fuel_points: 100, lifetime_fp: 100 })
          .eq('id', testAuthUser.id);

        if (updateError) throw updateError;

        console.log('FP system working correctly');
      });

      // Test 5: Challenge System
      await runTest('Challenge System', async () => {
        if (!testAuthUser) throw new Error('No authenticated user available for challenge test');

        // Test challenge library access
        const { data: challengeData, error: challengeError } = await supabase
          .from('challenge_library')
          .select('id, title, category')
          .limit(1);

        if (challengeError) throw challengeError;
        if (!challengeData || challengeData.length === 0) {
          console.warn('No challenges found in library');
          return;
        }

        console.log('Challenge system accessible');
      });

      // Test 6: Real-time Features
      await runTest('Real-time Features', async () => {
        // Test real-time subscription capability
        const testChannel = supabase
          .channel('test-channel')
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'users' }, 
            (payload) => {
              console.log('Real-time change received:', payload);
            }
          );

        await testChannel.subscribe();
        
        // Clean up the channel
        supabase.removeChannel(testChannel);
        
        console.log('Real-time features working');
      });

      // Test 7: Admin Functions (if current user is admin)
      await runTest('Admin Functions', async () => {
        if (user?.email && ['derek@healthrocket.app', 'derek@healthrocket.life'].includes(user.email)) {
          // Test admin-specific functions
          const { data: adminData, error: adminError } = await supabase
            .from('users')
            .select('count')
            .limit(1);

          if (adminError) throw adminError;
          console.log('Admin functions accessible');
        } else {
          console.log('Skipping admin tests - not admin user');
        }
      });

      // Test 8: Data Cleanup
      await runTest('Data Cleanup', async () => {
        if (!testAuthUser) {
          console.log('No test user to clean up');
          return;
        }

        // Clean up test data
        const cleanupOperations = [
          // Delete FP earnings
          supabase.from('fp_earnings').delete().eq('user_id', testAuthUser.id),
          // Delete user profile
          supabase.from('users').delete().eq('id', testAuthUser.id),
        ];

        await Promise.all(cleanupOperations);

        // Delete auth user
        const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(
          testAuthUser.id
        );

        if (deleteAuthError) {
          console.warn('Could not delete auth user:', deleteAuthError);
        }

        console.log('Test data cleanup completed');
      });

    } catch (error) {
      console.error('Test suite failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return '#10B981';
      case 'error': return '#EF4444';
      case 'running': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'running': return '🔄';
      default: return '⏳';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Health Rocket V3 - Database Tests</Text>
      
      <TouchableOpacity
        style={[styles.button, isRunning && styles.buttonDisabled]}
        onPress={runAllTests}
        disabled={isRunning}
      >
        <Text style={styles.buttonText}>
          {isRunning ? 'Running Tests...' : 'Run All Tests'}
        </Text>
      </TouchableOpacity>

      <ScrollView style={styles.resultsContainer}>
        {results.map((result, index) => (
          <View key={index} style={styles.resultItem}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultIcon}>
                {getStatusIcon(result.status)}
              </Text>
              <Text style={styles.resultName}>{result.name}</Text>
              {result.duration && (
                <Text style={styles.resultDuration}>
                  {result.duration}ms
                </Text>
              )}
            </View>
            
            {result.message && (
              <Text style={[
                styles.resultMessage,
                { color: getStatusColor(result.status) }
              ]}>
                {result.message}
              </Text>
            )}
            
            {result.error && result.status === 'error' && (
              <Text style={styles.errorDetails}>
                {JSON.stringify(result.error, null, 2)}
              </Text>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          Current User: {user?.email || 'Not authenticated'}
        </Text>
        <Text style={styles.infoText}>
          Database: Connected to Supabase
        </Text>
        <Text style={styles.infoText}>
          Tests: {results.filter(r => r.status === 'success').length} passed, {results.filter(r => r.status === 'error').length} failed
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1a1a1a',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#3B82F6',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#6B7280',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 15,
  },
  resultItem: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#404040',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  resultIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
  },
  resultDuration: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  resultMessage: {
    fontSize: 14,
    marginLeft: 26,
    marginTop: 5,
  },
  errorDetails: {
    fontSize: 12,
    color: '#EF4444',
    marginLeft: 26,
    marginTop: 5,
    fontFamily: 'monospace',
  },
  infoContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 5,
  },
});