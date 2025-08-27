import React, { useState, useEffect, useMemo } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useSelector } from 'react-redux';

import { RegisteredDevice } from '../api/deviceRegistrationApi';
import { useGetRegisteredDevices } from '../api/deviceRegistrationApiRQ';
import type { RootState } from '../store';

export interface Device {
  id: string; // stable unique id used by FlatList
  serial: string;
  model: string;
  dealer: string;
  status: 'Active' | 'Inactive';
  date: string;
}

type RootStackParamList = {
  MainTabs: undefined;
  Login?: undefined;
};
// Use the full param list so navigate('Login') is typed correctly without any casts
type RegisterDeviceScreenNavigationProp = StackNavigationProp<RootStackParamList>;

// Color constants to satisfy react-native/no-color-literals
const COLOR_WHITE = '#FFFFFF';
const COLOR_MUTED = '#9CA3AF';
const COLOR_CARD = '#374151';
const COLOR_BG = '#1F2937';
const COLOR_BORDER = '#4B5563';
const COLOR_ERROR = '#EF4444';
const COLOR_SUCCESS = '#10B981';

type RegisteredDeviceMaybe = RegisteredDevice & {
  dealerId?: string | number;
  registeredBy?: string | number;
  serialNo?: string;
  modelNumber?: string;
  dealerName?: string;
  status?: string;
  registrationDate?: string;
};

const DevicesScreen: React.FC = () => {
  const [search, setSearch] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const navigation = useNavigation<RegisterDeviceScreenNavigationProp>();

  // Read token from the redux auth slice (narrowed without using `any`)
  const authTokenFromStore = useSelector((s: RootState) => {
    const auth = (s as unknown as { auth?: { token?: string | null } })?.auth;
    return auth?.token as string | null | undefined;
  });

  // If token is explicitly null, show local error and navigate to Login.
  useEffect(() => {
    if (authTokenFromStore === null) {
      setLocalError('No access token found. Please log in again.');
    } else {
      // clear localError when token exists or is pending
      setLocalError(null);
    }
  }, [authTokenFromStore]);

  useEffect(() => {
    if (authTokenFromStore === null) {
      // navigate to Login if there's no token
      navigation.navigate('Login');
    }
  }, [authTokenFromStore, navigation]);

  const {
    data: apiDevices,
    isLoading: queryLoading,
    isError: queryIsError,
    error: queryError,
    refetch,
  } = useGetRegisteredDevices(authTokenFromStore ?? undefined);

  const loading = authTokenFromStore === undefined || queryLoading;

  const error =
    localError ??
    (queryIsError ? (queryError instanceof Error ? queryError.message : String(queryError)) : null);

  // Map API RegisteredDevice[] to UI Device[] with a typed intermediate to avoid `any`
  const devices: Device[] = useMemo(() => {
    const apiDevicesTyped = (apiDevices ?? []) as RegisteredDeviceMaybe[];
    if (apiDevicesTyped.length === 0) return [];

    const occurrences: Record<string, number> = {};

    return apiDevicesTyped.map((device) => {
      // Use dealerId (if present) + serialNo as a composite base key
      const dealerPart = device.dealerId ?? device.registeredBy ?? 'unknownDealer';
      const baseKey = `${dealerPart}-${device.serialNo ?? ''}`;

      occurrences[baseKey] = (occurrences[baseKey] ?? 0) + 1;
      const uniqueKey = occurrences[baseKey] > 1 ? `${baseKey}-${occurrences[baseKey]}` : baseKey;

      return {
        id: uniqueKey,
        serial: device.serialNo ?? '',
        model: device.modelNumber ?? '',
        dealer: device.dealerName ?? '',
        status: device.status === 'Active' ? 'Active' : 'Inactive',
        date: device.registrationDate
          ? new Date(device.registrationDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          : 'N/A',
      };
    });
  }, [apiDevices]);

  const filtered = devices.filter((d) => d.serial.toLowerCase().includes(search.toLowerCase()));

  const onRefresh = async () => {
    if (!refetch) return;
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator size="large" color={COLOR_WHITE} style={styles.loadingIndicator} />;
    }

    if (error) {
      return <Text style={styles.errorText}>Error: {error}</Text>;
    }

    if (filtered.length === 0) {
      return <Text style={styles.emptyText}>No devices found.</Text>;
    }

    return (
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardLeft}>
              <MaterialIcons
                name={item.status === 'Active' ? 'check-circle' : 'cancel'}
                size={24}
                color={item.status === 'Active' ? COLOR_SUCCESS : COLOR_ERROR}
              />
              <View style={styles.cardText}>
                <Text style={styles.serial}>{item.serial}</Text>
                <Text style={styles.model}>{item.model}</Text>
                <Text style={styles.dealer}>{item.dealer}</Text>
              </View>
            </View>
            <Text style={styles.date}>{item.date}</Text>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLOR_WHITE} />
        }
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>All Registered Devices</Text>
            <Text style={styles.headerSubtitle}>View and manage your devices</Text>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Search by serial number"
            placeholderTextColor={COLOR_MUTED}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <View style={[styles.sectionContainer, styles.toolbar]}>
          <TouchableOpacity style={styles.toolBtn}>
            <MaterialIcons name="filter-list" size={20} color={COLOR_WHITE} />
            <Text style={styles.toolText}>Filter</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolBtn}>
            <MaterialIcons name="sort" size={20} color={COLOR_WHITE} />
            <Text style={styles.toolText}>Sort</Text>
          </TouchableOpacity>
          <Text style={styles.count}>{filtered.length} Devices</Text>
        </View>

        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  backArrow: {
    color: COLOR_WHITE,
    fontSize: 24,
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    marginRight: 16,
    width: 40,
  },
  card: {
    backgroundColor: COLOR_CARD,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    padding: 16,
  },
  cardLeft: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  cardText: {
    marginLeft: 12,
  },
  container: {
    backgroundColor: COLOR_BG,
    flex: 1,
  },
  count: {
    color: COLOR_MUTED,
    marginLeft: 'auto',
  },
  date: {
    alignSelf: 'flex-start',
    color: COLOR_MUTED,
    fontSize: 12,
  },
  dealer: {
    color: COLOR_MUTED,
    fontSize: 12,
    marginTop: 4,
  },
  emptyText: {
    color: COLOR_MUTED,
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
  },
  errorText: {
    color: COLOR_ERROR,
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginBottom: 32,
  },
  headerSubtitle: {
    color: COLOR_MUTED,
    fontSize: 14,
  },
  headerTitle: {
    color: COLOR_WHITE,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  headerTitleContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 60,
  },
  loadingIndicator: {
    marginTop: 50,
  },
  model: {
    color: COLOR_MUTED,
    fontSize: 14,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 60,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  sectionContainer: {
    marginBottom: 32,
  },
  serial: {
    color: COLOR_WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
  textInput: {
    backgroundColor: COLOR_CARD,
    borderColor: COLOR_BORDER,
    borderRadius: 8,
    borderWidth: 1,
    color: COLOR_WHITE,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  toolBtn: {
    alignItems: 'center',
    flexDirection: 'row',
    marginRight: 24,
  },
  toolText: {
    color: COLOR_WHITE,
    marginLeft: 4,
  },
  toolbar: {
    alignItems: 'center',
    flexDirection: 'row',
  },
});

export default DevicesScreen;
