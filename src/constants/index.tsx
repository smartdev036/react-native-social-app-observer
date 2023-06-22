import React from 'react';
import { ViewStyle, TextStyle } from 'react-native';
import { defaultSystemFonts, HTMLContentModel, HTMLElementModel } from 'react-native-render-html';
import { useAppSelector } from '../hooks';
import { theme } from './theme';
import { PostType } from '../models/articleFields';

export const systemFonts = [
  ...defaultSystemFonts,
  theme.fonts.halyardRegular,
  theme.fonts.halyardBold,
  theme.fonts.halyardBook,
  theme.fonts.halyardSemBd,
  theme.fonts.notoBold,
  theme.fonts.notoBoldItalic,
  theme.fonts.notoItalic,
  theme.fonts.notoRegular,
];

export interface CustomStyle extends ViewStyle, TextStyle {
  listStyleType?: string;
}

export interface tagsStylesI {
  [key: string]: CustomStyle;
}

export const useTagsStyles = (): tagsStylesI => {
  const themeState = useAppSelector(state => state.theme);
  return {
    h1: {
      fontFamily: theme.fonts.notoBold,
      fontSize: themeState.fontStyles.html.fontSize,
      color: themeState.themeColor.color,
      lineHeight: themeState.fontStyles.html.lineHeight,
    },
    p: {
      fontFamily: theme.fonts.notoRegular,
      fontSize: themeState.fontStyles.html.fontSize,
      lineHeight: themeState.fontStyles.html.lineHeight,
      color: themeState.themeColor.color,
      textAlign: 'left',
    },
    ul: {
      paddingLeft: 10,
      color: themeState.themeColor.color,
    },
    li: {
      flexDirection: 'row',
      alignItems: 'center',
      fontFamily: theme.fonts.notoRegular,
      fontSize: themeState.fontStyles.html.fontSize,
      lineHeight: themeState.fontStyles.html.lineHeight,
      color: themeState.themeColor.color,
      marginBottom: 20,
    },
    strong: {
      fontFamily: theme.fonts.notoBold,
      fontSize: themeState.fontStyles.html.fontSize,
      lineHeight: themeState.fontStyles.html.lineHeight,
    },
    b: {
      fontFamily: theme.fonts.notoBold,
      fontSize: themeState.fontStyles.html.fontSize,
    },
    em: {
      textAlign: 'left',
      fontSize: themeState.fontStyles.html.fontSize,
      lineHeight: themeState.fontStyles.html.lineHeight,
      fontFamily: theme.fonts.notoItalic,
      fontStyle: 'italic',
    },
  };
};

export const useClassStyles = (postType: PostType): tagsStylesI => {
  const themeState = useAppSelector(state => state.theme);
  const generalClassStyles = {
    'bigNumber': {
      color: theme.colors.brandBlue,
      fontSize: themeState.fontStyles.bigNumber.fontSize,
      fontFamily: theme.fonts.halyardBold,
    },
    'ul-li': {
      marginLeft: 8,
      marginTop: -4,
    },
  };
  switch (postType) {
    case 'obs_longform':
      return {
        ...generalClassStyles,
        headerNumberContainer: {
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        },
        headerNumber: {
          color: theme.colors.brandBlue,
          fontSize: themeState.fontStyles.headerNumber.fontSize,
          fontFamily: theme.fonts.halyardSemBd,
          marginRight: 10,
        },
        headerText: {
          flexShrink: 1,
        },
      };
    default:
      return generalClassStyles;
  }
};

export const ignoredDomTags = ['source', 'video', 'iframe'];

export const customHTMLElementModels = {
  postblock: HTMLElementModel.fromCustomModel({
    tagName: 'postblock',
    contentModel: HTMLContentModel.block,
  }),
  ads: HTMLElementModel.fromCustomModel({
    tagName: 'ads',
    contentModel: HTMLContentModel.block,
  }),
  obslink: HTMLElementModel.fromCustomModel({
    tagName: 'obslink',
    contentModel: HTMLContentModel.block,
  }),
  pub: HTMLElementModel.fromCustomModel({
    tagName: 'pub',
    contentModel: HTMLContentModel.block,
  }),
  imgblock: HTMLElementModel.fromCustomModel({
    tagName: 'imgblock',
    contentModel: HTMLContentModel.block,
  }),
  obsaudio: HTMLElementModel.fromCustomModel({
    tagName: 'obsaudio',
    contentModel: HTMLContentModel.block,
  }),
  obsvideo: HTMLElementModel.fromCustomModel({
    tagName: 'obsvideo',
    contentModel: HTMLContentModel.block,
  }),
  blockquote: HTMLElementModel.fromCustomModel({
    tagName: 'blockquote',
    contentModel: HTMLContentModel.block,
  }),
  font: HTMLElementModel.fromCustomModel({
    tagName: 'font',
    contentModel: HTMLContentModel.textual,
  }),
};

// Platform
export const OS = {
  android: 'android',
  ios: 'ios',
};

// Topic Letters
export const letters = ['#', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'l', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

// Piano
export const PIANO_AID = 'zK27EIf8Uk';
export const PIANO_API_TOKEN = 'c0buGSKrM3UlHqoq3P38TXvcpouDoxTIN9im04oB';

export const obsWithHttps = 'https://observador.pt';
export const obsWithHttp = 'http://observador.pt';
export const obsDevWithHttps = 'https://v2dev.observador.pt';
export const obsDevWithHttp = 'http://v2dev.observador.pt';
export const twitterProvider = 'https://publish.twitter.com/oembed';
export const youtubeProvider = 'https://www.youtube.com/oembed';
export const obsPeople = 'https://observador.pt/ficha-tecnica/';
export const obsContact = 'https://observador.pt/contactos/';
export const obsHelp = 'https://observador.pt/ajuda/';
export const obsPolicyPrivacy = 'https://observador.pt/politica-de-privacidade/';
export const obstTerms = 'https://observador.pt/termos-e-condicoes/';
