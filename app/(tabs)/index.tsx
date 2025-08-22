import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import {
  Zap,
  Flame,
  Target,
  Trophy,
  Calendar,
  TrendingUp,
  Star,
  Award,
  Plus,
  Bell,
} from 'lucide-react-native';
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
  withSequence,
} from 'react-native-reanimated';

interface DashboardStats {
  fuelPoints: number;
  level: number;
  burnStreak: number;
  weeklyFP: number;
  activeChallenges: number;
  activeQuests: number;
  contestsWon: number;
  healthSpanScore: number;
}

interface DailyBoost {
  id: string;
  title: string;
  description: string;
  fpReward: number;
  cooldownHours: number;
  lastUsed?: Date;
  isAvailable: boolean;
}

interface RecentActivity {
  id: string;
  type: 'challenge' | 'quest' | 'boost' | 'contest';
  title: string;
  fpEarned: number;
  timestamp: Date;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    fuelPoints: 2847,
    level: 12,
    burnStreak: 18,
    weeklyFP: 485,
    activeChallenges: 3,
    activeQuests: 1,
    contestsWon: 2,
    healthSpanScore: 78,
  });

  const [dailyBoosts, setDailyBoosts] = useState<DailyBoost[]>([
    {
      id: '1',
      title: 'Morning Meditation',
      description: '5 minutes of mindfulness',
      fpReward: 3,
      cooldownHours: 24,
      isAvailable: true,
    },
    {
      id: '2',
      title: 'Hydration Check',
      description: 'Log your water intake',
      fpReward: 2,
      cooldownHours: 6,
      isAvailable: true,
    },
    {
      id: '3',
      title: 'Quick Workout',
      description: '10-minute movement break',
      fpReward: 5,
      cooldownHours: 12,
      isAvailable: false,
    },
  ]);

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'challenge',
      title: 'Completed Daily Steps Challenge',
      fpEarned: 10,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: '2',
      type: 'boost',
      title: 'Morning Meditation Boost',
      fpEarned: 3,
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    },
    {
      id: '3',
      type: 'quest',
      title: 'Week 3 Action Complete',
      fpEarned: 30,
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  ]);

  const [refreshing, setRefreshing] = useState(false);
  const fpAnimationValue = useSharedValue(1);
  const streakAnimationValue = useSharedValue(1);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const handleBoostPress = (boostId: string) => {
    // Animate FP gain
    fpAnimationValue.value = withSequence(
      withSpring(1.2, { duration: 300 }),
      withSpring(1, { duration: 300 })
    );

    setDailyBoosts(prev =>
      prev.map(boost =>
        boost.id === boostId
          ? { ...boost, isAvailable: false, lastUsed: new Date() }
          : boost
      )
    );

    setStats(prev => ({
      ...prev,
      fuelPoints: prev.fuelPoints + 3,
      weeklyFP: prev.weeklyFP + 3,
    }));
  };

  const fpAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fpAnimationValue.value }],
  }));

  const streakAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: streakAnimationValue.value }],
  }));

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'challenge': return <Target size={16} color="#10B981" />;
      case 'quest': return <Calendar size={16} color="#3B82F6" />;
      case 'boost': return <Zap size={16} color="#F97316" />;
      case 'contest': return <Trophy size={16} color="#8B5CF6" />;
      default: return <Star size={16} color="#6B7280" />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome back!</Text>
            <Text style={styles.usernameText}>Health Warrior</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Bell size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Fuel Points Card */}
        <Animated.View style={[styles.fpCard, fpAnimatedStyle]}>
          <View style={styles.fpHeader}>
            <Zap size={24} color="#F97316" />
            <Text style={styles.fpTitle}>Fuel Points</Text>
          </View>
          <Text style={styles.fpAmount}>{stats.fuelPoints.toLocaleString()}</Text>
          <View style={styles.fpDetails}>
            <View style={styles.fpDetail}>
              <Text style={styles.fpDetailLabel}>Level</Text>
              <Text style={styles.fpDetailValue}>{stats.level}</Text>
            </View>
            <View style={styles.fpDetail}>
              <Text style={styles.fpDetailLabel}>This Week</Text>
              <Text style={styles.fpDetailValue}>+{stats.weeklyFP}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Burn Streak Card */}
        <Animated.View style={[styles.streakCard, streakAnimatedStyle]}>
          <View style={styles.streakHeader}>
            <Flame size={24} color="#EF4444" />
            <Text style={styles.streakTitle}>Burn Streak</Text>
          </View>
          <Text style={styles.streakDays}>{stats.burnStreak} days</Text>
          <Text style={styles.streakSubtitle}>Keep it going! 🔥</Text>
        </Animated.View>

        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Target size={20} color="#10B981" />
            <Text style={styles.statValue}>{stats.activeChallenges}</Text>
            <Text style={styles.statLabel}>Active Challenges</Text>
          </View>
          <View style={styles.statCard}>
            <Calendar size={20} color="#3B82F6" />
            <Text style={styles.statValue}>{stats.activeQuests}</Text>
            <Text style={styles.statLabel}>Active Quests</Text>
          </View>
          <View style={styles.statCard}>
            <Trophy size={20} color="#8B5CF6" />
            <Text style={styles.statValue}>{stats.contestsWon}</Text>
            <Text style={styles.statLabel}>Contests Won</Text>
          </View>
          <View style={styles.statCard}>
            <TrendingUp size={20} color="#F59E0B" />
            <Text style={styles.statValue}>{stats.healthSpanScore}</Text>
            <Text style={styles.statLabel}>HealthSpan</Text>
          </View>
        </View>

        {/* Daily Boosts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Boosts</Text>
          <View style={styles.boostsContainer}>
            {dailyBoosts.map((boost) => (
              <TouchableOpacity
                key={boost.id}
                style={[
                  styles.boostCard,
                  !boost.isAvailable && styles.boostCardDisabled
                ]}
                onPress={() => boost.isAvailable && handleBoostPress(boost.id)}
                disabled={!boost.isAvailable}
              >
                <View style={styles.boostHeader}>
                  <Zap size={18} color={boost.isAvailable ? "#F97316" : "#9CA3AF"} />
                  <Text style={[
                    styles.boostTitle,
                    !boost.isAvailable && styles.boostTitleDisabled
                  ]}>
                    {boost.title}
                  </Text>
                </View>
                <Text style={[
                  styles.boostDescription,
                  !boost.isAvailable && styles.boostDescriptionDisabled
                ]}>
                  {boost.description}
                </Text>
                <View style={styles.boostFooter}>
                  <Text style={[
                    styles.boostReward,
                    !boost.isAvailable && styles.boostRewardDisabled
                  ]}>
                    +{boost.fpReward} FP
                  </Text>
                  {!boost.isAvailable && (
                    <Text style={styles.boostCooldown}>
                      {boost.cooldownHours}h cooldown
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityContainer}>
            {recentActivity.map((activity) => (
              <View key={activity.id} style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  {getActivityIcon(activity.type)}
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activityTime}>{formatTimeAgo(activity.timestamp)}</Text>
                </View>
                <Text style={styles.activityReward}>+{activity.fpEarned} FP</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.quickActionCard}>
              <Plus size={24} color="#10B981" />
              <Text style={styles.quickActionText}>New Challenge</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCard}>
              <Trophy size={24} color="#8B5CF6" />
              <Text style={styles.quickActionText}>Join Contest</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCard}>
              <Award size={24} color="#F59E0B" />
              <Text style={styles.quickActionText}>Health Assessment</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCard}>
              <Target size={24} color="#3B82F6" />
              <Text style={styles.quickActionText}>Start Quest</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  welcomeText: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '500',
  },
  usernameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginTop: 4,
  },
  notificationButton: {
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
  fpCard: {
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
  fpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  fpTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F8FAFC',
    marginLeft: 8,
  },
  fpAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 16,
  },
  fpDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fpDetail: {
    alignItems: 'center',
  },
  fpDetailLabel: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 4,
  },
  fpDetailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  streakCard: {
    backgroundColor: '#1E293B',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  streakTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F8FAFC',
    marginLeft: 8,
  },
  streakDays: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 4,
  },
  streakSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    marginHorizontal: '1%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  statValue: {
    fontSize: 24,
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F8FAFC',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  boostsContainer: {
    paddingHorizontal: 20,
  },
  boostCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  boostCardDisabled: {
    backgroundColor: '#0F172A',
    opacity: 0.6,
  },
  boostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  boostTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
    marginLeft: 8,
  },
  boostTitleDisabled: {
    color: '#64748B',
  },
  boostDescription: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 12,
  },
  boostDescriptionDisabled: {
    color: '#64748B',
  },
  boostFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  boostReward: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B35',
  },
  boostRewardDisabled: {
    color: '#64748B',
  },
  boostCooldown: {
    fontSize: 12,
    color: '#64748B',
  },
  activityContainer: {
    paddingHorizontal: 20,
  },
  activityItem: {
    flexDirection: 'row',
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
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#F8FAFC',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#94A3B8',
  },
  activityReward: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4ADE80',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    marginHorizontal: '1%',
    alignItems: 'center',
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
  bottomPadding: {
    height: 20,
  },
});