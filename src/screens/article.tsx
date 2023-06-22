import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, SafeAreaView, NativeModules, Platform, View, NativeEventEmitter } from 'react-native';
import HeaderScreens from '../components/header/headerScreens';
import PostType from './articles/postType';
import SpecialType from './articles/specialType';
import DefaultType from './articles/defaultType';
import OpinionType from './articles/opinionType';
import LiveBlogType from './articles/liveBlogType';
import EpisodeType from './articles/episodeType';
import InteractiveType from './articles/interactiveType';
import { UserToken } from '../services/auth';
import { apiBarbeiro, apiEvent, apiSave } from '../api/endpoints';
import { useToast } from 'react-native-toast-notifications';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { Post } from '../models/articles';
import { OS, PIANO_AID } from '../constants';
import FactCheckType from './articles/factCheckType';
import { useAppDispatch, useAppSelector } from '../hooks';
import Paywall from '../components/premium/paywall';
import NewsletterType from './articles/newsletterType';
import TutorType from './articles/tutorType';
import { EventType } from './articles/eventType';
import { Analytics, Screens } from '../services/analytics';
import IntroBanner from '../components/introBanner';
import { sendQualityReadsArticle } from '../reducers/analytics';
import { ContentType, EVENT_KIND_INTERACTION, EVENT_KIND_VIEW } from '../utils/qualityReads';
const { PianoModule } = NativeModules;

interface ArticleProps {
  route: any;
}

type PianoEvent =
  | {
      type: 'showTemplate';
      container: ContainerId;
      url?: string;
    }
  | {
      type: 'error';
      message: string;
    }
  | { type: 'ExperienceExecuted' };

type ContainerId = 'native_paywall' | 'piano_start_of_article' | 'piano_middle_of_article' | 'piano_end_of_article';

const TypeComp = (props: { article: Post }): JSX.Element => {
  const { article } = props;
  let type;
  switch (article.type) {
    case 'obs_event':
      type = <EventType post={article} />;
      break;
    case 'post':
      type = <PostType post={article} />;
      break;
    case 'obs_liveblog':
      type = <LiveBlogType post={article} />;
      break;
    case 'obs_longform':
      type = <SpecialType post={article} />;
      break;
    case 'obs_opinion':
      type = <OpinionType post={article} />;
      break;
    case 'obs_episode':
      // TODO this isn't doing anything in here check goToArticle() in articleinList.tsx
      type = <EpisodeType post={article} />;
      break;
    case 'obs_factcheck':
      type = <FactCheckType post={article} />;
      break;
    case 'obs_interactive':
      type = <InteractiveType post={article} />;
      break;
    case 'obs_newsletter':
      type = <NewsletterType post={article} />;
      break;
    case 'obs_tutor':
      type = <TutorType post={article} />;
      break;
    default:
      type = <DefaultType post={article} />;
      break;
  }
  return type;
};

const Article = (props: ArticleProps) => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { route } = props;
  const article = route.params as Post;
  const toast = useToast();
  const [saved, setSaved] = useState(false);
  const [showPayWall, setShowPayWall] = useState(false);
  const sawIntro = useRef(false);
  const [commentCount, setCommentCount] = useState();
  const [showIntro, setShowIntro] = useState(false);
  const firstFocusRef = useRef(true);

  const { themeState, user, piano } = useAppSelector(s => ({
    themeState: s.theme,
    user: s.auth?.user || null,
    piano: s.piano,
  }));

  useEffect(() => {
    if (!piano.isPremium && !article.premium) {
      setShowIntro(true);
      sawIntro.current = true;
    }
  }, [piano]);

  const mainTopic = article?.topics?.find(t => t.mainTopic);
  const mainTopicName = mainTopic?.name ?? '';
  const authorsIndex = article?.credits?.map((c: any, index: number) => (index ? ', ' : '') + c.author.displayName);

  function sendQREvent(eventKind: typeof EVENT_KIND_INTERACTION | typeof EVENT_KIND_VIEW) {
    dispatch(
      sendQualityReadsArticle({
        cp: article.premium,
        cu: article.premium && piano.isPremium, //FIXME should check by paywall state
        si: sawIntro.current,
        e: eventKind,
        ct: ContentType.POST,
        ci: String(article.id),
        d1: 'READ_PERC',
        d2: 'PERC_ARTICLE',
      }),
    );
  }

  /* Quality Reads Related Stuff */
  useEffect(() => {
    Analytics.trackPageView({
      screen: Screens.ARTICLE,
      title: article.title,
      url: article.links.webUri,
      authorsName: article.chartBeatAuthors,
      topic: mainTopic,
      isPremium: article.premium,
    });

    const uF = navigation.addListener('focus', () => {
      /* On first render we want to wait for piano to execute,
        if the user navigates away and comes back to the article then we can then send the events here,
      */
      if (firstFocusRef.current) {
        firstFocusRef.current = false;
        return;
      }
      sendQREvent(EVENT_KIND_VIEW);
    });
    const uB = navigation.addListener('blur', () => {
      /*When blur the Article is still in the stack, and  the user can go back again to it, so, probably what we want here is
       to put the event on a buffer and if the user commes back to the article we continue to measure the interaction, and update it,
       For now we are sending new events.
      */
      sendQREvent(EVENT_KIND_INTERACTION);
    });

    const uBE = navigation.addListener('beforeRemove', () => {
      /* Whe the article is removed from the stack (usualy with the go back button) it is possible that we have sent blur events before
       */
      sendQREvent(EVENT_KIND_INTERACTION);
    });

    return () => {
      uB();
      uBE();
      uF();
    };
  }, []);

  useEffect(() => {
    console.log('article.tsx => useEffect', article.type, article.id);
    setShowPayWall(false);
    //LOG.info('ADDING Piano Listener', article.id, ' ', article.title);
    const pianoEventEmitter = new NativeEventEmitter(PianoModule);
    pianoEventEmitter.addListener('pianoEvent', async (event: PianoEvent) => {
      switch (event.type) {
        case 'showTemplate':
          handleShowTemplate(event.container, event.url || null);
          break;
        case 'ExperienceExecuted':
          //LOG.info('ExperienceExecuted', article.title, ' ', article.id);
          sendQREvent(EVENT_KIND_VIEW);

          /* We need to remove the listener because, if the user navigates to another article, this callback will continue to fire */
          pianoEventEmitter.removeAllListeners('pianoEvent');
          break;
        case 'error':
          console.log('Piano Error: ', event.message);
          break;
      }
    });

    if (Platform.OS === OS.android) {
      PianoModule.seeList(article.premium ? 'premium' : '', article.pubDate, mainTopicName, article?.credits[0]?.author?.displayName ?? '', piano.isPremium);
    } else {
      PianoModule.seeList(
        PIANO_AID, //iOS
        article.premium ? 'premium' : '',
        article.pubDate,
        mainTopicName,
        article?.credits[0]?.author.displayName,
        piano.isPremium,
      );
    }
  }, [piano.isPremium]);

  useEffect(() => {
    loadCountComment();
    if (user) {
      loadCheckSaved(user);
      let platform = 'REACT';
      if (Platform.OS == OS.ios) {
        platform = 'IOS-REACT';
      }
      if (Platform.OS == OS.android) {
        platform = 'ANDROID-REACT';
      }
      apiEvent
        .post(
          'article',
          {
            objectType: 'post',
            id: article.id.toString(),
            userId: user.id,
            anonymous: false,
            action: 'READ',
            platform: platform,
            origin: 'normal',
          },
          { headers: { Authorization: `Bearer ${user.access_token}` } },
        )
        .catch(e => {
          // TODO send data to collectors
          console.log('send_view_event', e);
        });
    }
  }, [user?.user.email]);

  const loadCheckSaved = async (u: UserToken) => {
    try {
      const resp = await apiSave.get(`save/${u.id}/${article.id}/status`, {
        headers: {
          Authorization: `Bearer ${u.access_token}`,
        },
      });
      if (resp.data?.saved != null && typeof resp.data.saved === 'boolean') {
        setSaved(resp.data.saved);
      }
    } catch (e) {
      // TODO send data to collectors
      console.log('loadCheckSaved', e);
    }
  };

  const onSaveCallback = async () => {
    if (!user) {
      navigation.dispatch(CommonActions.navigate('Login'));
      return;
    }
    try {
      await apiSave.post(saved ? 'unsave' : 'save', { userId: user.id, postId: article.id }, { headers: { Authorization: `Bearer ${user.access_token}` } });
      setSaved(!saved);
      toast.hideAll();
      saved ? toast.show('A remover o artigo...') : toast.show('A guardar o artigo...');
    } catch (e) {
      // TODO send data to collectors
      console.log('onSaved', e);
    }
  };

  const loadCountComment = async () => {
    const resp = await apiBarbeiro.get(`comments/count?content_type=post&id=${article.id}`);
    if (resp.data && resp.data[0]?.count != null) {
      setCommentCount(resp.data[0].count);
    }
  };

  function handleShowTemplate(container: ContainerId, url: string | null) {
    switch (container) {
      case 'native_paywall':
        setShowPayWall(true);
        break;
      case 'piano_start_of_article':
        //TODO
        break;
      case 'piano_middle_of_article':
        //TODO
        break;
      case 'piano_end_of_article':
        //TODO
        break;
      default:
        //TODO
        break;
    }
  }

  function handleIntroClose() {
    setShowIntro(false);
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeState.themeColor.background }]}>
      <View pointerEvents={showPayWall ? 'none' : 'auto'}>
        <HeaderScreens
          commentEnabled={article.comments_enabled}
          commentCount={commentCount}
          onComment={() => {
            navigation.dispatch(CommonActions.navigate('Comments', { id: article.id }));
          }}
          title={article.fullTitle}
          permalink={article.links?.webUri}
          isArticlePage={true}
          hasTitle={false}
          isSaved={saved}
          onSaved={onSaveCallback}
        />
      </View>
      {showPayWall && <Paywall post={article} hasCloseBtn={true} />}
      {showIntro && <IntroBanner unitId={'/14628225/app_overlay'} onClose={handleIntroClose} />}
      {article && !!authorsIndex && <TypeComp article={article} />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});

export default Article;
