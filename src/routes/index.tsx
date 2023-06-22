import React, { useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { NavigationContainer, DefaultTheme, Theme } from '@react-navigation/native';
import DrawerNavigator from '../navigation/drawerNavigator';
import { navigationRef } from '../rootNavigation';
import { useAppDispatch, useAppSelector } from '../hooks';
import { initThemeMode } from '../reducers/theme';
import { Analytics } from '../services/analytics';
import { incrementMustRefreshCount } from '../reducers/common';
import OnBoarding from '../components/onBoarding';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LOG } from '../utils/logger';
import messaging from '@react-native-firebase/messaging';
import notifee, { AuthorizationStatus } from '@notifee/react-native';
import { AdsConsentPopup } from '../services/adsConsent';
import { channels } from '../services/notifications';
import { OS } from '../constants';

const linking = {
  prefixes: ['obsapp://observador.pt'],
  config: {
    screens: {
      Home: {
        screens: {
          Inicio: {
            screens: {
              Article: {
                path: 'article',
              },
            },
          },
        },
      },
    },
  },
};

export const Routes = () => {
  const themeState = useAppSelector(state => state.theme);
  const dispatch = useAppDispatch();
  // martelo ios ⛏️🔨🪓
  const martelo = useRef(0);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [onboardingFinished, setOnboardingFinished] = useState<boolean>(false);
  const [onboardingSkipped, setOnboardingSkipped] = useState<boolean>(false);

  useEffect(() => {
    dispatch(initThemeMode());
    // TODO seems that we are registering multile callbacks if people change the theme color, check when return is called
    const unsubscribe = AppState.addEventListener('change', s => {
      if (martelo.current === 0 && Platform.OS === OS.ios && s === 'active') {
        martelo.current = 1;
        return;
      }
      if (s === 'active') {
        Analytics.trackBackToForeground();
        dispatch(initThemeMode());
        dispatch(incrementMustRefreshCount(true));
      }
    });
    return () => {
      unsubscribe.remove();
    };
  }, [themeState.themeColor.theme]);

  const obsTheme: Theme = {
    ...DefaultTheme,
    dark: themeState.themeColor.theme === 'dark',
    colors: { background: themeState.themeColor.background },
  };

  async function requestPermissions() {
    let authorizationStatus;

    if (Platform.OS === OS.ios) {
      authorizationStatus = await messaging().requestPermission();
    } else {
      const notifeeAuthorization = await notifee.requestPermission();
      authorizationStatus = notifeeAuthorization?.authorizationStatus;
    }
    const isAuthorized = authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED || authorizationStatus === messaging.AuthorizationStatus.PROVISIONAL;
    const isAdditionalAuthorized = authorizationStatus === AuthorizationStatus.AUTHORIZED || authorizationStatus === AuthorizationStatus.PROVISIONAL;
    if (isAuthorized || isAdditionalAuthorized) {
      await AsyncStorage.setItem('notificationPermission', 'granted');
      await AdsConsentPopup();
    } else {
      await AsyncStorage.setItem('notificationPermission', 'denied');
      await AdsConsentPopup();
    }
    await notifee.createChannel({
      id: channels.name,
      name: channels.displayName,
      vibration: true,
      vibrationPattern: [300, 500],
    });
  }

  useEffect(() => {
    const checkFirstInstall = async () => {
      try {
        const isFirstInstallation = await AsyncStorage.getItem('isFirstInstallation');
        if (!isFirstInstallation) {
          setShowOnboarding(true);
          await AsyncStorage.setItem('isFirstInstallation', 'false');
        }
      } catch (e) {
        LOG.info('Error: checkFirstintsall', e);
      }
    };
    checkFirstInstall();
  }, []);

  useEffect(() => {
    if (onboardingFinished || onboardingSkipped) {
      requestPermissions();
    }
  }, [onboardingFinished, onboardingSkipped]);

  const handleOnFinish = () => {
    setShowOnboarding(false);
    setOnboardingFinished(true);
  };

  const handleSkipStep = () => {
    Analytics.sendClickEvent({ event_name: 'onboard', click_action: 'close', click_label: '', click_location: 'bottom' });
    setShowOnboarding(false);
    setOnboardingSkipped(true);
  };

  if (showOnboarding) {
    return <OnBoarding onFinish={handleOnFinish} onSkip={handleSkipStep} />;
  }

  return (
    <NavigationContainer linking={linking} ref={navigationRef} theme={obsTheme}>
      <DrawerNavigator />
    </NavigationContainer>
  );
};
