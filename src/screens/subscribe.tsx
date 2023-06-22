import React, { useEffect } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import HeaderScreens from '../components/header/headerScreens';
import { useAppDispatch, useAppSelector } from '../hooks';
import Paywall from '../components/premium/paywall';
import { sendQualityReadsLanding } from '../reducers/analytics';
import { ContentType, EVENT_KIND_VIEW } from '../utils/qualityReads';

const Subscribe = () => {
  const themeState = useAppSelector(state => state.theme);
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(
      sendQualityReadsLanding({
        t: new Date().getTime(),
        e: EVENT_KIND_VIEW,
        ci: 'landing',
        cp: false,
        ct: ContentType.PAGE,
        cu: true,
        si: false,
      }),
    );
  }, []);

  return (
    <SafeAreaView style={[styles.safeAreaView, { backgroundColor: themeState.themeColor.background }]}>
      <HeaderScreens isArticlePage={false} hasTitle={false} />
      <View style={styles.container}>
        <Paywall />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
  },
  container: {
    flex: 1,
    marginHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Subscribe;
