import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Podcasts from '../screens/home/podcasts';
import Program from '../screens/home/podcasts/program';
import Episode from '../screens/home/podcasts/episode';
import { NativeStackNavigatorProps } from 'react-native-screens/lib/typescript/native-stack/types';

const Stack = createNativeStackNavigator<NativeStackNavigatorProps>();

const PodcastStack = () => {
  const navOptions = () => ({
    headerShown: false,
  });
  return (
    <Stack.Navigator initialRouteName="Podcasts">
      <Stack.Screen name="Podcasts" component={Podcasts} options={navOptions} />
      <Stack.Screen name="Program" component={Program} options={navOptions} />
      <Stack.Screen name="Episode" component={Episode} options={navOptions} />
    </Stack.Navigator>
  );
};

export default PodcastStack;
