import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  ScrollView 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';


interface Dealer {
  id: string;
  name: string;
  deviceCount: number;
}

const DEALERS: Dealer[] = [
  { id: 'DLR-001', name: 'TechSolutions Inc.', deviceCount: 24 },
  { id: 'DLR-002', name: 'Global Trackers LLC', deviceCount: 18 },
  { id: 'DLR-003', name: 'SmartTrack Solutions', deviceCount: 12 },
];

const TAB_LABELS = ['Dealers', 'Device Types', 'Manufacturers'];

const RecordsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState('');

  // Filter dealers by search
  const filteredDealers = DEALERS.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
  <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
    <View style={styles.container}>
      <Text style={styles.title}>Manage Records</Text>
      <Text style={styles.subtitle}>
        Manage foundational data for the application
      </Text>
      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsScrollContainer}
      >
        <View style={styles.tabsContainer}>
          {TAB_LABELS.map((label, idx) => (
            <TouchableOpacity
              key={label}
              style={[
                styles.tab,
                activeTab === idx && styles.activeTab,
              ]}
              onPress={() => setActiveTab(idx)}
              testID={`tab-${label.replace(' ', '-').toLowerCase()}`}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === idx && styles.activeTabText,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      {/* Dealers Tab */}
      {activeTab === 0 && (
        <View style={styles.tabContent}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search records"
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#A3A3A3"
            testID="search-input"
          />
          <View style={styles.dealerHeader}>
            <Text style={styles.dealerCount}>
              {filteredDealers.length} Dealers
            </Text>
            <TouchableOpacity style={styles.addButton} testID="add-dealer-btn">
              <Text style={styles.addButtonText}>+ Add Dealer</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={filteredDealers}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.dealerCard}>
                <Text style={styles.dealerName}>{item.name}</Text>
                <Text style={styles.dealerInfo}>
                  ID: {item.id} • {item.deviceCount} Devices
                </Text>
                <View style={styles.dealerActions}>
                  <TouchableOpacity style={styles.iconBtn}>
                    <MaterialIcons name="edit" size={20} color="#A3A3A3" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconBtn}>
                    <MaterialIcons name="delete" size={20} color="#A3A3A3" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            scrollEnabled = {false}
            contentContainerStyle={{ paddingBottom: 16 }}
          />
        </View>
      )}

      {/* Device Types Tab */}
      {activeTab === 1 && (
        <View style={styles.tabContent}>
          <Text style={styles.placeholderText}>Device Types tab content goes here.</Text>
        </View>
      )}

      {/* Manufacturers Tab */}
      {activeTab === 2 && (
        <View style={styles.tabContent}>
          <Text style={styles.placeholderText}>Manufacturers tab content goes here.</Text>
        </View>
      )}
    </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#10172A',
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  subtitle: {
    color: '#A3A3A3',
    fontSize: 14,
    marginBottom: 18,
  },
  tabsScrollContainer: {
    minHeight: 20,
    alignItems: 'center',
    paddingRight: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#232B3E',
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    color: '#A3A3A3',
    fontWeight: '600',
    fontSize: 15,
  },
  activeTabText: {
    color: '#FFF',
  },
  tabContent: {
    flex: 1,
  },
  searchInput: {
    backgroundColor: '#19213A',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#FFF',
    marginBottom: 16,
    fontSize: 15,
  },
  dealerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  dealerCount: {
    color: '#A3A3A3',
    fontSize: 15
  },
  addButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addButtonText: {
    
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  dealerCard: {
    backgroundColor: '#19213A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dealerName: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
    flex: 1,
  },
  dealerInfo: {
    color: '#A3A3A3',
    fontSize: 13,
    marginLeft: 12,
    flex: 1,
  },
  dealerActions: {
    flexDirection: 'row',
    marginLeft: 12,
  },
  iconBtn: {
    marginLeft: 8,
    padding: 4,
  },
  placeholderText: {
    color: '#A3A3A3',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 32,
  },
});

export default RecordsScreen;