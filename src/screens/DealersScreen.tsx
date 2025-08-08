import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DealersScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Dealers Screen</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1F2937' },
  text: { color: '#fff', fontSize: 20, fontWeight: '600' },
});

export default DealersScreen;