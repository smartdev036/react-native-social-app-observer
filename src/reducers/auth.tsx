import AuthService, { LoginType, UserToken, UserRegister, UpdatedUserToken } from '../services/auth';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { RootState, store } from '../store';
import { logoutPiano } from './piano';
import Barqueiro, { BarqueiroLoginRequest, BarqueiroRecoverRequest } from '../services/barqueiro';
import { LOG, LogToAll } from '../utils/logger';
import { RejectedWithValueActionFromAsyncThunk } from '@reduxjs/toolkit/dist/matchers';

export const getUserLocal = createAsyncThunk('auth/getUserLocal', async () => {
  return AuthService.getUserLocal();
});

export const updateUser = createAsyncThunk<UserToken | RejectedWithValueActionFromAsyncThunk<any>, UpdatedUserToken, { state: RootState }>('auth/updateUser', async (updatedProperties, thunkAPI) => {
  try {
    const oldUser = thunkAPI.getState().auth.user
    if (!oldUser) {
      throw new Error("User is null");
    }
    thunkAPI.dispatch(authSlice.actions.updateUser(updatedProperties))
    const updatedUser = thunkAPI.getState().auth.user
    if (updatedUser){
      return await AuthService.saveUserLocal(updatedUser);
    }
  } catch (e) {
    LogToAll({
      type: 'Save user error',
      message: e?.message ?? "unknown error",
    });
    await thunkAPI.dispatch(logout());
    return thunkAPI.rejectWithValue(e?.message ?? "unknown error");
  }
});

export const loginWithEmail = createAsyncThunk('auth/loginWithEmail', async (authData: BarqueiroLoginRequest, thunkAPI) => {
  try {
    return await AuthService.login(LoginType.Barqueiro, authData);
  } catch (e) {
    return thunkAPI.rejectWithValue(e);
  }
});

export const loginWithGoogle = createAsyncThunk('auth/loginWithGoogle', async () => {
  return AuthService.login(LoginType.Google);
});

export const logout = createAsyncThunk('auth/logout', async () => {
  store.dispatch(logoutPiano(false));
  return AuthService.logout();
});

export const register = createAsyncThunk('auth/register', async (data: UserRegister, thunkAPI) => {
  try {
    return await Barqueiro.register({
      recaptcha: data.recaptcha || '',
      email: data.email || '',
      password: data.password || '',
      password_check: data.passwordCheck || '',
      last_name: data.lastName || '',
      first_name: data.firstName || '',
    });
  } catch (e) {
    return thunkAPI.rejectWithValue(e);
  }
});

export const recoverPassword = createAsyncThunk('auth/recoverPassword', async (data: BarqueiroRecoverRequest, thunkAPI) => {
  try {
    return await Barqueiro.recoverPassword(data);
  } catch (e) {
    return thunkAPI.rejectWithValue(e);
  }
});

export const loginWithFacebook = createAsyncThunk('auth/loginWithFacebook', async () => AuthService.login(LoginType.Facebook));

export const loginWithApple = createAsyncThunk('auth/loginWithApple', async () => AuthService.login(LoginType.Apple));

interface authState {
  articleId: null | number;
  user: null | UserToken;
  stateLoading: boolean;
  recoverPasswordLoading: boolean;
}

const initialState: authState = {
  articleId: null,
  user: null,
  stateLoading: false,
  recoverPasswordLoading: false,

};

const authSlice = createSlice({
  name: 'auth',
  initialState: initialState,
  reducers: {
    setPremium: (state, { payload }) => {
      if (state.user) {
        state.user.premium = payload;
      }
    },
    setArticleId: (state, { payload }) => {
      state.articleId = payload;
    },
    setLoading: (state, { payload }) => {
      state.stateLoading = payload;
    },
    updateUser: (state, { payload }) => {
      if (state.user) {
        state.user = { ...state.user, ...payload }
      }
    },

  },
  extraReducers(builder) {
    builder.addCase(getUserLocal.fulfilled, (state, action) => {
      state.stateLoading = false;
      if (action.payload) {
        state.user = action.payload;
      }
    });
    builder.addCase(updateUser.fulfilled, (state) => {
      //Do nothing because this thunks updates user state
      state.stateLoading = false;
    });
    builder.addCase(updateUser.pending, state => {
      state.stateLoading = true;
    });
    builder.addCase(updateUser.rejected, (state) => {
      LOG.error("updateUserThunk.rejected")
      //Do nothing we logout the user in the catch block
      state.stateLoading = false;
    });
    builder.addCase(loginWithEmail.pending, state => {
      state.stateLoading = true;
    });
    builder.addCase(loginWithEmail.fulfilled, (state, action) => {
      state.stateLoading = false;
      state.user = action.payload;
    });
    builder.addCase(loginWithEmail.rejected, state => {
      state.stateLoading = false;
    });
    builder.addCase(register.pending, state => {
      state.stateLoading = true;
    });
    builder.addCase(register.fulfilled, state => {
      state.stateLoading = false;
    });
    builder.addCase(register.rejected, state => {
      state.stateLoading = false;
    });
    builder.addCase(recoverPassword.pending, state => {
      state.stateLoading = true;
    });
    builder.addCase(recoverPassword.fulfilled, state => {
      state.stateLoading = false;
    });
    builder.addCase(recoverPassword.rejected, state => {
      state.stateLoading = false;
    });
    builder.addCase(loginWithFacebook.pending, state => {
      state.stateLoading = true;
    });
    builder.addCase(loginWithFacebook.fulfilled, (state, action) => {
      state.user = action.payload;
      state.stateLoading = false;
    });
    builder.addCase(loginWithFacebook.rejected, state => {
      state.stateLoading = false;
    });
    builder.addCase(loginWithGoogle.pending, state => {
      state.stateLoading = true;
    });
    builder.addCase(loginWithGoogle.fulfilled, (state, action) => {
      state.user = action.payload;
      state.stateLoading = false;
    });
    builder.addCase(loginWithGoogle.rejected, state => {
      state.stateLoading = false;
    });
    builder.addCase(loginWithApple.pending, state => {
      state.stateLoading = true;
    });
    builder.addCase(loginWithApple.fulfilled, (state, action) => {
      state.user = action.payload;
      state.stateLoading = false;
    });
    builder.addCase(loginWithApple.rejected, state => {
      state.stateLoading = false;
      state.stateLoading = false;
    });
    builder.addCase(logout.fulfilled, state => {
      state.user = null;
      state.stateLoading = false;
    });
    builder.addCase(logout.rejected, state => {
      state.user = null;
      state.stateLoading = false;
    });
    builder.addCase(logout.pending, state => {
      state.stateLoading = true;
    });
  },
});

export const { setArticleId, setPremium, setLoading } = authSlice.actions;
export default authSlice.reducer;
