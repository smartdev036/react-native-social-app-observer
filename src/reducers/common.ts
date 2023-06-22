import { createSlice, CreateSliceOptions } from '@reduxjs/toolkit';

type CommonState = {
  maybeRefreshCount: number;
  offlineArticles: boolean;
  downloadComplete: boolean;
};

const op: CreateSliceOptions<CommonState> = {
  name: 'common',
  initialState: {
    maybeRefreshCount: 0,
    offlineArticles: false,
    downloadComplete: false,
  },
  reducers: {
    incrementMustRefreshCount: state => {
      state.maybeRefreshCount = state.maybeRefreshCount + 1;
    },
    toggleSwitch: state => {
      state.offlineArticles = !state.offlineArticles;
    },
    setDownloadComplete: (state, action) => {
      state.downloadComplete = action.payload;
    },
  },
};

const commonSlice = createSlice(op);
export const { incrementMustRefreshCount, toggleSwitch, setDownloadComplete } = commonSlice.actions;
export default commonSlice.reducer;
