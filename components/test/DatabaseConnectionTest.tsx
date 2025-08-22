import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator
} from 'react-native'
import { supabase } from '../../lib/supabase/client'
import { signUp, signIn, getCurrentUser } from '../../lib/supabase/auth'

interface TestResult {
  test: string
  status: 'pending' | 'success' | 'error'
  message: string
  details?: any
}

export function DatabaseConnectionTest() {
  const [results, setResults] = useState<TestResult[]>([])
  const [testing, setTesting] = useState(false)

  const addResult = (result: TestResult) => {
    setResults(prev => [...prev, result])
  }

  const clearResults = () => {
    setResults([])
  }

  const runAllTests = async () => {
    setTesting(true)
    clearResults()

    // Test 1: Basic Database Connection
    addResult({ test: 'Database Connection', status: 'pending', message: 'Testing basic connectivity...' })
    try {
      const { data, error } = await supabase.from('challenge_library').select('count', { count: 'exact' })
      if (error) throw error
      
      addResult({
        test: 'Database Connection',
        status: 'success',
        message: `✅ Database connected successfully! Schema accessible.`,
        details: { challenges_found: data?.length || 0 }
      })
    } catch (error: any) {
      addResult({
        test: 'Database Connection',
        status: 'error',
        message: `❌ Connection failed: ${error.message}`,
        details: error
      })
    }

    // Test 2: RPC Functions (Launch Code Validation)
    addResult({ test: 'RPC Functions', status: 'pending', message: 'Testing launch code validation...' })
    try {
      const { data, error } = await supabase.rpc('validate_launch_code', {
        p_code: 'V3BETA'
      })
      
      if (error) throw error
      
      addResult({
        test: 'RPC Functions',
        status: 'success',
        message: `✅ RPC functions working! Launch code ${data?.valid ? 'valid' : 'invalid'}`,
        details: data
      })
    } catch (error: any) {
      addResult({
        test: 'RPC Functions',
        status: 'error',
        message: `❌ RPC failed: ${error.message}`,
        details: error
      })
    }

    // Test 3: Authentication Flow with Launch Code
    addResult({ test: 'Authentication', status: 'pending', message: 'Testing user registration...' })
    try {
      const testEmail = `test+${Date.now()}@healthrocket.app`
      const testPassword = 'TestPassword123!'
      
      const signupResult = await signUp(testEmail, testPassword, 'Test User', 'V3BETA')
      
      if (signupResult.success) {
        addResult({
          test: 'Authentication',
          status: 'success',
          message: `✅ Authentication working! User created: ${testEmail}`,
          details: signupResult.data
        })
      } else {
        throw new Error(signupResult.error)
      }
    } catch (error: any) {
      addResult({
        test: 'Authentication',
        status: 'error',
        message: `❌ Authentication failed: ${error.message}`,
        details: error
      })
    }

    // Test 4: Fuel Points System
    addResult({ test: 'Fuel Points System', status: 'pending', message: 'Testing FP earning...' })
    try {
      // Get current user
      const { user } = await getCurrentUser()
      if (!user) throw new Error('No authenticated user found')

      // Try to earn fuel points
      const { data, error } = await supabase.rpc('earn_fuel_points', {
        p_user_id: user.id,
        p_source: 'daily_boost',
        p_amount: 5,
        p_source_id: 'test_boost',
        p_metadata: { test: true, timestamp: new Date().toISOString() }
      })

      if (error) throw error

      addResult({
        test: 'Fuel Points System',
        status: 'success',
        message: `✅ FP System working! Earned 5 FP. New total: ${data?.new_total || 'N/A'}`,
        details: data
      })
    } catch (error: any) {
      addResult({
        test: 'Fuel Points System',
        status: 'error',
        message: `❌ FP System failed: ${error.message}`,
        details: error
      })
    }

    // Test 5: User Dashboard Data
    addResult({ test: 'Dashboard Data', status: 'pending', message: 'Testing dashboard function...' })
    try {
      const { user } = await getCurrentUser()
      if (!user) throw new Error('No authenticated user found')

      const { data, error } = await supabase.rpc('get_user_dashboard', {
        p_user_id: user.id
      })

      if (error) throw error

      addResult({
        test: 'Dashboard Data',
        status: 'success',
        message: `✅ Dashboard data loaded! Level: ${data?.user?.level || 'N/A'}`,
        details: data
      })
    } catch (error: any) {
      addResult({
        test: 'Dashboard Data',
        status: 'error',
        message: `❌ Dashboard failed: ${error.message}`,
        details: error
      })
    }

    // Test 6: Real-time Subscriptions
    addResult({ test: 'Real-time Features', status: 'pending', message: 'Testing subscriptions...' })
    try {
      const channel = supabase.channel('test-channel')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'fp_earnings'
        }, (payload) => {
          console.log('Real-time update received:', payload)
        })
        .subscribe()

      // Wait a moment for subscription
      await new Promise(resolve => setTimeout(resolve, 1000))

      if (channel.state === 'SUBSCRIBED') {
        addResult({
          test: 'Real-time Features',
          status: 'success',
          message: `✅ Real-time subscriptions working! Channel state: ${channel.state}`,
          details: { channel_state: channel.state }
        })
        
        // Clean up
        supabase.removeChannel(channel)
      } else {
        throw new Error(`Subscription failed. Channel state: ${channel.state}`)
      }
    } catch (error: any) {
      addResult({
        test: 'Real-time Features',
        status: 'error',
        message: `❌ Real-time failed: ${error.message}`,
        details: error
      })
    }

    setTesting(false)
  }

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return '#10B981'
      case 'error': return '#EF4444'
      case 'pending': return '#F59E0B'
      default: return '#6B7280'
    }
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return '✅'
      case 'error': return '❌'
      case 'pending': return '⏳'
      default: return '⚪'
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🧪 Health Rocket V3 Database Tests</Text>
      <Text style={styles.subtitle}>
        Complete integration testing for mobile-first architecture
      </Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#FF6B35' }]}
          onPress={runAllTests}
          disabled={testing}
        >
          {testing ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.buttonText}>🚀 Run All Tests</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#6B7280' }]}
          onPress={clearResults}
          disabled={testing}
        >
          <Text style={styles.buttonText}>🗑️ Clear Results</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.resultsContainer}>
        {results.map((result, index) => (
          <View
            key={index}
            style={[
              styles.resultCard,
              { borderLeftColor: getStatusColor(result.status) }
            ]}
          >
            <View style={styles.resultHeader}>
              <Text style={styles.testName}>
                {getStatusIcon(result.status)} {result.test}
              </Text>
              {result.status === 'pending' && (
                <ActivityIndicator size="small" color="#F59E0B" />
              )}
            </View>
            
            <Text style={[styles.message, { color: getStatusColor(result.status) }]}>
              {result.message}
            </Text>
            
            {result.details && (
              <View style={styles.detailsContainer}>
                <Text style={styles.detailsLabel}>Details:</Text>
                <Text style={styles.details}>
                  {JSON.stringify(result.details, null, 2)}
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>

      {results.length === 0 && (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResults}>
            🎯 Ready to test your Health Rocket V3 integration!
          </Text>
          <Text style={styles.noResultsSubtext}>
            Click "Run All Tests" to verify database connection, authentication, FP system, and real-time features.
          </Text>
        </View>
      )}

      {results.length > 0 && (
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Test Summary</Text>
          <View style={styles.summaryStats}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryCount, { color: '#10B981' }]}>
                {results.filter(r => r.status === 'success').length}
              </Text>
              <Text style={styles.summaryLabel}>Passed</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryCount, { color: '#EF4444' }]}>
                {results.filter(r => r.status === 'error').length}
              </Text>
              <Text style={styles.summaryLabel}>Failed</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryCount, { color: '#F59E0B' }]}>
                {results.filter(r => r.status === 'pending').length}
              </Text>
              <Text style={styles.summaryLabel}>Pending</Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    marginBottom: 24,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resultsContainer: {
    gap: 16,
  },
  resultCard: {
    backgroundColor: '#1E293B',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  testName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  detailsContainer: {
    marginTop: 8,
  },
  detailsLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  details: {
    color: '#94A3B8',
    fontSize: 11,
    fontFamily: 'monospace',
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 8,
    lineHeight: 16,
  },
  noResultsContainer: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 20,
  },
  noResults: {
    color: 'white',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  noResultsSubtext: {
    color: '#94A3B8',
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
  },
  summaryContainer: {
    marginTop: 32,
    backgroundColor: '#1E293B',
    padding: 20,
    borderRadius: 12,
  },
  summaryTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryCount: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  summaryLabel: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 4,
  },
})