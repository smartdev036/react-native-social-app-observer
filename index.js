import 'react-native-gesture-handler';
import React from 'react';
import { AppRegistry, NativeModules, Text, TextInput, Platform } from 'react-native';
import { name as appName } from './app.json';
import App from './App';
import TrackPlayer from 'react-native-track-player';
import { Provider } from 'react-redux';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { MenuProvider } from 'react-native-popup-menu';
import { ToastProvider } from 'react-native-toast-notifications';
import { Notifications } from './src/services/notifications';
import { enableLatestRenderer } from 'react-native-maps';
import AuthService from './src/services/auth';
import { getUserLocal } from './src/reducers/auth';
import { store } from './src/store';
import { OS } from './src/constants';
import NetInfo from '@react-native-community/netinfo';
import { LOG } from './src/utils/logger';

enableLatestRenderer();
TrackPlayer.registerPlaybackService(() => require('./service'));

const { PianoModule } = NativeModules;
PianoModule.initComposer();

GoogleSignin.configure({
  forceConsentPrompt: true,
  offlineAccess: false,
  webClientId:
    Platform.OS === OS.ios
      ? '439313482366-5c51avrqphjv9j3noo2b4rcd8ufnult9.apps.googleusercontent.com'
      : '439313482366-dvdj8tsff9tpi5csb410roen1r9g3m5q.apps.googleusercontent.com',
});

Notifications.initHandlers();

store.dispatch(getUserLocal()).then(() => {
  startTimerForRefreshToken().catch(x => {
    // TODO TESTAR SE FAZ SENTIDO O CATCH (FAZ THROW NO REDUCER ou no auth service)
    LOG.error(x);
  });
});

const startTimerForRefreshToken = async () => {
  await refreshLogin();
  setInterval(async () => {
    await refreshLogin();
  }, 30000);
};

const refreshLogin = async () => {
  const user = store.getState().auth.user;
  const state = await NetInfo.fetch();
  if (!state.isConnected || !user) {
    return;
  }

  const saved_time = new Date(Number(user.saved_time) + Number(user.expires_in) * 1000);
  if (saved_time.getTime() - Date.now() > 120000) {
    return;
  }
  await AuthService.adamastorRefreshToken();
};

// MaxFontSize if system change
Text.defaultProps = {};
Text.defaultProps.maxFontSizeMultiplier = 1.1;
TextInput.defaultProps = {};
TextInput.defaultProps.maxFontSizeMultiplier = 1.1;

const ReduxApp = () => (
  <Provider store={store}>
    <MenuProvider>
      <ToastProvider offsetBottom={54}>
        <App />
      </ToastProvider>
    </MenuProvider>
  </Provider>
);

AppRegistry.registerComponent(appName, () => ReduxApp);
