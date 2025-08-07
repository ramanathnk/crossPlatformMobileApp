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

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'Dashboard'>>();
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo and App Name */}
        <View style={styles.headerContainer}>
          <View style={styles.logoContainer}>
            <SnaptrackerLogo width={120} height={50} />   
            <Text style={styles.appName}>SnapTracker</Text>
          </View>
        </View>

        {/* Header */}
        <View style={styles.dashboardHeader}>
          <View style={styles.dashboardTitleContainer}>
            <Text style={styles.dashboardTitle}>Dashboard</Text>
            <Text style={styles.dashboardSubtitle}>Device Registration Portal</Text>
          </View>
          <TouchableOpacity 
            style={styles.logoutButton}
            activeOpacity={1}
          >
            <Text style={styles.logoutText}>AT</Text>
          </TouchableOpacity>
        </View>

        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Text style={styles.statIcon}>📋</Text>
            </View>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Total Devices</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, styles.statIconGreen]}>
              <Text style={styles.statIcon}>✓</Text>
            </View>
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>Registered</Text>
          </View>
        </View>

        {/* Core Modules */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>CORE MODULES</Text>
          <View style={styles.moduleGrid}>
            <TouchableOpacity style={styles.moduleCard}>
              <View style={styles.moduleIconContainer}>
                <Text style={styles.moduleIcon}>📱</Text>
              </View>
              <Text style={styles.moduleTitle}>Device Requests</Text>
              <Text style={styles.moduleSubtitle}>Review & approve</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.moduleCard} onPress={() => navigation.navigate('RegisterDevice')}>
              <View style={styles.moduleIconContainer}>
                <Text style={styles.moduleIcon}>➕</Text>
              </View>
              <Text style={styles.moduleTitle}>Register Device</Text>
              <Text style={styles.moduleSubtitle}>Add new device</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.moduleCard}>
              <View style={styles.moduleIconContainer}>
                <Text style={styles.moduleIcon}>📊</Text>
              </View>
              <Text style={styles.moduleTitle}>Manage Records</Text>
              <Text style={styles.moduleSubtitle}>Edit & update</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.moduleCard}>
              <View style={styles.moduleIconContainer}>
                <Text style={styles.moduleIcon}>👁️</Text>
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

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem}>
            <Text style={styles.navIcon}>🏠</Text>
            <Text style={[styles.navLabel, styles.navLabelActive]}>Dashboard</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navItem}>
            <Text style={styles.navIcon}>📋</Text>
            <Text style={styles.navLabel}>Requests</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navItem}>
            <Text style={styles.navIcon}>📱</Text>
            <Text style={styles.navLabel}>Devices</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navItem}>
            <Text style={styles.navIcon}>⚙️</Text>
            <Text style={styles.navLabel}>Settings</Text>
          </TouchableOpacity>
        </View>
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
    paddingTop: 60,
    paddingBottom: 40,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 60,
    height: 60,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoText: {
    fontSize: 28,
    color: '#FFFFFF',
  },
  appName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 8,
  },
  dashboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  dashboardTitleContainer: {
    flex: 1,
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
  logoutButton: {
    width: 40,
    height: 40,
    backgroundColor: '#374151',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#4B5563',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIconGreen: {
    backgroundColor: '#059669',
  },
  statIcon: {
    fontSize: 20,
    color: '#FFFFFF',
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
  },
  moduleCard: {
    width: '47%',
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
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
  moduleIcon: {
    fontSize: 24,
    color: '#FFFFFF',
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
  navIcon: {
    fontSize: 20,
    marginBottom: 4,
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
