import { store } from '../store';
import DeviceInfo from 'react-native-device-info';
import axios from 'axios';
import { NativeModules } from 'react-native';
import { Topic } from '../models/articleFields';
import { LOG } from '../utils/logger';
import { netAudienceEvents, netAudienceStrings } from '../constants/strings';
import { QualityReadsEvent, qualityReadsURL } from '../utils/qualityReads';
import { getUserAgent } from '../api/endpoints';
import fireBaseAnalytics from '@react-native-firebase/analytics';
import { FirebaseAnalyticsTypes } from '@react-native-firebase/analytics';

const { ChartbeatModule, GemiusModule } = NativeModules;

const BASE_URL = 'https://observador.pt/';
const SUFFIX = '- Observador';
const TRACKING_ID_MP = 'UA-49680806-3'; //"UA-49680806-6"
const DATA_SOURCE = 'app_mp_v2';
const MEASUREMENT_API_URL = 'https://www.google-analytics.com/r/collect';

type ClickEvent = {
  event_name: string;
  click_action: string;
  click_location: string;
  click_label: string;
}

export const Screens = {
  FEATURED: 'Home',
  LATEST: 'Latest',
  POPULAR: 'Popular',
  OPINION: 'Opinion',
  PREMIUM: 'Premium',
  RADIO: 'Radio',
  ALERTS: 'Alerts',
  SAVED: 'Saved',
  READING_HISTORY: 'Reading History',
  SEARCH: 'Search',
  TOPICS: 'Topics',
  TOPIC: 'Topic',
  PODCAST_HOME: 'Podcast Home',
  PROGRAM: 'program',
  AUTHORS: 'authors',
  AUTHOR: 'Author',
  COLUMNISTS: 'Columnists',
  COLUMNIST: 'Columnist',
  ARTICLE: 'Article',
  GALLERY: 'GALLERY',
  COMMENTS: 'Comments',
  DEFAULT_TITLE: 'Observador',
  getURL(screen: string, slug?: string): string | undefined {
    switch (screen) {
      case Screens.FEATURED:
        return BASE_URL;
      case Screens.LATEST:
        return BASE_URL + 'ultimas/';
      case Screens.POPULAR:
        return BASE_URL + 'mais-populares/';
      case Screens.OPINION:
        return BASE_URL + 'opiniao/';
      case Screens.PREMIUM:
        return BASE_URL + 'exclusivos/';
      case Screens.RADIO:
        return BASE_URL + 'radio/player/';
      case Screens.ALERTS:
        return BASE_URL + 'alertas/';
      case Screens.SAVED:
        return BASE_URL + 'artigos-guardados/';
      case Screens.READING_HISTORY:
        return BASE_URL + 'historico/';
      case Screens.SEARCH:
        return BASE_URL + 'pesquisa/';
      case Screens.TOPICS:
        return BASE_URL + 'topicos/';
      case Screens.TOPIC:
        return BASE_URL + 'seccao/' + slug ?? '' + '';
      case Screens.PODCAST_HOME:
        return BASE_URL + 'programas/';
      case Screens.PROGRAM:
        return BASE_URL + 'programas/' + slug ?? '' + '/';
      case Screens.AUTHORS:
        return BASE_URL + 'autores/';
      case Screens.AUTHOR:
        return BASE_URL + 'perfil/' + slug ?? '' + '/';
      case Screens.COLUMNISTS:
        return BASE_URL + 'colunistas/';
      case Screens.COLUMNIST: // TODO
        return BASE_URL + 'opiniao/autor/' + slug ?? '' + '/';
      default:
        return undefined;
    }
  },
  getTitle(screen: string, name?: string): string {
    switch (screen) {
      case Screens.FEATURED:
        return 'Observador';
      case Screens.LATEST:
        return 'Últimas ' + SUFFIX;
      case Screens.POPULAR:
        return 'Mais Populares ' + SUFFIX;
      case Screens.OPINION:
        return 'Opiniões ' + SUFFIX;
      case Screens.RADIO:
        return 'Rádio Observador - Em direto';
      case Screens.ALERTS:
        return 'Alertas ' + SUFFIX;
      case Screens.SAVED:
        return 'Artigos guardados ' + SUFFIX;
      case Screens.READING_HISTORY:
        return 'Histórico ' + SUFFIX;
      case Screens.SEARCH:
        return 'Resultados de Pesquisa ' + SUFFIX;
      case Screens.TOPICS:
        return 'Tópicos ' + SUFFIX;
      case Screens.TOPIC:
        return 'Tudo sobre: ' + name + ' ' + SUFFIX;
      case Screens.PODCAST_HOME:
        return 'Episódios ' + SUFFIX;
      case Screens.PROGRAM:
        return name + ' - Programas ' + SUFFIX;
      case Screens.AUTHORS:
        return 'Autores - as nossas letras têm rosto ' + SUFFIX;
      case Screens.AUTHOR:
        return name + ' ' + SUFFIX;
      case Screens.COLUMNISTS:
        return 'Colunistas - a nossa opinião tem assinatura ' + SUFFIX;
      case Screens.COLUMNIST:
        return 'Opinião ' + SUFFIX;
      case Screens.PREMIUM:
        return 'Exclusivos ' + SUFFIX;
      default:
        return '';
    }
  },
};

export interface PageViewI {
  screen: string;
  url?: string;
  title?: string;
  isPremium?: boolean;
  topic?: Topic;
  authorsName?: string;
  userType?: 'anon' | 'lgdin' | 'paid';
  userId?: string;
  deviceUUID?: string;
  userAgent?: string;
  viewSlug?: string;
  viewName?: string;
  section?: string;
}

function sendPageViewG3(pageView: PageViewI) {
  const body =
    'v=1' +
    '&t=pageview' +
    '&dl=' +
    pageView.url +
    '&ul=en-us' +
    '&de=UTF-8' +
    '&dt=' +
    pageView.title +
    '&cid=' +
    pageView.deviceUUID +
    '&tid=' +
    TRACKING_ID_MP +
    '&uid=' +
    pageView.userId +
    '&ua=' +
    pageView.userAgent +
    '&ds=' +
    DATA_SOURCE;

  axios
    .post(MEASUREMENT_API_URL + '?' + body)
    .then(r => {
      // LOG.info('Page view send', r, pageView.screen, pageView.url, decodeURIComponent(pageView.title ?? ''));
      if (r.status !== 200) {
        LOG.error('ERROR ANALYTICS PAGE VIEW', r);
      }
    })
    .catch(x => LOG.error(x));
}

async function sendPageViewGA4(pageView: PageViewI) {
  //https://rnfirebase.io/analytics/usage
  const { auth, analytics, theme } = store.getState();

  const e: FirebaseAnalyticsTypes.ScreenViewParameters = {
    screen_name: pageView.screen,
    page_location: pageView.url,
    page_title: decodeURIComponent(pageView.title || ''),
    site_section: pageView.section || pageView.topic?.slug || '', //TODO verify if we are using the slug in web
    darkmode_status: theme.themeColor.theme === 'dark',
    user_id: auth.user?.user.sub ?? '',
    user_browser_id: analytics.browserID,
  };

  await fireBaseAnalytics().logScreenView(e);
}

function sendPageViewCB(pageView: PageViewI, successCallback: (success: boolean) => void) {
  const decodedTitle = decodeURIComponent(<string>pageView.title);
  pageView.title = decodedTitle;
  const sections = ['react'];
  if (pageView.topic) {
    sections.push(pageView.topic.slug);
  }
  if (pageView.isPremium) {
    sections.push('premium');
  }
  const authors = pageView.authorsName?.split(',');

  if (pageView.screen == Screens.ARTICLE) {
    ChartbeatModule.trackCompleteView(pageView.url, pageView.title, authors, sections, pageView.userType, successCallback);
  } else {
    ChartbeatModule.trackView(pageView.url, pageView.title, successCallback);
  }
}

function sendPageViewGM(pageView: PageViewI) {
  let data;
  switch (pageView.screen) {
    case Screens.FEATURED:
      data = 'Homepage_do_site';
      break;
    case Screens.ARTICLE:
      console.log(pageView);
      data = 'article/' + pageView.userType + '/' + pageView.topic?.name;
      break;
    case Screens.SEARCH:
      data = 'search';
      break;
    case Screens.GALLERY:
      data = 'photogallery';
      break;
    case Screens.COMMENTS:
      data = 'open_comments';
      break;
    case Screens.TOPIC:
      data = 'section/' + pageView.userType + '/' + pageView.viewSlug;
      break;
    default:
      data = 'other/' + pageView.userType;
  }

  GemiusModule.sendEvent(data, 'full');
}

export const Analytics = {
  trackPageView: (pageView: PageViewI) => {
    const { auth } = store.getState();
    pageView.userType = 'anon';
    pageView.userId = '';
    pageView.deviceUUID = DeviceInfo.getUniqueIdSync();
    pageView.userAgent = DeviceInfo.getUserAgentSync();
    if (auth?.user) {
      pageView.userId = auth.user.id;
      pageView.userType = auth.user.premium ? 'paid' : 'lgdin';
    }
    if (!pageView.url) {
      pageView.url = Screens.getURL(pageView.screen, pageView.viewSlug);
    }
    if (!pageView.title) {
      pageView.title = Screens.getTitle(pageView.screen, pageView.viewName);
    }
    pageView.title = encodeURIComponent(pageView.title);
    pageView.userAgent = encodeURIComponent(pageView.userAgent);

    //TODO SEND PAGE VIEW TO GA4
    sendPageViewGA4(pageView);

    sendPageViewG3(pageView);

    //TODO SEND PAGE VIEW TO CHARTBEAT
    sendPageViewCB(pageView, success => {
      if (!success) {
        setTimeout(() => {
          //console.log('send to charbeat after first fail:', success);
          sendPageViewCB(pageView, () => undefined);
        }, 1000);
      }
    });

    //TODO SEND PAGE VIEW TO GEMIUS
    sendPageViewGM(pageView);
  },
  trackInfiniteScroll: (isLiveBlog?: true) => {
    if (isLiveBlog) {
      GemiusModule.sendEvent('liveblog_infiniteScroll', 'partial');
    } else {
      GemiusModule.sendEvent('infiniteScroll', 'full');
    }
  },
  trackBackToForeground: () => {
    GemiusModule.sendEvent('app_backtoForeground', 'full');
  },
  audioRefreshIntervalId: 0,
  startAudioRefresh(event: netAudienceStrings) {
    clearInterval(this.audioRefreshIntervalId);
    this.audioRefreshIntervalId = setInterval(() => {
      GemiusModule.sendEvent(event, 'full');
    }, 3 * 60 * 1000);
  },
  clearAudioRefreshInterval() {
    clearInterval(this.audioRefreshIntervalId);
  },
  gemiusTrackEvent(event: netAudienceEvents) {
    GemiusModule.sendEvent(event, 'full');
  },
  async qualityReads(e: QualityReadsEvent) {
    //console.log('qualityReads: ', JSON.stringify(e));
    await axios.post(qualityReadsURL, JSON.stringify(e), {
      headers: {
        'User-Agent': getUserAgent(),
      },
    });
  },
  async sendClickEvent(e: ClickEvent){
    fireBaseAnalytics().logEvent(e.event_name, {
      click_action: e.click_action,
      click_location: e.click_location,
      click_label: e.click_location
    })
  }
};
