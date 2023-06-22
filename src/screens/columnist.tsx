import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, NativeScrollEvent } from 'react-native';
import HeaderScreens from '../components/header/headerScreens';
import { theme } from '../constants/theme';
import { apiBase } from '../api/endpoints';
import ArticleInListWrapper from '../components/article/articleInListWrapper';
import { useAppDispatch, useAppSelector } from '../hooks';
import { checkSubscribed, subscribe, unsubscribe } from '../reducers/subscription';
import { Dialog } from 'react-native-elements';
import FollowButton from '../components/followButton';
import ReactNativeParallaxHeader from 'react-native-parallax-header';
import { isCloseToBottom } from './author';
import { CommonActions, useNavigation } from '@react-navigation/native';
import AuthorImage from '../components/authorImage';
import { Post } from '../models/articles';
import { AuthorUser } from '../models/articleFields';
import Loading from '../components/loading';
import { Analytics, Screens } from '../services/analytics';
import { ArticleListsBorder } from '../components/article/articleListBorder';
import crashlytics from '@react-native-firebase/crashlytics';

interface ColumnistProps {
  route: {
    params: {
      author: {
        payload: AuthorUser;
      };
    };
  };
}

const Columnist = (props: ColumnistProps) => {
  const { author } = props.route.params;
  const [articlesByAuthor, setArticlesByAuthor] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState<boolean | any>();
  const [showDialogLoading, setShowDialogLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const navigation = useNavigation();
  const themeState = useAppSelector(state => state.theme);
  const user = useAppSelector(state => state.auth.user);
  const dispatch = useAppDispatch();

  useEffect(() => {
    getArticlesByAuthor();
    return () => {
      setShowDialogLoading(false);
    };
  }, [page]);

  useEffect(() => {
    Analytics.trackPageView({
      screen: Screens.COLUMNIST,
      viewName: author.payload.name,
      viewSlug: author.payload.userName,
    });
  }, [author]);

  useEffect(() => {
    dispatch(checkSubscribed({ id: author.payload.id, type: 'author' })).then(x => {
      setIsSubscribed(x.payload);
    });
  }, []);

  const getArticlesByAuthor = async () => {
    await apiBase
      .get(`/lists/articles/author/${author.payload.id}?page=${page}`)
      .then(response => {
        if (response.data) {
          setArticlesByAuthor((state: any) => [...state, ...response.data]);
        }
        setLoading(false);
        setIsLoading(false);
      })
      .catch((e: Error) => {
        crashlytics().recordError(e);
        crashlytics().log('Error: getArticlesByAuthor');
      });
    setIsLoading(false);
  };

  const Item = (item: Post, index: number) => {
    const lastItem = index === getArticlesByAuthor.length - 1;
    return (
      <View key={index}>
        <ArticleInListWrapper post={item} />
        <ArticleListsBorder border={!lastItem} />
      </View>
    );
  };

  const handleFollowClick = () => {
    setShowDialogLoading(true);
    if (!user) {
      setShowDialogLoading(false);
      navigation.dispatch(CommonActions.navigate('Login'));
    }
    isSubscribed
      ? dispatch(unsubscribe({ id: author.payload.id, type: 'author' }))
          .then(x => {
            setIsSubscribed(x.payload);
            setShowDialogLoading(false);
          })
          .catch((e: Error) => {
            crashlytics().recordError(e);
            crashlytics().log('Error: handleFollowClick - Unsubscribe error');
          })
      : dispatch(subscribe({ id: author.payload.id, type: 'author' }))
          .then(x => {
            setIsSubscribed(x.payload);
            setShowDialogLoading(false);
          })
          .catch((e: Error) => {
            crashlytics().recordError(e);
            crashlytics().log('Error: handleFollowClick - Subscription error');
          });
  };

  const handleLoadMore = () => {
    if (isLoading) {
      return;
    }
    setIsLoading(true);
    setPage(page + 1);
  };

  const Header = () => (
    <View style={styles.imageContainer}>
      <AuthorImage url={author.payload.image} style={styles.image} />
      <View style={styles.authorTextContainer}>
        <Text style={[styles.authorText, { color: themeState.themeColor.color }]}>{author.payload.name}</Text>
      </View>
      <View style={{ marginVertical: 10 }}>
        <FollowButton
          color={isSubscribed ? theme.colors.brandBlue : undefined}
          onPress={handleFollowClick}
          txtColor={isSubscribed ? theme.colors.white : themeState.themeColor.color}
          isSubscribed={isSubscribed}
        />
      </View>
    </View>
  );

  const renderNavBar = () => (
    <>
      <View style={{ paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center' }}>
        <AuthorImage url={author.payload.image} style={{ height: 50, width: 50, marginRight: 10, borderRadius: 50 }} />
        <Text style={{ flex: 1, fontSize: 16, color: themeState.themeColor.color, fontFamily: theme.fonts.halyardSemBd }}>{author.payload.name}</Text>
        <FollowButton
          color={isSubscribed ? theme.colors.brandBlue : undefined}
          onPress={handleFollowClick}
          txtColor={isSubscribed ? theme.colors.white : themeState.themeColor.color}
          isSubscribed={isSubscribed}
        />
      </View>
    </>
  );

  const renderContent = () => {
    return (
      <View style={{ backgroundColor: themeState.themeColor.background }}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Artigos Publicados</Text>
          <View style={styles.border} />
        </View>
        {loading && <Loading color={themeState.themeColor.color} size={'small'} style={styles.loading} />}
        {!loading && articlesByAuthor.map((item: Post, index: number) => Item(item, index))}
        {isLoading ? (
          <View style={styles.footer}>
            <Loading color={themeState.themeColor.color} size={'small'} />
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeAreaView, { backgroundColor: themeState.themeColor.background }]}>
      <HeaderScreens isArticlePage={false} hasTitle={false} />
      <Dialog
        isVisible={showDialogLoading}
        overlayStyle={{
          width: 100,
          height: 100,
          padding: 0,
          justifyContent: 'center',
        }}
      >
        <Dialog.Loading loadingProps={{ color: theme.colors.brandGrey }} />
      </Dialog>
      <View style={[styles.container, { maxWidth: themeState.themeOrientation.maxW }]}>
        <ReactNativeParallaxHeader
          alwaysShowNavBar={false}
          alwaysShowTitle={false}
          headerMaxHeight={200}
          statusBarColor={themeState.themeColor.background}
          navbarColor={themeState.themeColor.background}
          backgroundColor={themeState.themeColor.background}
          contentContainerStyle={{ backgroundColor: themeState.themeColor.background }}
          containerStyle={{ backgroundColor: themeState.themeColor.background }}
          title={<Header />}
          renderNavBar={renderNavBar}
          renderContent={renderContent}
          scrollViewProps={{
            showsVerticalScrollIndicator: true,
            removeClippedSubviews: true,
            onMomentumScrollEnd: ({ nativeEvent }: { nativeEvent: NativeScrollEvent }) => {
              if (isCloseToBottom(nativeEvent)) {
                handleLoadMore();
              }
            },
          }}
        />
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
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 100,
    height: 100,
  },
  authorTextContainer: {
    paddingTop: 15,
  },
  authorText: {
    fontSize: 22,
    fontFamily: theme.fonts.halyardSemBd,
  },
  titleContainer: {
    marginVertical: 30,
    marginHorizontal: 15,
  },
  title: {
    textTransform: 'uppercase',
    fontSize: 20,
    fontFamily: theme.fonts.halyardSemBd,
    color: theme.colors.brandBlue,
  },
  border: {
    borderWidth: 1,
    borderColor: theme.colors.brandBlue,
    width: 22,
  },
  articlesContent: {
    flex: 1,
  },
  footer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  loading: {
    flex: 1,
  },
});

export default Columnist;
