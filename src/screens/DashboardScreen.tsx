import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import SnaptrackerLogo from '../icons/SnapTrackerLogo';

import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../../App';
import MaterialIconComponent from '../icons/MaterialIconComponent';
import TableEditIcon from '../../assets/material-icons/table_edit.svg';
import AddBoxIcon from '../../assets/material-icons/add_box.svg';
import MobileCheckIcon from '../../assets/material-icons/mobile_check.svg';
import ConciergeIcon from '../../assets/material-icons/concierge.svg';
import PendingActionsIcon from '../../assets/material-icons/pending_actions.svg';

import { colors, spacing, fontSizes, borderRadius, fontWeights } from '../styles/theme';

const STAT_CARD_BG = '#2D3748';
const STAT_REGISTERED_BG = '#10B981';
const SHADOW_COLOR = '#000';

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
          <View style={[styles.statCard, styles.statCardBg]}>
            <View style={[styles.statIconContainer, styles.statIconPending]}>
              <MaterialIconComponent Icon={PendingActionsIcon} size={28} color="#fff" />
            </View>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Pending Requests</Text>
          </View>
          <View style={[styles.statCard, styles.statCardBgRegistered]}>
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
            <TouchableOpacity
              style={styles.moduleCard}
              onPress={() => navigation.navigate('DeviceRequests')}
            >
              <View style={styles.moduleIconContainer}>
                <MaterialIconComponent Icon={ConciergeIcon} size={28} color={colors.primary} />
              </View>
              <Text style={styles.moduleTitle}>Device Requests</Text>
              <Text style={styles.moduleSubtitle}>Review & approve</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.moduleCard}
              onPress={() => navigation.navigate('RegisterDevice')}
            >
              <View style={styles.moduleIconContainer}>
                <MaterialIconComponent Icon={AddBoxIcon} size={28} color={colors.primary} />
              </View>
              <Text style={styles.moduleTitle}>Register Device</Text>
              <Text style={styles.moduleSubtitle}>Add new device</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.moduleCard}
              onPress={() => navigation.navigate('RecordsScreen')}
            >
              <View style={styles.moduleIconContainer}>
                <MaterialIconComponent Icon={TableEditIcon} size={28} color={colors.primary} />
              </View>
              <Text style={styles.moduleTitle}>Manage Records</Text>
              <Text style={styles.moduleSubtitle}>Edit & update</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.moduleCard}
              onPress={() => navigation.navigate('Devices')}
            >
              <View style={styles.moduleIconContainer}>
                <MaterialIconComponent Icon={MobileCheckIcon} size={28} color={colors.primary} />
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
  activityList: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
  },
  appName: {
    color: colors.text,
    fontSize: fontSizes.xlarge,
    fontWeight: fontWeights.semibold,
    marginLeft: spacing.sm,
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
    paddingBottom: spacing.sm,
  },
  dashboardHeader: {
    marginBottom: spacing.lg,
  },
  dashboardSubtitle: {
    color: colors.muted,
    fontSize: fontSizes.medium,
  },
  dashboardTitle: {
    color: colors.text,
    fontSize: fontSizes.xxlarge,
    fontWeight: fontWeights.bold,
    marginBottom: spacing.xs,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  logoTextRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  logoutButton: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  logoutText: {
    color: colors.text,
    fontSize: fontSizes.large,
    fontWeight: fontWeights.semibold,
  },
  moduleCard: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    width: '47%',
  },
  moduleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  moduleIconContainer: {
    alignItems: 'center',
    backgroundColor: colors.border,
    borderRadius: borderRadius.md,
    height: 48,
    justifyContent: 'center',
    marginBottom: spacing.md - 4,
    width: 48,
  },
  moduleSubtitle: {
    color: colors.muted,
    fontSize: fontSizes.small,
    textAlign: 'center',
  },
  moduleTitle: {
    color: colors.text,
    fontSize: fontSizes.medium,
    fontWeight: fontWeights.semibold,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  noActivityText: {
    color: colors.muted,
    fontSize: fontSizes.medium,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  sectionContainer: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: colors.muted,
    fontSize: fontSizes.small,
    fontWeight: fontWeights.semibold,
    letterSpacing: 1,
  },
  statCard: {
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    elevation: 2,
    flex: 1,
    marginHorizontal: spacing.xs,
    padding: spacing.lg,
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  statCardBg: {
    backgroundColor: STAT_CARD_BG,
    shadowColor: SHADOW_COLOR,
  },
  statCardBgRegistered: {
    backgroundColor: STAT_CARD_BG,
    shadowColor: SHADOW_COLOR,
  },
  statIconContainer: {
    alignItems: 'center',
    borderRadius: borderRadius.md,
    height: 48,
    justifyContent: 'center',
    marginBottom: spacing.md - 4,
    width: 48,
  },
  statIconPending: {
    backgroundColor: colors.accent,
  },
  statIconRegistered: {
    backgroundColor: STAT_REGISTERED_BG,
  },
  statLabel: {
    color: colors.muted,
    fontSize: fontSizes.small,
    textAlign: 'center',
  },
  statNumber: {
    color: colors.text,
    fontSize: fontSizes.xxlarge,
    fontWeight: fontWeights.bold,
    marginBottom: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  viewAllText: {
    color: colors.primary,
    fontSize: fontSizes.medium,
  },
});

export default DashboardScreen;
