import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { Appearance } from 'react-native';
import { theme } from '../constants/theme';

type FontStylesType = {
  [key: string]: {
    fontSize?: number;
    lineHeight?: number;
    fontFamily?: string;
  };
};

type ThemeColorType = {
  [key: string]: string | { color: string } | { backgroundColor: string; color: string };
};

type ThemeOrientationType = {
  padding: number;
  maxW: string | number;
  maxWLogin: string | number;
  maxWHome: string;
  imageW: number;
  numCol: number;
  podcastW: string;
};

type AppStateType = {
  ready: boolean;
  themeColor: ThemeColorType;
  themeColorAuto: boolean;
  themeOrientation: ThemeOrientationType;
  fontScaleFactor: number;
  fontStyles: FontStylesType;
};

export const initThemeMode = createAsyncThunk('theme/initThemeMode', async () => {
  const theme = { color: 'auto', fontScaleFactor: 1 };
  const themeColor = (await AsyncStorage.getItem('themeColor')) as 'auto' | 'dark' | 'light';
  if (!themeColor) {
    await AsyncStorage.setItem('themeColor', 'auto');
    theme.color = 'auto';
  } else {
    theme.color = themeColor;
  }
  const tempScale = Number(await AsyncStorage.getItem('fontScaleFactor'));
  if (tempScale == 0) {
    await AsyncStorage.setItem('fontScaleFactor', '1');
    theme.fontScaleFactor = 1;
  } else {
    theme.fontScaleFactor = tempScale;
  }
  return theme;
});

export const setThemeColor = createAsyncThunk('theme/setThemeColor', async (data: 'auto' | 'light' | 'dark') => {
  await AsyncStorage.setItem('themeColor', data);
  return data;
});

export const setFontScaleFactor = createAsyncThunk('theme/setFontScaleFactor', async (data: number) => {
  await AsyncStorage.setItem('fontScaleFactor', String(data));
  return data;
});

function normalize(value: number, scaleFactor: number) {
  return Math.round(value * scaleFactor);
}

const defaultTextStyles = {
  fontSize: 18,
  lineHeight: 28,
};

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    ready: false,
    themeColor: theme.light,
    themeColorAuto: true,
    themeOrientation: theme.portrait,
    fontScaleFactor: 1,
    fontStyles: {
      topics: {
        fontSize: 12,
        fontFamily: theme.fonts.halyardRegular,
        lineHeight: 15,
      },
      title: {
        fontSize: 20,
        fontFamily: theme.fonts.halyardRegular,
      },
      postTitle: {
        fontSize: 24,
        fontFamily: theme.fonts.halyardSemBd,
        lineHeight: 29,
      },
      lead: {
        fontSize: 20,
        fontFamily: theme.fonts.halyardBook,
        lineHeight: 25,
      },
      state: {
        fontSize: 12,
        fontFamily: theme.fonts.halyardRegular,
        lineHeight: 18,
      },
      author: {
        fontSize: 14,
        fontFamily: theme.fonts.halyardRegular,
        lineHeight: 20,
      },
      text: {
        fontSize: 14,
        fontFamily: theme.fonts.halyardRegular,
      },
      listTitle: {
        fontSize: 18,
        fontFamily: theme.fonts.halyardSemBd,
        lineHeight: 22,
      },
      listDate: {
        fontSize: 12,
        fontFamily: theme.fonts.halyardRegular,
      },
      html: {
        ...defaultTextStyles,
      },
      bigNumber: {
        fontSize: 28,
      },
      city: {
        fontSize: 14,
      },
      freq: {
        fontSize: 14,
      },
      headerNumber: {
        fontSize: 30,
      },
      headline: {
        fontSize: 22,
        lineHeight: 28,
        fontFamily: theme.fonts.halyardSemBd,
      },
      related: {
        fontSize: 20,
        fontFamily: theme.fonts.halyardSemBd,
      },
      ads: {
        fontSize: 10,
        fontFamily: theme.fonts.halyardRegular,
      },
      obsLinkTitle: {
        fontSize: 15,
        fontFamily: theme.fonts.halyardSemBd,
        lineHeight: 20,
      },
      obsLinkDate: {
        fontSize: 12,
      },
      obsBlockTitle: {
        fontSize: 16,
        fontFamily: theme.fonts.halyardSemBd,
        lineHeight: 19,
      },
      obsBlockDate: {
        fontSize: 10,
      },
      interactiveText: {
        fontSize: 16,
        fontFamily: theme.fonts.halyardBook,
      },
      captions: {
        fontSize: 14,
        fontFamily: theme.fonts.halyardRegular,
        lineHeight: 20,
      },
      credits: {
        fontSize: 15,
        fontFamily: theme.fonts.halyardSemBd,
      },
      infoBoxTitle: {
        fontSize: 25,
        fontFamily: theme.fonts.halyardRegular,
      },
      infoBoxArrow: {
        fontSize: 30,
      },
      infoBoxShowHideText: {
        fontSize: 14,
      },
      quote: {
        fontFamily: theme.fonts.halyardBook,
        fontSize: 18,
        lineHeight: 25,
      },
      quoteAuthor: {
        fontFamily: theme.fonts.halyardRegular,
        fontSize: 14,
      },
      premiumBox: {
        fontSize: 12,
        lineHeight: 16,
        fontFamily: theme.fonts.halyardBold,
      },
      premiumBoxPrice: {
        fontSize: 25,
        lineHeight: 35,
        fontFamily: theme.fonts.halyardSemBd,
      },
      premiumBoxMonthOrYear: {
        fontSize: 18,
        fontFamily: theme.fonts.halyardRegular,
      },
      premiumButton: {
        fontSize: 15,
        lineHeight: 18,
        fontFamily: theme.fonts.halyardRegular,
      },
      paywallTitle: {
        fontSize: 20,
        lineHeight: 25,
        fontFamily: theme.fonts.halyardSemBd,
      },
      paywallInfo: {
        fontSize: 12,
        lineHeight: 16,
        fontFamily: theme.fonts.halyardBook,
      },
      paywallTextLinks: {
        fontSize: 12,
        lineHeight: 16,
        fontFamily: theme.fonts.halyardRegular,
      },
      paywallFooterText: {
        fontSize: 14,
        lineHeight: 16,
        fontFamily: theme.fonts.halyardRegular,
      },
      audioBlockCaption: {
        fontSize: 12,
        fontFamily: theme.fonts.halyardRegular,
      },
      galleryBlockCountBox: {
        fontSize: 14,
        fontFamily: theme.fonts.halyardRegular,
      },
      numberBoxHeader: {
        fontSize: 60,
        fontFamily: theme.fonts.halyardBold,
      },
      numberBoxCredits: {
        fontSize: 12,
        fontFamily: theme.fonts.halyardRegular,
      },
      tutorQuestions: {
        fontSize: 14,
        fontFamily: theme.fonts.halyardRegular,
      },
      tutorPostTitle: {
        fontFamily: theme.fonts.halyardSemBd,
      },
      tutorQuestion: {
        fontSize: 18,
        fontFamily: theme.fonts.halyardSemBd,
      },
      tutorBtns: {
        fontSize: 14,
        fontFamily: theme.fonts.halyardRegular,
      },
      defaultTypeText: {
        fontSize: 16,
        fontFamily: theme.fonts.halyardBook,
      },
      onBoardingTitle: {
        fontSize: 14,
        lineHeight: 20,
      },
      sliderItem: {
        fontSize: 22,
        lineHeight: 24,
      },
      sliderDescr: {
        fontSize: 16,
        lineHeight: 21,
      },
      onBoardingskipText: {
        fontSize: 15,
      },
    },
  },
  reducers: {
    setThemeOrientation: (state, { payload }: { payload: 'portrait' | 'landscape' }) => {
      state.themeOrientation = theme[payload];
    },
  },
  extraReducers(builder) {
    const updateFontStyles = (state: AppStateType) => {
      state.fontStyles = {
        topics: { fontSize: normalize(12, state.fontScaleFactor), lineHeight: normalize(15, state.fontScaleFactor), fontFamily: theme.fonts.halyardRegular },
        title: { fontSize: normalize(20, state.fontScaleFactor), fontFamily: theme.fonts.halyardRegular },
        postTitle: { fontSize: normalize(24, state.fontScaleFactor), lineHeight: normalize(29, state.fontScaleFactor), fontFamily: theme.fonts.halyardSemBd },
        lead: { fontSize: normalize(20, state.fontScaleFactor), lineHeight: normalize(25, state.fontScaleFactor), fontFamily: theme.fonts.halyardBook },
        state: { fontSize: normalize(12, state.fontScaleFactor), lineHeight: normalize(18, state.fontScaleFactor), fontFamily: theme.fonts.halyardRegular },
        author: { fontSize: normalize(14, state.fontScaleFactor), lineHeight: normalize(20, state.fontScaleFactor), fontFamily: theme.fonts.halyardRegular },
        text: { fontSize: normalize(14, state.fontScaleFactor), fontFamily: theme.fonts.halyardRegular },
        listTitle: { fontSize: normalize(18, state.fontScaleFactor), lineHeight: normalize(22, state.fontScaleFactor), fontFamily: theme.fonts.halyardSemBd },
        listDate: { fontSize: normalize(12, state.fontScaleFactor), fontFamily: theme.fonts.halyardRegular },
        html: { fontSize: normalize(18, state.fontScaleFactor), lineHeight: normalize(28, state.fontScaleFactor) },
        bigNumber: { fontSize: normalize(28, state.fontScaleFactor) },
        city: { fontSize: normalize(14, state.fontScaleFactor) },
        freq: { fontSize: normalize(14, state.fontScaleFactor) },
        headerNumber: { fontSize: normalize(30, state.fontScaleFactor) },
        headline: { fontSize: normalize(22, state.fontScaleFactor), lineHeight: normalize(28, state.fontScaleFactor), fontFamily: theme.fonts.halyardSemBd },
        related: { fontSize: normalize(20, state.fontScaleFactor), fontFamily: theme.fonts.halyardSemBd },
        ads: { fontSize: normalize(10, state.fontScaleFactor), fontFamily: theme.fonts.halyardRegular },
        obsLinkTitle: {
          fontSize: normalize(15, state.fontScaleFactor),
          lineHeight: normalize(20, state.fontScaleFactor),
          fontFamily: theme.fonts.halyardSemBd,
        },
        obsLinkDate: { fontSize: normalize(15, state.fontScaleFactor) },
        obsBlockTitle: {
          fontSize: normalize(16, state.fontScaleFactor),
          lineHeight: normalize(19, state.fontScaleFactor),
          fontFamily: theme.fonts.halyardSemBd,
        },
        obsBlockDate: { fontSize: normalize(10, state.fontScaleFactor) },
        interactiveText: { fontSize: normalize(16, state.fontScaleFactor), fontFamily: theme.fonts.halyardBook },
        captions: { fontSize: normalize(14, state.fontScaleFactor), lineHeight: normalize(20, state.fontScaleFactor), fontFamily: theme.fonts.halyardRegular },
        credits: { fontSize: normalize(14, state.fontScaleFactor), fontFamily: theme.fonts.halyardSemBd },
        infoBoxTitle: { fontSize: normalize(25, state.fontScaleFactor), fontFamily: theme.fonts.halyardRegular },
        infoBoxArrow: { fontSize: normalize(30, state.fontScaleFactor) },
        infoBoxShowHideText: { fontSize: normalize(14, state.fontScaleFactor) },
        quote: { fontSize: normalize(18, state.fontScaleFactor), lineHeight: normalize(25, state.fontScaleFactor), fontFamily: theme.fonts.halyardBook },
        quoteAuthor: { fontSize: normalize(14, state.fontScaleFactor), fontFamily: theme.fonts.halyardRegular },
        premiumBox: { fontSize: normalize(12, state.fontScaleFactor), lineHeight: normalize(16, state.fontScaleFactor), fontFamily: theme.fonts.halyardBold },
        premiumBoxPrice: {
          fontSize: normalize(25, state.fontScaleFactor),
          lineHeight: normalize(35, state.fontScaleFactor),
          fontFamily: theme.fonts.halyardSemBd,
        },
        premiumBoxMonthOrYear: { fontSize: normalize(18, state.fontScaleFactor), fontFamily: theme.fonts.halyardRegular },
        premiumButton: {
          fontSize: normalize(15, state.fontScaleFactor),
          lineHeight: normalize(18, state.fontScaleFactor),
          fontFamily: theme.fonts.halyardRegular,
        },
        paywallTitle: {
          fontSize: normalize(20, state.fontScaleFactor),
          lineHeight: normalize(25, state.fontScaleFactor),
          fontFamily: theme.fonts.halyardSemBd,
        },
        paywallInfo: { fontSize: normalize(12, state.fontScaleFactor), lineHeight: normalize(16, state.fontScaleFactor), fontFamily: theme.fonts.halyardBook },
        paywallTextLinks: {
          fontSize: normalize(12, state.fontScaleFactor),
          lineHeight: normalize(16, state.fontScaleFactor),
          fontFamily: theme.fonts.halyardRegular,
        },
        paywallFooterText: {
          fontSize: normalize(14, state.fontScaleFactor),
          lineHeight: normalize(16, state.fontScaleFactor),
          fontFamily: theme.fonts.halyardRegular,
        },
        audioBlockCaption: {
          fontSize: normalize(12, state.fontScaleFactor),
          fontFamily: theme.fonts.halyardRegular,
        },
        galleryBlockCountBox: {
          fontSize: normalize(14, state.fontScaleFactor),
          fontFamily: theme.fonts.halyardRegular,
        },
        numberBoxHeader: {
          fontSize: normalize(60, state.fontScaleFactor),
          fontFamily: theme.fonts.halyardBold,
        },
        numberBoxCredits: {
          fontSize: normalize(12, state.fontScaleFactor),
          fontFamily: theme.fonts.halyardRegular,
        },
        tutorQuestions: {
          fontSize: normalize(14, state.fontScaleFactor),
          fontFamily: theme.fonts.halyardRegular,
        },
        tutorPostTitle: {
          fontFamily: theme.fonts.halyardSemBd,
        },
        tutorQuestion: {
          fontSize: normalize(18, state.fontScaleFactor),
          fontFamily: theme.fonts.halyardSemBd,
        },
        tutorBtns: {
          fontSize: normalize(14, state.fontScaleFactor),
          fontFamily: theme.fonts.halyardRegular,
        },
        defaultTypeText: {
          fontSize: normalize(16, state.fontScaleFactor),
          fontFamily: theme.fonts.halyardBook,
        },
        onBoardingTitle: {
          fontSize: normalize(14, state.fontScaleFactor),
          lineHeight: normalize(20, state.fontScaleFactor),
        },
        sliderItem: {
          fontSize: normalize(22, state.fontScaleFactor),
          lineHeight: normalize(24, state.fontScaleFactor),
        },
        sliderDescr: {
          fontSize: normalize(16, state.fontScaleFactor),
          lineHeight: normalize(21, state.fontScaleFactor),
        },
        onBoardingskipText: {
          fontSize: normalize(15, state.fontScaleFactor),
        },
      };
    };
    builder.addCase(initThemeMode.fulfilled, (state, action) => {
      state.ready = true;
      state.themeColorAuto = action.payload.color === 'auto';
      state.themeColor = getTheme(action.payload.color);
      state.fontScaleFactor = action.payload.fontScaleFactor;
      updateFontStyles(state);
    });
    builder.addCase(setThemeColor.fulfilled, (state, action) => {
      state.themeColor = getTheme(action.payload);
      state.themeColorAuto = action.payload === 'auto';
    }),
      builder.addCase(setFontScaleFactor.fulfilled, (state, action) => {
        state.fontScaleFactor = action.payload;
        updateFontStyles(state);
      });
  },
});

function getTheme(payload: 'auto' | 'light' | 'dark') {
  const cs = Appearance.getColorScheme();
  if (payload === 'auto' && cs) {
    return theme[cs];
  } else {
    return payload === 'dark' ? theme.dark : theme.light;
  }
}
export const { setThemeOrientation } = themeSlice.actions;
export default themeSlice.reducer;
