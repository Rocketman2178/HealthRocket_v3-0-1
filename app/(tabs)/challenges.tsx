import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import {
  Target,
  Clock,
  Zap,
  Camera,
  Check,
  Plus,
  Star,
  Users,
  Calendar,
  X,
  Send,
} from 'lucide-react-native';
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
} from 'react-native-reanimated';

interface Challenge {
  id: string;
  title: string;
  description: string;
  fpReward: number;
  tier: 'bronze' | 'silver' | 'gold' | 'diamond';
  isDaily: boolean;
  completedToday?: boolean;
  totalCompletions: number;
  estimatedTime: string;
  category: string;
  participants: number;
  verificationRequired: boolean;
}

interface UserChallenge {
  id: string;
  challengeId: string;
  status: 'active' | 'completed' | 'failed';
  completedAt?: Date;
  verificationPhoto?: string;
}

export default function Challenges() {
  const [activeTab, setActiveTab] = useState<'daily' | 'custom' | 'completed'>('daily');
  const [challenges, setChallenges] = useState<Challenge[]>([
    {
      id: '1',
      title: '10,000 Steps',
      description: 'Walk or run 10,000 steps today',
      fpReward: 10,
      tier: 'bronze',
      isDaily: true,
      completedToday: false,
      totalCompletions: 12,
      estimatedTime: '60-90 min',
      category: 'Movement',
      participants: 1247,
      verificationRequired: true,
    },
    {
      id: '2',
      title: 'Meditation Session',
      description: 'Complete 10 minutes of meditation',
      fpReward: 8,
      tier: 'bronze',
      isDaily: true,
      completedToday: true,
      totalCompletions: 8,
      estimatedTime: '10 min',
      category: 'Mindfulness',
      participants: 892,
      verificationRequired: false,
    },
    {
      id: '3',
      title: 'Healthy Meal Prep',
      description: 'Prepare a nutritious meal from scratch',
      fpReward: 15,
      tier: 'silver',
      isDaily: true,
      completedToday: false,
      totalCompletions: 5,
      estimatedTime: '45 min',
      category: 'Nutrition',
      participants: 634,
      verificationRequired: true,
    },
    {
      id: '4',
      title: 'Cold Shower Challenge',
      description: 'Take a cold shower for 2+ minutes',
      fpReward: 20,
      tier: 'gold',
      isDaily: false,
      totalCompletions: 3,
      estimatedTime: '5 min',
      category: 'Resilience',
      participants: 423,
      verificationRequired: true,
    },
    {
      id: '5',
      title: '5K Run',
      description: 'Complete a 5-kilometer run',
      fpReward: 50,
      tier: 'diamond',
      isDaily: false,
      totalCompletions: 2,
      estimatedTime: '30-45 min',
      category: 'Endurance',
      participants: 289,
      verificationRequired: true,
    },
  ]);

  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [verificationNote, setVerificationNote] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const animationValue = useSharedValue(1);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return '#CD7F32';
      case 'silver': return '#C0C0C0';
      case 'gold': return '#FFD700';
      case 'diamond': return '#B9F2FF';
      default: return '#6B7280';
    }
  };

  const getTierIcon = (tier: string) => {
    return <Star size={16} color={getTierColor(tier)} />;
  };

  const handleChallengePress = (challenge: Challenge) => {
    if (challenge.completedToday) return;
    
    if (challenge.verificationRequired) {
      setSelectedChallenge(challenge);
      setShowVerificationModal(true);
    } else {
      completeChallenge(challenge);
    }
  };

  const completeChallenge = (challenge: Challenge) => {
    animationValue.value = withSpring(1.2, { duration: 300 }, () => {
      animationValue.value = withSpring(1, { duration: 300 });
    });

    setChallenges(prev =>
      prev.map(c =>
        c.id === challenge.id
          ? { ...c, completedToday: true, totalCompletions: c.totalCompletions + 1 }
          : c
      )
    );

    setUserChallenges(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        challengeId: challenge.id,
        status: 'completed',
        completedAt: new Date(),
      }
    ]);
  };

  const handleVerificationSubmit = () => {
    if (selectedChallenge) {
      completeChallenge(selectedChallenge);
      setShowVerificationModal(false);
      setSelectedChallenge(null);
      setVerificationNote('');
    }
  };

  const filteredChallenges = challenges.filter(challenge => {
    switch (activeTab) {
      case 'daily':
        return challenge.isDaily;
      case 'custom':
        return !challenge.isDaily;
      case 'completed':
        return challenge.completedToday;
      default:
        return true;
    }
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: animationValue.value }],
  }));

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Challenges</Text>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'daily' && styles.activeTab]}
          onPress={() => setActiveTab('daily')}
        >
          <Text style={[styles.tabText, activeTab === 'daily' && styles.activeTabText]}>
            Daily
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'custom' && styles.activeTab]}
          onPress={() => setActiveTab('custom')}
        >
          <Text style={[styles.tabText, activeTab === 'custom' && styles.activeTabText]}>
            Custom
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

      {/* Challenges List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.challengesContainer}>
          {filteredChallenges.map((challenge) => (
            <Animated.View key={challenge.id} style={animatedStyle}>
              <TouchableOpacity
                style={[
                  styles.challengeCard,
                  challenge.completedToday && styles.challengeCardCompleted
                ]}
                onPress={() => handleChallengePress(challenge)}
                disabled={challenge.completedToday}
              >
                <View style={styles.challengeHeader}>
                  <View style={styles.challengeTitleRow}>
                    {getTierIcon(challenge.tier)}
                    <Text style={[
                      styles.challengeTitle,
                      challenge.completedToday && styles.challengeTitleCompleted
                    ]}>
                      {challenge.title}
                    </Text>
                    {challenge.completedToday && (
                      <Check size={20} color="#10B981" />
                    )}
                  </View>
                  <Text style={styles.challengeCategory}>{challenge.category}</Text>
                </View>

                <Text style={[
                  styles.challengeDescription,
                  challenge.completedToday && styles.challengeDescriptionCompleted
                ]}>
                  {challenge.description}
                </Text>

                <View style={styles.challengeDetails}>
                  <View style={styles.challengeDetail}>
                    <Zap size={16} color="#F97316" />
                    <Text style={styles.challengeDetailText}>+{challenge.fpReward} FP</Text>
                  </View>
                  <View style={styles.challengeDetail}>
                    <Clock size={16} color="#6B7280" />
                    <Text style={styles.challengeDetailText}>{challenge.estimatedTime}</Text>
                  </View>
                  <View style={styles.challengeDetail}>
                    <Users size={16} color="#6B7280" />
                    <Text style={styles.challengeDetailText}>{challenge.participants}</Text>
                  </View>
                </View>

                <View style={styles.challengeFooter}>
                  <Text style={styles.completionCount}>
                    Completed {challenge.totalCompletions} times
                  </Text>
                  {challenge.verificationRequired && (
                    <View style={styles.verificationBadge}>
                      <Camera size={12} color="#3B82F6" />
                      <Text style={styles.verificationText}>Verification Required</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Verification Modal */}
      <Modal
        visible={showVerificationModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowVerificationModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowVerificationModal(false)}
            >
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Complete Challenge</Text>
            <TouchableOpacity
              style={styles.modalSubmitButton}
              onPress={handleVerificationSubmit}
            >
              <Send size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {selectedChallenge && (
            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalChallengeTitle}>{selectedChallenge.title}</Text>
              <Text style={styles.modalChallengeDescription}>
                {selectedChallenge.description}
              </Text>

              <View style={styles.photoSection}>
                <Text style={styles.sectionLabel}>Verification Photo</Text>
                <TouchableOpacity style={styles.photoButton}>
                  <Camera size={32} color="#6B7280" />
                  <Text style={styles.photoButtonText}>Take Photo</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.noteSection}>
                <Text style={styles.sectionLabel}>Optional Note</Text>
                <TextInput
                  style={styles.noteInput}
                  placeholder="Add a note about your experience..."
                  value={verificationNote}
                  onChangeText={setVerificationNote}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.rewardSection}>
                <View style={styles.rewardBox}>
                  <Zap size={24} color="#F97316" />
                  <Text style={styles.rewardText}>
                    You'll earn {selectedChallenge.fpReward} Fuel Points
                  </Text>
                </View>
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

      {/* Create Challenge Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowCreateModal(false)}
            >
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Challenge</Text>
            <TouchableOpacity style={styles.modalSubmitButton}>
              <Text style={styles.modalSubmitText}>Create</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.createDescription}>
              Create a custom challenge for yourself or share with the community
            </Text>
            {/* Create challenge form would go here */}
            <View style={styles.comingSoonContainer}>
              <Text style={styles.comingSoonText}>Coming Soon</Text>
              <Text style={styles.comingSoonDescription}>
                Custom challenge creation will be available in the next update!
              </Text>
            </View>
          </ScrollView>
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
  createButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
  challengesContainer: {
    paddingHorizontal: 20,
  },
  challengeCard: {
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
  challengeCardCompleted: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#4ADE80',
  },
  challengeHeader: {
    marginBottom: 12,
  },
  challengeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F8FAFC',
    marginLeft: 8,
    flex: 1,
  },
  challengeTitleCompleted: {
    color: '#4ADE80',
  },
  challengeCategory: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  challengeDescription: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 16,
    lineHeight: 20,
  },
  challengeDescriptionCompleted: {
    color: '#4ADE80',
  },
  challengeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  challengeDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  challengeDetailText: {
    fontSize: 14,
    color: '#94A3B8',
    marginLeft: 4,
    fontWeight: '500',
  },
  challengeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  completionCount: {
    fontSize: 12,
    color: '#94A3B8',
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verificationText: {
    fontSize: 10,
    color: '#60A5FA',
    fontWeight: '500',
    marginLeft: 4,
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
  modalSubmitButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSubmitText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalChallengeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  modalChallengeDescription: {
    fontSize: 16,
    color: '#94A3B8',
    lineHeight: 24,
    marginBottom: 32,
  },
  photoSection: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 12,
  },
  photoButton: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#334155',
    borderStyle: 'dashed',
  },
  photoButtonText: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '500',
    marginTop: 8,
  },
  noteSection: {
    marginBottom: 32,
  },
  noteInput: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#334155',
    color: '#F8FAFC',
    textAlignVertical: 'top',
  },
  rewardSection: {
    marginBottom: 32,
  },
  rewardBox: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  rewardText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
    marginLeft: 12,
  },
  createDescription: {
    fontSize: 16,
    color: '#94A3B8',
    marginBottom: 32,
    textAlign: 'center',
  },
  comingSoonContainer: {
    alignItems: 'center',
    padding: 40,
  },
  comingSoonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#94A3B8',
    marginBottom: 8,
  },
  comingSoonDescription: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
  bottomPadding: {
    height: 20,
  },
});