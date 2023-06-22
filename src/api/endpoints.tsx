import axios, { AxiosRequestConfig } from 'axios';
import crashlytics from '@react-native-firebase/crashlytics';

import {
  API_RADIO_BASE_URL,
  API_URL,
  URL_QUIOSQUE_REGISTER,
  API_LOGIN,
  API_SAVE,
  API_EVENT,
  API_BARBEIRO,
  API_PODCASTS,
  API_SININHO,
  URL_QUIOSQUE,
  API_PIANO,
  API_BARQUEIRO,
} from './index';
import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

export const getUserAgent = (): string => {
  const version = DeviceInfo.getVersion();
  const system = DeviceInfo.getSystemName();
  const systemVersion = DeviceInfo.getSystemVersion();
  const buildId = DeviceInfo.getBuildIdSync();
  const deviceId = DeviceInfo.getDeviceId();
  const model = DeviceInfo.getModel();

  let userAgentStr = '';
  if (Platform.OS === 'android') {
    userAgentStr = `Observador/${version} (Linux; ${system} ${systemVersion}; ${model} Build/${buildId};)`;
  } else {
    userAgentStr = `Observador/${version} ${deviceId} ${system}/${systemVersion}`;
  }
  return userAgentStr;
};

const apiRadioBase = axios.create({
  baseURL: API_RADIO_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

const apiBase = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

const apiQuiosqueRegister = axios.create({
  baseURL: URL_QUIOSQUE_REGISTER,
  headers: { 'Content-Type': 'application/json', 'X-Adamastor-User-Id': 'dummy' },
});

const apiQuiosque = axios.create({
  baseURL: URL_QUIOSQUE,
  headers: { 'Content-Type': 'application/json' },
});

const apiLogin = axios.create({
  baseURL: API_LOGIN,
  headers: { 'Content-Type': 'application/json' },
});

apiLogin.interceptors.request.use(config => {
  if (!config.headers) {
    config.headers = {};
  }
  config.headers['User-Agent'] = getUserAgent();
  return config;
});

const apiSave = axios.create({
  baseURL: API_SAVE,
  headers: { 'Content-Type': 'application/json' },
});

const apiEvent = axios.create({
  baseURL: API_EVENT,
  headers: { 'Content-Type': 'application/json' },
});

const apiBarbeiro = axios.create({
  baseURL: API_BARBEIRO,
  headers: { 'Content-Type': 'application/json' },
});

const apiPodcasts = axios.create({
  baseURL: API_PODCASTS,
  headers: { 'Content-Type': 'application/json' },
});

const apiSininho = axios.create({
  baseURL: API_SININHO,
  headers: { 'Content-Type': 'application/json' },
});

const apiPiano = axios.create({
  baseURL: API_PIANO,
  headers: { 'Content-Type': 'application/json' },
});

const apiBarqueiro = axios.create({
  baseURL: API_BARQUEIRO,
  headers: { 'Content-Type': 'application/json' },
});


export { apiRadioBase, apiBase, apiQuiosqueRegister, apiQuiosque, apiLogin, apiSave, apiEvent, apiBarbeiro, apiPodcasts, apiSininho, apiPiano, apiBarqueiro };
