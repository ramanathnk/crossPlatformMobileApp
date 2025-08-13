import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import SnaptrackerLogo from '../icons/SnapTrackerLogo';

import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../../App';
import MaterialIconComponent from '../icons/MaterialIconComponent';

import TableEditIcon from '../../assets/material-icons/table_edit.svg';
import AddBoxIcon from '../../assets/material-icons/add_box.svg';
import MobileCheckIcon from '../../assets/material-icons/mobile_check.svg';
import PendingActionsIcon from '../../assets/material-icons/pending_actions.svg';


const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'RegisterDevice'>>();
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Row: Logo, SnapTracker, AT Button */}
        <View style={styles.headerRow}>
          <View style={styles.logoTextRow}>
            <SnaptrackerLogo width={32} height={32} />
            <Text style={styles.appName}>SnapTracker</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} activeOpacity={1}>
            <Text style={styles.logoutText}>AT</Text>
          </TouchableOpacity>
        </View>

        {/* Dashboard Title */}
        <View style={styles.dashboardHeader}>
          <Text style={styles.dashboardTitle}>Dashboard</Text>
          <Text style={styles.dashboardSubtitle}>Device Registration Portal</Text>
        </View>

        {/* Statistics Cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, styles.statIconPending]}>
              <MaterialIconComponent Icon={PendingActionsIcon} size={28} color="#fff" />
            </View>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Pending Requests</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, styles.statIconRegistered]}>
              <MaterialIconComponent Icon={MobileCheckIcon} size={28} color="#fff" />
            </View>
            <Text style={styles.statNumber}>7</Text>
            <Text style={styles.statLabel}>Registered Today</Text>
          </View>
        </View>

        {/* Core Modules */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>CORE MODULES</Text>
          <View style={styles.moduleGrid}>
            <TouchableOpacity style={styles.moduleCard} onPress={() => navigation.navigate('DeviceRequests')}>
              <View style={styles.moduleIconContainer}>
                <MaterialIconComponent Icon={MobileCheckIcon} size={28} color="#3B82F6" />
              </View>
              <Text style={styles.moduleTitle}>Device Requests</Text>
              <Text style={styles.moduleSubtitle}>Review & approve</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.moduleCard} onPress={() => navigation.navigate('RegisterDevice')}>
              <View style={styles.moduleIconContainer}>
                <MaterialIconComponent Icon={AddBoxIcon} size={28} color="#3B82F6" />
              </View>
              <Text style={styles.moduleTitle}>Register Device</Text>
              <Text style={styles.moduleSubtitle}>Add new device</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.moduleCard}>
              <View style={styles.moduleIconContainer}>
                <MaterialIconComponent Icon={TableEditIcon} size={28} color="#3B82F6" />
              </View>
              <Text style={styles.moduleTitle}>Manage Records</Text>
              <Text style={styles.moduleSubtitle}>Edit & update</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.moduleCard} onPress={() => navigation.navigate('Devices')}>
              <View style={styles.moduleIconContainer}>
                <MaterialIconComponent Icon={TableEditIcon} size={28} color="#3B82F6" />
              </View>
              <Text style={styles.moduleTitle}>View Devices</Text>
              <Text style={styles.moduleSubtitle}>All registrations</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>RECENT ACTIVITY</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.activityList}>
            <Text style={styles.noActivityText}>No recent activity</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F2937',
    paddingBottom: 8,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  logoTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 10,
  },
  logoutButton: {
    width: 40,
    height: 40,
    backgroundColor: '#374151',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dashboardHeader: {
    marginBottom: 24,
  },
  dashboardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  dashboardSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#2D3748',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIconPending: {
    backgroundColor: '#F59E42',
  },
  statIconRegistered: {
    backgroundColor: '#10B981',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  sectionContainer: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 1,
  },
  viewAllText: {
    fontSize: 14,
    color: '#3B82F6',
  },
  moduleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  moduleCard: {
    width: '47%',
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  moduleIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#4B5563',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  moduleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  moduleSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  activityList: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  noActivityText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#374151',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginTop: 'auto',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navLabel: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  navLabelActive: {
    color: '#3B82F6',
  },
});

export default DashboardScreen;