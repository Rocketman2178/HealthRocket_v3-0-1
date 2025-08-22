import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  TextInput,
  Switch,
} from 'react-native';
import { User, Settings, Trophy, Target, Calendar, Zap, Star, Award, Bell, Shield, CircleHelp as HelpCircle, LogOut, CreditCard as Edit, X, Save, Camera, Gift, Code, ChartBar as BarChart3, Moon, Sun } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
} from 'react-native-reanimated';

interface UserStats {
  level: number;
  fuelPoints: number;
  totalFPEarned: number;
  burnStreak: number;
  challengesCompleted: number;
  questsCompleted: number;
  contestsWon: number;
  healthSpanScore: number;
  joinDate: Date;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedDate?: Date;
  isEarned: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export default function Profile() {
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const [showPromoCodeModal, setShowPromoCodeModal] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const [userProfile, setUserProfile] = useState({
    username: 'Health Warrior',
    email: 'warrior@healthrocket.com',
    bio: 'Entrepreneur on a mission to optimize health and performance. Always pushing limits! 🚀',
    location: 'San Francisco, CA',
  });

  const [userStats] = useState<UserStats>({
    level: 12,
    fuelPoints: 2847,
    totalFPEarned: 8943,
    burnStreak: 18,
    challengesCompleted: 47,
    questsCompleted: 3,
    contestsWon: 2,
    healthSpanScore: 78,
    joinDate: new Date('2024-01-15'),
  });

  const [achievements] = useState<Achievement[]>([
    {
      id: '1',
      title: 'First Steps',
      description: 'Complete your first challenge',
      icon: 'target',
      earnedDate: new Date('2024-01-16'),
      isEarned: true,
      rarity: 'common',
    },
    {
      id: '2',
      title: 'Streak Master',
      description: 'Maintain a 7-day burn streak',
      icon: 'flame',
      earnedDate: new Date('2024-01-23'),
      isEarned: true,
      rarity: 'rare',
    },
    {
      id: '3',
      title: 'Contest Champion',
      description: 'Win your first contest',
      icon: 'trophy',
      earnedDate: new Date('2024-02-05'),
      isEarned: true,
      rarity: 'epic',
    },
    {
      id: '4',
      title: 'Level 10 Legend',
      description: 'Reach level 10',
      icon: 'star',
      earnedDate: new Date('2024-02-20'),
      isEarned: true,
      rarity: 'epic',
    },
    {
      id: '5',
      title: 'Quest Completer',
      description: 'Complete your first quest',
      icon: 'calendar',
      earnedDate: new Date('2024-03-01'),
      isEarned: true,
      rarity: 'rare',
    },
    {
      id: '6',
      title: 'FP Millionaire',
      description: 'Earn 10,000 total Fuel Points',
      icon: 'zap',
      isEarned: false,
      rarity: 'legendary',
    },
  ]);

  const animationValue = useSharedValue(1);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return '#6B7280';
      case 'rare': return '#3B82F6';
      case 'epic': return '#8B5CF6';
      case 'legendary': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const formatJoinDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const handlePromoCodeSubmit = () => {
    if (promoCode.trim()) {
      animationValue.value = withSpring(1.1, { duration: 200 }, () => {
        animationValue.value = withSpring(1, { duration: 200 });
      });
      // Handle promo code redemption
      setPromoCode('');
      setShowPromoCodeModal(false);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: animationValue.value }],
  }));

  const earnedAchievements = achievements.filter(a => a.isEarned);
  const unearned = achievements.filter(a => !a.isEarned);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => setShowSettingsModal(true)}
        >
          <Settings size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <Animated.View style={[styles.profileCard, animatedStyle]}>
          <TouchableOpacity style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <User size={32} color="#6B7280" />
            </View>
            <View style={styles.cameraIcon}>
              <Camera size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          
          <View style={styles.profileInfo}>
            <View style={styles.profileHeader}>
              <Text style={styles.username}>{userProfile.username}</Text>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setShowEditModal(true)}
              >
                <Edit size={16} color="#10B981" />
              </TouchableOpacity>
            </View>
            <Text style={styles.email}>{userProfile.email}</Text>
            <Text style={styles.bio}>{userProfile.bio}</Text>
            <Text style={styles.location}>{userProfile.location}</Text>
            <Text style={styles.joinDate}>
              Member since {formatJoinDate(userStats.joinDate)}
            </Text>
          </View>
        </Animated.View>

        {/* Level & FP Card */}
        <View style={styles.levelCard}>
          <View style={styles.levelInfo}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>Level {userStats.level}</Text>
            </View>
            <View style={styles.fpInfo}>
              <Zap size={20} color="#F97316" />
              <Text style={styles.fpAmount}>{userStats.fuelPoints.toLocaleString()}</Text>
              <Text style={styles.fpLabel}>Fuel Points</Text>
            </View>
          </View>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '67%' }]} />
            </View>
            <Text style={styles.progressText}>
              {Math.floor((userStats.fuelPoints % 500) / 5)}% to Level {userStats.level + 1}
            </Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Star size={24} color="#F59E0B" />
            <Text style={styles.statValue}>{userStats.totalFPEarned.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total FP Earned</Text>
          </View>
          <View style={styles.statCard}>
            <Target size={24} color="#10B981" />
            <Text style={styles.statValue}>{userStats.challengesCompleted}</Text>
            <Text style={styles.statLabel}>Challenges</Text>
          </View>
          <View style={styles.statCard}>
            <Calendar size={24} color="#3B82F6" />
            <Text style={styles.statValue}>{userStats.questsCompleted}</Text>
            <Text style={styles.statLabel}>Quests</Text>
          </View>
          <View style={styles.statCard}>
            <Trophy size={24} color="#8B5CF6" />
            <Text style={styles.statValue}>{userStats.contestsWon}</Text>
            <Text style={styles.statLabel}>Contests Won</Text>
          </View>
        </View>

        {/* Burn Streak & HealthSpan */}
        <View style={styles.metricsContainer}>
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricTitle}>Burn Streak</Text>
              <Text style={styles.burnStreak}>{userStats.burnStreak} days</Text>
            </View>
            <Text style={styles.metricDescription}>Days with FP earning activity</Text>
          </View>
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricTitle}>HealthSpan Score</Text>
              <Text style={styles.healthSpan}>{userStats.healthSpanScore}</Text>
            </View>
            <Text style={styles.metricDescription}>Overall health assessment</Text>
          </View>
        </View>

        {/* Achievements Section */}
        <View style={styles.achievementsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Achievements</Text>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => setShowAchievementsModal(true)}
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.achievementsGrid}>
            {earnedAchievements.slice(0, 4).map((achievement) => (
              <View key={achievement.id} style={styles.achievementCard}>
                <View style={[
                  styles.achievementIcon,
                  { backgroundColor: getRarityColor(achievement.rarity) }
                ]}>
                  <Award size={20} color="#FFFFFF" />
                </View>
                <Text style={styles.achievementTitle} numberOfLines={1}>
                  {achievement.title}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => setShowPromoCodeModal(true)}
            >
              <Gift size={24} color="#F97316" />
              <Text style={styles.quickActionText}>Promo Code</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCard}>
              <BarChart3 size={24} color="#3B82F6" />
              <Text style={styles.quickActionText}>Health Report</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCard}>
              <Award size={24} color="#8B5CF6" />
              <Text style={styles.quickActionText}>Achievements</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCard}>
              <HelpCircle size={24} color="#6B7280" />
              <Text style={styles.quickActionText}>Help & FAQ</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Settings Modal */}
      <Modal
        visible={showSettingsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSettingsModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowSettingsModal(false)}
            >
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Settings</Text>
            <View style={styles.modalPlaceholder} />
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.settingsSection}>
              <Text style={styles.settingsSectionTitle}>Appearance</Text>
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  {darkMode ? <Moon size={20} color="#6B7280" /> : <Sun size={20} color="#6B7280" />}
                  <Text style={styles.settingText}>Dark Mode</Text>
                </View>
                <Switch
                  value={darkMode}
                  onValueChange={setDarkMode}
                  trackColor={{ false: '#E5E7EB', true: '#10B981' }}
                  thumbColor={darkMode ? '#FFFFFF' : '#FFFFFF'}
                />
              </View>
            </View>

            <View style={styles.settingsSection}>
              <Text style={styles.settingsSectionTitle}>Notifications</Text>
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Bell size={20} color="#6B7280" />
                  <Text style={styles.settingText}>Push Notifications</Text>
                </View>
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  trackColor={{ false: '#E5E7EB', true: '#10B981' }}
                  thumbColor={notifications ? '#FFFFFF' : '#FFFFFF'}
                />
              </View>
            </View>

            <View style={styles.settingsSection}>
              <Text style={styles.settingsSectionTitle}>Account</Text>
              <TouchableOpacity style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Shield size={20} color="#6B7280" />
                  <Text style={styles.settingText}>Privacy & Security</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <HelpCircle size={20} color="#6B7280" />
                  <Text style={styles.settingText}>Help & Support</Text>
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.settingsSection}>
              <TouchableOpacity style={[styles.settingItem, styles.logoutItem]}>
                <View style={styles.settingInfo}>
                  <LogOut size={20} color="#EF4444" />
                  <Text style={[styles.settingText, styles.logoutText]}>Log Out</Text>
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Promo Code Modal */}
      <Modal
        visible={showPromoCodeModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPromoCodeModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowPromoCodeModal(false)}
            >
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Promo Code</Text>
            <View style={styles.modalPlaceholder} />
          </View>

          <View style={styles.modalContent}>
            <View style={styles.promoCodeSection}>
              <Text style={styles.promoCodeTitle}>Enter Promo Code</Text>
              <Text style={styles.promoCodeDescription}>
                Redeem promo codes for bonus Fuel Points and exclusive rewards!
              </Text>
              
              <View style={styles.promoCodeInputContainer}>
                <TextInput
                  style={styles.promoCodeInput}
                  placeholder="Enter code here..."
                  value={promoCode}
                  onChangeText={setPromoCode}
                  autoCapitalize="characters"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={[
                    styles.redeemButton,
                    promoCode.trim() && styles.redeemButtonActive
                  ]}
                  onPress={handlePromoCodeSubmit}
                  disabled={!promoCode.trim()}
                >
                  <Text style={[
                    styles.redeemButtonText,
                    promoCode.trim() && styles.redeemButtonTextActive
                  ]}>
                    Redeem
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: '#1E293B',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarContainer: {
    alignSelf: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  editButton: {
    marginLeft: 8,
    padding: 4,
  },
  email: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 12,
  },
  bio: {
    fontSize: 14,
    color: '#CBD5E1',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  location: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  joinDate: {
    fontSize: 12,
    color: '#64748B',
  },
  levelCard: {
    backgroundColor: '#1E293B',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  levelInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelBadge: {
    backgroundColor: '#4ADE80',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  levelText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  fpInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fpAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginLeft: 8,
  },
  fpLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginLeft: 8,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#334155',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: 8,
    backgroundColor: '#4ADE80',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 8,
    marginHorizontal: '1%',
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },
  metricsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  metricTitle: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  burnStreak: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  healthSpan: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4ADE80',
  },
  metricDescription: {
    fontSize: 10,
    color: '#64748B',
  },
  achievementsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  viewAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#334155',
    borderRadius: 16,
  },
  viewAllText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  achievementCard: {
    width: '48%',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 8,
    marginHorizontal: '1%',
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F8FAFC',
    textAlign: 'center',
  },
  quickActionsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 8,
    marginHorizontal: '1%',
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#F8FAFC',
    marginTop: 8,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    backgroundColor: '#1E293B',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  modalPlaceholder: {
    width: 32,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  settingsSection: {
    marginBottom: 32,
  },
  settingsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    color: '#F8FAFC',
    marginLeft: 12,
  },
  logoutItem: {
    borderWidth: 1,
    borderColor: '#EF4444',
    backgroundColor: '#1E293B',
  },
  logoutText: {
    color: '#EF4444',
  },
  promoCodeSection: {
    alignItems: 'center',
  },
  promoCodeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  promoCodeDescription: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  promoCodeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  promoCodeInput: {
    flex: 1,
    fontSize: 16,
    color: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  redeemButton: {
    backgroundColor: '#334155',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  redeemButtonActive: {
    backgroundColor: '#FF6B35',
  },
  redeemButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94A3B8',
  },
  redeemButtonTextActive: {
    color: '#FFFFFF',
  },
  bottomPadding: {
    height: 20,
  },
});