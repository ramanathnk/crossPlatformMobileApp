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
import * as SecureStore from 'expo-secure-store';

import { RegisteredDevice } from '../api/deviceRegistrationApi';
import { useGetRegisteredDevices } from '../api/deviceRegistrationApiRQ';

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
type RegisterDeviceScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MainTabs'>;

const DevicesScreen: React.FC = () => {
  const [search, setSearch] = useState('');
  const [authToken, setAuthToken] = useState<string | null | undefined>(undefined);
  const [localError, setLocalError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const navigation = useNavigation<RegisterDeviceScreenNavigationProp>();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = await SecureStore.getItemAsync('accessToken');
        if (!mounted) return;
        setAuthToken(token ?? null);
        if (!token) {
          setLocalError('No access token found. Please log in again.');
        }
      } catch (err) {
        if (!mounted) return;
        setAuthToken(null);
        setLocalError('Failed to retrieve access token. Please log in again.');
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (authToken === null) {
      navigation.navigate('Login' as any);
    }
  }, [authToken, navigation]);

  const {
    data: apiDevices,
    isLoading: queryLoading,
    isError: queryIsError,
    error: queryError,
    refetch,
  } = useGetRegisteredDevices(authToken ?? undefined);

  const loading = authToken === undefined || queryLoading;

  const error =
    localError ??
    (queryIsError ? (queryError instanceof Error ? queryError.message : String(queryError)) : null);

  // Map API RegisteredDevice[] to UI Device[] and generate stable unique keys.
  // We use a composite key (dealerId + serialNo), and if duplicates still happen we append an occurrence count.
  const devices: Device[] = useMemo(() => {
    if (!apiDevices || apiDevices.length === 0) return [];

    const occurrences: Record<string, number> = {};

    return apiDevices.map((device: RegisteredDevice) => {
      // Use dealerId (if present) + serialNo as a composite base key
      const dealerPart =
        (device as any).dealerId ?? (device as any).registeredBy ?? 'unknownDealer';
      const baseKey = `${dealerPart}-${device.serialNo}`;

      occurrences[baseKey] = (occurrences[baseKey] ?? 0) + 1;
      const uniqueKey = occurrences[baseKey] > 1 ? `${baseKey}-${occurrences[baseKey]}` : baseKey;

      return {
        id: uniqueKey,
        serial: device.serialNo,
        model: device.modelNumber,
        dealer: device.dealerName,
        status: device.status === 'Active' ? 'Active' : 'Inactive',
        date: new Date(device.registrationDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
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
      return <ActivityIndicator size="large" color="#FFFFFF" style={{ marginTop: 50 }} />;
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
                color={item.status === 'Active' ? '#10B981' : '#EF4444'}
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
        contentContainerStyle={{ paddingBottom: 60 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFFFFF" />
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
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <View style={[styles.sectionContainer, styles.toolbar]}>
          <TouchableOpacity style={styles.toolBtn}>
            <MaterialIcons name="filter-list" size={20} color="#FFF" />
            <Text style={styles.toolText}>Filter</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolBtn}>
            <MaterialIcons name="sort" size={20} color="#FFF" />
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
  container: {
    flex: 1,
    backgroundColor: '#1F2937',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 60,
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
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  toolText: {
    color: '#FFFFFF',
    marginLeft: 4,
  },
  count: {
    color: '#9CA3AF',
    marginLeft: 'auto',
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardText: {
    marginLeft: 12,
  },
  serial: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  model: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  dealer: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 4,
  },
  date: {
    color: '#9CA3AF',
    fontSize: 12,
    alignSelf: 'flex-start',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default DevicesScreen;
