import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import CrossPlatformAlert from '../utils/CrossPlatformAlert';
import CrossPlatformDropdown from '../components/CrossPlatformDropdown';

interface RegisterDeviceScreenProps {
  onBack: () => void;
  onRegisterSuccess: () => void;
}

interface DropdownOption {
  label: string;
  value: string;
}

const RegisterDeviceScreen: React.FC<RegisterDeviceScreenProps> = ({ onBack, onRegisterSuccess }) => {
  const [selectedDealer, setSelectedDealer] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [selectedDeviceType, setSelectedDeviceType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Active');

  const dealerOptions: DropdownOption[] = [
    { label: 'TechSolutions Inc.', value: 'tech-solutions' },
    { label: 'Global Trackers LLC', value: 'global-trackers' },
    { label: 'SmartTrack Solutions', value: 'smarttrack' },
    { label: 'EcoTrack Systems', value: 'ecotrack' },
    { label: 'SafeGuard Monitoring', value: 'safeguard' },
  ];

  const deviceTypeOptions: DropdownOption[] = [
    { label: 'GPS Tracker', value: 'gps-tracker' },
    { label: 'Fleet Monitor', value: 'fleet-monitor' },
    { label: 'Asset Tracker', value: 'asset-tracker' },
    { label: 'Vehicle Tracker', value: 'vehicle-tracker' },
  ];

  const statusOptions: DropdownOption[] = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
  ];

  const isFormValid = selectedDealer && serialNumber.trim().length > 0 && selectedDeviceType;

  const formatSerialNumber = (text: string) => {
    // Remove any non-alphanumeric characters and convert to uppercase
    const cleaned = text.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    
    // Format as ST-XXXXX
    if (cleaned.length <= 2) {
      return cleaned;
    } else if (cleaned.length <= 7) {
      return `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`;
    } else {
      return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 7)}`;
    }
  };

  const handleSerialNumberChange = (text: string) => {
    const formatted = formatSerialNumber(text);
    setSerialNumber(formatted);
  };

  const handleRegisterDevice = () => {
    if (!isFormValid) {
      CrossPlatformAlert.alert(
        'Validation Error',
        'Please fill in all required fields.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    CrossPlatformAlert.alert(
      'Device Registered',
      `Device ${serialNumber} has been successfully registered!`,
      [
        { 
          text: 'OK', 
          style: 'default',
          onPress: onRegisterSuccess
        }
      ]
    );
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    return now.toLocaleDateString('en-US', options);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Register New Device</Text>
              <Text style={styles.headerSubtitle}>Manually register a device into the system</Text>
            </View>
          </View>

          {/* Device Information Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Device Information</Text>
            
            {/* Dealer Dropdown */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Dealer *</Text>
              <CrossPlatformDropdown
                options={dealerOptions}
                selectedValue={selectedDealer}
                onSelect={setSelectedDealer}
                placeholder="Select dealers"
              />
            </View>

            {/* Serial Number */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Serial Number *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter device serial number"
                placeholderTextColor="#6B7280"
                value={serialNumber}
                onChangeText={handleSerialNumberChange}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={8}
              />
              <Text style={styles.inputHint}>Format: ST-XXXXX (must be unique)</Text>
            </View>

            {/* Device Type Dropdown */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Device Type *</Text>
              <CrossPlatformDropdown
                options={deviceTypeOptions}
                selectedValue={selectedDeviceType}
                onSelect={setSelectedDeviceType}
                placeholder="Select device type"
              />
            </View>

            {/* Status Dropdown */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Status *</Text>
              <CrossPlatformDropdown
                options={statusOptions}
                selectedValue={selectedStatus}
                onSelect={setSelectedStatus}
                placeholder="Select status"
              />
            </View>
          </View>

          {/* System Information Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>System Information</Text>
            
            <View style={styles.systemInfoContainer}>
              <View style={styles.systemInfoItem}>
                <Text style={styles.systemInfoLabel}>Created By</Text>
                <Text style={styles.systemInfoValue}>Admin User (admin@company.com)</Text>
              </View>
              
              <View style={styles.systemInfoItem}>
                <Text style={styles.systemInfoLabel}>Created At</Text>
                <Text style={styles.systemInfoValue}>{getCurrentDateTime()}</Text>
              </View>
            </View>
          </View>

          {/* Register Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[
                styles.registerButton, 
                !isFormValid && styles.registerButtonDisabled
              ]} 
              onPress={handleRegisterDevice}
              disabled={!isFormValid}
            >
              <Text style={styles.registerButtonIcon}>+</Text>
              <Text style={[
                styles.registerButtonText,
                !isFormValid && styles.registerButtonTextDisabled
              ]}>
                Register Device
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F2937',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 60, // Consistent with other screens
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  backArrow: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  sectionContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#D1D5DB',
    marginBottom: 8,
    fontWeight: '500',
  },
  textInput: {
    backgroundColor: '#374151',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  inputHint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  systemInfoContainer: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
  },
  systemInfoItem: {
    marginBottom: 12,
  },
  systemInfoLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  systemInfoValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  buttonContainer: {
    marginTop: 24,
    paddingTop: 16,
  },
  registerButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerButtonDisabled: {
    backgroundColor: '#6B7280',
    opacity: 0.6,
  },
  registerButtonIcon: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
    marginRight: 8,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  registerButtonTextDisabled: {
    color: '#D1D5DB',
  },
});

export default RegisterDeviceScreen;
