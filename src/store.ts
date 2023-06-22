import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit';
import authReducer from './reducers/auth';
import subscriptionReducer from './reducers/subscription';
import pianoReducer from './reducers/piano';
import themeReducer from './reducers/theme';
import commonReducer from './reducers/common';
import analyticsReducer from './reducers/analytics';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    subscription: subscriptionReducer,
    piano: pianoReducer,
    theme: themeReducer,
    common: commonReducer,
    analytics: analyticsReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
