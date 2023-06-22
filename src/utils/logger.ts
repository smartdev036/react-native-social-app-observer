import { logger, consoleTransport, transportFunctionType } from 'react-native-logs';
import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import axios from 'axios';
import crashlytics from '@react-native-firebase/crashlytics';

const key = '8a8ac15e0ab01f507dae6d204101b614';
const id = 490925;
const url = 'https://api.airbrake.io/api/v3/projects/' + id + '/notices?key=' + key;

export interface SendToAirBrakeProps {
  type: string;
  message: unknown;
}

export interface AirbrakeError {
  type?: string;
  message?: string;
}

export interface AirBrakeObject {
  errors?: AirbrakeError[];
  context?: {
    environment?: string;
    component?: string;
    action?: string;
    os?: string;
    language?: string;
    severity?: string;
    version?: string;
    url?: string;
    userAgent?: string;
    userAddr?: string;
    remoteAddr?: string;
    rootDirectory?: string;
    hostname?: string;
    notifier?: {
      name?: string;
      version?: string;
      url?: string;
    };
    user?: {
      id?: string;
      username?: string;
      name?: string;
      email?: string;
    };
  };
  environment?: {
    [k: string]: unknown;
  };
  session?: {
    [k: string]: unknown;
  };
  params?: {
    [k: string]: unknown;
  };
}

export function GenerateAirBrakeObject(errors: AirbrakeError[]): AirBrakeObject {
  return {
    context: {
      os: Platform.OS,
      version: DeviceInfo.getVersion(),
    },
    errors: errors,
  };
}
const recorErrorTransport: transportFunctionType = props => {
  if (!props || props.level.severity !== 3) {
    return false;
  }

  if (props.rawMsg && Array.isArray(props.rawMsg)) {
    const errors: AirbrakeError[] = [];
    for (const err of props.rawMsg) {
      if (err.type && err.message) {
        errors.push({
          type: err.type,
          message: JSON.stringify(err.message),
        });
      }
    }

    if (errors.length > 0) {
      axios
        .post(url, GenerateAirBrakeObject(errors), {
          headers: { 'Content-Type': 'application/json' },
        })
        .then(x => console.log('Airbrake success'))
        .catch(x => console.error('Airbrake error', x));

      for (const err of errors) {
        crashlytics().recordError(new Error(JSON.stringify(err.message)), err.type);
      }
    }
  }

  return true;
};

const config = {
  transport: __DEV__ ? [consoleTransport, recorErrorTransport] : [recorErrorTransport],
  severity: __DEV__ ? 'debug' : 'error',
  transportOptions: {
    colors: {
      info: 'blueBright',
      warn: 'yellowBright',
      error: 'redBright',
    },
  },
};

const LOG = logger.createLogger(config);

export const LogToAll = (e: SendToAirBrakeProps) => {
  LOG.error(e);
};

export { LOG };
