import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BannerAd } from 'react-native-google-mobile-ads';
import { theme } from '../constants/theme';
import { useAppSelector } from '../hooks';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import Icon from './icon';
import { LOG } from '../utils/logger';

interface RequestOptions {
  customTargeting: {
    position: string;
    user?: string;
  };
}

interface IntroProps {
  unitId: string;
  onClose: () => void;
}

const IntroBanner = (props: IntroProps) => {
  const { unitId, onClose } = props;
  const [adsLoaded, setAdsLoaded] = useState(false);
  const { themeState } = useAppSelector(s => ({
    themeState: s.theme,
  }));

  const tmp: RequestOptions = {
    customTargeting: {
      position: '',
      user: 'none',
    },
  };

  return (
    <View style={[{ backgroundColor: themeState.themeColor.background, display: adsLoaded ? 'flex' : 'none' }, styles.introWrapper]}>
      <View style={styles.header}>
        <View>
          <Icon name="logo-observador" size={130} fill={themeState.themeColor.color} color={themeState.themeColor.color} disableFill={false} />
        </View>
        <TouchableOpacity activeOpacity={0.9} onPress={onClose} style={styles.closeWrapper}>
          <Text style={[{ color: themeState.themeColor.color }, styles.closeText]}>Avançar</Text>
          <View style={[styles.close, {backgroundColor: theme.colors.brandBlue}]}>
            <Icon name="arrow" size={30} fill={'white'} color={'white'} disableFill={false} style={styles.icon} />
          </View>
        </TouchableOpacity>
      </View>
      <ScrollView>
        <View style={[styles.pubContainer, { display: adsLoaded ? 'flex' : 'none' }]}>
          <BannerAd
            unitId={unitId}
            requestOptions={tmp}
            onAdFailedToLoad={r => {
              LOG.info('PUB ERROR', r);
              onClose();
            }}
            size={'300x480'}
            onAdLoaded={() => {
              setAdsLoaded(true);
            }}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  introWrapper: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 10,
    width: '100%',
    height: '100%',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
    paddingHorizontal: 10,
  },
  pubContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
  },
  closeWrapper: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center'
  },
  closeText: {
    fontSize: 17,
    marginRight: 10,
    textTransform: 'uppercase',
  },
  close: {
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center'
  },
  icon: {
    transform: [{ rotate: '180deg' }]
  }
});

export default IntroBanner;
