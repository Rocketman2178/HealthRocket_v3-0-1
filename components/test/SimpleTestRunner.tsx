import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { TestTube, CircleCheck as CheckCircle, Circle as XCircle, Clock, Database, Shield, Zap } from 'lucide-react-native';
import { supabase } from '@/lib/supabase/client';

interface SimpleTest {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'success' | 'error';
  result?: string;
  category: 'database' | 'auth' | 'rpc' | 'public';
}

export default function SimpleTestRunner() {
  const [tests, setTests] = useState<SimpleTest[]>([
    {
      id: 'db-connection',
      name: 'Database Connection',
      description: 'Test basic Supabase connection',
      status: 'pending',
      category: 'database',
    },
    {
      id: 'public-tables',
      name: 'Public Table Access',
      description: 'Test access to public/unrestricted tables',
      status: 'pending',
      category: 'database',
    },
    {
      id: 'challenge-library',
      name: 'Challenge Library',
      description: 'Test challenge library access',
      status: 'pending',
      category: 'public',
    },
    {
      id: 'boost-library',
      name: 'Boost Library',
      description: 'Test boost library access',
      status: 'pending',
      category: 'public',
    },
    {
      id: 'contest-library',
      name: 'Contest Library',
      description: 'Test contest library access',
      status: 'pending',
      category: 'public',
    },
    {
      id: 'launch-codes',
      name: 'Launch Codes',
      description: 'Test launch code validation',
      status: 'pending',
      category: 'public',
    },
    {
      id: 'boost-codes',
      name: 'Boost Codes',
      description: 'Test boost code access',
      status: 'pending',
      category: 'public',
    },
    {
      id: 'auth-status',
      name: 'Authentication Status',
      description: 'Check current authentication state',
      status: 'pending',
      category: 'auth',
    },
  ]);

  const [isRunning, setIsRunning] = useState(false);

  const updateTestStatus = (testId: string, status: SimpleTest['status'], result?: string) => {
    setTests(prev => prev.map(test => 
      test.id === testId 
        ? { ...test, status, result }
        : test
    ));
  };

  const runAllTests = async () => {
    setIsRunning(true);
    
    // Reset all tests
    setTests(prev => prev.map(test => ({ ...test, status: 'pending' as const })));

    try {
      // Test 1: Database Connection
      await testDatabaseConnection();
      
      // Test 2: Public Tables
      await testPublicTables();
      
      // Test 3: Challenge Library
      await testChallengeLibrary();
      
      // Test 4: Boost Library
      await testBoostLibrary();
      
      // Test 5: Contest Library
      await testContestLibrary();
      
      // Test 6: Launch Codes
      await testLaunchCodes();
      
      // Test 7: Boost Codes
      await testBoostCodes();
      
      // Test 8: Auth Status
      await testAuthStatus();

    } catch (error) {
      console.error('Test suite error:', error);
      Alert.alert('Error', 'Test suite encountered an error');
    } finally {
      setIsRunning(false);
    }
  };

  const testDatabaseConnection = async () => {
    updateTestStatus('db-connection', 'running');
    
    try {
      const startTime = Date.now();
      
      // Simple connection test
      const { data, error } = await supabase
        .from('challenge_library')
        .select('count')
        .limit(1);
      
      const duration = Date.now() - startTime;
      
      if (error) {
        updateTestStatus('db-connection', 'error', `Connection failed: ${error.message}`);
      } else {
        updateTestStatus('db-connection', 'success', `Connected successfully (${duration}ms)`);
      }
    } catch (error) {
      updateTestStatus('db-connection', 'error', 'Connection test failed');
    }
  };

  const testPublicTables = async () => {
    updateTestStatus('public-tables', 'running');
    
    try {
      // Test multiple public tables
      const tables = ['challenge_library', 'boost_library', 'contests', 'quest_library'];
      const results = [];
      
      for (const table of tables) {
        try {
          const { data, error } = await supabase
            .from(table)
            .select('count')
            .limit(1);
          
          if (error) {
            results.push(`${table}: ERROR`);
          } else {
            results.push(`${table}: OK`);
          }
        } catch (err) {
          results.push(`${table}: FAILED`);
        }
      }
      
      const successCount = results.filter(r => r.includes('OK')).length;
      updateTestStatus('public-tables', 'success', `${successCount}/${tables.length} tables accessible`);
      
    } catch (error) {
      updateTestStatus('public-tables', 'error', 'Public table test failed');
    }
  };

  const testChallengeLibrary = async () => {
    updateTestStatus('challenge-library', 'running');
    
    try {
      const { data, error } = await supabase
        .from('challenge_library')
        .select('*')
        .eq('is_active', true)
        .limit(5);
      
      if (error) {
        updateTestStatus('challenge-library', 'error', error.message);
      } else {
        updateTestStatus('challenge-library', 'success', `Found ${data?.length || 0} active challenges`);
      }
    } catch (error) {
      updateTestStatus('challenge-library', 'error', 'Challenge library test failed');
    }
  };

  const testBoostLibrary = async () => {
    updateTestStatus('boost-library', 'running');
    
    try {
      const { data, error } = await supabase
        .from('boost_library')
        .select('*')
        .eq('is_active', true)
        .limit(5);
      
      if (error) {
        updateTestStatus('boost-library', 'error', error.message);
      } else {
        updateTestStatus('boost-library', 'success', `Found ${data?.length || 0} active boosts`);
      }
    } catch (error) {
      updateTestStatus('boost-library', 'error', 'Boost library test failed');
    }
  };

  const testContestLibrary = async () => {
    updateTestStatus('contest-library', 'running');
    
    try {
      const { data, error } = await supabase
        .from('contests')
        .select('*')
        .limit(5);
      
      if (error) {
        updateTestStatus('contest-library', 'error', error.message);
      } else {
        updateTestStatus('contest-library', 'success', `Found ${data?.length || 0} contests`);
      }
    } catch (error) {
      updateTestStatus('contest-library', 'error', 'Contest library test failed');
    }
  };

  const testLaunchCodes = async () => {
    updateTestStatus('launch-codes', 'running');
    
    try {
      const { data, error } = await supabase
        .rpc('validate_launch_code', { p_code: 'INVALID_TEST_CODE' });
      
      if (error) {
        updateTestStatus('launch-codes', 'error', error.message);
      } else if (data && !data.valid) {
        updateTestStatus('launch-codes', 'success', 'Launch code validation working');
      } else {
        updateTestStatus('launch-codes', 'error', 'Launch code validation not working properly');
      }
    } catch (error) {
      updateTestStatus('launch-codes', 'error', 'Launch code test failed');
    }
  };

  const testBoostCodes = async () => {
    updateTestStatus('boost-codes', 'running');
    
    try {
      const { data, error } = await supabase
        .from('boost_codes')
        .select('*')
        .eq('is_active', true)
        .limit(5);
      
      if (error) {
        updateTestStatus('boost-codes', 'error', error.message);
      } else {
        updateTestStatus('boost-codes', 'success', `Found ${data?.length || 0} active boost codes`);
      }
    } catch (error) {
      updateTestStatus('boost-codes', 'error', 'Boost codes test failed');
    }
  };

  const testAuthStatus = async () => {
    updateTestStatus('auth-status', 'running');
    
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        updateTestStatus('auth-status', 'error', error.message);
      } else if (user) {
        updateTestStatus('auth-status', 'success', `Authenticated as: ${user.email}`);
      } else {
        updateTestStatus('auth-status', 'success', 'Not authenticated (anonymous access)');
      }
    } catch (error) {
      updateTestStatus('auth-status', 'error', 'Auth status check failed');
    }
  };

  const getStatusIcon = (status: SimpleTest['status']) => {
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

  const getCategoryIcon = (category: SimpleTest['category']) => {
    switch (category) {
      case 'database':
        return <Database size={16} color="#3B82F6" />;
      case 'auth':
        return <Shield size={16} color="#8B5CF6" />;
      case 'rpc':
        return <Zap size={16} color="#F59E0B" />;
      case 'public':
        return <TestTube size={16} color="#10B981" />;
      default:
        return <TestTube size={16} color="#6B7280" />;
    }
  };

  const getStatusColor = (status: SimpleTest['status']) => {
    switch (status) {
      case 'success': return '#10B981';
      case 'error': return '#EF4444';
      case 'running': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const successCount = tests.filter(t => t.status === 'success').length;
  const errorCount = tests.filter(t => t.status === 'error').length;
  const runningCount = tests.filter(t => t.status === 'running').length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TestTube size={24} color="#10B981" />
        <Text style={styles.title}>Simple Test Runner</Text>
        <TouchableOpacity
          style={[styles.runButton, isRunning && styles.runButtonDisabled]}
          onPress={runAllTests}
          disabled={isRunning}
        >
          <Text style={styles.runButtonText}>
            {isRunning ? 'Running...' : 'Run All Tests'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.description}>
        Tests basic functionality without requiring authentication
      </Text>

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
          <Text style={styles.summaryText}>{runningCount} Running</Text>
        </View>
      </View>

      <ScrollView style={styles.testList} showsVerticalScrollIndicator={false}>
        {tests.map((test) => (
          <View key={test.id} style={styles.testCard}>
            <View style={styles.testHeader}>
              {getStatusIcon(test.status)}
              <View style={styles.testInfo}>
                <View style={styles.testTitleRow}>
                  <Text style={styles.testName}>{test.name}</Text>
                  <View style={styles.categoryBadge}>
                    {getCategoryIcon(test.category)}
                    <Text style={styles.categoryText}>{test.category}</Text>
                  </View>
                </View>
                <Text style={styles.testDescription}>{test.description}</Text>
              </View>
            </View>
            {test.result && (
              <Text style={[styles.testResult, { color: getStatusColor(test.status) }]}>
                {test.result}
              </Text>
            )}
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
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F8FAFC',
    flex: 1,
    marginLeft: 8,
  },
  runButton: {
    backgroundColor: '#10B981',
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
  description: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 16,
    fontStyle: 'italic',
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
    alignItems: 'flex-start',
  },
  testInfo: {
    flex: 1,
    marginLeft: 12,
  },
  testTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  testName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F8FAFC',
    flex: 1,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#475569',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    marginLeft: 2,
    textTransform: 'uppercase',
  },
  testDescription: {
    fontSize: 12,
    color: '#94A3B8',
  },
  testResult: {
    fontSize: 12,
    marginTop: 8,
    marginLeft: 32,
  },
});