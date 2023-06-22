import React, { useState } from 'react';
import { StyleSheet, View, Pressable, Modal } from 'react-native';
import ArticleInList from './articleInList';
import { apiBase, apiPodcasts } from '../../api/endpoints';
import { CommonActions, StackActions, useNavigation, useRoute } from '@react-navigation/native';
import { Post } from '../../models/articles';
import Headline from '../header/headline';
import { useAppSelector } from '../../hooks';
import crashlytics from '@react-native-firebase/crashlytics';
import { theme } from '../../constants/theme';
import Loading from '../loading';

interface ArticlesProps {
  post: Post;
  headLine?: boolean;
}

export const getPostInfo = (id: number, isPodcast: boolean, slug: string) => {
  if (isPodcast) {
    return apiPodcasts.get(`episodes/${slug}/${id}`);
  } else {
    return apiBase.get(`/items/post/${id}`);
  }
};

const ArticleInListWrapper = (props: ArticlesProps) => {
  const [showDialogLoading, setShowDialogLoading] = useState(false);
  const route = useRoute();
  const navigation = useNavigation();
  const { post, headLine } = props;
  const themeState = useAppSelector(state => state.theme);

  async function goToArticle() {
    setShowDialogLoading(true);
    const episode = post.type === 'obs_episode';
    const podcast = post.program?.programType.includes('podcast');
    const audio = post.program?.programType.includes('audio');
    const isPodcast = episode && (podcast || audio);
    const programSlug = episode ? post.program.slug : '';

    if (!episode && post.body) {
      console.log('Post has Body Offline');
      navigation.dispatch(CommonActions.navigate('Article', post));
      setTimeout(() => {
        setShowDialogLoading(false);
      }, 70);
      return;
    }

    getPostInfo(post.id, isPodcast, programSlug)
      .then(x => {
        if (isPodcast) {
          navigation.dispatch(CommonActions.navigate('Episode', x?.data?.data));
        } else {
          const p = x.data as Post;
          if (route.name !== 'Opinião') {
            const pushAction = StackActions.push('Article', p);
            navigation.dispatch(pushAction);
          } else {
            navigation.dispatch(CommonActions.navigate('Article', p));
          }
        }
        // TODO pass loading para redux
        setTimeout(() => {
          setShowDialogLoading(false);
        }, 70);
      })
      .catch((e: Error) => {
        crashlytics().recordError(e);
        crashlytics().log('Error: goToArticle');
        setShowDialogLoading(false);
      });
  }

  return (
    <View style={{ backgroundColor: themeState.themeColor.background }}>
      <Modal transparent={true} statusBarTranslucent={true} visible={showDialogLoading}>
        <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <Loading size={'large'} color={theme.colors.brandDarkBlue} />
        </View>
      </Modal>
      <Pressable
        onPress={goToArticle}
        style={[
          styles.container,
          {
            paddingBottom: headLine ? 0 : styles.container.paddingBottom,
            paddingTop: headLine ? 0 : styles.container.paddingTop,
            paddingRight: headLine ? 0 : styles.container.paddingRight,
            paddingLeft: headLine ? 0 : styles.container.paddingLeft,
          },
        ]}
      >
        {headLine ? <Headline post={post} /> : <ArticleInList post={post} />}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    paddingRight: 15,
    paddingLeft: 15,
    paddingTop: 15,
    paddingBottom: 15,
  },
});

export default ArticleInListWrapper;
