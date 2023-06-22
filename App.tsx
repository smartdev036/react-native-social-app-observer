import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Dimensions, LogBox, StyleSheet, View } from 'react-native';
import * as Font from 'expo-font';
import { enableScreens } from 'react-native-screens';
import { firebase } from '@react-native-firebase/analytics';
import { cleanSubscripitionsConfirmation, initSubscriptionsManager } from './src/utils/piano';
import { useAppDispatch, useAppSelector } from './src/hooks';
import { setThemeOrientation } from './src/reducers/theme';
import crashlytics from '@react-native-firebase/crashlytics';
import TrackPlayer, { AppKilledPlaybackBehavior, Capability } from 'react-native-track-player';
import * as SplashScreen from 'expo-splash-screen';
import { Routes } from './src/routes';
import { useNetInfo } from '@react-native-community/netinfo';
import { useToast } from 'react-native-toast-notifications';
import { theme } from './src/constants/theme';

enableScreens();

export default function App() {
  const themeState = useAppSelector(state => state.theme);
  const [ready, setReady] = useState<boolean>();
  const dispatch = useAppDispatch();
  const netInfo = useNetInfo();
  const toast = useToast();
  const toastRef = useRef(null);

  LogBox.ignoreLogs([
    'new NativeEventEmitter',
    'RCTBridge required dispatch_sync to load RCTDevLoadingView',
    'RCTBridge required dispatch_sync to load REAModule. This may lead to deadlocks',
    'Did not receive response to shouldStartLoad in time, defaulting to YES',
    'You seem to update the renderers prop(s) of the "RenderHTML" component in short periods of time',
    'Sending `onAnimatedValueUpdate` with no listeners registered.',
    'Non-serializable values were found in the navigation state.',
    'Sending',
    'The operation couldn’t be completed.',
  ]);

  // Fonts and Icons
  async function loadResourcesAsync() {
    await Promise.all([
      Font.loadAsync({
        'NotoSerif-Bold': require('./src/assets/fonts/NotoSerif-Bold.ttf'),
        'NotoSerif-BoldItalic': require('./src/assets/fonts/NotoSerif-BoldItalic.ttf'),
        'NotoSerif-Italic': require('./src/assets/fonts/NotoSerif-Italic.ttf'),
        'NotoSerif-Regular': require('./src/assets/fonts/NotoSerif-Regular.ttf'),
        'HalyardText-Reg': require('./src/assets/fonts/HalyardText-Reg.otf'),
        'HalyardText-Bd': require('./src/assets/fonts/HalyardText-Bd.otf'),
        'HalyardTextSemBd': require('./src/assets/fonts/HalyardTextSemBd.otf'),
        'HalyardTextBook': require('./src/assets/fonts/HalyardTextBook.otf'),
        'IcoMoon': require('./src/assets/icons/icomoon.ttf'),
      }),
    ]);
  }

  const readyApp = async () => {
    try {
      await loadResourcesAsync();
      await SplashScreen.preventAutoHideAsync();
    } catch (e: Error | any) {
      crashlytics().recordError(e);
      crashlytics().log('Error: readyApp');
    } finally {
      setReady(true);
    }
  };

  const getOrientation = () => {
    const screen = Dimensions.get('screen');
    if (screen.height > screen.width) {
      return 'portrait';
    }
    return 'landscape';
  };

  useEffect(() => {
    (async () => {
      await firebase.analytics().logAppOpen();
    })();
    readyApp();
    initSubscriptionsManager();
    return () => {
      cleanSubscripitionsConfirmation();
    };
  }, []);

  useEffect(() => {
    TrackPlayer.setupPlayer({ waitForBuffer: true })
      .then(() => {
        TrackPlayer.updateOptions({
          android: {
            appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
          },
          capabilities: [Capability.Play, Capability.Pause],
          compactCapabilities: [Capability.Play, Capability.Pause],
          notificationCapabilities: [Capability.Play, Capability.Pause],
        });
      })
      .catch(err => {
        crashlytics().log('Error: Setup player index.js');
      });
  }, []);

  useEffect(() => {
    if (netInfo.isConnected === false) {
      if (!toastRef.current) {
        toast.show('Volte a ligar-se à Internet para continuar.', {
          type: 'normal',
          placement: 'bottom',
          duration: 0,
          animationType: 'slide-in',
          swipeEnabled: false,
          textStyle: { fontSize: 14, color: theme.colors.white, fontFamily: theme.fonts.halyardRegular, textAlign: 'center' },
          normalColor: theme.colors.brandBlue,
          style: {
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 0,
          },
        });
      }
    } else {
      if (ready) {
        toast.hideAll();
      }
    }
  }, [netInfo?.isConnected]);

  const onLayoutRootView = useCallback(async () => {
    dispatch(setThemeOrientation(getOrientation()));
    if (ready) {
      await SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) {
    return null;
  }

  return (
    <View onLayout={onLayoutRootView} style={[styles.container, { backgroundColor: themeState.themeColor.background }]}>
      <Routes />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
