import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Image,
} from 'react-native';
import {
  Trophy,
  Calendar,
  Users,
  Clock,
  Zap,
  Camera,
  Star,
  Medal,
  Crown,
  Award,
  X,
  MessageCircle,
} from 'lucide-react-native';
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
} from 'react-native-reanimated';

interface Contest {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  durationDays: number;
  entryCost: number;
  prizePool: number;
  participants: number;
  maxParticipants: number;
  status: 'upcoming' | 'active' | 'ended';
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isJoined: boolean;
  verificationCount?: number;
  leaderboard?: ContestLeaderboard[];
}

interface ContestLeaderboard {
  rank: number;
  userId: string;
  username: string;
  score: number;
  verifications: number;
  avatar?: string;
  isCurrentUser?: boolean;
}

export default function Contests() {
  const [activeTab, setActiveTab] = useState<'active' | 'upcoming' | 'ended'>('active');
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);

  const [contests] = useState<Contest[]>([
    {
      id: '1',
      title: '30-Day Fitness Challenge',
      description: 'Complete daily fitness goals for 30 days straight. Track workouts, nutrition, and mindfulness.',
      startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      durationDays: 30,
      entryCost: 50,
      prizePool: 5000,
      participants: 89,
      maxParticipants: 100,
      status: 'active',
      category: 'Fitness',
      difficulty: 'intermediate',
      isJoined: true,
      verificationCount: 12,
      leaderboard: [
        { rank: 1, userId: '1', username: 'FitnessGuru', score: 285, verifications: 15 },
        { rank: 2, userId: '2', username: 'HealthWarrior', score: 278, verifications: 14 },
        { rank: 3, userId: '3', username: 'WellnessKing', score: 265, verifications: 13 },
        { rank: 4, userId: 'current', username: 'You', score: 240, verifications: 12, isCurrentUser: true },
        { rank: 5, userId: '4', username: 'MindfulMover', score: 235, verifications: 12 },
      ],
    },
    {
      id: '2',
      title: 'Mindfulness Marathon',
      description: '21 days of meditation and mindfulness practices. Build consistency in your mental wellness routine.',
      startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000),
      durationDays: 21,
      entryCost: 25,
      prizePool: 2000,
      participants: 67,
      maxParticipants: 80,
      status: 'active',
      category: 'Mindfulness',
      difficulty: 'beginner',
      isJoined: false,
      leaderboard: [
        { rank: 1, userId: '5', username: 'ZenMaster', score: 189, verifications: 18 },
        { rank: 2, userId: '6', username: 'CalmSpirit', score: 176, verifications: 16 },
        { rank: 3, userId: '7', username: 'PeacefulMind', score: 164, verifications: 15 },
      ],
    },
    {
      id: '3',
      title: 'Nutrition Challenge',
      description: 'Track healthy meals and hydration goals. Learn sustainable eating habits.',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      durationDays: 14,
      entryCost: 30,
      prizePool: 3000,
      participants: 23,
      maxParticipants: 100,
      status: 'upcoming',
      category: 'Nutrition',
      difficulty: 'intermediate',
      isJoined: false,
    },
    {
      id: '4',
      title: 'Sleep Optimization',
      description: 'Improve sleep quality and maintain consistent sleep schedules.',
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      durationDays: 28,
      entryCost: 40,
      prizePool: 4000,
      participants: 156,
      maxParticipants: 200,
      status: 'ended',
      category: 'Recovery',
      difficulty: 'advanced',
      isJoined: true,
      leaderboard: [
        { rank: 1, userId: '8', username: 'SleepChampion', score: 420, verifications: 28 },
        { rank: 2, userId: 'current', username: 'You', score: 398, verifications: 26, isCurrentUser: true },
        { rank: 3, userId: '9', username: 'RestfulNights', score: 385, verifications: 25 },
      ],
    },
  ]);

  const animationValue = useSharedValue(1);

  const filteredContests = contests.filter(contest => contest.status === activeTab);

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
      case 'upcoming': return '#3B82F6';
      case 'ended': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown size={20} color="#FFD700" />;
      case 2: return <Medal size={20} color="#C0C0C0" />;
      case 3: return <Award size={20} color="#CD7F32" />;
      default: return <Text style={styles.rankNumber}>{rank}</Text>;
    }
  };

  const formatTimeRemaining = (endDate: Date) => {
    const now = new Date();
    const diffInMs = endDate.getTime() - now.getTime();
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays > 0) {
      return `${diffInDays} days left`;
    } else {
      return 'Contest ended';
    }
  };

  const handleContestPress = (contest: Contest) => {
    setSelectedContest(contest);
    setShowDetailModal(true);
  };

  const handleJoinContest = (contestId: string) => {
    animationValue.value = withSpring(1.1, { duration: 200 }, () => {
      animationValue.value = withSpring(1, { duration: 200 });
    });
    // Handle contest joining logic
  };

  const showLeaderboard = (contest: Contest) => {
    setSelectedContest(contest);
    setShowLeaderboardModal(true);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: animationValue.value }],
  }));

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Contests</Text>
        <View style={styles.headerStats}>
          <Text style={styles.headerStatsText}>3 Active</Text>
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
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'ended' && styles.activeTab]}
          onPress={() => setActiveTab('ended')}
        >
          <Text style={[styles.tabText, activeTab === 'ended' && styles.activeTabText]}>
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contests List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.contestsContainer}>
          {filteredContests.map((contest) => (
            <Animated.View key={contest.id} style={animatedStyle}>
              <TouchableOpacity
                style={styles.contestCard}
                onPress={() => handleContestPress(contest)}
              >
                <View style={styles.contestHeader}>
                  <View style={styles.contestTitleRow}>
                    <Trophy size={24} color={getStatusColor(contest.status)} />
                    <View style={styles.contestTitleContainer}>
                      <Text style={styles.contestTitle}>{contest.title}</Text>
                      <View style={styles.contestBadges}>
                        <View style={[styles.badge, { backgroundColor: getDifficultyColor(contest.difficulty) }]}>
                          <Text style={styles.badgeText}>{contest.difficulty}</Text>
                        </View>
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>{contest.category}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  {contest.isJoined && (
                    <View style={styles.joinedBadge}>
                      <Text style={styles.joinedText}>Joined</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.contestDescription}>{contest.description}</Text>

                <View style={styles.contestStats}>
                  <View style={styles.contestStat}>
                    <Calendar size={16} color="#6B7280" />
                    <Text style={styles.contestStatText}>{contest.durationDays} days</Text>
                  </View>
                  <View style={styles.contestStat}>
                    <Users size={16} color="#6B7280" />
                    <Text style={styles.contestStatText}>
                      {contest.participants}/{contest.maxParticipants}
                    </Text>
                  </View>
                  <View style={styles.contestStat}>
                    <Clock size={16} color="#6B7280" />
                    <Text style={styles.contestStatText}>{formatTimeRemaining(contest.endDate)}</Text>
                  </View>
                </View>

                <View style={styles.contestFooter}>
                  <View style={styles.prizeInfo}>
                    <Zap size={16} color="#F97316" />
                    <Text style={styles.entryCostText}>Entry: {contest.entryCost} FP</Text>
                    <Text style={styles.prizePoolText}>Prize: {contest.prizePool} FP</Text>
                  </View>
                  
                  <View style={styles.contestActions}>
                    {contest.leaderboard && contest.isJoined && (
                      <TouchableOpacity
                        style={styles.leaderboardButton}
                        onPress={() => showLeaderboard(contest)}
                      >
                        <Star size={16} color="#3B82F6" />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity style={styles.chatButton}>
                      <MessageCircle size={16} color="#6B7280" />
                    </TouchableOpacity>
                  </View>
                </View>

                {contest.isJoined && contest.verificationCount !== undefined && (
                  <View style={styles.progressBar}>
                    <View style={styles.progressBarBackground}>
                      <View 
                        style={[
                          styles.progressBarFill, 
                          { width: `${Math.min((contest.verificationCount / contest.durationDays) * 100, 100)}%` }
                        ]} 
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {contest.verificationCount}/{contest.durationDays} verifications
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Contest Detail Modal */}
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
            <Text style={styles.modalTitle}>Contest Details</Text>
            <View style={styles.modalPlaceholder} />
          </View>

          {selectedContest && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.contestDetailHeader}>
                <Trophy size={32} color={getStatusColor(selectedContest.status)} />
                <Text style={styles.contestDetailTitle}>{selectedContest.title}</Text>
                <View style={styles.contestDetailBadges}>
                  <View style={[styles.badge, { backgroundColor: getDifficultyColor(selectedContest.difficulty) }]}>
                    <Text style={styles.badgeText}>{selectedContest.difficulty}</Text>
                  </View>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{selectedContest.category}</Text>
                  </View>
                </View>
              </View>

              <Text style={styles.contestDetailDescription}>{selectedContest.description}</Text>

              <View style={styles.contestDetailStats}>
                <View style={styles.detailStatCard}>
                  <Calendar size={20} color="#3B82F6" />
                  <Text style={styles.detailStatValue}>{selectedContest.durationDays}</Text>
                  <Text style={styles.detailStatLabel}>Days</Text>
                </View>
                <View style={styles.detailStatCard}>
                  <Users size={20} color="#10B981" />
                  <Text style={styles.detailStatValue}>{selectedContest.participants}</Text>
                  <Text style={styles.detailStatLabel}>Participants</Text>
                </View>
                <View style={styles.detailStatCard}>
                  <Zap size={20} color="#F97316" />
                  <Text style={styles.detailStatValue}>{selectedContest.entryCost}</Text>
                  <Text style={styles.detailStatLabel}>Entry Cost</Text>
                </View>
                <View style={styles.detailStatCard}>
                  <Trophy size={20} color="#F59E0B" />
                  <Text style={styles.detailStatValue}>{selectedContest.prizePool}</Text>
                  <Text style={styles.detailStatLabel}>Prize Pool</Text>
                </View>
              </View>

              {!selectedContest.isJoined && selectedContest.status !== 'ended' && (
                <TouchableOpacity
                  style={styles.joinButton}
                  onPress={() => handleJoinContest(selectedContest.id)}
                >
                  <Text style={styles.joinButtonText}>Join Contest ({selectedContest.entryCost} FP)</Text>
                </TouchableOpacity>
              )}

              {selectedContest.isJoined && (
                <View style={styles.joinedSection}>
                  <Text style={styles.joinedSectionTitle}>You're In!</Text>
                  <Text style={styles.joinedSectionText}>
                    Keep completing daily activities and submit verification photos to climb the leaderboard.
                  </Text>
                  <TouchableOpacity style={styles.verificationButton}>
                    <Camera size={20} color="#FFFFFF" />
                    <Text style={styles.verificationButtonText}>Submit Verification</Text>
                  </TouchableOpacity>
                </View>
              )}

              {selectedContest.leaderboard && (
                <TouchableOpacity
                  style={styles.viewLeaderboardButton}
                  onPress={() => showLeaderboard(selectedContest)}
                >
                  <Star size={20} color="#3B82F6" />
                  <Text style={styles.viewLeaderboardText}>View Leaderboard</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

      {/* Leaderboard Modal */}
      <Modal
        visible={showLeaderboardModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowLeaderboardModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowLeaderboardModal(false)}
            >
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Leaderboard</Text>
            <View style={styles.modalPlaceholder} />
          </View>

          {selectedContest?.leaderboard && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.leaderboardContainer}>
                {selectedContest.leaderboard.map((entry) => (
                  <View
                    key={entry.userId}
                    style={[
                      styles.leaderboardEntry,
                      entry.isCurrentUser && styles.currentUserEntry
                    ]}
                  >
                    <View style={styles.leaderboardRank}>
                      {getRankIcon(entry.rank)}
                    </View>
                    <View style={styles.leaderboardUser}>
                      <Text style={[
                        styles.leaderboardUsername,
                        entry.isCurrentUser && styles.currentUserText
                      ]}>
                        {entry.username}
                      </Text>
                      <Text style={styles.leaderboardVerifications}>
                        {entry.verifications} verifications
                      </Text>
                    </View>
                    <Text style={[
                      styles.leaderboardScore,
                      entry.isCurrentUser && styles.currentUserText
                    ]}>
                      {entry.score} FP
                    </Text>
                  </View>
                ))}
              </View>
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
  contestsContainer: {
    paddingHorizontal: 20,
  },
  contestCard: {
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
  contestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  contestTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  contestTitleContainer: {
    marginLeft: 12,
    flex: 1,
  },
  contestTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  contestBadges: {
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
  joinedBadge: {
    backgroundColor: '#4ADE80',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  joinedText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  contestDescription: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 16,
    lineHeight: 20,
  },
  contestStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  contestStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contestStatText: {
    fontSize: 14,
    color: '#94A3B8',
    marginLeft: 4,
    fontWeight: '500',
  },
  contestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prizeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  entryCostText: {
    fontSize: 12,
    color: '#94A3B8',
    marginLeft: 4,
    marginRight: 12,
  },
  prizePoolText: {
    fontSize: 12,
    color: '#4ADE80',
    fontWeight: '600',
  },
  contestActions: {
    flexDirection: 'row',
  },
  leaderboardButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E3A8A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  chatButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBar: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: '#334155',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressBarFill: {
    height: 4,
    backgroundColor: '#4ADE80',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#94A3B8',
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
  contestDetailHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  contestDetailTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginTop: 12,
    marginBottom: 12,
    textAlign: 'center',
  },
  contestDetailBadges: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  contestDetailDescription: {
    fontSize: 16,
    color: '#94A3B8',
    lineHeight: 24,
    marginBottom: 32,
    textAlign: 'center',
  },
  contestDetailStats: {
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginTop: 8,
    marginBottom: 4,
  },
  detailStatLabel: {
    fontSize: 14,
    color: '#94A3B8',
  },
  joinButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  joinedSection: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#4ADE80',
  },
  joinedSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4ADE80',
    marginBottom: 8,
  },
  joinedSectionText: {
    fontSize: 14,
    color: '#4ADE80',
    marginBottom: 16,
    lineHeight: 20,
  },
  verificationButton: {
    backgroundColor: '#4ADE80',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verificationButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  viewLeaderboardButton: {
    backgroundColor: '#1E3A8A',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#60A5FA',
  },
  viewLeaderboardText: {
    color: '#60A5FA',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  leaderboardContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
  },
  leaderboardEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  currentUserEntry: {
    backgroundColor: '#0F2A1A',
  },
  leaderboardRank: {
    width: 40,
    alignItems: 'center',
    marginRight: 16,
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#94A3B8',
  },
  leaderboardUser: {
    flex: 1,
  },
  leaderboardUsername: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 2,
  },
  currentUserText: {
    color: '#4ADE80',
  },
  leaderboardVerifications: {
    fontSize: 12,
    color: '#94A3B8',
  },
  leaderboardScore: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  bottomPadding: {
    height: 20,
  },
});