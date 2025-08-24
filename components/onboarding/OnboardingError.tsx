import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { AlertTriangle, RefreshCw, MessageCircle, Wifi, WifiOff } from 'lucide-react-native';
import NetInfo from '@react-native-community/netinfo';

interface OnboardingErrorProps {
  error: string;
  onRetry?: () => void;
  onContactSupport?: () => void;
  showNetworkStatus?: boolean;
}

export default function OnboardingError({ 
  error, 
  onRetry, 
  onContactSupport,
  showNetworkStatus = true 
}: OnboardingErrorProps) {
  const [isConnected, setIsConnected] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    if (showNetworkStatus) {
      const unsubscribe = NetInfo.addEventListener(state => {
        setIsConnected(state.isConnected);
      });

      return unsubscribe;
    }
  }, [showNetworkStatus]);

  const handleContactSupport = () => {
    if (onContactSupport) {
      onContactSupport();
    } else {
      Alert.alert(
        'Contact Support',
        'Please email us at support@healthrocket.app or reach out through our community chat.',
        [
          { text: 'OK', style: 'default' }
        ]
      );
    }
  };

  const getErrorType = (errorMessage: string) => {
    const lowerError = errorMessage.toLowerCase();
    
    if (lowerError.includes('network') || lowerError.includes('connection')) {
      return 'network';
    }
    if (lowerError.includes('invalid') || lowerError.includes('credentials')) {
      return 'auth';
    }
    if (lowerError.includes('email') || lowerError.includes('password')) {
      return 'validation';
    }
    
    return 'general';
  };

  const getErrorIcon = (type: string) => {
    switch (type) {
      case 'network':
        return <WifiOff size={32} color="#EF4444" />;
      case 'auth':
      case 'validation':
        return <AlertTriangle size={32} color="#F59E0B" />;
      default:
        return <AlertTriangle size={32} color="#EF4444" />;
    }
  };

  const getErrorTitle = (type: string) => {
    switch (type) {
      case 'network':
        return 'Connection Problem';
      case 'auth':
        return 'Authentication Error';
      case 'validation':
        return 'Validation Error';
      default:
        return 'Something Went Wrong';
    }
  };

  const getErrorSuggestion = (type: string) => {
    switch (type) {
      case 'network':
        return 'Please check your internet connection and try again.';
      case 'auth':
        return 'Please check your credentials and try again.';
      case 'validation':
        return 'Please check your input and try again.';
      default:
        return 'We encountered an unexpected error. Please try again or contact support if the problem persists.';
    }
  };

  const errorType = getErrorType(error);

  return (
    <View style={styles.container}>
      <View style={styles.errorCard}>
        {/* Error Icon */}
        <View style={styles.iconContainer}>
          {getErrorIcon(errorType)}
        </View>

        {/* Error Content */}
        <View style={styles.content}>
          <Text style={styles.title}>{getErrorTitle(errorType)}</Text>
          <Text style={styles.message}>{error}</Text>
          <Text style={styles.suggestion}>{getErrorSuggestion(errorType)}</Text>
        </View>

        {/* Network Status */}
        {showNetworkStatus && isConnected !== null && (
          <View style={styles.networkStatus}>
            <View style={styles.networkIndicator}>
              {isConnected ? (
                <Wifi size={16} color="#10B981" />
              ) : (
                <WifiOff size={16} color="#EF4444" />
              )}
              <Text style={[
                styles.networkText,
                { color: isConnected ? '#10B981' : '#EF4444' }
              ]}>
                {isConnected ? 'Connected' : 'No Internet Connection'}
              </Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          {onRetry && (
            <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
              <RefreshCw size={18} color="#FFFFFF" />
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.supportButton} onPress={handleContactSupport}>
            <MessageCircle size={18} color="#FF6B35" />
            <Text style={styles.supportButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  errorCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  content: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#EF4444',
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 20,
  },
  suggestion: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
  },
  networkStatus: {
    width: '100%',
    marginBottom: 20,
  },
  networkIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#334155',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  networkText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  supportButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
    marginLeft: 8,
  },
});