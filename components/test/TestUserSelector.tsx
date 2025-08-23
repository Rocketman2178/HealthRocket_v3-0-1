import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { User, LogIn, LogOut, Shield, Users } from 'lucide-react-native';
import { TEST_USERS, TestUser } from '@/utils/testUsers';
import { signIn, signOut, useAuth } from '@/lib/supabase/auth';

interface TestUserSelectorProps {
  onUserChange?: (user: TestUser | null) => void;
}

export default function TestUserSelector({ onUserChange }: TestUserSelectorProps) {
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<TestUser | null>(null);
  const { user } = useAuth();

  const handleLogin = async (testUser: TestUser) => {
    setLoading(true);
    try {
      const result = await signIn(testUser.email, testUser.password);
      if (result.success) {
        setSelectedUser(testUser);
        onUserChange?.(testUser);
        Alert.alert('Success', `Logged in as ${testUser.name}`);
      } else {
        Alert.alert('Login Failed', result.error || 'Unknown error');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      const result = await signOut();
      if (result.success) {
        setSelectedUser(null);
        onUserChange?.(null);
        Alert.alert('Success', 'Logged out successfully');
      } else {
        Alert.alert('Logout Failed', result.error || 'Unknown error');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to logout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Test User Selector</Text>
        {user && (
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={16} color="#FFFFFF" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        )}
      </View>

      {user && (
        <View style={styles.currentUserCard}>
          <User size={20} color="#4ADE80" />
          <View style={styles.currentUserInfo}>
            <Text style={styles.currentUserName}>
              Current: {selectedUser?.name || 'Unknown User'}
            </Text>
            <Text style={styles.currentUserEmail}>{user.email}</Text>
          </View>
          {selectedUser?.role === 'admin' && (
            <Shield size={16} color="#F59E0B" />
          )}
        </View>
      )}

      <ScrollView style={styles.userList} showsVerticalScrollIndicator={false}>
        {TEST_USERS.map((testUser) => (
          <TouchableOpacity
            key={testUser.email}
            style={[
              styles.userCard,
              selectedUser?.email === testUser.email && styles.selectedUserCard,
              user?.email === testUser.email && styles.activeUserCard,
            ]}
            onPress={() => handleLogin(testUser)}
            disabled={loading || user?.email === testUser.email}
          >
            <View style={styles.userIcon}>
              {testUser.role === 'admin' ? (
                <Shield size={20} color="#F59E0B" />
              ) : (
                <User size={20} color="#3B82F6" />
              )}
            </View>
            
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{testUser.name}</Text>
              <Text style={styles.userEmail}>{testUser.email}</Text>
              <Text style={styles.userRole}>{testUser.role.toUpperCase()}</Text>
            </View>

            <View style={styles.userActions}>
              {user?.email === testUser.email ? (
                <View style={styles.activeBadge}>
                  <Text style={styles.activeText}>ACTIVE</Text>
                </View>
              ) : (
                <View style={styles.loginIcon}>
                  <LogIn size={16} color="#94A3B8" />
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Authenticating...</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  currentUserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F2A1A',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#4ADE80',
  },
  currentUserInfo: {
    flex: 1,
    marginLeft: 12,
  },
  currentUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4ADE80',
  },
  currentUserEmail: {
    fontSize: 12,
    color: '#4ADE80',
    opacity: 0.8,
  },
  userList: {
    maxHeight: 300,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#334155',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#475569',
  },
  selectedUserCard: {
    borderColor: '#FF6B35',
    backgroundColor: '#2D1B13',
  },
  activeUserCard: {
    borderColor: '#4ADE80',
    backgroundColor: '#0F2A1A',
  },
  userIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#475569',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
  },
  userActions: {
    alignItems: 'center',
  },
  activeBadge: {
    backgroundColor: '#4ADE80',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  loginIcon: {
    padding: 4,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  loadingText: {
    color: '#F8FAFC',
    fontSize: 14,
    marginTop: 8,
  },
});