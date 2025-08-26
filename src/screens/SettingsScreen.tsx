import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SettingsScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Settings Screen</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { alignItems: 'center', backgroundColor: '#1F2937', flex: 1, justifyContent: 'center' },
  text: { color: '#fff', fontSize: 20, fontWeight: '600' },
});

export default SettingsScreen;