import { apiLogin, apiPiano } from '../api/endpoints';
import { Buffer } from 'buffer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AccessToken, LoginManager } from 'react-native-fbsdk-next';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { appleAuth, AppleRequestResponseFullName } from '@invertase/react-native-apple-authentication';
import { AxiosError } from 'axios';
import { Alert } from 'react-native';
import { PIANO_AID, PIANO_API_TOKEN } from '../constants';
import { logout, updateUser } from '../reducers/auth';
import { store } from '../store';
import { setHasActiveAccess } from '../reducers/piano';
import { Mutex } from 'async-mutex';
import Barqueiro, { BarqueiroLoginRequest, BarqueiroResponse } from './barqueiro';
import DeviceInfo from 'react-native-device-info';
import { LOG, LogToAll, SendToAirBrakeProps } from '../utils/logger';
import { isRejected } from '@reduxjs/toolkit';

export enum LoginType {
  Google = 'google',
  Facebook = 'facebook',
  Apple = 'apple',
  Barqueiro = 'barqueiro',
}

export interface User {
  api_policy: string;
  aud: string;
  exp: number | string | Date;
  gender: string;
  iat: number | string | Date;
  is_anonymous: boolean;
  iss: string;
  login_provider: string;
  name: string;
  nonce: string;
  piano_active_access: boolean;
  piano_ref_token: string;
  risk_level: number;
  staff: boolean;
  sub: string;
  tags: string;
  email: string;
  picture: string;
}

export interface UserToken {
  user: User;
  refresh_token: any;
  saved_time: number | string | Date;
  expires_in: number | string | Date;
  access_token: string;
  id: string;
  premium: boolean;
}

export interface UpdatedUserToken {
  user?: User;
  refresh_token?: any;
  saved_time?: number | string | Date;
  expires_in?: number | string | Date;
  access_token?: string;
  id?: string;
  premium?: boolean;
}

// FIXME estes tipos estao mertelados
export interface UserRegister {
  firstName: string | null | undefined;
  lastName: string | null | undefined;
  email: string | null | undefined;
  password: string | null | undefined;
  passwordCheck: string | null | undefined;
  recaptcha?: string | null | undefined;
}

//TODO Finish interfaces
interface PianoAccess {
  access_id: string;
  granted: boolean;
}

interface PianoAccessResponse {
  accesses: PianoAccess[];
}

const refreshMutex = new Mutex();
export default class AuthService {
  private static version: string = DeviceInfo.getVersion();

  static async login(provider: LoginType.Apple): Promise<any>;
  static async login(provider: LoginType.Google): Promise<any>;
  static async login(provider: LoginType.Facebook): Promise<any>;
  static async login(provider: LoginType.Barqueiro, data: BarqueiroLoginRequest): Promise<any>;
  static async login(provider: LoginType, data?: BarqueiroLoginRequest | void): Promise<any> {
    try {
      let callbackToken: { token: string; type: LoginType; appleFullName?: AppleRequestResponseFullName | null } | null = null;
      switch (provider) {
        case LoginType.Barqueiro:
          if (!data) {
            break;
          }
          try {
            // eslint-disable-next-line no-case-declarations
            const barqueiroResponse = await Barqueiro.login(data);
            callbackToken = { token: barqueiroResponse.token, type: LoginType.Barqueiro };
          } catch (e: Error | AxiosError | unknown) {
            return Promise.reject(e as BarqueiroResponse);
          }
          break;
        case LoginType.Google:
          await GoogleSignin.hasPlayServices();
          // eslint-disable-next-line no-case-declarations
          const userInfo = await GoogleSignin.signIn();
          callbackToken = { token: userInfo.idToken || '', type: LoginType.Google };
          break;
        case LoginType.Facebook:
          // eslint-disable-next-line no-case-declarations
          const fb = await LoginManager.logInWithPermissions(['public_profile', 'email']);
          if (fb.isCancelled) {
            return Promise.reject({ message: 'Sign in action cancelled' });
          }
          callbackToken = {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            token: (await AccessToken.getCurrentAccessToken())!.accessToken,
            type: LoginType.Facebook,
          };
          break;
        case LoginType.Apple:
          // eslint-disable-next-line no-case-declarations
          const request = await appleAuth.performRequest({
            requestedOperation: appleAuth.Operation.LOGIN,
            requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
          });
          // eslint-disable-next-line no-case-declarations
          const credential = await appleAuth.getCredentialStateForUser(request.user);
          if (credential !== appleAuth.State.AUTHORIZED) {
            return Promise.reject({
              message: 'Sign in action cancelled',
            });
          }
          callbackToken = {
            token: request.identityToken || '',
            appleFullName: request.fullName,
            type: LoginType.Apple,
          };
          break;
        default:
          return Promise.reject('data empty');
      }

      if (!callbackToken) {
        return Promise.reject('data empty');
      }

      // convert an external token into an adamastor token
      let loginParameters = {};
      if (callbackToken.type === LoginType.Apple) {
        loginParameters = {
          token: callbackToken.token,
          ...callbackToken.appleFullName,
        };
      } else {
        loginParameters = {
          token: callbackToken.token,
        };
      }
      const resp = await apiLogin.get(`login/${callbackToken.type}/callback`, {
        params: loginParameters,
      });

      // convert an adamastor token into an valid session
      const authorizeResp = await apiLogin.get('/oauth2/authorize', {
        params: {
          client_id: 'c1b32d75-9828-4314-a841-3bda690e01a8',
          scope: 'openid profile email read write',
          redirect_uri: 'obsapp://observador.pt',
          grant_type: 'authorization_code',
          debug: this.version,
          code: resp.data.code,
        },
      });

      authorizeResp.data.user = JSON.parse(Buffer.from(authorizeResp.data.access_token.split('.')[1], 'base64').toString('utf-8'));
      authorizeResp.data.saved_time = Date.now();
      await AuthService.saveUserLocal(authorizeResp.data);
      return authorizeResp.data;
    } catch (e) {
      LogToAll({
        type: 'login',
        message: e,
      });
      return Promise.reject({ message: e.message });
    }
  }

  static adamastorRefreshToken = async () => {
    return refreshMutex.runExclusive(async () => {
      try {
        const user = store.getState().auth.user;
        if (!user) {
          LOG.info('Dont have user token');
          return;
        }

        const resp = await apiLogin.get('/oauth2/token', {
          params: {
            debug: this.version,
            scope: 'openid profile email read write',
            grant_type: 'refresh_token',
            refresh_token: user.refresh_token,
            user_id: user.user.sub,
          },
        });

        const resSaveUser = await store.dispatch(updateUser({access_token: resp.data.access_token, refresh_token: resp.data.refresh_token, saved_time: Date.now()}));
        if (isRejected(resSaveUser)) {
          // WARNING: for now do nothing, we already log the error in the reducer, but be aware that errors aren't going to the catch block. ⛏️
        }
      } catch (e) {
        let errorMsg = {
          error: e,
          errorData: {},
        };

        if (e instanceof AxiosError) {
          if (e.response && e.response.status === 400) {
            if (e.response.data.error === 'limit_exceeded') {
              Alert.alert('Limite máximo', 'Limite máximo de logins por dispositivo atingido');
              await store.dispatch(logout());
            }
            if (e.response.data.error === 'invalid_grant') {
              await store.dispatch(logout());
            }
            errorMsg = {
              error: e.toJSON(),
              errorData: e.response.data,
            };
          }
        } else {
          errorMsg = {
            error: e?.message ?? "unkkown error message",
            errorData: {},
          };
        }
        LogToAll({
          type: 'refreshtoken',
          message: errorMsg,
        });
      }
    });
  };

  static saveUserLocal = async (u: UserToken) => {
    await checkIfUserIsPremiumAndDispatchIfHasPianoAccess(u.user.sub);
    await AsyncStorage.setItem('user_info', JSON.stringify(u));
    return u;
  };

  static getUserLocal = async (): Promise<UserToken | undefined> => {
    try {
      const userStr = await AsyncStorage.getItem('user_info');
      if (userStr) {
        const user = JSON.parse(userStr);
        await checkIfUserIsPremiumAndDispatchIfHasPianoAccess(user.user.sub);
        return user;
      }
    } catch (e) {
      LOG.error('getUserLocal: ', e);
      return Promise.reject(e);
    }
  };

  public static deleteUserLocal = async () => {
    try {
      await AsyncStorage.removeItem('user_info');
    } catch (e) {
      LOG.error('delete user local error:', e);
    }
  };

  static logout = async () => {
    try {
      const user = store.getState().auth.user;
      if (!user) {
        return;
      }
      try {
        await apiLogin.get('/oauth2/logout', {
          headers: { Authorization: `Bearer ${user.access_token}` },
          params: {
            refresh_token: user.refresh_token,
            debug: this.version,
          },
        });
      } catch (e) {
        if (e instanceof AxiosError) {
          if (e.response) {
            const a: SendToAirBrakeProps = {
              message: [
                {
                  error: e.toJSON(),
                  errorData: e.response.data,
                },
              ],
              type: 'Logout error',
            };
            LogToAll(a);
          }
        }
      }
      LoginManager.logOut();
      if (await GoogleSignin.isSignedIn()) {
        await GoogleSignin.signOut();
      }
    } finally {
      await AuthService.deleteUserLocal();
    }
  };
}

export async function checkIfUserIsPremiumAndDispatchIfHasPianoAccess(sub: string) {
  if (store.getState().piano.isPremium) {
    return true;
  }
  try {
    const res = await apiPiano.get(`publisher/user/access/list?&aid=${PIANO_AID}&api_token=${PIANO_API_TOKEN}&uid=${sub}&active=true&limit=100`);
    const accessRes = res.data as PianoAccessResponse;
    for (const access of accessRes.accesses) {
      if (access.granted) {
        store.dispatch(setHasActiveAccess(true));
        return true;
      }
    }
    return false;
  } catch (e) {
    LOG.error('Error setting is premium', e);
    return false;
  }
}
