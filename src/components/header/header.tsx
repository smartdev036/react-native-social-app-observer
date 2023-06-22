import React from 'react';
import { View, StyleSheet, StatusBar, Platform } from 'react-native';
import { CustomLogo } from './logo';
import { OS } from '../../constants';
import { useAppSelector } from '../../hooks';

interface CustomHeaderProps {
  isHome: boolean;
  menuColor: string;
}

function CustomHeader(props: CustomHeaderProps) {
  const { isHome } = props;
  const statusBarHeight = StatusBar.currentHeight !== null && undefined ? StatusBar.currentHeight : isHome ? 50 : 0;
  const themeState = useAppSelector(state => state.theme);

  return (
    <View style={{ marginTop: Platform.OS === OS.android ? 10 : statusBarHeight }}>
      <View style={styles.logoContainer}>
        <View style={[styles.center, { flex: 1 }]} />
        <View style={[styles.center, { flex: 3 }]}>
          <CustomLogo iconColor={isHome ? themeState.themeColor.color : undefined} isHome={isHome} size={136} />
        </View>
        <View style={{ flex: 1 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    flexDirection: 'row',
    height: 50,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CustomHeader;
