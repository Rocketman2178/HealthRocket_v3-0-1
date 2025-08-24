import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Rocket, Target, Trophy, Calendar, Zap, Users, CircleCheck as CheckCircle, ArrowRight, Star, Activity } from 'lucide-react-native';

interface WelcomeDashboardProps {
  onComplete: () => void;
}

export default function WelcomeDashboard({ onComplete }: WelcomeDashboardProps) {
  const features = [
    {
      icon: Target,
      title: 'Daily Challenges',
      description: 'Complete daily health challenges to earn Fuel Points',
      color: '#10B981',
    },
    {
      icon: Trophy,
      title: 'Contests',
      description: 'Compete with others in health and fitness contests',
      color: '#8B5CF6',
    },
    {
      icon: Calendar,
      title: 'Long-term Quests',
      description: 'Embark on 12-week transformation journeys',
      color: '#3B82F6',
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Connect with like-minded health enthusiasts',
      color: '#F59E0B',
    },
  ];

  const gettingStartedItems = [
    {
      id: 'profile',
      title: 'Complete your profile',
      description: 'Add your health goals and preferences',
      completed: true,
    },
    {
      id: 'assessment',
      title: 'Take health assessment',
      description: 'Get personalized recommendations',
      completed: false,
    },
    {
      id: 'challenge',
      title: 'Join your first challenge',
      description: 'Start earning Fuel Points today',
      completed: false,
    },
    {
      id: 'community',
      title: 'Connect with the community',
      description: 'Introduce yourself in the chat',
      completed: false,
    },
  ];

  const firstChallenges = [
    {
      title: '10,000 Steps',
      description: 'Walk 10,000 steps today',
      reward: '10 FP',
      difficulty: 'Easy',
    },
    {
      title: 'Morning Meditation',
      description: '5 minutes of mindfulness',
      reward: '8 FP',
      difficulty: 'Easy',
    },
    {
      title: 'Hydration Goal',
      description: 'Drink 8 glasses of water',
      reward: '5 FP',
      difficulty: 'Easy',
    },
  ];

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
          {/* Welcome Header */}
          <View style={styles.header}>
            <View style={styles.rocketContainer}>
              <LinearGradient
                colors={['#FF6B35', '#FF8A65']}
                style={styles.rocketBackground}
              >
                <Rocket size={32} color="#FFFFFF" />
              </LinearGradient>
            </View>
            <Text style={styles.welcomeTitle}>Welcome to Health Rocket! 🚀</Text>
            <Text style={styles.welcomeSubtitle}>
              You're all set to begin your personalized health journey. 
              Let's explore what makes Health Rocket special.
            </Text>
          </View>

          {/* Features Overview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What You Can Do</Text>
            <View style={styles.featuresGrid}>
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <View key={index} style={styles.featureCard}>
                    <View style={[styles.featureIcon, { backgroundColor: `${feature.color}20` }]}>
                      <IconComponent size={24} color={feature.color} />
                    </View>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDescription}>{feature.description}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Getting Started Checklist */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Getting Started</Text>
            <Text style={styles.sectionDescription}>
              Complete these steps to get the most out of Health Rocket
            </Text>
            
            <View style={styles.checklistContainer}>
              {gettingStartedItems.map((item) => (
                <View key={item.id} style={styles.checklistItem}>
                  <View style={styles.checklistIcon}>
                    {item.completed ? (
                      <CheckCircle size={20} color="#10B981" />
                    ) : (
                      <View style={styles.uncheckedCircle} />
                    )}
                  </View>
                  <View style={styles.checklistContent}>
                    <Text style={[
                      styles.checklistTitle,
                      item.completed && styles.checklistTitleCompleted
                    ]}>
                      {item.title}
                    </Text>
                    <Text style={styles.checklistDescription}>
                      {item.description}
                    </Text>
                  </View>
                  {!item.completed && (
                    <ArrowRight size={16} color="#94A3B8" />
                  )}
                </View>
              ))}
            </View>
          </View>

          {/* First Challenges */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommended First Challenges</Text>
            <Text style={styles.sectionDescription}>
              Start with these beginner-friendly challenges to earn your first Fuel Points
            </Text>
            
            <View style={styles.challengesContainer}>
              {firstChallenges.map((challenge, index) => (
                <View key={index} style={styles.challengeCard}>
                  <View style={styles.challengeHeader}>
                    <Text style={styles.challengeTitle}>{challenge.title}</Text>
                    <View style={styles.challengeReward}>
                      <Zap size={14} color="#FF6B35" />
                      <Text style={styles.challengeRewardText}>{challenge.reward}</Text>
                    </View>
                  </View>
                  <Text style={styles.challengeDescription}>{challenge.description}</Text>
                  <View style={styles.challengeFooter}>
                    <View style={styles.difficultyBadge}>
                      <Text style={styles.difficultyText}>{challenge.difficulty}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Stats Preview */}
          <View style={styles.section}>
            <View style={styles.statsCard}>
              <Text style={styles.statsTitle}>Your Health Rocket Journey</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Zap size={20} color="#FF6B35" />
                  <Text style={styles.statValue}>0</Text>
                  <Text style={styles.statLabel}>Fuel Points</Text>
                </View>
                <View style={styles.statItem}>
                  <Star size={20} color="#F59E0B" />
                  <Text style={styles.statValue}>1</Text>
                  <Text style={styles.statLabel}>Level</Text>
                </View>
                <View style={styles.statItem}>
                  <Activity size={20} color="#10B981" />
                  <Text style={styles.statValue}>0</Text>
                  <Text style={styles.statLabel}>Streak Days</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Launch Button */}
          <View style={styles.launchSection}>
            <TouchableOpacity style={styles.launchButton} onPress={onComplete}>
              <LinearGradient
                colors={['#FF6B35', '#FF8A65']}
                style={styles.launchButtonGradient}
              >
                <Text style={styles.launchButtonText}>Launch My Journey</Text>
                <Rocket size={20} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
            
            <Text style={styles.launchNote}>
              Ready to transform your health? Let's go! 🚀
            </Text>
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
  rocketContainer: {
    marginBottom: 16,
  },
  rocketBackground: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
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
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureCard: {
    width: '48%',
    backgroundColor: '#334155',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 4,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 16,
  },
  checklistContainer: {
    backgroundColor: '#334155',
    borderRadius: 12,
    overflow: 'hidden',
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#475569',
  },
  checklistIcon: {
    marginRight: 12,
  },
  uncheckedCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#64748B',
  },
  checklistContent: {
    flex: 1,
  },
  checklistTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 2,
  },
  checklistTitleCompleted: {
    color: '#10B981',
  },
  checklistDescription: {
    fontSize: 12,
    color: '#94A3B8',
  },
  challengesContainer: {
    gap: 12,
  },
  challengeCard: {
    backgroundColor: '#334155',
    borderRadius: 12,
    padding: 16,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
    flex: 1,
  },
  challengeReward: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  challengeRewardText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B35',
    marginLeft: 4,
  },
  challengeDescription: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 12,
  },
  challengeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficultyBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statsCard: {
    backgroundColor: '#334155',
    borderRadius: 12,
    padding: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
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
  },
  launchSection: {
    alignItems: 'center',
  },
  launchButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  launchButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
  },
  launchButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 8,
  },
  launchNote: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});