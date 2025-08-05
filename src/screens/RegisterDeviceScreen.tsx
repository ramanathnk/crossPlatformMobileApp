import React, { useState, useEffect, useRef, useCallback } from 'react';
// Use a constant for dropdown vertical padding
const DROPDOWN_VERTICAL_PADDING = 16;
import * as SecureStore from 'expo-secure-store';
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
import { findNodeHandle, UIManager } from 'react-native';
import CrossPlatformAlert from '../utils/CrossPlatformAlert';
import { Provider as PaperProvider } from 'react-native-paper';
import CrossPlatformDropdown from '../components/CrossPlatformDropdown';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { Dimensions } from 'react-native';
// For real API calls
import { getAllDealers } from '../api/dealerApi';
import { getAllDeviceTypes } from '../api/deviceTypeApi';

// For testing with mock data, uncomment the lines below:
//import { getAllDealers as getAllDealersMock } from '../api/mocks/dealerApiMock';
//import { getAllDeviceTypes as getAllDeviceTypesMock } from '../api/mocks/deviceTypeApiMock';

type RootStackParamList = {
  Dashboard: undefined;
};
type RegisterDeviceScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Dashboard'>;

type DropdownOption = {
  label: string;
  value: number;
};


const RegisterDeviceScreen: React.FC = () => {
  const navigation = useNavigation<RegisterDeviceScreenNavigationProp>();
  const scrollViewRef = useRef<ScrollView>(null);
  const [selectedDealer, setSelectedDealer] = useState<number | null>(null);
  const [serialNumber, setSerialNumber] = useState('');
  const [selectedDeviceType, setSelectedDeviceType] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<number | null>(1);
  const [dealerOptions, setDealerOptions] = useState<DropdownOption[]>([]);
  const [deviceTypeOptions, setDeviceTypeOptions] = useState<DropdownOption[]>([]);
  const [loadingDealers, setLoadingDealers] = useState(true);
  const [loadingDeviceTypes, setLoadingDeviceTypes] = useState(true);
  const [dealerError, setDealerError] = useState<string | null>(null);
  const [deviceTypeError, setDeviceTypeError] = useState<string | null>(null);



  // Store layout (y position) for dropdowns
  const [dealerDropdownY, setDealerDropdownY] = useState<number | null>(null);
  const [deviceTypeDropdownY, setDeviceTypeDropdownY] = useState<number | null>(null);
  const [statusDropdownY, setStatusDropdownY] = useState<number | null>(null);
  // Track which dropdown should open after scroll
  const [pendingDropdown, setPendingDropdown] = useState<'dealer' | 'deviceType' | 'status' | null>(null);
  const [showDealerDropdown, setShowDealerDropdown] = useState(false);
  const [showDeviceTypeDropdown, setShowDeviceTypeDropdown] = useState(false);


  // Status dropdown visibility (not scroll-into-view)
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  // Scroll dropdown into view when opened

  // Track current scroll position
  const [scrollY, setScrollY] = useState(0);

  // Helper to check if a dropdown is visible in the ScrollView viewport
  const isDropdownVisible = (dropdownY: number | null, dropdownHeight = 200) => {
    if (dropdownY == null || !scrollViewRef.current) return false;
    // Assume viewport height is window height minus padding
    const viewportHeight = Platform.OS === 'web' ? window.innerHeight : 700; // fallback
    // Button is visible if its top is below the top of the viewport and enough space below for dropdown
    const buttonTop = dropdownY;
    const buttonBottom = dropdownY + 50; // button height
    const spaceBelow = scrollY + viewportHeight - buttonBottom;
    return buttonTop >= scrollY && spaceBelow >= dropdownHeight;
  };

  // Scroll-into-view using y position from onLayout (Fabric compatible)
  const scrollDropdownIntoView = useCallback((dropdown: 'dealer' | 'deviceType' | 'status') => {
    let y: number | null = null;
    let setShowDropdown: ((v: boolean) => void) | null = null;
    if (dropdown === 'dealer') { y = dealerDropdownY; setShowDropdown = setShowDealerDropdown; }
    if (dropdown === 'deviceType') { y = deviceTypeDropdownY; setShowDropdown = setShowDeviceTypeDropdown; }
    if (dropdown === 'status') { y = statusDropdownY; setShowDropdown = setShowStatusDropdown; }
    if (y == null || !scrollViewRef.current) return;
    //const viewportHeight = Platform.OS === 'web' ? window.innerHeight : 700; // fallback
    const viewportHeight = Dimensions.get('window').height;
    const buttonTop = y;
    const buttonBottom = y + 50; // button height
    const dropdownHeight = 200; // match dropdownList style
    const margin = 20;
    // The ideal top of the button so the dropdown fits below
    const idealButtonTop = Math.max(0, scrollY, buttonBottom - (viewportHeight - dropdownHeight - margin));
    console.log("This is the debug log for scrollDropdownIntoView");

    console.log("ButtonTop:", buttonTop, "ButtonBottom:", buttonBottom, "ScrollY:", scrollY, "ViewportHeight:", viewportHeight, "IdealButtonTop:", idealButtonTop);
    // If the button is above the viewport, scroll up to it
    if (buttonTop < scrollY) {
      setPendingDropdown(dropdown);
      scrollViewRef.current.scrollTo({ y: Math.max(0, buttonTop - margin), animated: true });
    }
    // If not enough space below, and scrolling up would help, scroll up
    else if ((buttonTop >= scrollY) && (buttonBottom + dropdownHeight + margin > scrollY + viewportHeight)) {
      // Only scroll up, never down
      const scrollToY = Math.min(scrollY, Math.max(0, buttonBottom - (viewportHeight - dropdownHeight - margin)));
      setPendingDropdown(dropdown);
      scrollViewRef.current.scrollTo({ y: scrollToY, animated: true });
    }
    // Otherwise, open immediately
    else {
      setShowDropdown && setShowDropdown(true);
    }
    //console.log("scrollToY:", scrollToY));
  }, [dealerDropdownY, deviceTypeDropdownY, statusDropdownY, scrollY]);


  const statusOptions: DropdownOption[] = [
    { label: 'Active', value: 1 },
    { label: 'Inactive', value: 0 },
  ];

  // Scroll-into-view using y position from onLayout (Fabric compatible)
  const scrollDropdownIntoView1 = useCallback((dropdown: 'dealer' | 'deviceType' | 'status') => {
    let y: number | null = null;
    let setShowDropdown: ((v: boolean) => void) | null = null;
    let options: DropdownOption[] = [];
    if (dropdown === 'dealer') { y = dealerDropdownY; setShowDropdown = setShowDealerDropdown; options = dealerOptions; }
    if (dropdown === 'deviceType') { y = deviceTypeDropdownY; setShowDropdown = setShowDeviceTypeDropdown; options = deviceTypeOptions; }
    if (dropdown === 'status') { y = statusDropdownY; setShowDropdown = setShowStatusDropdown; options = statusOptions; }
    if (y == null || !scrollViewRef.current) return;
    const viewportHeight = Dimensions.get('window').height;
    const buttonTop = y;
    const buttonBottom = y + 50; // button height
    const margin = 20;
    // Responsive dropdown height: max 70% of screen, but never more than needed for all items
    const itemHeight = 48; // Estimate or match your dropdown item style
    const maxDropdownHeight = Math.floor(viewportHeight * 0.7);
    const requiredHeight = options.length * itemHeight + DROPDOWN_VERTICAL_PADDING;
    const dropdownHeight = Math.min(maxDropdownHeight, requiredHeight);
    // If the button is above the viewport, scroll up to it
    if (buttonTop < scrollY) {
      setPendingDropdown(dropdown);
      scrollViewRef.current.scrollTo({ y: Math.max(0, buttonTop - margin), animated: true });
      return;
    }
    // If the button is below the viewport, scroll down to it
    if (buttonBottom > scrollY + viewportHeight) {
      setPendingDropdown(dropdown);
      scrollViewRef.current.scrollTo({ y: Math.max(0, buttonTop - margin), animated: true });
      return;
    }
    // If not enough space below for dropdown, scroll up just enough so dropdown fits
    if (buttonBottom + dropdownHeight + margin > scrollY + viewportHeight) {
      const targetY = Math.max(0, buttonBottom - (viewportHeight - dropdownHeight - margin));
      setPendingDropdown(dropdown);
      scrollViewRef.current.scrollTo({ y: targetY, animated: true });
      return;
    }
    // Otherwise, open immediately
    setShowDropdown && setShowDropdown(true);
  }, [dealerDropdownY, deviceTypeDropdownY, statusDropdownY, scrollY, dealerOptions, deviceTypeOptions, statusOptions]);

  useEffect(() => {
    async function fetchDealersAndDeviceTypes() {
      setLoadingDealers(true);
      setLoadingDeviceTypes(true);
      setDealerError(null);
      setDeviceTypeError(null);
      let dealers: any[] = [];
      let deviceTypes: any[] = [];
      let token = '';
      try {
        token = (await SecureStore.getItemAsync('accessToken')) || '';
        if (!token) {
          throw new Error('No access token found. Please log in again.');
        }
      } catch (err) {
        setDealerError('Authentication error. Please log in again.');
        setDeviceTypeError('Authentication error. Please log in again.');
        setLoadingDealers(false);
        setLoadingDeviceTypes(false);
        return;
      }
      try {
        dealers = await getAllDealers(token);
        console.log('Dealers API response:', dealers);
        if (!Array.isArray(dealers)) {
          throw new Error('Invalid dealers API response format');
        }
        setDealerOptions(
          dealers.map((dealer) => ({ label: dealer.name, value: dealer.dealerId }))
        );
      } catch (err: any) {
        setDealerError('Failed to load dealers.');
        setDealerOptions([]);
        console.error('Error fetching dealers:', err);
      } finally {
        setLoadingDealers(false);
      }
      try {
        deviceTypes = await getAllDeviceTypes(token);
        console.log('DeviceTypes API response:', deviceTypes);
        if (!Array.isArray(deviceTypes)) {
          throw new Error('Invalid device types API response format');
        }
        setDeviceTypeOptions(
          deviceTypes.map((type) => ({ label: type.modelNumber, value: type.deviceTypeId }))
        );
      } catch (err: any) {
        setDeviceTypeError('Failed to load device types.');
        setDeviceTypeOptions([]);
        console.error('Error fetching device types:', err);
      } finally {
        setLoadingDeviceTypes(false);
      }
    }
    fetchDealersAndDeviceTypes();
  }, []);



  const isFormValid = selectedDealer !== null && serialNumber.trim().length > 0 && selectedDeviceType !== null && selectedStatus !== null;

  const formatSerialNumber = (text: string) => {
    const cleaned = text.replace(/[^A-Z0-9]/gi, '').toUpperCase();
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
          onPress: () => navigation.navigate('Dashboard'),
        },
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
      hour12: true,
    };
    return now.toLocaleDateString('en-US', options);
  };



  return (
    <PaperProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onScroll={e => setScrollY(e.nativeEvent.contentOffset.y)}
            scrollEventThrottle={16}
            onMomentumScrollEnd={() => {
              if (pendingDropdown === 'dealer') {
                setShowDealerDropdown(true);
                setPendingDropdown(null);
              } else if (pendingDropdown === 'deviceType') {
                setShowDeviceTypeDropdown(true);
                setPendingDropdown(null);
              } else if (pendingDropdown === 'status') {
                setShowStatusDropdown(true);
                setPendingDropdown(null);
              }
            }}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
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
              <View style={styles.inputContainer}
                onLayout={e => setDealerDropdownY(e.nativeEvent.layout.y)}
              >
                <Text style={styles.inputLabel}>Dealer *</Text>
                {loadingDealers ? (
                  <Text style={{ color: '#9CA3AF', marginBottom: 8 }}>Loading dealers...</Text>
                ) : dealerError ? (
                  <Text style={{ color: 'red', marginBottom: 8 }}>{dealerError}</Text>
                ) : (
                  <CrossPlatformDropdown
                    options={dealerOptions}
                    selectedValue={selectedDealer}
                    onSelect={setSelectedDealer}
                    placeholder="Select dealers"
                    visible={showDealerDropdown}
                    setVisible={setShowDealerDropdown}
                    onOpen={() => scrollDropdownIntoView1('dealer')}
                  />
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
              <View style={styles.inputContainer}
                onLayout={e => setDeviceTypeDropdownY(e.nativeEvent.layout.y)}
              >
                <Text style={styles.inputLabel}>Device Type *</Text>
                {loadingDeviceTypes ? (
                  <Text style={{ color: '#9CA3AF', marginBottom: 8 }}>Loading device types...</Text>
                ) : deviceTypeError ? (
                  <Text style={{ color: 'red', marginBottom: 8 }}>{deviceTypeError}</Text>
                ) : (
                  <CrossPlatformDropdown
                    options={deviceTypeOptions}
                    selectedValue={selectedDeviceType}
                    onSelect={setSelectedDeviceType}
                    placeholder="Select device type"
                    visible={showDeviceTypeDropdown}
                    setVisible={setShowDeviceTypeDropdown}
                    onOpen={() => scrollDropdownIntoView1('deviceType')}
                  />
                )}
              </View>
              {/* Status Dropdown */}
              <View style={styles.inputContainer}
                onLayout={e => setStatusDropdownY(e.nativeEvent.layout.y)}
              >
                <Text style={styles.inputLabel}>Status *</Text>
                <CrossPlatformDropdown
                  options={statusOptions}
                  selectedValue={selectedStatus}
                  onSelect={setSelectedStatus}
                  placeholder="Select status"
                  visible={showStatusDropdown}
                  setVisible={setShowStatusDropdown}
                  onOpen={() => scrollDropdownIntoView1('status')}
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
                  !isFormValid && styles.registerButtonDisabled,
                ]}
                onPress={handleRegisterDevice}
                disabled={!isFormValid}
              >
                <Text style={styles.registerButtonIcon}>+</Text>
                <Text
                  style={[
                    styles.registerButtonText,
                    !isFormValid && styles.registerButtonTextDisabled,
                  ]}
                >
                  Register Device
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  dropdownMenu: {
    backgroundColor: '#374151',
    borderRadius: 8,
    borderColor: '#4B5563',
    borderWidth: 1,
  },
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
