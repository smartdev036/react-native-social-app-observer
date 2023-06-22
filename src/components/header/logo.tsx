import React from 'react';
import {View, StyleSheet} from 'react-native';
import Icon from '../icon';

interface CustomLogoProps {
  size: number;
  iconColor: string | undefined;
  isHome: boolean;
}

export function CustomLogo(props: CustomLogoProps) {
  const {size, iconColor, isHome} = props;
  return (
    <View style={styles.container}>
      <View style={styles.primaryLogo}>
        <Icon
          name={isHome ? 'logo-observador' : 'logo-radio'}
          size={size}
          fill={iconColor}
          color={iconColor}
          disableFill={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  primaryLogo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
