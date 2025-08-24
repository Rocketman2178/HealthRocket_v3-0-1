import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { CircleCheck as CheckCircle, CircleAlert as AlertCircle, Info, Users, Crown } from 'lucide-react-native';
import { validateLaunchCode } from '../../utils/launchCodeValidator';

interface LaunchCodeInputProps {
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
}

interface LaunchCodeInfo {
  valid: boolean;
  communityName?: string;
  planName?: string;
  error?: string;
}

export default function LaunchCodeInput({ value, onChangeText, error }: LaunchCodeInputProps) {
  const [codeInfo, setCodeInfo] = useState<LaunchCodeInfo | null>(null);
  const [validating, setValidating] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    const validateCode = async () => {
      if (!value.trim()) {
        setCodeInfo(null);
        return;
      }

      if (value.length < 3) {
        return;
      }

      setValidating(true);
      try {
        const result = await validateLaunchCode(value.trim());
        setCodeInfo(result);
      } catch (err) {
        setCodeInfo({
          valid: false,
          error: 'Unable to validate code'
        });
      } finally {
        setValidating(false);
      }
    };

    const debounceTimer = setTimeout(validateCode, 500);
    return () => clearTimeout(debounceTimer);
  }, [value]);

  const handleTextChange = (text: string) => {
    // Auto-uppercase and remove spaces
    const formattedText = text.toUpperCase().replace(/\s/g, '');
    onChangeText(formattedText);
  };

  const getStatusIcon = () => {
    if (validating) {
      return <View style={styles.loadingDot} />;
    }
    
    if (codeInfo?.valid) {
      return <CheckCircle size={20} color="#10B981" />;
    }
    
    if (codeInfo && !codeInfo.valid) {
      return <AlertCircle size={20} color="#EF4444" />;
    }
    
    return null;
  };

  const getPlanIcon = (planName?: string) => {
    if (planName?.toLowerCase().includes('founder')) {
      return <Crown size={16} color="#F59E0B" />;
    }
    return <Users size={16} color="#3B82F6" />;
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>Launch Code</Text>
        <TouchableOpacity
          style={styles.infoButton}
          onPress={() => setShowInfo(!showInfo)}
        >
          <Info size={16} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      {showInfo && (
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            Launch codes provide access to Health Rocket and may include special perks like:
          </Text>
          <Text style={styles.infoBullet}>• Community access</Text>
          <Text style={styles.infoBullet}>• Premium features</Text>
          <Text style={styles.infoBullet}>• Bonus Fuel Points</Text>
          <Text style={styles.infoNote}>
            Don't have a code? You can still create an account with basic access.
          </Text>
        </View>
      )}

      <View style={[
        styles.inputContainer,
        error && styles.inputContainerError,
        codeInfo?.valid && styles.inputContainerValid
      ]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={handleTextChange}
          placeholder="Enter launch code (optional)"
          placeholderTextColor="#64748B"
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={20}
        />
        <View style={styles.statusIcon}>
          {getStatusIcon()}
        </View>
      </View>

      {/* Validation Results */}
      {codeInfo && (
        <View style={styles.resultContainer}>
          {codeInfo.valid ? (
            <View style={styles.validResult}>
              <CheckCircle size={16} color="#10B981" />
              <View style={styles.resultContent}>
                <Text style={styles.validText}>Valid launch code!</Text>
                {codeInfo.communityName && (
                  <View style={styles.communityInfo}>
                    <Users size={14} color="#3B82F6" />
                    <Text style={styles.communityText}>
                      Community: {codeInfo.communityName}
                    </Text>
                  </View>
                )}
                {codeInfo.planName && (
                  <View style={styles.planInfo}>
                    {getPlanIcon(codeInfo.planName)}
                    <Text style={styles.planText}>
                      Plan: {codeInfo.planName}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ) : (
            <View style={styles.invalidResult}>
              <AlertCircle size={16} color="#EF4444" />
              <Text style={styles.invalidText}>
                {codeInfo.error || 'Invalid launch code'}
              </Text>
            </View>
          )}
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <AlertCircle size={14} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 4,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F8FAFC',
    flex: 1,
  },
  infoButton: {
    padding: 4,
  },
  infoCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  infoText: {
    fontSize: 12,
    color: '#93C5FD',
    marginBottom: 8,
  },
  infoBullet: {
    fontSize: 12,
    color: '#93C5FD',
    marginLeft: 8,
    marginBottom: 2,
  },
  infoNote: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 8,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 16,
    minHeight: 52,
  },
  inputContainerError: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  inputContainerValid: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#F8FAFC',
    paddingVertical: 16,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 1,
  },
  statusIcon: {
    marginLeft: 12,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#94A3B8',
  },
  resultContainer: {
    marginTop: 8,
  },
  validResult: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  resultContent: {
    marginLeft: 8,
    flex: 1,
  },
  validText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 4,
  },
  communityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  communityText: {
    fontSize: 12,
    color: '#3B82F6',
    marginLeft: 4,
    fontWeight: '500',
  },
  planInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planText: {
    fontSize: 12,
    color: '#F59E0B',
    marginLeft: 4,
    fontWeight: '500',
  },
  invalidResult: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  invalidText: {
    fontSize: 12,
    color: '#EF4444',
    marginLeft: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginLeft: 4,
    flex: 1,
  },
});