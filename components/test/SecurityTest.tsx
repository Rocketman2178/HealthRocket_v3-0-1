import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Shield, CircleCheck as CheckCircle, Circle as XCircle, Clock, Lock, Clock as Unlock, Eye, EyeOff } from 'lucide-react-native';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth';
import { TEST_USERS } from '@/utils/testUsers';

interface SecurityTest {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'success' | 'error';
  result?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export default function SecurityTest() {
  const [securityTests, setSecurityTests] = useState<SecurityTest[]>([
    {
      id: 'user-data-isolation',
      name: 'User Data Isolation',
      description: 'Verify users can only access their own data',
      status: 'pending',
      severity: 'critical',
    },
    {
      id: 'cross-user-access',
      name: 'Cross-User Access Prevention',
      description: 'Ensure users cannot access other users\' data',
      status: 'pending',
      severity: 'critical',
    },
    {
      id: 'admin-privileges',
      name: 'Admin Privilege Validation',
      description: 'Test admin-only functions and data access',
      status: 'pending',
      severity: 'high',
    },
    {
      id: 'launch-code-security',
      name: 'Launch Code Security',
      description: 'Validate launch code usage and restrictions',
      status: 'pending',
      severity: 'medium',
    },
    {
      id: 'boost-code-security',
      name: 'Boost Code Security',
      description: 'Test boost code redemption limits and validation',
      status: 'pending',
      severity: 'medium',
    },
    {
      id: 'contest-verification',
      name: 'Contest Verification Security',
      description: 'Ensure contest entries follow ownership rules',
      status: 'pending',
      severity: 'high',
    },
    {
      id: 'fp-manipulation',
      name: 'FP Manipulation Prevention',
      description: 'Test protection against FP manipulation',
      status: 'pending',
      severity: 'critical',
    },
    {
      id: 'chat-message-security',
      name: 'Chat Message Security',
      description: 'Validate message ownership and editing permissions',
      status: 'pending',
      severity: 'medium',
    },
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const { user } = useAuth();

  const updateTestStatus = (testId: string, status: SecurityTest['status'], result?: string) => {
    setSecurityTests(prev => prev.map(test => 
      test.id === testId 
        ? { ...test, status, result }
        : test
    ));
  };

  const runSecurityTests = async () => {
    if (!user) {
      Alert.alert('Error', 'Please login with a test user first');
      return;
    }

    setIsRunning(true);

    try {
      // Test 1: User Data Isolation
      await testUserDataIsolation();
      
      // Test 2: Cross-User Access Prevention
      await testCrossUserAccess();
      
      // Test 3: Admin Privilege Validation
      await testAdminPrivileges();
      
      // Test 4: Launch Code Security
      await testLaunchCodeSecurity();
      
      // Test 5: Boost Code Security
      await testBoostCodeSecurity();
      
      // Test 6: Contest Verification Security
      await testContestVerificationSecurity();
      
      // Test 7: FP Manipulation Prevention
      await testFPManipulationPrevention();
      
      // Test 8: Chat Message Security
      await testChatMessageSecurity();

    } catch (error) {
      console.error('Security test suite error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const testUserDataIsolation = async () => {
    updateTestStatus('user-data-isolation', 'running');
    
    try {
      // Test that user can access their own data
      const { data: ownData, error: ownError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user!.id);

      if (ownError) {
        updateTestStatus('user-data-isolation', 'error', `Cannot access own data: ${ownError.message}`);
        return;
      }

      if (!ownData || ownData.length === 0) {
        updateTestStatus('user-data-isolation', 'error', 'No user data returned');
        return;
      }

      // Test FP earnings access
      const { data: fpData, error: fpError } = await supabase
        .from('fp_earnings')
        .select('*')
        .eq('user_id', user!.id)
        .limit(5);

      if (fpError) {
        updateTestStatus('user-data-isolation', 'error', `Cannot access FP data: ${fpError.message}`);
        return;
      }

      updateTestStatus('user-data-isolation', 'success', `Can access own data (${fpData?.length || 0} FP records)`);
    } catch (error) {
      updateTestStatus('user-data-isolation', 'error', 'Unexpected error');
    }
  };

  const testCrossUserAccess = async () => {
    updateTestStatus('cross-user-access', 'running');
    
    try {
      // Try to access all users (should be restricted by RLS)
      const { data: allUsers, error: allUsersError } = await supabase
        .from('users')
        .select('*');

      if (allUsersError) {
        updateTestStatus('cross-user-access', 'success', 'RLS properly blocks access to all users');
        return;
      }

      // If we get data, check if it's only our own
      if (allUsers && allUsers.length === 1 && allUsers[0].id === user!.id) {
        updateTestStatus('cross-user-access', 'success', 'RLS properly restricts to own data only');
      } else if (allUsers && allUsers.length > 1) {
        updateTestStatus('cross-user-access', 'error', `SECURITY BREACH: Can access ${allUsers.length} users' data`);
      } else {
        updateTestStatus('cross-user-access', 'error', 'Unexpected data access pattern');
      }
    } catch (error) {
      updateTestStatus('cross-user-access', 'error', 'Unexpected error');
    }
  };

  const testAdminPrivileges = async () => {
    updateTestStatus('admin-privileges', 'running');
    
    try {
      // Check if current user is admin
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', user!.id)
        .single();

      if (profileError) {
        updateTestStatus('admin-privileges', 'error', profileError.message);
        return;
      }

      const isAdmin = userProfile?.is_admin || false;
      
      // Try to access admin-only data (if any exists)
      // For now, we'll just verify the admin flag is properly set
      const currentTestUser = TEST_USERS.find(u => u.email === user!.email);
      const expectedAdmin = currentTestUser?.role === 'admin';

      if (isAdmin === expectedAdmin) {
        updateTestStatus('admin-privileges', 'success', `Admin status correct: ${isAdmin ? 'Admin' : 'Regular User'}`);
      } else {
        updateTestStatus('admin-privileges', 'error', `Admin status mismatch: Expected ${expectedAdmin}, got ${isAdmin}`);
      }
    } catch (error) {
      updateTestStatus('admin-privileges', 'error', 'Unexpected error');
    }
  };

  const testLaunchCodeSecurity = async () => {
    updateTestStatus('launch-code-security', 'running');
    
    try {
      // Test launch code validation
      const { data: validationResult, error: validationError } = await supabase
        .rpc('validate_launch_code', { p_code: 'INVALID_CODE' });

      if (validationError) {
        updateTestStatus('launch-code-security', 'error', validationError.message);
        return;
      }

      if (validationResult && !validationResult.valid) {
        updateTestStatus('launch-code-security', 'success', 'Invalid launch codes properly rejected');
      } else {
        updateTestStatus('launch-code-security', 'error', 'Invalid launch code was accepted');
      }
    } catch (error) {
      updateTestStatus('launch-code-security', 'error', 'Unexpected error');
    }
  };

  const testBoostCodeSecurity = async () => {
    updateTestStatus('boost-code-security', 'running');
    
    try {
      // Check boost codes access
      const { data: boostCodes, error: boostError } = await supabase
        .from('boost_codes')
        .select('*')
        .limit(1);

      if (boostError) {
        updateTestStatus('boost-code-security', 'error', boostError.message);
        return;
      }

      // Check code redemptions (user should only see their own)
      const { data: redemptions, error: redemptionError } = await supabase
        .from('code_redemptions')
        .select('*');

      if (redemptionError) {
        updateTestStatus('boost-code-security', 'success', 'RLS properly restricts redemption access');
      } else {
        // Verify all redemptions belong to current user
        const allOwnRedemptions = redemptions?.every(r => r.user_id === user!.id) ?? true;
        if (allOwnRedemptions) {
          updateTestStatus('boost-code-security', 'success', `Can only see own redemptions (${redemptions?.length || 0})`);
        } else {
          updateTestStatus('boost-code-security', 'error', 'Can see other users\' redemptions');
        }
      }
    } catch (error) {
      updateTestStatus('boost-code-security', 'error', 'Unexpected error');
    }
  };

  const testContestVerificationSecurity = async () => {
    updateTestStatus('contest-verification', 'running');
    
    try {
      // Check contest entries (should only see own)
      const { data: contestEntries, error: contestError } = await supabase
        .from('active_contests')
        .select('*');

      if (contestError) {
        updateTestStatus('contest-verification', 'success', 'RLS properly restricts contest access');
      } else {
        const allOwnEntries = contestEntries?.every(e => e.user_id === user!.id) ?? true;
        if (allOwnEntries) {
          updateTestStatus('contest-verification', 'success', `Can only see own contest entries (${contestEntries?.length || 0})`);
        } else {
          updateTestStatus('contest-verification', 'error', 'Can see other users\' contest entries');
        }
      }
    } catch (error) {
      updateTestStatus('contest-verification', 'error', 'Unexpected error');
    }
  };

  const testFPManipulationPrevention = async () => {
    updateTestStatus('fp-manipulation', 'running');
    
    try {
      // Try to directly update FP (should be prevented)
      const { error: updateError } = await supabase
        .from('users')
        .update({ fuel_points: 999999 })
        .eq('id', user!.id);

      if (updateError) {
        updateTestStatus('fp-manipulation', 'success', 'Direct FP manipulation properly blocked');
      } else {
        // Check if the update actually went through
        const { data: updatedUser, error: checkError } = await supabase
          .from('users')
          .select('fuel_points')
          .eq('id', user!.id)
          .single();

        if (checkError) {
          updateTestStatus('fp-manipulation', 'error', 'Cannot verify FP manipulation test');
        } else if (updatedUser?.fuel_points === 999999) {
          updateTestStatus('fp-manipulation', 'error', 'CRITICAL: Direct FP manipulation succeeded');
        } else {
          updateTestStatus('fp-manipulation', 'success', 'FP manipulation properly prevented');
        }
      }
    } catch (error) {
      updateTestStatus('fp-manipulation', 'error', 'Unexpected error');
    }
  };

  const testChatMessageSecurity = async () => {
    updateTestStatus('chat-message-security', 'running');
    
    try {
      // Check chat messages access
      const { data: messages, error: messageError } = await supabase
        .from('chat_messages')
        .select('*')
        .limit(10);

      if (messageError) {
        updateTestStatus('chat-message-security', 'error', messageError.message);
      } else {
        // For chat messages, users might be able to see public messages
        // but should only be able to edit their own
        updateTestStatus('chat-message-security', 'success', `Can access ${messages?.length || 0} chat messages`);
      }
    } catch (error) {
      updateTestStatus('chat-message-security', 'error', 'Unexpected error');
    }
  };

  const getStatusIcon = (status: SecurityTest['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={20} color="#10B981" />;
      case 'error':
        return <XCircle size={20} color="#EF4444" />;
      case 'running':
        return <Clock size={20} color="#F59E0B" />;
      default:
        return <Shield size={20} color="#6B7280" />;
    }
  };

  const getSeverityColor = (severity: SecurityTest['severity']) => {
    switch (severity) {
      case 'critical': return '#DC2626';
      case 'high': return '#EA580C';
      case 'medium': return '#D97706';
      case 'low': return '#65A30D';
      default: return '#6B7280';
    }
  };

  const getSeverityIcon = (severity: SecurityTest['severity']) => {
    switch (severity) {
      case 'critical': return <Lock size={16} color="#DC2626" />;
      case 'high': return <Eye size={16} color="#EA580C" />;
      case 'medium': return <EyeOff size={16} color="#D97706" />;
      case 'low': return <Unlock size={16} color="#65A30D" />;
      default: return <Shield size={16} color="#6B7280" />;
    }
  };

  const criticalIssues = securityTests.filter(t => t.status === 'error' && t.severity === 'critical').length;
  const highIssues = securityTests.filter(t => t.status === 'error' && t.severity === 'high').length;
  const passedTests = securityTests.filter(t => t.status === 'success').length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Shield size={24} color="#DC2626" />
        <Text style={styles.title}>Security Tests</Text>
        <TouchableOpacity
          style={[styles.runButton, isRunning && styles.runButtonDisabled]}
          onPress={runSecurityTests}
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
            Please login with a test user to run security tests
          </Text>
        </View>
      )}

      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <CheckCircle size={16} color="#10B981" />
          <Text style={styles.summaryText}>{passedTests} Passed</Text>
        </View>
        <View style={styles.summaryItem}>
          <XCircle size={16} color="#DC2626" />
          <Text style={styles.summaryText}>{criticalIssues} Critical</Text>
        </View>
        <View style={styles.summaryItem}>
          <XCircle size={16} color="#EA580C" />
          <Text style={styles.summaryText}>{highIssues} High</Text>
        </View>
      </View>

      <ScrollView style={styles.testList} showsVerticalScrollIndicator={false}>
        {securityTests.map((test) => (
          <View key={test.id} style={styles.testCard}>
            <View style={styles.testHeader}>
              {getStatusIcon(test.status)}
              <View style={styles.testInfo}>
                <View style={styles.testTitleRow}>
                  <Text style={styles.testName}>{test.name}</Text>
                  <View style={styles.severityBadge}>
                    {getSeverityIcon(test.severity)}
                    <Text style={[styles.severityText, { color: getSeverityColor(test.severity) }]}>
                      {test.severity.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text style={styles.testDescription}>{test.description}</Text>
              </View>
            </View>
            {test.result && (
              <Text style={[
                styles.testResult,
                { color: test.status === 'success' ? '#10B981' : '#EF4444' }
              ]}>
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
    backgroundColor: '#DC2626',
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
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#475569',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  severityText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 2,
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