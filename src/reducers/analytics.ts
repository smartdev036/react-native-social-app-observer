/*
Tracking analytics in the articles is a little tricky because, we set the paywall and intro in the article.tsx, and we track
the scroll in the ArticleWarapper at global.tsx, and we have exceptions like the obs_tutor where we navigate with buttons

Here we have a store to keep record of the current article the user is seeing and the scroll depth,
and maybe in the futture other metrics.

When the user navigates from one article to another, or/and goes back etc.. we have some work to do, we need to put the correct properties
in the current article, and in the future if we want to use a buffer to send the events we need to update that buffer

*/

import { CreateSliceOptions, PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { EVENT_KIND_INTERACTION, EVENT_SOURCE_APP, MaxScrollT, QualityReadsEvent, getUserKind } from '../utils/qualityReads';
import { store } from '../store';
import { Analytics } from '../services/analytics';
import DeviceInfo from 'react-native-device-info';

type ArticlePropsT = { type: 'article' } | TutorPropsT;
type GeneralArticleProps = { sawIntro: boolean; sawPaywall: boolean; premium: boolean };

type AnalyticsStateT = {
  browserID: string;
  scrollProps: MaxScrollT;
  articleProps: ArticlePropsT & GeneralArticleProps;
};

export type TutorPropsT = { type: 'obs_tutor'; maxQuestionsReached: number; maxQuestions: number };
export type ScrollEndT = { scrollPosition: number, contentHeight: number}

export const sendQualityReadsArticle = createAsyncThunk('analytics/sendQualityReadsArticle', async (e: QualityReadsEvent) => {
  const { auth, analytics } = store.getState();

  if (e.e === EVENT_KIND_INTERACTION) {
    if (analytics.articleProps.type === 'obs_tutor') {
      //console.log( "OBS TUTOR M1: " ,analytics.articleProps.maxQuestionsReached , analytics.articleProps.maxQuestions)
      e.m1 = (analytics.articleProps.maxQuestionsReached / analytics.articleProps.maxQuestions).toFixed(1);
    } else {
      //console.log( "ARTCILE M1: " ,analytics.scrollProps.maxScrolled, analytics.scrollProps.scrollHeith)
      e.m1 = analytics.scrollProps.scrollHeith > 0 ? (analytics.scrollProps.maxScrolled / analytics.scrollProps.scrollHeith).toFixed(1) : '0';
    }
  }

  /* TODO browserID should be the unique id on the device check it */
  const merge: QualityReadsEvent = {
    ...e,
    uk: getUserKind(),
    ui: auth.user?.user.sub || '',
    b: analytics.browserID,
    s: EVENT_SOURCE_APP,
    t: analytics.scrollProps.maxTimeStamp,
  };
  Analytics.qualityReads(merge);
  store.dispatch(resetQualityReads(true));
});

export const sendQualityReadsLanding = createAsyncThunk('analytics/sendQualityReadsLanding', async (e: QualityReadsEvent) => {
  const { auth, analytics } = store.getState();
  const merge: QualityReadsEvent = {
    ...e,
    uk: getUserKind(),
    ui: auth.user?.user.sub || '',
    b: analytics.browserID,
    s: EVENT_SOURCE_APP,
  };
  Analytics.qualityReads(merge);
  store.dispatch(resetQualityReads);
});

const op: CreateSliceOptions<AnalyticsStateT> = {
  name: 'AnalyticsState',
  initialState: {
    browserID: DeviceInfo.getUniqueIdSync(),
    scrollProps: { maxScrolled: 0, maxTimeStamp: new Date().getTime(), scrollHeith: 0 },
    articleProps: { sawIntro: false, sawPaywall: false, premium: false, type: 'article' },
  },
  reducers: {
    resetQualityReads: state => {
      state.scrollProps.maxScrolled = 0;
      state.scrollProps.maxTimeStamp = new Date().getTime();
      state.scrollProps.scrollHeith = 0;
    },
    setScrollHeith: (state, { payload }) => {
      state.scrollProps.scrollHeith = payload;
    },
    handleScrollEndDrag: (state, action: PayloadAction<ScrollEndT>) => {
      const {scrollPosition, contentHeight} = action.payload
      if (state.scrollProps.maxScrolled < scrollPosition) {
        state.scrollProps.maxScrolled = scrollPosition;
      }
      state.scrollProps.maxTimeStamp = new Date().getTime();
      state.scrollProps.scrollHeith = contentHeight;
    },
    setMaxQuestionsReached: (state, { payload }) => {
      (state.articleProps as TutorPropsT).maxQuestionsReached = payload;
    },
    setArticleProps: (state, action: PayloadAction<ArticlePropsT>) => {
      state.articleProps.type = action.payload.type;
      switch (state.articleProps.type) {
        case 'obs_tutor': {
          const { maxQuestions, maxQuestionsReached } = action.payload as TutorPropsT;
          state.articleProps.maxQuestions = maxQuestions;
          state.articleProps.maxQuestionsReached = maxQuestionsReached;
          break;
        }
      }
    },
  },
};

const AnalyticsSlice = createSlice(op);
export const { handleScrollEndDrag, resetQualityReads, setMaxQuestionsReached, setMaxQuestions, setArticleProps } = AnalyticsSlice.actions;
export default AnalyticsSlice.reducer;
