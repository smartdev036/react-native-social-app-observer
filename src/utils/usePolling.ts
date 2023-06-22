import { useEffect, useState } from 'react';
import { apiRadioBase } from '../api/endpoints';
import useWebSocket from 'react-native-use-websocket';
import crashlytics from '@react-native-firebase/crashlytics';
import { LOG } from './logger';

export const useLiveString = () => {
  let pullingInterval: number | undefined;
  const [currentText, setCurrentText] = useState('Aconteça o que acontecer');

  const { sendJsonMessage } = useWebSocket('wss://sws.observador.pt/ws?topics=radio', {
    onError: err => onSocketError(err),
    onMessage: message => onSocketMessage(message),
    shouldReconnect: () => true,
    share: true,
    options: { headers: { ['Origin']: 'https://observador.pt' } },
  });

  const getPulling = async () => {
    return await apiRadioBase
      .get('/live')
      .then(response => response.data)
      .catch((e: Error) => {
        LOG.error('get radio data');
      });
  };

  useEffect(() => {
    getPulling().then(r => {
      setCurrentText(r.live);
    });
    sendJsonMessage({ action: 'subscribe', params: { topics: ['radio'] } });
  }, []);

  const onSocketError = async (err: WebSocketErrorEvent) => {
    LOG.error('Error: onSocketError - ', err);
    pullingInterval = setInterval(async () => (await getPulling()).live, 5000);
  };

  const onSocketMessage = async (mess: WebSocketMessageEvent) => {
    try {
      if (pullingInterval != undefined) {
        clearInterval(pullingInterval);
        pullingInterval = undefined;
      }
      let data = JSON.parse(mess.data);
      if (data?.data && data?.data?.message) {
        setCurrentText(data.data.message);
      }
    } catch (e: Error | any) {
      crashlytics().recordError(e);
      crashlytics().log('Error: onSocketMessage');
    }
  };
  return { currentText };
};
