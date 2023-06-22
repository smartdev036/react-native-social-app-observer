import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import { apiBase } from '../api/endpoints';
import ArticleInListWrapper from '../components/article/articleInListWrapper';
import HeaderScreens from '../components/header/headerScreens';
import { theme } from '../constants/theme';
import { checkSubscribed, subscribe, unsubscribe } from '../reducers/subscription';
import { Dialog } from 'react-native-elements';
import { useAppDispatch, useAppSelector } from '../hooks';
import FollowButton from '../components/followButton';
import { Post } from '../models/articles';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { Taxonomy } from '../models/taxonomy';
import Loading from '../components/loading';
import { Analytics, Screens } from '../services/analytics';
import { ArticleListsBorder } from '../components/article/articleListBorder';
import { AlertError } from '../error/errorAlert';
import crashlytics from '@react-native-firebase/crashlytics';

interface TopicsProps {
  route: {
    params: {
      topic: Taxonomy;
    };
  };
}

const TopicsDetails = (props: TopicsProps) => {
  const { topic } = props.route.params;
  const { name, permalink, term_id } = topic;
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const [getArticlesByTopic, setGetArticlesByTopic] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showDialogLoading, setShowDialogLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState<boolean | any>();
  const themeState = useAppSelector(state => state.theme);
  const user = useAppSelector(state => state.auth.user);

  useEffect(() => {
    getArticlesByTopicData();
    return navigation.addListener('focus', () => {
      getArticlesByTopicData();
      setShowDialogLoading(false);
    });
  }, [navigation]);

  useEffect(() => {
    const permalinkParts = permalink.split('observador.pt/seccao/');
    const slug = permalinkParts[permalinkParts.length - 1];
    Analytics.trackPageView({ screen: Screens.TOPIC, viewSlug: slug, viewName: name });
  }, [topic]);

  useEffect(() => {
    dispatch(checkSubscribed({ id: term_id, type: 'topic' })).then(x => {
      setIsSubscribed(x.payload);
    });
  }, []);

  const getArticlesByTopicData = async () => {
    await apiBase
      .get(`/lists/articles/topic/${term_id}?page=${page}`)
      .then(response => {
        const posts = response.data as Post[];
        setGetArticlesByTopic([...getArticlesByTopic, ...posts]);
        setLoading(false);
        setIsLoading(false);
      })
      .catch((e: Error) => {
        setLoading(true);
        crashlytics().recordError(e);
        crashlytics().log('Error: getArticlesByTopicData');
      });
  };

  const renderItem = ({ item, index }: { item: Post; index: number }) => {
    const lastItem = index === getArticlesByTopic.length - 1;
    return (
      <>
        <ArticleInListWrapper post={item} />
        <ArticleListsBorder border={!lastItem} />
      </>
    );
  };

  const RenderFooter = () => {
    return isLoading ? (
      <View style={styles.footer}>
        <Loading color={themeState.themeColor.color} size={'small'} />
      </View>
    ) : null;
  };

  const handleLoadMore = () => {
    // TODO implementar em backend paged articles
    return;
    if (isLoading) {
      return;
    }
    setIsLoading(true);
    setPage(page + 1);
  };

  const handleFollowClick = () => {
    setShowDialogLoading(true);
    if (!user) {
      setShowDialogLoading(false);
      navigation.dispatch(CommonActions.navigate('Login'));
    }
    if (isSubscribed) {
      dispatch(unsubscribe({ id: term_id, type: 'topic' }))
        .then(x => {
          setIsSubscribed(x.payload);
          setShowDialogLoading(false);
        })
        .catch(() => AlertError('Erro', 'Não foi possível cancelar a subscrição!', false));
    } else {
      dispatch(subscribe({ id: term_id, type: 'topic' }))
        .then(x => {
          setIsSubscribed(x.payload);
          setShowDialogLoading(false);
        })
        .catch(() => AlertError('Erro', 'Não foi possível efetuar a subscrição!', false));
    }
  };

  const keyExtractor = useCallback((item: Post, index: number) => item.id.toString() + index, []);

  return (
    <SafeAreaView style={[styles.safeAreaView, { backgroundColor: themeState.themeColor.background }]}>
      <HeaderScreens isArticlePage={false} hasTitle={false} />
      <Dialog isVisible={showDialogLoading} overlayStyle={styles.overlay}>
        <Dialog.Loading loadingProps={{ color: theme.colors.brandGrey }} />
      </Dialog>
      <View style={[styles.container, { maxWidth: themeState.themeOrientation.maxW }]}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: themeState.themeColor.color }]}>{name}</Text>
          <FollowButton
            color={isSubscribed ? theme.colors.brandBlue : undefined}
            onPress={handleFollowClick}
            txtColor={isSubscribed ? theme.colors.white : themeState.themeColor.color}
            isSubscribed={isSubscribed}
          />
        </View>
        <View style={styles.articlesContent}>
          {loading ? (
            <Loading color={themeState.themeColor.color} size={'small'} />
          ) : (
            <FlatList
              showsVerticalScrollIndicator={true}
              data={getArticlesByTopic}
              renderItem={renderItem}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.1}
              maxToRenderPerBatch={7}
              initialNumToRender={7}
              removeClippedSubviews={true}
              updateCellsBatchingPeriod={100}
              windowSize={10}
              keyExtractor={keyExtractor}
              ListFooterComponent={RenderFooter}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
  },
  container: {
    flex: 1,
    width: '100%',
    marginRight: 'auto',
    marginLeft: 'auto',
  },
  titleContainer: {
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontSize: 22,
    fontFamily: theme.fonts.halyardSemBd,
  },
  articlesContent: {
    flex: 1,
    marginTop: 20,
  },
  footer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  overlay: {
    width: 100,
    height: 100,
    padding: 0,
    justifyContent: 'center',
  },
});

export default TopicsDetails;
