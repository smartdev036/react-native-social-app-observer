import React from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {MainStackNavigator} from './stackNavigator';
import {BottomTabBarProps, BottomTabNavigationEventMap, createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Radio from '../screens/home/radio';
import TabNavigatiorContent from '../components/tabNavigatiorContent';
import PodcastStack from './podcastStack';
import OpinionStack from './opinionStack';
import {BottomTabDescriptorMap} from '@react-navigation/bottom-tabs/lib/typescript/src/types';
import {TabNavigationState, ParamListBase, NavigationHelpers, DrawerActions} from '@react-navigation/native';
import Morestack from './moreStack';

interface MyTabBarProps {
  state: TabNavigationState<ParamListBase>;
  descriptors: BottomTabDescriptorMap;
  navigation: NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>;
}

const Tab = createBottomTabNavigator();

function MyTabBar(props: MyTabBarProps) {
  const {state, descriptors, navigation} = props;
  const insets = useSafeAreaInsets();

  return <TabNavigatiorContent state={state} descriptors={descriptors} insets={insets} navigation={navigation}/>;
}

const BottomTabNavigator = () => {
  const navOptions = () => ({
    headerShown: false,
  });
  return (
    <Tab.Navigator initialRouteName="Home" tabBar={(props: BottomTabBarProps) => <MyTabBar {...props} />}>
      <Tab.Screen name="Inicio" component={MainStackNavigator} options={navOptions}/>
      <Tab.Screen name="Podcast" component={PodcastStack} options={navOptions}/>
      <Tab.Screen name="Rádio" component={Radio} options={navOptions}/>
      <Tab.Screen name="Opinião" component={OpinionStack} options={navOptions}/>
      <Tab.Screen name="Mais" component={Morestack} options={navOptions}
        listeners={({navigation}) => ({
          tabPress: (e: { preventDefault: () => void; }) => {
            e.preventDefault();
            navigation.dispatch(DrawerActions.openDrawer());
          },
        })}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
