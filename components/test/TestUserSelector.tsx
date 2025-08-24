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
import { supabase } from '@/lib/supabase/client';
import { signOut, useAuth } from '@/lib/supabase/auth';

interface DatabaseUser {
  id: string;
  email: string;
  user_name: string;
  is_admin: boolean;
}

interface TestUserSelectorProps {
  onUserChange?: (user: DatabaseUser | null) => void;
}

export default function TestUserSelector({ onUserChange }: TestUserSelectorProps) {
  const [loading, setLoading] = useState(false);
  const [databaseUsers, setDatabaseUsers] = useState<DatabaseUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<DatabaseUser | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const { user } = useAuth();

  // Load users from database on component mount
  React.useEffect(() => {
    loadDatabaseUsers();
  }, []);

  const loadDatabaseUsers = async () => {
    setLoadingUsers(true);
    try {
      // First try to get all users (may be restricted by RLS)
      const { data: users, error } = await supabase
        .from('users')
        .select('id, email, user_name, is_admin')
        .eq('is_active', true)
        .limit(10);

      if (error) {
        console.log('RLS restricting user access, trying alternative approach...');
        
        // Try using RPC function to get users (bypasses RLS if function allows it)
        const { data: rpcUsers, error: rpcError } = await supabase
          .rpc('get_test_users');
        
        if (rpcError || !rpcUsers) {
          console.log('RPC approach failed, using current user only');
          // Fallback: show only current user
          if (user) {
            const { data: currentUser, error: currentUserError } = await supabase
              .from('users')
              .select('id, email, user_name, is_admin')
              .eq('id', user.id)
              .single();
            
            if (currentUser && !currentUserError) {
              setDatabaseUsers([currentUser]);
            }
          }
        } else {
          setDatabaseUsers(rpcUsers);
        }
      } else {
        setDatabaseUsers(users || []);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      // Don't show alert, just log the error and show current user
      if (user) {
        const { data: currentUser, error: currentUserError } = await supabase
          .from('users')
          .select('id, email, user_name, is_admin')
          .eq('id', user.id)
          .single();
        
        if (currentUser && !currentUserError) {
          setDatabaseUsers([currentUser]);
        }
      }
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleUserSelect = (dbUser: DatabaseUser) => {
    if (user?.id === dbUser.id) {
      // User is already logged in as this user
      setSelectedUser(dbUser);
      onUserChange?.(dbUser);
      return;
    }
    
    Alert.alert(
      'Switch User',
      `To test as ${dbUser.user_name}, you need to log out and log in with their credentials. This selector shows available users but cannot automatically switch authentication.`,
      [
        { text: 'OK', style: 'default' }
      ]
    );
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

  // Update selected user when auth user changes
  React.useEffect(() => {
    const currentDbUser = databaseUsers.find(dbUser => dbUser.id === user?.id);
    setSelectedUser(currentDbUser || null);
  }, [user, databaseUsers]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Database Users</Text>
        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={loadDatabaseUsers}
          disabled={loadingUsers}
        >
          <Text style={styles.refreshText}>
            {loadingUsers ? 'Loading...' : 'Refresh'}
          </Text>
        </TouchableOpacity>
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
              Current: {selectedUser?.user_name || 'Unknown User'}
            </Text>
            <Text style={styles.currentUserEmail}>{user.email}</Text>
          </View>
          {selectedUser?.is_admin && (
            <Shield size={16} color="#F59E0B" />
          )}
        </View>
      )}

      {loadingUsers && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#FF6B35" />
          <Text style={styles.loadingText}>Loading users...</Text>
        </View>
      )}

      <ScrollView style={styles.userList} showsVerticalScrollIndicator={false}>
        {databaseUsers.map((dbUser) => (
          <TouchableOpacity
            key={dbUser.id}
            style={[
              styles.userCard,
              selectedUser?.id === dbUser.id && styles.selectedUserCard,
              user?.id === dbUser.id && styles.activeUserCard,
            ]}
            onPress={() => handleUserSelect(dbUser)}
            disabled={loading}
          >
            <View style={styles.userIcon}>
              {dbUser.is_admin ? (
                <Shield size={20} color="#F59E0B" />
              ) : (
                <User size={20} color="#3B82F6" />
              )}
            </View>
            
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{dbUser.user_name}</Text>
              <Text style={styles.userEmail}>{dbUser.email}</Text>
              <Text style={styles.userRole}>{dbUser.is_admin ? 'ADMIN' : 'USER'}</Text>
            </View>

            <View style={styles.userActions}>
              {user?.id === dbUser.id ? (
                <View style={styles.activeBadge}>
                  <Text style={styles.activeText}>ACTIVE</Text>
                </View>
              ) : (
                <View style={styles.selectIcon}>
                  <Text style={styles.selectText}>VIEW</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {databaseUsers.length === 0 && !loadingUsers && (
        <Text style={styles.noUsersText}>
          No users found. Make sure you have users in your database.
        </Text>
      )}

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
  refreshButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  refreshText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
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
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  loadingText: {
    color: '#94A3B8',
    marginLeft: 8,
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
  selectIcon: {
    backgroundColor: '#475569',
    paddingHorizontal: 8,
    padding: 4,
    borderRadius: 12,
  },
  selectText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '600',
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
  noUsersText: {
    color: '#94A3B8',
    textAlign: 'center',
    padding: 20,
    fontStyle: 'italic',
  },
});