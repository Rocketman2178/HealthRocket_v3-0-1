import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, User, MapPin, Bell, Clock } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import AuthInput from '../../components/forms/AuthInput';
import AuthButton from '../../components/forms/AuthButton';

interface ProfileSetupScreenProps {
  user: any;
  onComplete: () => void;
  onSkip: () => void;
}

interface HealthGoal {
  id: string;
  title: string;
  icon: string;
  selected: boolean;
}

export default function ProfileSetupScreen({ user, onComplete, onSkip }: ProfileSetupScreenProps) {
  const [userName, setUserName] = useState(user?.user_metadata?.user_name || '');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [timezone, setTimezone] = useState('UTC');
  const [loading, setLoading] = useState(false);
  
  const [healthGoals, setHealthGoals] = useState<HealthGoal[]>([
    { id: 'weight-loss', title: 'Weight Loss', icon: '⚖️', selected: false },
    { id: 'muscle-gain', title: 'Muscle Gain', icon: '💪', selected: false },
    { id: 'endurance', title: 'Endurance', icon: '🏃', selected: false },
    { id: 'flexibility', title: 'Flexibility', icon: '🧘', selected: false },
    { id: 'nutrition', title: 'Better Nutrition', icon: '🥗', selected: false },
    { id: 'sleep', title: 'Better Sleep', icon: '😴', selected: false },
    { id: 'stress', title: 'Stress Management', icon: '🧠', selected: false },
    { id: 'energy', title: 'More Energy', icon: '⚡', selected: false },
  ]);

  const [notifications, setNotifications] = useState({
    push: true,
    email: false,
    challenges: true,
    achievements: true,
    contests: true,
  });

  React.useEffect(() => {
    // Get device timezone
    const deviceTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimezone(deviceTimezone);
  }, []);

  const handlePhotoUpload = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photo library to upload a profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfilePhoto(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload photo. Please try again.');
    }
  };

  const toggleHealthGoal = (goalId: string) => {
    setHealthGoals(prev => prev.map(goal => 
      goal.id === goalId 
        ? { ...goal, selected: !goal.selected }
        : goal
    ));
  };

  const handleComplete = async () => {
    if (!userName.trim()) {
      Alert.alert('Name Required', 'Please enter your name to continue.');
      return;
    }

    setLoading(true);
    try {
      const selectedGoals = healthGoals.filter(goal => goal.selected).map(goal => goal.id);
      
      // Update user profile in database
      const { error } = await supabase
        .from('users')
        .update({
          user_name: userName.trim(),
          timezone: timezone,
          notification_preferences: notifications,
          onboarding_step: 'health_assessment',
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      // Create user profile with additional details
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          health_goals: selectedGoals,
          profile_visibility: 'community',
          show_real_name: false,
          show_location: false,
        });

      if (profileError) {
        console.warn('Profile creation warning:', profileError);
      }

      onComplete();
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedGoalsCount = healthGoals.filter(goal => goal.selected).length;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0F172A', '#1E293B']}
        style={styles.gradient}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Complete Your Profile</Text>
            <Text style={styles.headerSubtitle}>
              Help us personalize your Health Rocket experience
            </Text>
          </View>

          {/* Profile Photo */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Profile Photo</Text>
            <TouchableOpacity style={styles.photoUpload} onPress={handlePhotoUpload}>
              {profilePhoto ? (
                <Image source={{ uri: profilePhoto }} style={styles.profileImage} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Camera size={32} color="#94A3B8" />
                  <Text style={styles.photoPlaceholderText}>Add Photo</Text>
                </View>
              )}
            </TouchableOpacity>
            <Text style={styles.sectionNote}>Optional - you can add this later</Text>
          </View>

          {/* Name */}
          <View style={styles.section}>
            <AuthInput
              label="Display Name"
              value={userName}
              onChangeText={setUserName}
              placeholder="How should we call you?"
              autoCapitalize="words"
            />
            <Text style={styles.sectionNote}>
              This is how you'll appear to other Health Rocket members
            </Text>
          </View>

          {/* Health Goals */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Health Goals {selectedGoalsCount > 0 && `(${selectedGoalsCount} selected)`}
            </Text>
            <Text style={styles.sectionDescription}>
              Select your primary health and fitness goals to get personalized recommendations
            </Text>
            <View style={styles.goalsGrid}>
              {healthGoals.map((goal) => (
                <TouchableOpacity
                  key={goal.id}
                  style={[styles.goalCard, goal.selected && styles.goalCardSelected]}
                  onPress={() => toggleHealthGoal(goal.id)}
                >
                  <Text style={styles.goalIcon}>{goal.icon}</Text>
                  <Text style={[styles.goalTitle, goal.selected && styles.goalTitleSelected]}>
                    {goal.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Timezone */}
          <View style={styles.section}>
            <View style={styles.timezoneCard}>
              <Clock size={20} color="#3B82F6" />
              <View style={styles.timezoneInfo}>
                <Text style={styles.timezoneTitle}>Timezone</Text>
                <Text style={styles.timezoneValue}>{timezone}</Text>
              </View>
            </View>
            <Text style={styles.sectionNote}>
              Automatically detected from your device
            </Text>
          </View>

          {/* Notification Preferences */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notifications</Text>
            <Text style={styles.sectionDescription}>
              Choose how you'd like to stay updated on your progress
            </Text>
            
            <View style={styles.notificationsList}>
              <View style={styles.notificationItem}>
                <Bell size={20} color="#FF6B35" />
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationTitle}>Push Notifications</Text>
                  <Text style={styles.notificationDescription}>
                    Daily reminders and achievement alerts
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.toggle, notifications.push && styles.toggleActive]}
                  onPress={() => setNotifications(prev => ({ ...prev, push: !prev.push }))}
                >
                  <View style={[styles.toggleThumb, notifications.push && styles.toggleThumbActive]} />
                </TouchableOpacity>
              </View>

              <View style={styles.notificationItem}>
                <Bell size={20} color="#3B82F6" />
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationTitle}>Challenge Updates</Text>
                  <Text style={styles.notificationDescription}>
                    Progress updates and new challenges
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.toggle, notifications.challenges && styles.toggleActive]}
                  onPress={() => setNotifications(prev => ({ ...prev, challenges: !prev.challenges }))}
                >
                  <View style={[styles.toggleThumb, notifications.challenges && styles.toggleThumbActive]} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionSection}>
            <AuthButton
              title="Complete Setup"
              onPress={handleComplete}
              loading={loading}
              disabled={loading}
            />
            
            <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
              <Text style={styles.skipButtonText}>Skip for Now</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 16,
    lineHeight: 20,
  },
  sectionNote: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 8,
    fontStyle: 'italic',
  },
  photoUpload: {
    alignSelf: 'center',
    marginBottom: 8,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#475569',
    borderStyle: 'dashed',
  },
  photoPlaceholderText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  goalCard: {
    width: '48%',
    backgroundColor: '#334155',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  goalCardSelected: {
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    borderColor: '#FF6B35',
  },
  goalIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#CBD5E1',
    textAlign: 'center',
  },
  goalTitleSelected: {
    color: '#FF6B35',
  },
  timezoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#334155',
    borderRadius: 12,
    padding: 16,
  },
  timezoneInfo: {
    marginLeft: 12,
    flex: 1,
  },
  timezoneTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  timezoneValue: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  notificationsList: {
    gap: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#334155',
    borderRadius: 12,
    padding: 16,
  },
  notificationContent: {
    flex: 1,
    marginLeft: 12,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  notificationDescription: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#64748B',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: '#FF6B35',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  actionSection: {
    gap: 16,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  skipButtonText: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '500',
  },
});