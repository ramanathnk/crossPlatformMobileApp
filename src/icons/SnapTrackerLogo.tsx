import React from 'react';
import { View, StyleSheet } from 'react-native';
import SnapTrackerLogo from '../../assets/SnapTracker_logo_2019.svg';

const SnaptrackerLogo: React.FC<{ width?: number; height?: number }> = ({ width = 220, height = 100 }) => (
  <View style={styles.container}>
    <SnapTrackerLogo width={width} height={height} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SnaptrackerLogo;