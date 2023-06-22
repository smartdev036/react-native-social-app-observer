import axios, {AxiosError} from 'axios';
import { apiBarqueiro } from '../api/endpoints';

export interface BarqueiroRecoverRequest {
  email: string;
  recaptcha: string;
}

export interface BarqueiroLoginRequest {
  email: string;
  password: string;
  recaptcha: string;
}

export interface BarqueiroRegisterRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_check: string;
  recaptcha: string;
}

interface BarqueiroUser {
  created_at: string;
  email: string;
  first_name: string;
  last_name: string;
  name: string;
  photo: string;
  uid: string;
  updated_at: string;
  verified: boolean;
}

export interface BarqueiroResponse {
  data: BarqueiroUser;
  errors: string[];
  status: number;
  token: string;
}

export default class Barqueiro {
  static async login(params: BarqueiroLoginRequest): Promise<BarqueiroResponse> {
    if (!params.email || !params.recaptcha || !params.password) {
      return Promise.reject({ message: 'invalid data' });
    }
    try {
      const resp = await apiBarqueiro.post('/login', {
        email: params.email,
        password: params.password,
        'g-recaptcha-response': params.recaptcha,
      });
      return resp.data as BarqueiroResponse;
    } catch (e: Error | AxiosError | unknown) {
      if (axios.isAxiosError(e) && e.response?.data) {
        const err = e.response.data as BarqueiroResponse;
        return Promise.reject(err);
      } else {
        return Promise.reject({ message: (e as Error)?.message || '' });
      }
    }
  }

  static async recoverPassword(params: BarqueiroRecoverRequest): Promise<BarqueiroResponse> {
    if (!params.email || !params.recaptcha) {
      return Promise.reject({ message: 'invalid data' });
    }
    try {
      const resp = await apiBarqueiro.post('/recover', {
        email: params.email,
        'g-recaptcha-response': params.recaptcha,
      });
      return resp.data as BarqueiroResponse;
    } catch (e: Error | AxiosError | unknown) {
      if (axios.isAxiosError(e) && e.response?.data) {
        const err = e.response.data as BarqueiroResponse;
        return Promise.reject(err);
      } else {
        return Promise.reject({ message: (e as Error)?.message || '' });
      }
    }
  }

  static async register(params: BarqueiroRegisterRequest): Promise<BarqueiroResponse> {
    try {
      const resp = await apiBarqueiro.post('/register', {
        first_name: params.first_name,
        last_name: params.last_name,
        email: params.email,
        password: params.password,
        password_check: params.password_check,
        'g-recaptcha-response': params.recaptcha,
      });
      return resp.data as BarqueiroResponse;
    } catch (e: Error | AxiosError | unknown) {
      if (axios.isAxiosError(e) && e.response?.data) {
        const err = e.response.data as BarqueiroResponse;
        return Promise.reject(err);
      } else {
        return Promise.reject({ message: (e as Error)?.message || '' });
      }
    }
  }
}
