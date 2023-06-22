import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from '../../../../components/icon';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../../../../hooks';

interface HeaderProps {
  onShare?: any;
  iconColor?: string;
}

function Header(props: HeaderProps) {
  const { onShare, iconColor } = props;
  const navigation = useNavigation();
  const themeState = useAppSelector(state => state.theme);

  return (
    <View style={[styles.container, { maxWidth: themeState.themeOrientation.maxW }]}>
      {navigation ? (
        <TouchableOpacity accessibilityLabel={'Voltar'} activeOpacity={0.9} onPress={() => navigation.goBack()} style={styles.arrowContainer}>
          <Icon name="arrow" size={18} fill={iconColor ?? themeState.themeColor.color} color={iconColor ?? themeState.themeColor.color} disableFill={false} />
        </TouchableOpacity>
      ) : (
        <View style={styles.noNav} />
      )}
      <View style={styles.middleNav} />
      {onShare ? (
        <TouchableOpacity accessibilityLabel={'Partilhar'} onPress={onShare} style={styles.shareContainer}>
          <Icon name="share" size={18} disableFill fill={iconColor ?? themeState.themeColor.color} color={iconColor ?? themeState.themeColor.color} />
        </TouchableOpacity>
      ) : (
        <View style={styles.noShare} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    marginRight: 'auto',
    width: '100%',
  },
  arrowContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  noNav: {
    flex: 1,
  },
  middleNav: {
    flex: 1,
    height: 50,
  },
  shareContainer: {
    flex: 1,
    alignItems: 'flex-end',
    paddingHorizontal: 15,
  },
  noShare: {
    flex: 1,
  },
});

export default Header;
