import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, SafeAreaView, RefreshControl } from 'react-native';
import { apiBase } from '../api/endpoints';
import ArticleInListWrapper from '../components/article/articleInListWrapper';
import { Post } from '../models/articles';
import Loading from '../components/loading';
import { useAppSelector } from '../hooks';
import { Analytics, Screens } from '../services/analytics';
import { ArticleListsBorder } from '../components/article/articleListBorder';
import { useNavigation } from '@react-navigation/native';
import { LOG } from '../utils/logger';
import HeaderScreens from '../components/header/headerScreens';
import { strings } from '../constants/strings';

interface renderItemProps {
  item: Post;
  index: number;
}

const Premium = () => {
  const [premiumPosts, setPremiumPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const themeState = useAppSelector(state => state.theme);
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      Analytics.trackPageView({ screen: Screens.PREMIUM });
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    getPremiumData();
    return () => {
      setIsLoading(false);
    };
  }, [page]);

  const handlePageChange = (reset: boolean) => {
    if (page === 1 && reset) {
      getPremiumData();
    } else {
      setPage(reset ? 1 : page + 1);
    }
  };

  const getPremiumData = async () => {
    try {
      setIsLoading(true);
      const response = await apiBase.get(`/lists/premium?page=${page}`);
      const posts = response.data as Post[];
      if (page === 1) {
        setPremiumPosts(posts);
      } else {
        setPremiumPosts([...premiumPosts, ...posts]);
      }
    } catch (err) {
      LOG.error('Error: getPremiumData', err);
    } finally {
      setIsLoading(false);
    }
  };

  const RenderItem = (props: renderItemProps) => {
    const { item, index } = props;
    const lastItem = index === premiumPosts.length - 1;
    return (
      <View key={index}>
        <ArticleInListWrapper post={item} />
        <ArticleListsBorder border={!lastItem} />
      </View>
    );
  };

  const RenderFooter = () => {
    return page > 1 && isLoading ? (
      <View style={styles.footer}>
        <Loading color={themeState.themeColor.color} size={'small'} />
      </View>
    ) : null;
  };

  const keyExtractor = useCallback((item: Post) => item.id.toString(), []);

  return (
    <SafeAreaView style={[styles.safeAreaView, { backgroundColor: themeState.themeColor.background }]}>
      <HeaderScreens isArticlePage={false} hasTitle={true} screenTitle={strings.premium.screenTitle} />
      <View
        style={[
          styles.container,
          {
            backgroundColor: themeState.themeColor.background,
            maxWidth: themeState.themeOrientation.maxW,
          },
        ]}
      >
        {premiumPosts.length == 0 && isLoading ? (
          <Loading color={themeState.themeColor.color} size={'small'} />
        ) : (
          <FlatList
            initialNumToRender={10}
            data={premiumPosts}
            renderItem={RenderItem}
            onEndReached={() => {
              handlePageChange(false);
            }}
            onEndReachedThreshold={0.1}
            showsVerticalScrollIndicator={true}
            keyExtractor={keyExtractor}
            removeClippedSubviews={true}
            refreshControl={
              <RefreshControl
                refreshing={premiumPosts.length > 0 && page === 1 && isLoading}
                onRefresh={() => {
                  handlePageChange(true);
                }}
                tintColor={themeState.themeColor.color}
              />
            }
            ListFooterComponent={RenderFooter}
          />
        )}
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
    justifyContent: 'center',
    width: '100%',
    marginRight: 'auto',
    marginLeft: 'auto',
  },
  footer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
});

export default Premium;
