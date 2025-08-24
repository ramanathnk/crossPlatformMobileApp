import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
// Use a constant for dropdown vertical padding
const DROPDOWN_VERTICAL_PADDING = 16;
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
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import CrossPlatformAlert from '../utils/CrossPlatformAlert';
import { Provider as PaperProvider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { DropdownOption } from '../components/CrossPlatformDropdownGen/types';
import CrossPlatformDropdownGen from '../components/CrossPlatformDropdownGen';

// Redux
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import {
  registerDeviceRequest,
  selectRegistering,
  selectRegisterError,
} from '../store/deviceRequestsSlice';
import {
  fetchDealers,
  selectDealers,
  selectDealersLoading,
  selectDealersError,
} from '../store/dealerSlice';
import {
  fetchDeviceTypes,
  selectDeviceTypes,
  selectDeviceTypesLoading,
  selectDeviceTypesError,
} from '../store/deviceTypeSlice';

type RootStackParamList = {
  MainTabs: undefined;
};
type RegisterDeviceScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MainTabs'>;

interface DealerResult {
  dealerId: number;
  success: boolean;
  errorMessage?: string | null;
  dealerName?: string;
}

const RegisterDeviceScreen: React.FC = () => {
  const navigation = useNavigation<RegisterDeviceScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const scrollViewRef = useRef<ScrollView>(null);

  // Form state
  // allow multiple dealers: use array of dealerIds
  const [selectedDealers, setSelectedDealers] = useState<number[]>([]);
  const [serialNumber, setSerialNumber] = useState('');
  const [selectedDeviceType, setSelectedDeviceType] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<number | null>(1);

  // Dropdown layout / behavior state (unchanged)
  const [dealerDropdownY, setDealerDropdownY] = useState<number | null>(null);
  const [deviceTypeDropdownY, setDeviceTypeDropdownY] = useState<number | null>(null);
  const [statusDropdownY, setStatusDropdownY] = useState<number | null>(null);
  const [dealerDropdownHeight, setDealerDropdownHeight] = useState<number>(200);
  const [deviceTypeDropdownHeight, setDeviceTypeDropdownHeight] = useState<number>(200);
  const [statusDropdownHeight, setStatusDropdownHeight] = useState<number>(200);
  const [pendingDropdown, setPendingDropdown] = useState<'dealer' | 'deviceType' | 'status' | null>(
    null,
  );
  const [showDealerDropdown, setShowDealerDropdown] = useState(false);
  const [showDeviceTypeDropdown, setShowDeviceTypeDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  // Redux state/selectors
  const registering = useSelector((s: RootState) => selectRegistering(s));
  const registerError = useSelector((s: RootState) => selectRegisterError(s));

  const dealers = useSelector((s: RootState) => selectDealers(s));
  const dealersLoading = useSelector((s: RootState) => selectDealersLoading(s));
  const dealersError = useSelector((s: RootState) => selectDealersError(s));

  const deviceTypes = useSelector((s: RootState) => selectDeviceTypes(s));
  const deviceTypesLoading = useSelector((s: RootState) => selectDeviceTypesLoading(s));
  const deviceTypesError = useSelector((s: RootState) => selectDeviceTypesError(s));

  // Local: registration summary results returned by API
  const [registrationResults, setRegistrationResults] = useState<DealerResult[] | null>(null);

  // Derived dropdown options from Redux data
  const dealerOptions: DropdownOption<number>[] = useMemo(
    () => (dealers ?? []).map((d) => ({ label: d.name, value: d.dealerId })),
    [dealers],
  );

  const deviceTypeOptions: DropdownOption<number>[] = useMemo(
    () => (deviceTypes ?? []).map((t) => ({ label: t.modelNumber, value: t.deviceTypeId })),
    [deviceTypes],
  );

  const statusOptions: DropdownOption<number>[] = [
    { label: 'Active', value: 1 },
    { label: 'Inactive', value: 0 },
  ];

  // Fetch dealers + device types with Redux on mount
  useEffect(() => {
    dispatch(fetchDealers());
    dispatch(fetchDeviceTypes());
  }, [dispatch]);

  // Scroll-into-view helpers (kept same logic)
  const scrollDropdownIntoView1 = useCallback(
    (dropdown: 'dealer' | 'deviceType' | 'status') => {
      if (Platform.OS !== 'web') {
        // @ts-ignore
        const { Keyboard } = require('react-native');
        Keyboard.dismiss();
      }
      let y: number | null = null;
      let setShowDropdown: ((v: boolean) => void) | null = null;
      let options: DropdownOption[] = [];
      if (dropdown === 'dealer') {
        y = dealerDropdownY;
        setShowDropdown = setShowDealerDropdown;
        options = dealerOptions;
      }
      if (dropdown === 'deviceType') {
        y = deviceTypeDropdownY;
        setShowDropdown = setShowDeviceTypeDropdown;
        options = deviceTypeOptions;
      }
      if (dropdown === 'status') {
        y = statusDropdownY;
        setShowDropdown = setShowStatusDropdown;
        options = statusOptions;
      }
      if (y == null || !scrollViewRef.current) {
        return;
      }
      const viewportHeight = Dimensions.get('window').height;
      const buttonTop = y;
      const buttonBottom = y + 50; // button height
      const margin = 20;
      let measuredDropdownHeight = 200;
      if (dropdown === 'dealer') measuredDropdownHeight = dealerDropdownHeight;
      if (dropdown === 'deviceType') measuredDropdownHeight = deviceTypeDropdownHeight;
      if (dropdown === 'status') measuredDropdownHeight = statusDropdownHeight;
      const maxDropdownHeight = Math.floor(viewportHeight * 0.7);
      const dropdownHeight = Math.min(maxDropdownHeight, measuredDropdownHeight);

      if (buttonTop < scrollY) {
        setPendingDropdown(dropdown);
        scrollViewRef.current.scrollTo({ y: Math.max(0, buttonTop - margin), animated: true });
        return;
      }
      if (buttonBottom + dropdownHeight + margin > scrollY + viewportHeight) {
        const targetY = Math.max(0, buttonBottom - (viewportHeight - dropdownHeight - margin));
        setPendingDropdown(dropdown);
        scrollViewRef.current.scrollTo({ y: targetY, animated: true });
        return;
      }
      if (buttonBottom > scrollY + viewportHeight) {
        setPendingDropdown(dropdown);
        scrollViewRef.current.scrollTo({ y: Math.max(0, buttonTop - margin), animated: true });
        return;
      }
      setShowDropdown && setShowDropdown(true);
    },
    [
      dealerDropdownY,
      deviceTypeDropdownY,
      statusDropdownY,
      scrollY,
      dealerOptions,
      deviceTypeOptions,
      statusOptions,
      dealerDropdownHeight,
      deviceTypeDropdownHeight,
      statusDropdownHeight,
    ],
  );

  const isFormValid =
    selectedDealers.length > 0 &&
    serialNumber.trim().length === 10 &&
    selectedDeviceType !== null &&
    selectedStatus !== null;

  const formatSerialNumber = (text: string) =>
    text
      .replace(/[^A-Za-z0-9]/g, '')
      .toUpperCase()
      .slice(0, 10);

  const handleSerialNumberChange = (text: string) => {
    setSerialNumber(formatSerialNumber(text));
  };

  const [localError, setLocalError] = useState<string | null>(null);

  const handleRegisterDevice = async () => {
    if (!isFormValid) {
      CrossPlatformAlert.alert(
        'Validation Error',
        'Please fill in all required fields. Serial number must be exactly 10 characters.',
        [{ text: 'OK', style: 'default' }],
      );
      return;
    }

    setLocalError(null);
    setRegistrationResults(null);

    try {
      const requestData = {
        dealerIds: selectedDealers, // now multiple dealer ids
        serialNo: serialNumber,
        deviceTypeId: selectedDeviceType!,
        status: selectedStatus!,
      };

      // Dispatch the Redux thunk; thunk reads token internally.
      const response: any = await dispatch(registerDeviceRequest(requestData)).unwrap();

      // Response is expected to contain dealerResults array even on success.
      // Normalize and map dealer names where available.
      const apiDealerResults: Array<{
        dealerId: number;
        success: boolean;
        errorMessage?: string | null;
      }> = Array.isArray(response?.dealerResults) ? response.dealerResults : [];

      const mappedResults: DealerResult[] = apiDealerResults.map((r) => {
        const dealerRecord = (dealers ?? []).find((d: any) => d.dealerId === r.dealerId);
        return {
          dealerId: r.dealerId,
          dealerName: dealerRecord ? dealerRecord.name : `Dealer ${r.dealerId}`,
          success: Boolean(r.success),
          errorMessage: r.errorMessage ?? null,
        };
      });

      setRegistrationResults(mappedResults);

      // Build a descriptive alert that lists successes and failures (with messages)
      const successList = mappedResults.filter((r) => r.success).map((r) => `• ${r.dealerName}`);
      const failedList = mappedResults
        .filter((r) => !r.success)
        .map((r) => `• ${r.dealerName}: ${r.errorMessage ?? 'Unknown error'}`);

      const lines: string[] = [];
      lines.push(`Serial: ${response?.serialNo ?? serialNumber}`);
      lines.push('');

      // Successes (explicit)
      lines.push(`Successful registrations (${successList.length}):`);
      if (successList.length > 0) {
        lines.push(...successList);
      } else {
        lines.push('• None');
      }
      lines.push('');

      // Failures (explicit)
      lines.push(`Failed registrations (${failedList.length}):`);
      if (failedList.length > 0) {
        lines.push(...failedList);
      } else {
        lines.push('• None');
      }

      CrossPlatformAlert.alert('Registration Results', lines.join('\n'), [
        {
          text: 'OK',
          style: 'default',
          onPress: () => navigation.navigate('MainTabs'),
        },
      ]);
    } catch (err: any) {
      console.log('Device registration failed:', err);
      // Try to show the server-provided message first
      const message =
        err?.description ?? err?.message ?? registerError ?? 'Failed to register device.';
      setLocalError(message);
    }
  };

  // combined errors for dealer/device-type fetching display
  const dealerLoadError = dealersError;
  const deviceTypeLoadError = deviceTypesError;

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
            onScroll={(e) => setScrollY(e.nativeEvent.contentOffset.y)}
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
                <Text style={styles.headerSubtitle}>
                  Manually register a device into the system
                </Text>
              </View>
            </View>

            {/* Device Information Section */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Device Information</Text>
              {/* Dealer Dropdown */}
              <View
                style={styles.inputContainer}
                onLayout={(e) => setDealerDropdownY(e.nativeEvent.layout.y)}
              >
                <Text style={styles.inputLabel}>Dealer * (select one or more)</Text>
                {dealersLoading ? (
                  <Text style={{ color: '#9CA3AF', marginBottom: 8 }}>Loading dealers...</Text>
                ) : dealerLoadError ? (
                  <Text style={{ color: 'red', marginBottom: 8 }}>{dealerLoadError}</Text>
                ) : (
                  <CrossPlatformDropdownGen<number>
                    options={dealerOptions}
                    selectedValue={selectedDealers}
                    onSelect={(val) => {
                      // onSelect may return a single value (number) or an array (number[])
                      if (Array.isArray(val)) {
                        setSelectedDealers(val as number[]);
                      } else if (val === null || val === undefined) {
                        setSelectedDealers([]);
                      } else {
                        // toggle single selection into array (for safety)
                        const n = val as number;
                        setSelectedDealers((prev) =>
                          prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n],
                        );
                      }
                    }}
                    placeholder="Select dealers"
                    visible={showDealerDropdown}
                    setVisible={setShowDealerDropdown}
                    onOpen={() => scrollDropdownIntoView1('dealer')}
                    onMeasureAllItemsHeight={setDealerDropdownHeight}
                    multiSelect
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
                  maxLength={10}
                />
                <Text style={styles.inputHint}>
                  Format: XXXXXXXXXX (10 alphanumeric characters, letters and numbers only)
                </Text>
              </View>
              {/* Device Type Dropdown */}
              <View
                style={styles.inputContainer}
                onLayout={(e) => setDeviceTypeDropdownY(e.nativeEvent.layout.y)}
              >
                <Text style={styles.inputLabel}>Device Type *</Text>
                {deviceTypesLoading ? (
                  <Text style={{ color: '#9CA3AF', marginBottom: 8 }}>Loading device types...</Text>
                ) : deviceTypeLoadError ? (
                  <Text style={{ color: 'red', marginBottom: 8 }}>{deviceTypeLoadError}</Text>
                ) : (
                  <CrossPlatformDropdownGen<number | null>
                    options={deviceTypeOptions}
                    selectedValue={selectedDeviceType}
                    onSelect={(val) => {
                      if (Array.isArray(val)) {
                        setSelectedDeviceType(val.length > 0 ? (val[0] as number) : null);
                      } else {
                        setSelectedDeviceType(val as number | null);
                      }
                    }}
                    placeholder="Select device type"
                    visible={showDeviceTypeDropdown}
                    setVisible={setShowDeviceTypeDropdown}
                    onOpen={() => scrollDropdownIntoView1('deviceType')}
                    onMeasureAllItemsHeight={setDeviceTypeDropdownHeight}
                  />
                )}
              </View>
              {/* Status Dropdown */}
              <View
                style={styles.inputContainer}
                onLayout={(e) => setStatusDropdownY(e.nativeEvent.layout.y)}
              >
                <Text style={styles.inputLabel}>Status *</Text>
                <CrossPlatformDropdownGen<number | null>
                  options={statusOptions}
                  selectedValue={selectedStatus}
                  onSelect={(val) => {
                    if (Array.isArray(val)) {
                      setSelectedStatus(val.length > 0 ? (val[0] as number) : null);
                    } else {
                      setSelectedStatus(val as number | null);
                    }
                  }}
                  placeholder="Select status"
                  visible={showStatusDropdown}
                  setVisible={setShowStatusDropdown}
                  onOpen={() => scrollDropdownIntoView1('status')}
                  onMeasureAllItemsHeight={setStatusDropdownHeight}
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
                testID="register-device-button"
                style={[styles.registerButton, !isFormValid && styles.registerButtonDisabled]}
                onPress={handleRegisterDevice}
                disabled={!isFormValid || registering}
              >
                <Text style={styles.registerButtonIcon}>+</Text>
                <Text
                  style={[
                    styles.registerButtonText,
                    !isFormValid && styles.registerButtonTextDisabled,
                  ]}
                >
                  {registering ? 'Registering...' : 'Register Device'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* show error (from reducer or local) */}
            {localError ? (
              <Text style={{ color: 'red', textAlign: 'center', marginTop: 12 }}>{localError}</Text>
            ) : null}

            {/* registration results summary */}
            {registrationResults && registrationResults.length > 0 ? (
              <View style={styles.resultsContainer}>
                <Text style={styles.resultsTitle}>Registration details</Text>
                {registrationResults.map((r) => (
                  <View key={r.dealerId} style={styles.resultRow}>
                    <Text style={styles.resultDealerName}>
                      {r.dealerName ?? `Dealer ${r.dealerId}`}
                    </Text>
                    <Text
                      style={[
                        styles.resultStatus,
                        r.success ? styles.successText : styles.failText,
                      ]}
                    >
                      {r.success ? 'Registered' : 'Failed'}
                    </Text>
                    {!r.success && r.errorMessage ? (
                      <Text style={styles.resultError}>{r.errorMessage}</Text>
                    ) : null}
                  </View>
                ))}
              </View>
            ) : null}
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

  // results summary
  resultsContainer: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#262f37',
    borderRadius: 8,
    borderColor: '#2f3a42',
    borderWidth: 1,
  },
  resultsTitle: {
    color: '#D1D5DB',
    fontWeight: '700',
    marginBottom: 8,
  },
  resultRow: {
    marginBottom: 8,
  },
  resultDealerName: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  resultStatus: {
    marginTop: 2,
    fontWeight: '600',
  },
  successText: {
    color: '#10B981',
  },
  failText: {
    color: '#EF4444',
  },
  resultError: {
    color: '#FCA5A5',
    marginTop: 4,
  },
});

function getCurrentDateTime() {
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
}

export default RegisterDeviceScreen;
