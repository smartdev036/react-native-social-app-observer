import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, NativeScrollEvent } from 'react-native';
import HeaderScreens from '../components/header/headerScreens';
import { theme } from '../constants/theme';
import { apiBase } from '../api/endpoints';
import ArticleInListWrapper from '../components/article/articleInListWrapper';
import { checkSubscribed, subscribe, unsubscribe } from '../reducers/subscription';
import { Dialog } from 'react-native-elements';
import { useAppDispatch, useAppSelector } from '../hooks';
import FollowButton from '../components/followButton';
import { Post } from '../models/articles';
import { CommonActions, useNavigation } from '@react-navigation/native';
import AuthorImage from '../components/authorImage';
import { AuthorUser } from '../models/articleFields';
import Loading from '../components/loading';
import { Analytics, Screens } from '../services/analytics';
import { ArticleListsBorder } from '../components/article/articleListBorder';
import ReactNativeParallaxHeader from 'react-native-parallax-header';

interface AuthorProps {
  [x: string]: any;

  author: AuthorUser;
}

export const isCloseToBottom = (event: NativeScrollEvent) => {
  return event.layoutMeasurement.height + event.contentOffset.y >= event.contentSize.height - 40;
};

const Author = (props: AuthorProps) => {
  const { author } = props.route.params;
  const [getArticlesByAuthor, setGetArticlesByAuthor] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showDialogLoading, setShowDialogLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState<boolean | any>();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const themeState = useAppSelector(state => state.theme);
  const user = useAppSelector(state => state.auth.user);

  useEffect(() => {
    getArticlesByAuthorData().then();
    return () => {
      setShowDialogLoading(false);
    };
  }, [page]);

  useEffect(() => {
    Analytics.trackPageView({
      screen: Screens.AUTHOR,
      viewName: author.payload.name,
      viewSlug: author.payload.userName,
    });
  }, [author]);

  useEffect(() => {
    dispatch(checkSubscribed({ id: author.payload.id, type: 'author' })).then(x => {
      setIsSubscribed(x.payload);
    });
  }, []);

  const getArticlesByAuthorData = async () => {
    await apiBase
      .get(`/lists/articles/author/${author.payload.id}?page=${page}`)
      .then(response => {
        setGetArticlesByAuthor([...getArticlesByAuthor, ...(response.data as Post[])]);
        setLoading(false);
        setIsLoading(false);
      })
      .catch((err: any) => {
        setLoading(true);
        console.log('Error: Getting articles by Author', err);
      });
    setIsLoading(false);
  };

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

  const Header = () => (
    <>
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
    </>
  );

  const handleFollowClick = () => {
    setShowDialogLoading(true);
    if (!user) {
      setShowDialogLoading(false);
      navigation.dispatch(CommonActions.navigate('Login'));
    }
    if (isSubscribed) {
      dispatch(unsubscribe({ id: author.payload.id, type: 'author' }))
        .then(x => {
          setIsSubscribed(x.payload);
          setShowDialogLoading(false);
        })
        .catch(() => 'Erro ao cancelar Subscrição');
    } else {
      dispatch(subscribe({ id: author.payload.id, type: 'author' }))
        .then(x => {
          setIsSubscribed(x.payload);
          setShowDialogLoading(false);
        })
        .catch(() => 'Erro ao Subscrever');
    }
  };

  const renderItem = (item: Post, index: number) => {
    const lastItem = index === getArticlesByAuthor.length - 1;
    return (
      <>
        <ArticleInListWrapper key={index} post={item} />
        <ArticleListsBorder border={!lastItem} />
      </>
    );
  };

  const renderContent = () => {
    return (
      <View style={{ backgroundColor: themeState.themeColor.background }}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Artigos Publicados</Text>
          <View style={styles.border} />
        </View>
        {loading && <Loading color={themeState.themeColor.color} size={'small'} />}
        {!loading && getArticlesByAuthor.map(renderItem)}
        {isLoading ? (
          <View style={styles.footer}>
            <Loading color={themeState.themeColor.color} size={'small'} />
          </View>
        ) : null}
      </View>
    );
  };

  const handleLoadMore = () => {
    if (isLoading) {
      return;
    }
    setIsLoading(true);
    setPage(page + 1);
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
      <View style={[styles.container, { maxWidth: themeState.themeOrientation.maxW, backgroundColor: 'red' }]}>
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
  footer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
});

export default Author;
