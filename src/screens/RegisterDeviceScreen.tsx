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
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

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
  
  // Dropdown states
  const [showDealerDropdown, setShowDealerDropdown] = useState(false);
  const [showDeviceTypeDropdown, setShowDeviceTypeDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

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
      Alert.alert(
        'Validation Error',
        'Please fill in all required fields.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    Alert.alert(
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

  const renderDropdown = (
    options: DropdownOption[],
    selectedValue: string,
    onSelect: (value: string) => void,
    placeholder: string,
    isVisible: boolean,
    onToggle: () => void
  ) => (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity style={styles.dropdownButton} onPress={onToggle}>
        <Text style={[styles.dropdownText, !selectedValue && styles.placeholderText]}>
          {selectedValue ? options.find(opt => opt.value === selectedValue)?.label : placeholder}
        </Text>
        <Text style={styles.dropdownArrow}>▼</Text>
      </TouchableOpacity>
      
      {isVisible && (
        <View style={styles.dropdownList}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={styles.dropdownItem}
              onPress={() => {
                onSelect(option.value);
                onToggle();
              }}
            >
              <View style={styles.checkboxContainer}>
                <View style={[styles.checkbox, selectedValue === option.value && styles.checkboxSelected]}>
                  {selectedValue === option.value && <Text style={styles.checkmark}>●</Text>}
                </View>
                <Text style={styles.dropdownItemText}>{option.label}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

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
              {renderDropdown(
                dealerOptions,
                selectedDealer,
                setSelectedDealer,
                'Select dealers',
                showDealerDropdown,
                () => setShowDealerDropdown(!showDealerDropdown)
              )}
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
              {renderDropdown(
                deviceTypeOptions,
                selectedDeviceType,
                setSelectedDeviceType,
                'Select device type',
                showDeviceTypeDropdown,
                () => setShowDeviceTypeDropdown(!showDeviceTypeDropdown)
              )}
            </View>

            {/* Status Dropdown */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Status *</Text>
              {renderDropdown(
                statusOptions,
                selectedStatus,
                setSelectedStatus,
                'Select status',
                showStatusDropdown,
                () => setShowStatusDropdown(!showStatusDropdown)
              )}
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
    paddingBottom: 40,
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
  dropdownContainer: {
    position: 'relative',
  },
  dropdownButton: {
    backgroundColor: '#374151',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#4B5563',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 16,
    color: '#FFFFFF',
    flex: 1,
  },
  placeholderText: {
    color: '#6B7280',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#374151',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4B5563',
    marginTop: 4,
    maxHeight: 200,
    zIndex: 1000,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#4B5563',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#6B7280',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#3B82F6',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 8,
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#FFFFFF',
    flex: 1,
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
  registerButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
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
