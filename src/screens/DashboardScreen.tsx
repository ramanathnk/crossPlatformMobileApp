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

import { colors, spacing, fontSizes, borderRadius, fontWeights } from '../styles/theme';
import { textStyles, cardStyles } from '../styles/commonStyles';

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
                <MaterialIconComponent Icon={MobileCheckIcon} size={28} color={colors.primary} />
              </View>
              <Text style={styles.moduleTitle}>Device Requests</Text>
              <Text style={styles.moduleSubtitle}>Review & approve</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.moduleCard} onPress={() => navigation.navigate('RegisterDevice')}>
              <View style={styles.moduleIconContainer}>
                <MaterialIconComponent Icon={AddBoxIcon} size={28} color={colors.primary} />
              </View>
              <Text style={styles.moduleTitle}>Register Device</Text>
              <Text style={styles.moduleSubtitle}>Add new device</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.moduleCard}>
              <View style={styles.moduleIconContainer}>
                <MaterialIconComponent Icon={TableEditIcon} size={28} color={colors.primary} />
              </View>
              <Text style={styles.moduleTitle}>Manage Records</Text>
              <Text style={styles.moduleSubtitle}>Edit & update</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.moduleCard} onPress={() => navigation.navigate('Devices')}>
              <View style={styles.moduleIconContainer}>
                <MaterialIconComponent Icon={TableEditIcon} size={28} color={colors.primary} />
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
    backgroundColor: colors.background,
    paddingBottom: spacing.sm,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  logoTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appName: {
    fontSize: fontSizes.xlarge,
    fontWeight: fontWeights.semibold,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  logoutButton: {
    width: 40,
    height: 40,
    backgroundColor: colors.card,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    fontSize: fontSizes.large,
    fontWeight: fontWeights.semibold,
    color: colors.text,
  },
  dashboardHeader: {
    marginBottom: spacing.lg,
  },
  dashboardTitle: {
    fontSize: fontSizes.xxlarge,
    fontWeight: fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  dashboardSubtitle: {
    fontSize: fontSizes.medium,
    color: colors.muted,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#2D3748',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md - 4,
  },
  statIconPending: {
    backgroundColor: colors.accent,
  },
  statIconRegistered: {
    backgroundColor: '#10B981',
  },
  statNumber: {
    fontSize: fontSizes.xxlarge,
    fontWeight: fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: fontSizes.small,
    color: colors.muted,
    textAlign: 'center',
  },
  sectionContainer: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSizes.small,
    fontWeight: fontWeights.semibold,
    color: colors.muted,
    letterSpacing: 1,
  },
  viewAllText: {
    fontSize: fontSizes.medium,
    color: colors.primary,
  },
  moduleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  moduleCard: {
    width: '47%',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  moduleIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: colors.border,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md - 4,
  },
  moduleTitle: {
    fontSize: fontSizes.medium,
    fontWeight: fontWeights.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  moduleSubtitle: {
    fontSize: fontSizes.small,
    color: colors.muted,
    textAlign: 'center',
  },
  activityList: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
  },
  noActivityText: {
    fontSize: fontSizes.medium,
    color: colors.muted,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    marginTop: 'auto',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  navLabel: {
    fontSize: fontSizes.small,
    color: colors.muted,
  },
  navLabelActive: {
    color: colors.primary,
  },
});

export default DashboardScreen;