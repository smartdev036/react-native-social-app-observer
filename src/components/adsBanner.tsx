import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BannerAd } from 'react-native-google-mobile-ads';
import { theme } from '../constants/theme';
import { useAppSelector } from '../hooks';

export interface RequestOptions {
  customTargeting: {
    position: string;
    user?: string;
  };
}

interface AdsBannerProps {
  unitId: string;
  size: string;
  hasBackground?: boolean;
  requestOptions: RequestOptions;
  inList?: true;
}

const AdsBanner = (props: AdsBannerProps) => {
  const { unitId, size, hasBackground, requestOptions, inList } = props;
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const { themeState, piano } = useAppSelector(s => ({
    themeState: s.theme,
    piano: s.piano,
  }));

  let tmp: RequestOptions = {
    customTargeting: {
      position: requestOptions.customTargeting.position,
      user: 'none',
    },
  };
  if (piano.isPremium) {
    tmp = {
      customTargeting: {
        position: requestOptions.customTargeting.position,
        user: 'premium',
      },
    };
  }

  useEffect(() => {
    setLoadFailed(false);
    return () => {
      setLoaded(false);
    };
  }, []);

  return !loadFailed ? (
    <View
      accessible={true}
      accessibilityLabel={'Publicidade'}
      style={[
        styles.container,
        {
          borderColor: hasBackground ? themeState.themeColor.background : themeState.themeColor.transparent,
          backgroundColor: hasBackground ? themeState.themeColor.background : themeState.themeColor.transparent,
        },
      ]}
    >
      <View style={[styles.mainAds, { display: hasBackground ? 'flex' : 'none' }]}>
        <Text style={[styles.title, { fontSize: themeState.fontStyles.ads.fontSize, fontFamily: themeState.fontStyles.ads.fontFamily }]}>Publicidade</Text>
      </View>
      <View style={styles.pubContainer}>
        <BannerAd
          unitId={unitId}
          requestOptions={tmp}
          onAdFailedToLoad={r => {
            setLoadFailed(true);
            if (r.message === '[googleMobileAds/no-fill] Request Error: No ad to show.') {
              setError(true);
            }
          }}
          size={size}
          onAdLoaded={() => {
            setLoaded(true);
            setLoadFailed(false);
          }}
        />
      </View>
    </View>
  ) : (
    <></>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: 12,
  },
  mainAds: {
    marginHorizontal: 15,
    paddingVertical: 4,
  },
  title: {
    color: theme.colors.brandGrey,
  },
  containerAds: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pubContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AdsBanner;
