import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native'
import {
  Zap,
  Target,
  Calendar,
  Trophy,
  TrendingUp,
  Users,
  Bell,
  Flame,
  Star,
  Award,
  Activity,
  Heart,
} from 'lucide-react-native'
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
} from 'react-native-reanimated'

export default function Dashboard() {
  const animationValue = useSharedValue(1)

  const handleCardPress = () => {
    animationValue.value = withSpring(1.05, { duration: 200 }, () => {
      animationValue.value = withSpring(1, { duration: 200 })
    })
  }

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: animationValue.value }],
  }))

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <Text style={styles.userName}>Health Warrior</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Bell size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Fuel Points Card */}
        <Animated.View style={[styles.fpCard, animatedStyle]}>
          <TouchableOpacity onPress={handleCardPress}>
            <View style={styles.fpHeader}>
              <Zap size={24} color="#FF6B35" />
              <Text style={styles.fpTitle}>Fuel Points</Text>
            </View>
            <Text style={styles.fpAmount}>2,847</Text>
            <View style={styles.fpDetails}>
              <View style={styles.fpDetail}>
                <Text style={styles.fpDetailLabel}>Level</Text>
                <Text style={styles.fpDetailValue}>12</Text>
              </View>
              <View style={styles.fpDetail}>
                <Text style={styles.fpDetailLabel}>This Week</Text>
                <Text style={styles.fpDetailValue}>+485</Text>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Burn Streak Card */}
        <View style={styles.streakCard}>
          <View style={styles.streakHeader}>
            <Flame size={24} color="#FF6B35" />
            <Text style={styles.streakTitle}>Burn Streak</Text>
          </View>
          <Text style={styles.streakDays}>18 days</Text>
          <Text style={styles.streakMessage}>Keep it going! 🔥</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Target size={24} color="#4ADE80" />
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>Active Challenges</Text>
          </View>
          <View style={styles.statCard}>
            <Calendar size={24} color="#3B82F6" />
            <Text style={styles.statValue}>1</Text>
            <Text style={styles.statLabel}>Active Quests</Text>
          </View>
          <View style={styles.statCard}>
            <Trophy size={24} color="#8B5CF6" />
            <Text style={styles.statValue}>2</Text>
            <Text style={styles.statLabel}>Contests Won</Text>
          </View>
          <View style={styles.statCard}>
            <TrendingUp size={24} color="#F59E0B" />
            <Text style={styles.statValue}>78</Text>
            <Text style={styles.statLabel}>HealthSpan</Text>
          </View>
        </View>

        {/* Daily Boosts Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Daily Boosts</Text>
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.boostsScroll}>
            <View style={styles.boostCard}>
              <View style={styles.boostIcon}>
                <Activity size={20} color="#4ADE80" />
              </View>
              <Text style={styles.boostTitle}>Morning Walk</Text>
              <Text style={styles.boostReward}>+10 FP</Text>
            </View>
            <View style={styles.boostCard}>
              <View style={styles.boostIcon}>
                <Heart size={20} color="#EF4444" />
              </View>
              <Text style={styles.boostTitle}>Gratitude Journal</Text>
              <Text style={styles.boostReward}>+8 FP</Text>
            </View>
            <View style={styles.boostCard}>
              <View style={styles.boostIcon}>
                <Star size={20} color="#F59E0B" />
              </View>
              <Text style={styles.boostTitle}>Healthy Meal</Text>
              <Text style={styles.boostReward}>+15 FP</Text>
            </View>
          </ScrollView>
        </View>
  )
}

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityList}>
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Target size={16} color="#4ADE80" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Completed 10K Steps Challenge</Text>
                <Text style={styles.activityTime}>2 hours ago</Text>
              </View>
              <Text style={styles.activityReward}>+20 FP</Text>
            </View>
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Award size={16} color="#8B5CF6" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Earned "Streak Master" achievement</Text>
                <Text style={styles.activityTime}>1 day ago</Text>
              </View>
              <Text style={styles.activityReward}>+50 FP</Text>
            </View>
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Calendar size={16} color="#3B82F6" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Started Mindful Mornings Quest</Text>
                <Text style={styles.activityTime}>3 days ago</Text>
              </View>
              <Text style={styles.activityReward}>Quest</Text>
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
            </View>
          </View>
        </View>
  )
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
  headerContent: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: '#94A3B8',
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F8FAFC',
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
  scrollView: {
    flex: 1,
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
    fontSize: 48,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  streakCard: {
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
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  streakTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F8FAFC',
    marginLeft: 8,
  },
  streakDays: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 8,
  },
  streakMessage: {
    fontSize: 14,
    color: '#94A3B8',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 24,
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
  seeAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#334155',
    borderRadius: 16,
  },
  seeAllText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  boostsScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  boostCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 120,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  boostIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  boostTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: 4,
  },
  boostReward: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '600',
  },
  activityList: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
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
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#94A3B8',
  },
  activityReward: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B35',
  },
  bottomPadding: {
    height: 20,
  },
})