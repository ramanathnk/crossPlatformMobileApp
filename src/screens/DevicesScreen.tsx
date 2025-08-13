import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

export interface Device {
  id: string;
  serial: string;
  model: string;
  dealer: string;
  status: 'Active' | 'Inactive';
  date: string;
}

const MOCK_DEVICES: Device[] = [
  { id: '1', serial: 'ST-78901', model: 'ST-Pro 2023', dealer: 'TechSolutions Inc.', status: 'Active', date: 'May 15, 2023' },
  { id: '2', serial: 'ST-78845', model: 'ST-Mini 2023', dealer: 'Global Trackers LLC', status: 'Active', date: 'May 14, 2023' },
  { id: '3', serial: 'ST-78756', model: 'ST-Pro 2022', dealer: 'SmartTrack Solutions', status: 'Inactive', date: 'May 12, 2023' },
];

type RootStackParamList = {
  MainTabs: undefined;
};
type RegisterDeviceScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MainTabs'>;


const DevicesScreen: React.FC = () => {

  const [search, setSearch] = useState('');
  const filtered = MOCK_DEVICES.filter(d =>
    d.serial.toLowerCase().includes(search.toLowerCase())
  );
  const navigation = useNavigation<RegisterDeviceScreenNavigationProp>();


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>All Registered Devices</Text>
            <Text style={styles.headerSubtitle}>
              View and manage your devices
            </Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.sectionContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Search by serial number"
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Toolbar */}
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

        {/* Devices List */}
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
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
        />
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
});

export default DevicesScreen;