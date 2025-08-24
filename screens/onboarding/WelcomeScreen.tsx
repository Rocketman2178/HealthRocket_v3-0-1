import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Rocket, Zap, Target, Heart } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export default function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  const rocketScale = useSharedValue(1);
  const pulseScale = useSharedValue(1);

  React.useEffect(() => {
    // Rocket floating animation
    rocketScale.value = withRepeat(
      withSequence(
        withSpring(1.1, { duration: 2000 }),
        withSpring(1, { duration: 2000 })
      ),
      -1,
      true
    );

    // Pulse animation for icons
    pulseScale.value = withRepeat(
      withSequence(
        withSpring(1.2, { duration: 1500 }),
        withSpring(1, { duration: 1500 })
      ),
      -1,
      true
    );
  }, []);

  const rocketAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rocketScale.value }],
  }));

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0F172A', '#1E293B', '#334155']}
        style={styles.gradient}
      >
        {/* Background Elements */}
        <View style={styles.backgroundElements}>
          <Animated.View style={[styles.floatingIcon, styles.icon1, pulseAnimatedStyle]}>
            <Zap size={24} color="#FF6B35" />
          </Animated.View>
          <Animated.View style={[styles.floatingIcon, styles.icon2, pulseAnimatedStyle]}>
            <Target size={20} color="#4ADE80" />
          </Animated.View>
          <Animated.View style={[styles.floatingIcon, styles.icon3, pulseAnimatedStyle]}>
            <Heart size={22} color="#EF4444" />
          </Animated.View>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <Animated.View style={[styles.rocketContainer, rocketAnimatedStyle]}>
              <LinearGradient
                colors={['#FF6B35', '#FF8A65']}
                style={styles.rocketBackground}
              >
                <Rocket size={48} color="#FFFFFF" />
              </LinearGradient>
            </Animated.View>
            
            <Text style={styles.appName}>Health Rocket</Text>
            <Text style={styles.version}>V3.0</Text>
          </View>

          {/* Mission Statement */}
          <View style={styles.missionSection}>
            <Text style={styles.missionTitle}>
              Fuel Your Health Journey
            </Text>
            <Text style={styles.missionText}>
              Transform your health with gamified challenges, personalized insights, 
              and a supportive community. Earn Fuel Points, unlock achievements, 
              and optimize your healthspan.
            </Text>
          </View>

          {/* Features Preview */}
          <View style={styles.featuresSection}>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Zap size={20} color="#FF6B35" />
              </View>
              <Text style={styles.featureText}>Earn Fuel Points</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Target size={20} color="#4ADE80" />
              </View>
              <Text style={styles.featureText}>Complete Challenges</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Heart size={20} color="#EF4444" />
              </View>
              <Text style={styles.featureText}>Optimize Health</Text>
            </View>
          </View>
        </View>

        {/* Get Started Button */}
        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={onGetStarted}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#FF6B35', '#FF8A65']}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Get Started</Text>
              <Rocket size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
          
          <Text style={styles.tagline}>
            Ready to launch your health transformation?
          </Text>
        </View>
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
  backgroundElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  floatingIcon: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon1: {
    top: height * 0.15,
    right: width * 0.1,
  },
  icon2: {
    top: height * 0.3,
    left: width * 0.1,
  },
  icon3: {
    top: height * 0.6,
    right: width * 0.15,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  rocketContainer: {
    marginBottom: 24,
  },
  rocketBackground: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 4,
    textAlign: 'center',
  },
  version: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: '600',
  },
  missionSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  missionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: 16,
  },
  missionText: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  featuresSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 12,
    color: '#CBD5E1',
    textAlign: 'center',
    fontWeight: '500',
  },
  buttonSection: {
    paddingHorizontal: 32,
    paddingBottom: 48,
    alignItems: 'center',
  },
  getStartedButton: {
    width: '100%',
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 8,
  },
  tagline: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});