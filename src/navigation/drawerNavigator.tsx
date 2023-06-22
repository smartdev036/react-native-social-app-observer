import React from 'react';
import BottomTabNavigator from './tabNavigator';
import { createDrawerNavigator } from '@react-navigation/drawer';
import DrawerContentMenu from '../components/menu/menu';

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={() => <DrawerContentMenu />}
      screenOptions={{
        drawerStyle: {
          width: '100%',
        },
        swipeEnabled: true,
        drawerPosition: 'right',
      }}
    >
      <Drawer.Screen name="Home" component={BottomTabNavigator} options={{ headerShown: false, unmountOnBlur: true }} />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
