import { useRef, useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

export const useConnectivity = () => {
  const [isConnected, setConnected] = useState<boolean | null>(null);
  const ref = useRef<[typeof isConnected, () => void] | null>(null);

  useEffect(() => {
    const checkConnection = () => {
      NetInfo.fetch().then(state => {
        setConnected(!!state.isConnected);
      });
    };

    const unsubscribe = NetInfo.addEventListener(state => {
      setConnected(state.isConnected);
    });

    ref.current = [isConnected, checkConnection];
    checkConnection();

    return () => {
      unsubscribe();
    };
  }, []);

  if (ref.current) {
    ref.current[0] = isConnected;
  }

  return ref.current;
};
