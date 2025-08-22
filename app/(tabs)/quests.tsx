import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  ProgressBarAndroid,
} from 'react-native';
import { Calendar, Target, Users, Clock, CircleCheck as CheckCircle, Circle, Star, Trophy, Zap, X, MessageCircle, Play, Pause } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
} from 'react-native-reanimated';

interface Quest {
  id: string;
  title: string;
  description: string;
  durationWeeks: number;
  currentWeek: number;
  status: 'available' | 'active' | 'completed' | 'paused';
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  participants: number;
  fpReward: number;
  weeklyActions: WeeklyAction[];
  startDate?: Date;
  completionRate: number;
  isGroupQuest: boolean;
  groupMembers?: number;
  nextActionDate?: Date;
}

interface WeeklyAction {
  week: number;
  title: string;
  description: string;
  isCompleted: boolean;
  fpReward: number;
  dueDate?: Date;
}

export default function Quests() {
  const [activeTab, setActiveTab] = useState<'available' | 'active' | 'completed'>('active');
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [quests] = useState<Quest[]>([
    {
      id: '1',
      title: 'Mindful Mornings',
      description: 'Build a consistent morning routine that sets you up for success. Includes meditation, journaling, and mindful movement.',
      durationWeeks: 12,
      currentWeek: 4,
      status: 'active',
      category: 'Mindfulness',
      difficulty: 'beginner',
      participants: 156,
      fpReward: 500,
      completionRate: 32,
      isGroupQuest: true,
      groupMembers: 8,
      startDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
      nextActionDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      weeklyActions: [
        { week: 1, title: 'Morning Reflection', description: 'Spend 5 minutes each morning reflecting on your intentions', isCompleted: true, fpReward: 30 },
        { week: 2, title: 'Meditation Practice', description: 'Establish a 10-minute daily meditation routine', isCompleted: true, fpReward: 30 },
        { week: 3, title: 'Gratitude Journaling', description: 'Write down 3 things you\'re grateful for each morning', isCompleted: true, fpReward: 30 },
        { week: 4, title: 'Mindful Movement', description: 'Add 15 minutes of gentle stretching or yoga', isCompleted: false, fpReward: 30, dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) },
      ],
    },
    {
      id: '2',
      title: 'Nutrition Transformation',
      description: 'Transform your relationship with food through mindful eating, meal planning, and understanding nutrition basics.',
      durationWeeks: 8,
      currentWeek: 1,
      status: 'active',
      category: 'Nutrition',
      difficulty: 'intermediate',
      participants: 89,
      fpReward: 400,
      completionRate: 12,
      isGroupQuest: false,
      startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      nextActionDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      weeklyActions: [
        { week: 1, title: 'Food Awareness', description: 'Track your meals and notice eating patterns', isCompleted: false, fpReward: 35, dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) },
      ],
    },
    {
      id: '3',
      title: 'Fitness Foundation',
      description: 'Build sustainable fitness habits with progressive workouts, recovery practices, and movement variety.',
      durationWeeks: 16,
      currentWeek: 0,
      status: 'available',
      category: 'Fitness',
      difficulty: 'beginner',
      participants: 234,
      fpReward: 600,
      completionRate: 0,
      isGroupQuest: true,
      weeklyActions: [],
    },
    {
      id: '4',
      title: 'Stress Mastery',
      description: 'Develop advanced stress management techniques including breathwork, time management, and emotional regulation.',
      durationWeeks: 10,
      currentWeek: 0,
      status: 'available',
      category: 'Mental Health',
      difficulty: 'advanced',
      participants: 67,
      fpReward: 550,
      completionRate: 0,
      isGroupQuest: false,
      weeklyActions: [],
    },
    {
      id: '5',
      title: 'Sleep Optimization',
      description: 'Master the art of restorative sleep through sleep hygiene, environment optimization, and recovery protocols.',
      durationWeeks: 6,
      currentWeek: 6,
      status: 'completed',
      category: 'Recovery',
      difficulty: 'intermediate',
      participants: 123,
      fpReward: 350,
      completionRate: 100,
      isGroupQuest: false,
      startDate: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000),
      weeklyActions: [
        { week: 1, title: 'Sleep Tracking', description: 'Monitor your sleep patterns', isCompleted: true, fpReward: 25 },
        { week: 2, title: 'Environment Setup', description: 'Optimize your sleep environment', isCompleted: true, fpReward: 25 },
        { week: 3, title: 'Bedtime Routine', description: 'Create a consistent bedtime routine', isCompleted: true, fpReward: 25 },
        { week: 4, title: 'Screen Time Management', description: 'Reduce screen exposure before bed', isCompleted: true, fpReward: 25 },
        { week: 5, title: 'Recovery Protocols', description: 'Implement active recovery techniques', isCompleted: true, fpReward: 25 },
        { week: 6, title: 'Long-term Habits', description: 'Establish sustainable sleep habits', isCompleted: true, fpReward: 25 },
      ],
    },
  ]);

  const animationValue = useSharedValue(1);

  const filteredQuests = quests.filter(quest => quest.status === activeTab);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '#10B981';
      case 'intermediate': return '#F59E0B';
      case 'advanced': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'available': return '#3B82F6';
      case 'completed': return '#6B7280';
      case 'paused': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'In Progress';
      case 'available': return 'Available';
      case 'completed': return 'Completed';
      case 'paused': return 'Paused';
      default: return status;
    }
  };

  const handleQuestPress = (quest: Quest) => {
    setSelectedQuest(quest);
    setShowDetailModal(true);
  };

  const handleStartQuest = (questId: string) => {
    animationValue.value = withSpring(1.1, { duration: 200 }, () => {
      animationValue.value = withSpring(1, { duration: 200 });
    });
    // Handle quest start logic
  };

  const formatTimeRemaining = (dueDate: Date) => {
    const now = new Date();
    const diffInMs = dueDate.getTime() - now.getTime();
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Due today';
    if (diffInDays === 1) return 'Due tomorrow';
    if (diffInDays > 0) return `Due in ${diffInDays} days`;
    return 'Overdue';
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: animationValue.value }],
  }));

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quests</Text>
        <View style={styles.headerStats}>
          <Text style={styles.headerStatsText}>2 Active</Text>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
            Active
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'available' && styles.activeTab]}
          onPress={() => setActiveTab('available')}
        >
          <Text style={[styles.tabText, activeTab === 'available' && styles.activeTabText]}>
            Available
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      {/* Quests List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.questsContainer}>
          {filteredQuests.map((quest) => (
            <Animated.View key={quest.id} style={animatedStyle}>
              <TouchableOpacity
                style={styles.questCard}
                onPress={() => handleQuestPress(quest)}
              >
                <View style={styles.questHeader}>
                  <View style={styles.questTitleRow}>
                    <Target size={24} color={getStatusColor(quest.status)} />
                    <View style={styles.questTitleContainer}>
                      <Text style={styles.questTitle}>{quest.title}</Text>
                      <View style={styles.questBadges}>
                        <View style={[styles.badge, { backgroundColor: getDifficultyColor(quest.difficulty) }]}>
                          <Text style={styles.badgeText}>{quest.difficulty}</Text>
                        </View>
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>{quest.category}</Text>
                        </View>
                        {quest.isGroupQuest && (
                          <View style={[styles.badge, { backgroundColor: '#8B5CF6' }]}>
                            <Text style={styles.badgeText}>Group</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(quest.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(quest.status)}</Text>
                  </View>
                </View>

                <Text style={styles.questDescription}>{quest.description}</Text>

                <View style={styles.questStats}>
                  <View style={styles.questStat}>
                    <Calendar size={16} color="#6B7280" />
                    <Text style={styles.questStatText}>{quest.durationWeeks} weeks</Text>
                  </View>
                  <View style={styles.questStat}>
                    <Users size={16} color="#6B7280" />
                    <Text style={styles.questStatText}>{quest.participants} joined</Text>
                  </View>
                  <View style={styles.questStat}>
                    <Zap size={16} color="#F97316" />
                    <Text style={styles.questStatText}>{quest.fpReward} FP</Text>
                  </View>
                </View>

                {quest.status === 'active' && (
                  <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressTitle}>Week {quest.currentWeek} of {quest.durationWeeks}</Text>
                      <Text style={styles.progressPercent}>{quest.completionRate}%</Text>
                    </View>
                    <View style={styles.progressBarContainer}>
                      <View style={styles.progressBarBackground}>
                        <View 
                          style={[
                            styles.progressBarFill, 
                            { width: `${quest.completionRate}%` }
                          ]} 
                        />
                      </View>
                    </View>
                    {quest.nextActionDate && (
                      <Text style={styles.nextActionText}>
                        Next action: {formatTimeRemaining(quest.nextActionDate)}
                      </Text>
                    )}
                  </View>
                )}

                {quest.status === 'completed' && (
                  <View style={styles.completedSection}>
                    <View style={styles.completedBadge}>
                      <Trophy size={16} color="#F59E0B" />
                      <Text style={styles.completedText}>Quest Completed!</Text>
                    </View>
                    <Text style={styles.completedReward}>Earned {quest.fpReward} Fuel Points</Text>
                  </View>
                )}

                <View style={styles.questFooter}>
                  {quest.isGroupQuest && quest.groupMembers && (
                    <View style={styles.groupInfo}>
                      <Users size={14} color="#8B5CF6" />
                      <Text style={styles.groupText}>{quest.groupMembers} in your group</Text>
                    </View>
                  )}
                  
                  <View style={styles.questActions}>
                    {quest.status === 'active' && (
                      <TouchableOpacity style={styles.chatButton}>
                        <MessageCircle size={16} color="#6B7280" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Quest Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowDetailModal(false)}
            >
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Quest Details</Text>
            <View style={styles.modalPlaceholder} />
          </View>

          {selectedQuest && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.questDetailHeader}>
                <Target size={32} color={getStatusColor(selectedQuest.status)} />
                <Text style={styles.questDetailTitle}>{selectedQuest.title}</Text>
                <View style={styles.questDetailBadges}>
                  <View style={[styles.badge, { backgroundColor: getDifficultyColor(selectedQuest.difficulty) }]}>
                    <Text style={styles.badgeText}>{selectedQuest.difficulty}</Text>
                  </View>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{selectedQuest.category}</Text>
                  </View>
                  {selectedQuest.isGroupQuest && (
                    <View style={[styles.badge, { backgroundColor: '#8B5CF6' }]}>
                      <Text style={styles.badgeText}>Group Quest</Text>
                    </View>
                  )}
                </View>
              </View>

              <Text style={styles.questDetailDescription}>{selectedQuest.description}</Text>

              <View style={styles.questDetailStats}>
                <View style={styles.detailStatCard}>
                  <Calendar size={20} color="#3B82F6" />
                  <Text style={styles.detailStatValue}>{selectedQuest.durationWeeks}</Text>
                  <Text style={styles.detailStatLabel}>Weeks</Text>
                </View>
                <View style={styles.detailStatCard}>
                  <Users size={20} color="#10B981" />
                  <Text style={styles.detailStatValue}>{selectedQuest.participants}</Text>
                  <Text style={styles.detailStatLabel}>Participants</Text>
                </View>
                <View style={styles.detailStatCard}>
                  <Zap size={20} color="#F97316" />
                  <Text style={styles.detailStatValue}>{selectedQuest.fpReward}</Text>
                  <Text style={styles.detailStatLabel}>FP Reward</Text>
                </View>
                <View style={styles.detailStatCard}>
                  <Star size={20} color="#F59E0B" />
                  <Text style={styles.detailStatValue}>{selectedQuest.difficulty}</Text>
                  <Text style={styles.detailStatLabel}>Difficulty</Text>
                </View>
              </View>

              {selectedQuest.status === 'available' && (
                <TouchableOpacity
                  style={styles.startButton}
                  onPress={() => handleStartQuest(selectedQuest.id)}
                >
                  <Play size={20} color="#FFFFFF" />
                  <Text style={styles.startButtonText}>Start Quest</Text>
                </TouchableOpacity>
              )}

              {selectedQuest.weeklyActions.length > 0 && (
                <View style={styles.weeklyActionsSection}>
                  <Text style={styles.weeklyActionsTitle}>Weekly Actions</Text>
                  {selectedQuest.weeklyActions.map((action) => (
                    <View key={action.week} style={styles.weeklyActionCard}>
                      <View style={styles.weeklyActionHeader}>
                        <View style={styles.weeklyActionInfo}>
                          {action.isCompleted ? (
                            <CheckCircle size={20} color="#10B981" />
                          ) : (
                            <Circle size={20} color="#6B7280" />
                          )}
                          <Text style={[
                            styles.weeklyActionTitle,
                            action.isCompleted && styles.completedActionTitle
                          ]}>
                            Week {action.week}: {action.title}
                          </Text>
                        </View>
                        <View style={styles.actionReward}>
                          <Zap size={14} color="#F97316" />
                          <Text style={styles.actionRewardText}>+{action.fpReward}</Text>
                        </View>
                      </View>
                      <Text style={[
                        styles.weeklyActionDescription,
                        action.isCompleted && styles.completedActionDescription
                      ]}>
                        {action.description}
                      </Text>
                      {action.dueDate && !action.isCompleted && (
                        <Text style={styles.actionDueDate}>
                          {formatTimeRemaining(action.dueDate)}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              )}

              {selectedQuest.isGroupQuest && (
                <View style={styles.groupSection}>
                  <Text style={styles.groupSectionTitle}>Group Quest</Text>
                  <Text style={styles.groupSectionText}>
                    Join with other participants for accountability and support throughout your journey.
                  </Text>
                  {selectedQuest.groupMembers && (
                    <View style={styles.groupMembersInfo}>
                      <Users size={16} color="#8B5CF6" />
                      <Text style={styles.groupMembersText}>
                        {selectedQuest.groupMembers} members in your group
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </ScrollView>
          )}
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
  headerStats: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  headerStatsText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  activeTab: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#94A3B8',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  questsContainer: {
    paddingHorizontal: 20,
  },
  questCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  questHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  questTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  questTitleContainer: {
    marginLeft: 12,
    flex: 1,
  },
  questTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  questBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badge: {
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  questDescription: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 16,
    lineHeight: 20,
  },
  questStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  questStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  questStatText: {
    fontSize: 14,
    color: '#94A3B8',
    marginLeft: 4,
    fontWeight: '500',
  },
  progressSection: {
    backgroundColor: '#0F2A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#4ADE80',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4ADE80',
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4ADE80',
  },
  progressBarContainer: {
    marginBottom: 8,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#334155',
    borderRadius: 3,
  },
  progressBarFill: {
    height: 6,
    backgroundColor: '#4ADE80',
    borderRadius: 3,
  },
  nextActionText: {
    fontSize: 12,
    color: '#4ADE80',
    fontWeight: '500',
  },
  completedSection: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  completedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
    marginLeft: 8,
  },
  completedReward: {
    fontSize: 12,
    color: '#F59E0B',
  },
  questFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  groupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  groupText: {
    fontSize: 12,
    color: '#8B5CF6',
    marginLeft: 4,
    fontWeight: '500',
  },
  questActions: {
    flexDirection: 'row',
  },
  chatButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
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
  questDetailHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  questDetailTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginTop: 12,
    marginBottom: 12,
    textAlign: 'center',
  },
  questDetailBadges: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  questDetailDescription: {
    fontSize: 16,
    color: '#94A3B8',
    lineHeight: 24,
    marginBottom: 32,
    textAlign: 'center',
  },
  questDetailStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  detailStatCard: {
    width: '48%',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  detailStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginTop: 8,
    marginBottom: 4,
  },
  detailStatLabel: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  weeklyActionsSection: {
    marginBottom: 24,
  },
  weeklyActionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 16,
  },
  weeklyActionCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  weeklyActionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  weeklyActionInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  weeklyActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F8FAFC',
    marginLeft: 8,
    flex: 1,
  },
  completedActionTitle: {
    color: '#4ADE80',
    textDecorationLine: 'line-through',
  },
  actionReward: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionRewardText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F97316',
    marginLeft: 4,
  },
  weeklyActionDescription: {
    fontSize: 12,
    color: '#94A3B8',
    marginLeft: 28,
    lineHeight: 16,
  },
  completedActionDescription: {
    color: '#64748B',
  },
  actionDueDate: {
    fontSize: 12,
    color: '#EF4444',
    marginLeft: 28,
    marginTop: 4,
    fontWeight: '500',
  },
  groupSection: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  groupSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginBottom: 8,
  },
  groupSectionText: {
    fontSize: 14,
    color: '#A78BFA',
    marginBottom: 12,
    lineHeight: 20,
  },
  groupMembersInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupMembersText: {
    fontSize: 12,
    color: '#8B5CF6',
    marginLeft: 4,
    fontWeight: '500',
  },
  bottomPadding: {
    height: 20,
  },
});