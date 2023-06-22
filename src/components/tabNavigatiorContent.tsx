import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, StatusBar, StatusBarStyle } from 'react-native';
import { renderIcon } from '../utils/renderIcon';
import { theme } from '../constants/theme';
import { BottomTabDescriptorMap } from '@react-navigation/bottom-tabs/lib/typescript/src/types';
import { TabNavigationState, ParamListBase } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OS } from '../constants/';
import { useAppSelector } from '../hooks';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TabNavigatorContentProps {
  navigation: NativeStackNavigationProp<ParamListBase>;
  state: TabNavigationState<ParamListBase>;
  descriptors: BottomTabDescriptorMap;
  insets: {
    bottom: number;
    left: number;
    right: number;
    top: number;
  };
}

const TabNavigatiorContent = (props: TabNavigatorContentProps) => {
  const { state, descriptors, insets, navigation } = props;
  const heightInsets = 55 + insets.bottom;
  const marginBotInsets = insets.bottom > 0 ? 16 : 0;
  const themeState = useAppSelector(state => state.theme);
  const [drawer, setDrawer] = useState<boolean>();
  const barStyle = themeState.themeColor.barStyle as StatusBarStyle;

  useEffect(() => {
    checkDrawer();
  });

  const setIndex = async (index: string) => {
    await AsyncStorage.setItem('index', index);
  };

  const setRoute = async (name: string) => {
    await AsyncStorage.setItem('routeName', name);
  };

  const checkDrawer = async () => {
    const index = await AsyncStorage.getItem('index');
    if (index == null) {
      setDrawer(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: themeState.themeColor.background,
          shadowColor: themeState.themeColor.shadowColor,
          height: heightInsets,
        },
      ]}
    >
      {state.routes.map((route: { key: string | number; name: string }, index: number) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel !== undefined ? options.tabBarLabel : options.title !== undefined ? options.title : route.name;
        const isFocused = state.index === index && !drawer;
        const colorStatus = isFocused ? theme.colors.brandBlue : themeState.themeColor.colorMenu;
        const colorStatusDrawer = drawer ? theme.colors.brandBlue : themeState.themeColor.colorMenu;
        const colorText = isFocused ? themeState.themeColor.colorMenu : themeState.themeColor.colorMenu;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented && index !== 4) {
            navigation.navigate({
              name: route.name,
              merge: true,
              params: {},
            });
            setDrawer(false);
          }

          if (index === 4) {
            setDrawer(true);
            setIndex('1');
          } else {
            setRoute(route.name);
          }

          if (index === 2) {
            if (Platform.OS === OS.android) {
              StatusBar.setBackgroundColor(theme.colors.radioBg);
              StatusBar.setBarStyle('light-content');
            } else {
              StatusBar.setBarStyle('light-content', true);
            }
          } else {
            if (Platform.OS === OS.android) {
              StatusBar.setBackgroundColor(themeState.themeColor.colorStatusbar);
              StatusBar.setBarStyle(barStyle);
            } else {
              StatusBar.setBarStyle(barStyle, true);
            }
          }
        };

        function showIcon() {
          switch (route.name) {
            case 'Inicio':
              return renderIcon('inicio', 24, false, colorStatus);
            case 'Podcast':
              return renderIcon('podcast', 24, false, colorStatus);
            case 'Rádio':
              return renderIcon('radio', 24, false, colorStatus);
            case 'Opinião':
              return renderIcon('opiniao', 24, false, colorStatus);
            case 'Mais':
              return renderIcon('mais', 24, false, colorStatusDrawer);
            default:
              return renderIcon('inicio', 24, false, colorStatus);
          }
        }

        return (
          <TouchableOpacity
            key={route.key}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            style={[styles.btn, { marginBottom: marginBotInsets }]}
          >
            <View style={styles.btnContent}>
              <View style={styles.icon}>{showIcon()}</View>
              <Text style={[styles.text, { color: colorText }]}>{label as string}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    elevation: 4,
  },
  btn: {
    flex: 1,
  },
  btnContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    marginBottom: 0,
  },
  text: {
    fontFamily: theme.fonts.halyardRegular,
    fontSize: 12,
  },
});

export default TabNavigatiorContent;
