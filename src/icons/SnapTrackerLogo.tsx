import React from 'react';
import { Image, View, StyleSheet } from 'react-native';

import SnapTrackerLogoImg from '../../assets/SnapTrackerLogoNew1024.png';

const SnaptrackerLogo: React.FC<{ width?: number; height?: number }> = ({
  width = 220,
  height = 100,
}) => (
  <View style={styles.container}>
    <Image source={SnapTrackerLogoImg} style={{ width, height }} resizeMode="contain" />
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SnaptrackerLogo;
