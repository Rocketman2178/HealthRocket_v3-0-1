import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LogIn, User } from 'lucide-react-native';
import { signIn, signUp } from '@/lib/supabase/auth';

interface QuickLoginFormProps {
  onLoginSuccess?: () => void;
}

export default function QuickLoginForm({ onLoginSuccess }: QuickLoginFormProps) {
  const [email, setEmail] = useState('testuser@healthrocket.app');
  const [password, setPassword] = useState('TestUser123!');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      let result;
      if (isSignUp) {
        const userName = email.split('@')[0]; // Use email prefix as username
        result = await signUp(email, password, userName);
      } else {
        result = await signIn(email, password);
      }

      if (result.success) {
        Alert.alert('Success', `${isSignUp ? 'Account created' : 'Logged in'} successfully!`);
        setEmail('');
        setPassword('');
        onLoginSuccess?.();
      } else {
        Alert.alert('Error', result.error || 'Authentication failed');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <User size={20} color="#3B82F6" />
        <Text style={styles.title}>Quick Login</Text>
      </View>
      
      <Text style={styles.description}>
        {isSignUp ? 'Create an account to run authenticated tests' : 'Login to run authenticated tests'}
      </Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          placeholderTextColor="#9CA3AF"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          placeholderTextColor="#9CA3AF"
        />

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <LogIn size={16} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>
                {isSignUp ? 'Sign Up' : 'Sign In'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setIsSignUp(!isSignUp)}
        >
          <Text style={styles.toggleButtonText}>
            {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
          </Text>
        </TouchableOpacity>
      </View>
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
    marginLeft: 8,
  },
  description: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  form: {
    gap: 12,
  },
  input: {
    backgroundColor: '#334155',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#475569',
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#64748B',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  toggleButton: {
    alignItems: 'center',
    padding: 8,
  },
  toggleButtonText: {
    color: '#94A3B8',
    fontSize: 14,
  },
});