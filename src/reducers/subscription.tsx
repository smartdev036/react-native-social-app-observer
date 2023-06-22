import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiQuiosque } from '../api/endpoints';
import { store } from '../store';

export const checkSubscribed = createAsyncThunk('subscriptions/checkSubscrided', async (data: { id: any; type: 'author' | 'program' | 'topic' }) => {
  try {
    if (!data.id || !data.type) {
      return;
    }
    const user = await store.getState().auth.user;
    if (!user) {
      return;
    }
    const resp = await apiQuiosque.get(`subscriptions/user/${user.id}/subscribed/${data.type}/${data.id}`, {
      headers: { Authorization: `Bearer ${user.access_token}` },
    });
    return resp.data;
  } catch (e) {
    //FIXME melhorar os erros
    console.log('checkSubscribed: ', e);
    Promise.reject('Erro ao verificar subscrição');
  }
});

export const subscribe = createAsyncThunk('subscriptions/subscribe', async (data: { id: any; type: 'author' | 'program' | 'topic' }) => {
  try {
    const user = await store.getState().auth.user;
    if (!user) {
      return;
    }
    const resp = await apiQuiosque.get(`subscriptions/user/${user.id}/subscribe/${data.type}/${data.id}`, {
      headers: { Authorization: `Bearer ${user.access_token}` },
    });
    return resp.data;
  } catch (e) {
    // TODO send data to collectors
    console.log('subscribe: ', e);
    return Promise.reject('Erro ao subscrever');
  }
});

export const unsubscribe = createAsyncThunk('subscriptions/unsubcribe', async (data: { id: any; type: 'author' | 'program' | 'topic' }) => {
  try {
    const user = await store.getState().auth.user;
    if (!user) {
      return;
    }
    const res = await apiQuiosque.delete(`subscriptions/user/${user.id}/subscribe/${data.type}/${data.id}`, {
      headers: { Authorization: `Bearer ${user.access_token}` },
    });
    return res.data;
  } catch (e) {
    // TODO send data to collectors
    console.log('unsubscribe: ', e);
    return Promise.reject('Erro ao cancelar subscrição');
  }
});

const initialState = {
  loading: true,
  isSubscribed: false,
};

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState: initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(checkSubscribed.fulfilled, (state, action) => {
      state.isSubscribed = action.payload;
    });
    builder.addCase(subscribe.fulfilled, state => {
      state.isSubscribed = true;
    });
    builder.addCase(unsubscribe.fulfilled, state => {
      state.isSubscribed = false;
    });
  },
});

export default subscriptionSlice.reducer;
