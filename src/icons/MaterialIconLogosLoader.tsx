import React from 'react';
import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import { useFonts, MaterialIcons_400Regular } from '@expo-google-fonts/material-icons';

const MaterialIconLogos: React.FC = () => {
  const [fontsLoaded] = useFonts({
    MaterialIcons_400Regular,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="small" />
      </View>
    );
  }

  return (
    <View style={styles.center}>
      <Text style={styles.icon} accessibilityLabel="material-icon-demo">
        &#xE8F4;
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  icon: {
    fontFamily: 'MaterialIcons_400Regular',
    fontSize: 48,
  },
});

export default MaterialIconLogos;
