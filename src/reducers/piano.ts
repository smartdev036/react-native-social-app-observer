import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice, CreateSliceOptions } from '@reduxjs/toolkit';
import { Purchase } from 'react-native-iap';

export const APP_PURCHASE_KEY = 'appPurchase';
export const savePurchase = createAsyncThunk('piano/savePurchase', async (purchase: Purchase) => {
  try {
    await AsyncStorage.setItem(APP_PURCHASE_KEY, JSON.stringify(purchase));
    return purchase;
  } catch (e) {
    console.log('ERROR SAVING PURCHASE: ', e);
    throw e;
  }
});

export const syncPurchase = createAsyncThunk('piano/syncPurchase', async (purchase: Purchase | false) => {
  //User don't have any active subscriptions so remove the old
  if (!purchase) {
    await AsyncStorage.removeItem(APP_PURCHASE_KEY);
    return null;
  }

  const storedPurchaseStr = await AsyncStorage.getItem(APP_PURCHASE_KEY);
  if (!storedPurchaseStr) {
    //This shouldn't happen because we should have a purchase, somenase has cleaned app data, cahce etc...
    return purchase;
  }

  const storedPurchase = JSON.parse(storedPurchaseStr) as Purchase;
  if (storedPurchase.transactionDate === purchase.transactionDate) {
    return storedPurchase;
  }

  return purchase;
});

type PianoStateT = {
  purchase: Purchase | null;
  subscribingPiano: boolean;
  registeredSubscriber: boolean;
  hasPurchase: boolean;
  hasActiveAccess: boolean;
  isPremium: boolean;
  canMakePayments: boolean;
};

const op: CreateSliceOptions<PianoStateT> = {
  name: 'piano',
  initialState: {
    purchase: null,
    subscribingPiano: false,
    registeredSubscriber: false,
    hasPurchase: false,
    hasActiveAccess: false,
    isPremium: false,
    canMakePayments: true,
  },
  reducers: {
    setSubscribingPiano: (state, { payload }) => {
      state.subscribingPiano = payload;
    },
    setRegisteredSubscriber: (state, { payload }) => {
      state.registeredSubscriber = payload;
    },
    setHasActiveAccess: (state, { payload }) => {
      state.hasActiveAccess = payload;
      if (payload) {
        state.isPremium = true;
      }
    },
    setCanMakePayments: (state, { payload }) => {
      state.canMakePayments = payload;
    },
    logoutPiano: state => {
      state.hasActiveAccess = false;
      if (!state.hasPurchase) {
        state.isPremium = false;
      }
    },
  },
  extraReducers(builder) {
    builder.addCase(savePurchase.fulfilled, (state, action) => {
      console.log('savePurchase: @@@@@@@@@@ :', action.payload);
      state.purchase = action.payload;
      state.hasPurchase = true;
      state.isPremium = true;
    });
    builder.addCase(syncPurchase.fulfilled, (state, action) => {
      console.log('syncPurchase: @@@@@@@@@@ :', action.payload);
      state.purchase = action.payload;
      state.hasPurchase = action.payload !== null;
      if (action.payload !== null) {
        state.isPremium = true;
      }
    });
  },
};

const pianoSlice = createSlice(op);
export const { setSubscribingPiano, setRegisteredSubscriber, setHasActiveAccess, setCanMakePayments, logoutPiano } = pianoSlice.actions;
export default pianoSlice.reducer;
