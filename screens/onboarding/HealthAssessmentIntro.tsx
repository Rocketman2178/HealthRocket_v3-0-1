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
import { Activity, Brain, Moon, Utensils, Zap, Shield, TrendingUp, Award } from 'lucide-react-native';

interface HealthAssessmentIntroProps {
  onStartAssessment: () => void;
  onSkip: () => void;
}

export default function HealthAssessmentIntro({ onStartAssessment, onSkip }: HealthAssessmentIntroProps) {
  const assessmentAreas = [
    {
      icon: Brain,
      title: 'Mindset & Mental Health',
      description: 'Stress levels, mental clarity, and emotional wellbeing',
      color: '#8B5CF6',
    },
    {
      icon: Moon,
      title: 'Sleep Quality',
      description: 'Sleep duration, quality, and recovery patterns',
      color: '#3B82F6',
    },
    {
      icon: Activity,
      title: 'Physical Activity',
      description: 'Exercise frequency, intensity, and movement habits',
      color: '#10B981',
    },
    {
      icon: Utensils,
      title: 'Nutrition',
      description: 'Diet quality, eating patterns, and nutritional habits',
      color: '#F59E0B',
    },
    {
      icon: Zap,
      title: 'Biohacking & Optimization',
      description: 'Advanced health practices and optimization techniques',
      color: '#EF4444',
    },
  ];

  const benefits = [
    {
      icon: TrendingUp,
      title: 'Personalized Insights',
      description: 'Get tailored recommendations based on your unique health profile',
    },
    {
      icon: Shield,
      title: 'Track Progress',
      description: 'Monitor improvements across all areas of your health journey',
    },
    {
      icon: Award,
      title: 'Earn Rewards',
      description: 'Complete your assessment and earn 100 Fuel Points',
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
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Activity size={48} color="#FF6B35" />
            </View>
            <Text style={styles.headerTitle}>Health Assessment</Text>
            <Text style={styles.headerSubtitle}>
              Let's understand your current health status to create a personalized experience
            </Text>
          </View>

          {/* What We'll Assess */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What We'll Assess</Text>
            <Text style={styles.sectionDescription}>
              Our comprehensive assessment covers 5 key areas of health and wellness:
            </Text>
            
            <View style={styles.assessmentAreas}>
              {assessmentAreas.map((area, index) => {
                const IconComponent = area.icon;
                return (
                  <View key={index} style={styles.assessmentArea}>
                    <View style={[styles.areaIcon, { backgroundColor: `${area.color}20` }]}>
                      <IconComponent size={24} color={area.color} />
                    </View>
                    <View style={styles.areaContent}>
                      <Text style={styles.areaTitle}>{area.title}</Text>
                      <Text style={styles.areaDescription}>{area.description}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Benefits */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Why Take the Assessment?</Text>
            
            <View style={styles.benefits}>
              {benefits.map((benefit, index) => {
                const IconComponent = benefit.icon;
                return (
                  <View key={index} style={styles.benefitItem}>
                    <View style={styles.benefitIcon}>
                      <IconComponent size={20} color="#FF6B35" />
                    </View>
                    <View style={styles.benefitContent}>
                      <Text style={styles.benefitTitle}>{benefit.title}</Text>
                      <Text style={styles.benefitDescription}>{benefit.description}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Privacy & Data */}
          <View style={styles.section}>
            <View style={styles.privacyCard}>
              <Shield size={24} color="#10B981" />
              <View style={styles.privacyContent}>
                <Text style={styles.privacyTitle}>Your Privacy Matters</Text>
                <Text style={styles.privacyDescription}>
                  Your health data is encrypted and private. We use it only to personalize 
                  your Health Rocket experience and never share it with third parties.
                </Text>
              </View>
            </View>
          </View>

          {/* Time Estimate */}
          <View style={styles.timeEstimate}>
            <Text style={styles.timeText}>⏱️ Takes about 5-7 minutes</Text>
            <Text style={styles.rewardText}>🎯 Earn 100 Fuel Points upon completion</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionSection}>
            <TouchableOpacity style={styles.startButton} onPress={onStartAssessment}>
              <LinearGradient
                colors={['#FF6B35', '#FF8A65']}
                style={styles.startButtonGradient}
              >
                <Text style={styles.startButtonText}>Start Assessment</Text>
                <Activity size={20} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
              <Text style={styles.skipButtonText}>Skip for Now</Text>
              <Text style={styles.skipNote}>You can take this assessment later in your profile</Text>
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
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  headerSubtitle: {
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
    marginBottom: 20,
    lineHeight: 20,
  },
  assessmentAreas: {
    gap: 16,
  },
  assessmentArea: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#334155',
    borderRadius: 12,
    padding: 16,
  },
  areaIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  areaContent: {
    flex: 1,
  },
  areaTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  areaDescription: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
  },
  benefits: {
    gap: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
  },
  privacyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  privacyContent: {
    marginLeft: 12,
    flex: 1,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 4,
  },
  privacyDescription: {
    fontSize: 14,
    color: '#6EE7B7',
    lineHeight: 20,
  },
  timeEstimate: {
    backgroundColor: '#334155',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  timeText: {
    fontSize: 16,
    color: '#F8FAFC',
    fontWeight: '600',
    marginBottom: 4,
  },
  rewardText: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '500',
  },
  actionSection: {
    gap: 16,
  },
  startButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 8,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  skipButtonText: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '500',
    marginBottom: 4,
  },
  skipNote: {
    fontSize: 12,
    color: '#64748B',
    fontStyle: 'italic',
  },
});