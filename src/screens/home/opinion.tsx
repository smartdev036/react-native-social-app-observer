import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, SafeAreaView, RefreshControl } from 'react-native';
import { apiBase } from '../../api/endpoints';
import ArticleInListWrapper from '../../components/article/articleInListWrapper';
import { Post } from '../../models/articles';
import Loading from '../../components/loading';
import { useAppSelector } from '../../hooks';
import { Analytics, Screens } from '../../services/analytics';
import { ArticleListsBorder } from '../../components/article/articleListBorder';
import { useNavigation } from '@react-navigation/native';
import { LOG } from '../../utils/logger';

interface renderItemProps {
  item: Post;
  index: number;
}

const Opinion = () => {
  const [opinionPosts, setOpinionPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);

  const themeState = useAppSelector(state => state.theme);
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      Analytics.trackPageView({ screen: Screens.OPINION });
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    getOpinionData();
    return () => {
      setIsLoading(false);
    };
  }, [page]);

  const handlePageChange = (reset: boolean) => {
    if (page === 1 && reset) {
      // if we pull down to refresh and the last pega was 1,
      // there's no page change to trigger useEffect.
      // In that case we'll call getLatestData() directly
      getOpinionData();
    } else {
      // change page will trigger useEffect that loads more
      setPage(reset ? 1 : page + 1);
    }
  };

  // Get Latest
  const getOpinionData = async () => {
    try {
      setIsLoading(true);
      const response = await apiBase.get(`/lists/opinion?page=${page}`);
      const posts = response.data as Post[];
      if (page === 1) {
        setOpinionPosts(posts);
      } else {
        setOpinionPosts([...opinionPosts, ...posts]);
      }
    } catch (err) {
      LOG.error('Error Get Latest', err);
    } finally {
      setIsLoading(false);
    }
  };

  const RenderItem = (props: renderItemProps) => {
    const { item, index } = props;
    const lastItem = index === opinionPosts.length - 1;
    return (
      <View key={index}>
        <ArticleInListWrapper post={item} />
        <ArticleListsBorder border={!lastItem} />
      </View>
    );
  };

  // Footer Loading
  const RenderFooter = () => {
    return page > 1 && isLoading ? (
      <View style={styles.footer}>
        <Loading color={themeState.themeColor.color} size={'small'} />
      </View>
    ) : null;
  };

  return (
    <SafeAreaView style={[styles.safeAreaView, { backgroundColor: themeState.themeColor.background }]}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: themeState.themeColor.background,
            maxWidth: themeState.themeOrientation.maxW,
          },
        ]}
      >
        {opinionPosts.length == 0 && isLoading ? (
          <Loading color={themeState.themeColor.color} size={'small'} />
        ) : (
          <FlatList
            initialNumToRender={10}
            data={opinionPosts}
            renderItem={RenderItem}
            onEndReached={() => {
              handlePageChange(false);
            }}
            onEndReachedThreshold={0.1}
            showsVerticalScrollIndicator={true}
            keyExtractor={(item, index) => item.id + '-' + index + 'opinion'}
            removeClippedSubviews={true}
            refreshControl={
              <RefreshControl
                refreshing={opinionPosts.length > 0 && page === 1 && isLoading}
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

export default Opinion;
