import React from 'react';
import { Text, View, ActivityIndicator } from 'react-native';
import { useFonts, MaterialIcons_400Regular } from '@expo-google-fonts/material-icons';

const MaterialIconLogos: React.FC = () => {
  const [fontsLoaded] = useFonts({
    MaterialIcons_400Regular,
  });

  if (!fontsLoaded) {
    return <ActivityIndicator />;
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontFamily: 'MaterialIcons_400Regular', fontSize: 48 }}>
        {/*&#xE87C; { Example: home icon unicode }*/}
        &#xE8F4; {/* Example: Eye icon unicode for show password */}
      </Text>
    </View>
  );
};

export default MaterialIconLogos;