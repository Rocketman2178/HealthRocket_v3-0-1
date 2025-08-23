import React, { createContext, useContext, useState, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, SafeAreaView } from 'react-native';
import { TestTube, X, Settings } from 'lucide-react-native';
import TestingDashboard from '@/screens/TestingDashboard';

interface TestingModeContextType {
  isTestingMode: boolean;
  toggleTestingMode: () => void;
  showTestingDashboard: boolean;
  setShowTestingDashboard: (show: boolean) => void;
}

const TestingModeContext = createContext<TestingModeContextType | undefined>(undefined);

export const useTestingMode = () => {
  const context = useContext(TestingModeContext);
  if (!context) {
    throw new Error('useTestingMode must be used within TestingModeProvider');
  }
  return context;
};

interface TestingModeProviderProps {
  children: ReactNode;
}

export default function TestingModeProvider({ children }: TestingModeProviderProps) {
  const [isTestingMode, setIsTestingMode] = useState(__DEV__); // Enable in development by default
  const [showTestingDashboard, setShowTestingDashboard] = useState(false);

  const toggleTestingMode = () => {
    setIsTestingMode(!isTestingMode);
    if (!isTestingMode) {
      setShowTestingDashboard(false);
    }
  };

  return (
    <TestingModeContext.Provider
      value={{
        isTestingMode,
        toggleTestingMode,
        showTestingDashboard,
        setShowTestingDashboard,
      }}
    >
      {children}
      
      {/* Testing Mode Toggle Button */}
      {isTestingMode && (
        <View style={styles.testingModeOverlay}>
          <TouchableOpacity
            style={styles.testingToggle}
            onPress={() => setShowTestingDashboard(true)}
          >
            <TestTube size={20} color="#FFFFFF" />
            <Text style={styles.testingToggleText}>Tests</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Testing Dashboard Modal */}
      <Modal
        visible={showTestingDashboard}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowTestingDashboard(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowTestingDashboard(false)}
            >
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Testing Dashboard</Text>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={toggleTestingMode}
            >
              <Settings size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <TestingDashboard />
        </SafeAreaView>
      </Modal>
    </TestingModeContext.Provider>
  );
}

const styles = StyleSheet.create({
  testingModeOverlay: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1000,
  },
  testingToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B35',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  testingToggleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
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
  closeButton: {
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
  settingsButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
});