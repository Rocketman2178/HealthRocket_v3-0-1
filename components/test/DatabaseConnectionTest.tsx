// components/test/SimpleDatabaseTest.tsx
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

export function SimpleDatabaseTest() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { user, isConnected } = useSupabase();

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
    }
  };

  const runAllTests = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setResults([]);
    
    // Initialize test results
    const testNames = [
      'Database Connection',
      'Schema Validation', 
      'RPC Functions',
      'Real-time Connection',
      'Current User Context',
      'Read-Only Data Access'
    ];

    testNames.forEach(name => {
      addResult({ name, status: 'pending' });
    });

    try {
      // Test 1: Basic Database Connection
      await runTest('Database Connection', async () => {
        const { error } = await supabase
          .from('users')
          .select('count')
          .limit(1);
        
        if (error) throw error;
        console.log('✅ Database connection successful');
      });

      // Test 2: Schema Validation - Check key tables exist
      await runTest('Schema Validation', async () => {
        const tables = ['users', 'challenge_library', 'fp_earnings', 'communities'];
        const results = await Promise.all(
          tables.map(async (table) => {
            const { error } = await supabase
              .from(table)
              .select('*')
              .limit(1);
            return { table, success: !error };
          })
        );
        
        const failedTables = results.filter(r => !r.success).map(r => r.table);
        if (failedTables.length > 0) {
          throw new Error(`Missing tables: ${failedTables.join(', ')}`);
        }
        
        console.log('✅ All core tables accessible');
      });

      // Test 3: RPC Functions
      await runTest('RPC Functions', async () => {
        // Test launch code validation function
        const { data, error } = await supabase.rpc(
          'validate_launch_code',
          { p_code: 'TEST_CODE' } // This will be invalid but function should work
        );
        
        if (error) throw error;
        
        // Should return validation result (even if invalid)
        if (data === null || data === undefined) {
          throw new Error('RPC function returned no data');
        }
        
        console.log('✅ RPC functions working');
      });

      // Test 4: Real-time Connection
      await runTest('Real-time Connection', async () => {
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Real-time connection timeout'));
          }, 5000);

          const channel = supabase
            .channel('test-connection')
            .on('presence', { event: 'sync' }, () => {
              console.log('✅ Real-time connection established');
            })
            .subscribe((status) => {
              if (status === 'SUBSCRIBED') {
                clearTimeout(timeout);
                supabase.removeChannel(channel);
                resolve(undefined);
              } else if (status === 'CHANNEL_ERROR') {
                clearTimeout(timeout);
                reject(new Error('Real-time channel error'));
              }
            });
        });
      });

      // Test 5: Current User Context
      await runTest('Current User Context', async () => {
        if (!user) {
          throw new Error('No user authenticated - please sign in first');
        }
        
        // Try to fetch current user's profile
        const { data: profile, error } = await supabase
          .from('users')
          .select('id, email, name, fuel_points, level')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        if (!profile) throw new Error('User profile not found');
        
        console.log('✅ Current user profile accessible:', {
          email: profile.email,
          name: profile.name,
          level: profile.level,
          fuel_points: profile.fuel_points
        });
      });

      // Test 6: Read-Only Data Access
      await runTest('Read-Only Data Access', async () => {
        // Test reading challenge library
        const { data: challenges, error: challengeError } = await supabase
          .from('challenge_library')
          .select('id, title, category, description')
          .limit(5);
        
        if (challengeError) throw challengeError;
        
        // Test reading communities
        const { data: communities, error: communityError } = await supabase
          .from('communities')
          .select('id, name, member_count')
          .limit(3);
        
        if (communityError) throw communityError;
        
        console.log('✅ Read access working:', {
          challenges_found: challenges?.length || 0,
          communities_found: communities?.length || 0
        });
      });

    } catch (error) {
      console.error('❌ Test suite failed:', error);
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
      <Text style={styles.title}>Health Rocket V3 - Simple Database Test</Text>
      
      <View style={styles.statusContainer}>
        <Text style={[styles.statusText, { color: isConnected ? '#10B981' : '#EF4444' }]}>
          Connection Status: {isConnected ? 'Connected' : 'Disconnected'}
        </Text>
        <Text style={styles.statusText}>
          Current User: {user?.email || 'Not authenticated'}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, isRunning && styles.buttonDisabled]}
        onPress={runAllTests}
        disabled={isRunning}
      >
        <Text style={styles.buttonText}>
          {isRunning ? 'Running Tests...' : 'Run Simple Tests'}
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
              <View style={styles.errorContainer}>
                <Text style={styles.errorTitle}>Error Details:</Text>
                <Text style={styles.errorDetails}>
                  {result.error.message || 'Unknown error'}
                </Text>
                {result.error.code && (
                  <Text style={styles.errorCode}>
                    Code: {result.error.code}
                  </Text>
                )}
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Test Summary</Text>
        <Text style={styles.summaryText}>
          ✅ Passed: {results.filter(r => r.status === 'success').length}
        </Text>
        <Text style={styles.summaryText}>
          ❌ Failed: {results.filter(r => r.status === 'error').length}
        </Text>
        <Text style={styles.summaryText}>
          ⏳ Pending: {results.filter(r => r.status === 'pending').length}
        </Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>What This Tests:</Text>
        <Text style={styles.infoText}>• Basic database connectivity</Text>
        <Text style={styles.infoText}>• Core table schema validation</Text>
        <Text style={styles.infoText}>• RPC function availability</Text>
        <Text style={styles.infoText}>• Real-time connection capability</Text>
        <Text style={styles.infoText}>• Current user data access</Text>
        <Text style={styles.infoText}>• Read permissions for game data</Text>
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
  statusContainer: {
    backgroundColor: '#2a2a2a',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  statusText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 5,
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
    marginBottom: 20,
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
  errorContainer: {
    marginLeft: 26,
    marginTop: 8,
    padding: 10,
    backgroundColor: '#2d1b1b',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
  },
  errorTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#EF4444',
    marginBottom: 4,
  },
  errorDetails: {
    fontSize: 12,
    color: '#FCA5A5',
    marginBottom: 4,
  },
  errorCode: {
    fontSize: 11,
    color: '#9CA3AF',
    fontFamily: 'monospace',
  },
  summaryContainer: {
    backgroundColor: '#2a2a2a',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 3,
  },
  infoContainer: {
    backgroundColor: '#2a2a2a',
    padding: 15,
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 3,
  },
});