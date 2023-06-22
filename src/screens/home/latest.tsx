import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { apiBase } from '../../api/endpoints';
import ArticleInListWrapper from '../../components/article/articleInListWrapper';
import AdsBanner from '../../components/adsBanner';
import { Post } from '../../models/articles';
import { useNavigation, useScrollToTop } from '@react-navigation/native';
import Loading from '../../components/loading';
import { useAppSelector } from '../../hooks';
import { ArticleListsBorder } from '../../components/article/articleListBorder';
import { LOG } from '../../utils/logger';
import { Analytics } from '../../services/analytics';
import { netAudienceEvents } from '../../constants/strings';

interface renderItemProps {
  item: Post;
  index: number;
}

const Latest = () => {
  const [latestPosts, setLatestPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const navigation = useNavigation();
  const lastRefreshRef = useRef(0);
  const { themeState, commonState } = useAppSelector(state => ({
    themeState: state.theme,
    commonState: state.common,
  }));
  const ref = React.useRef(null);

  useScrollToTop(ref);

  useEffect(() => {
    const now = Math.round(new Date().getTime() / 1000);
    const lastRefresh = lastRefreshRef.current;
    if (lastRefresh > 0 && now - lastRefresh > 15 * 60) {
      getLatestData();
      ref.current?.scrollToIndex({
        index: 0,
        animated: true,
      });
    }
  }, [commonState]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      Analytics.gemiusTrackEvent(netAudienceEvents.others);
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    getLatestData();
    return () => {
      setIsLoading(false);
    };
  }, [page]);

  const handlePageChange = (reset: boolean) => {
    if (page === 1 && reset) {
      // if we pull down to refresh and the last pega was 1,
      // there's no page change to trigger useEffect.
      // In that case we'll call getLatestData() directly
      getLatestData();
    } else {
      // change page will trigger useEffect that loads more
      setPage(reset ? 1 : page + 1);
    }
  };

  const getLatestData = async () => {
    try {
      setIsLoading(true);
      const response = await apiBase.get(`/lists/latest?page=${page}`);
      const posts = response.data as Post[];
      if (page === 1) {
        setLatestPosts(posts);
      } else {
        setLatestPosts([...latestPosts, ...posts]);
      }
    } catch (err) {
      LOG.error('Error Get Latest', err);
    } finally {
      setIsLoading(false);
      lastRefreshRef.current = Math.round(new Date().getTime() / 1000);
    }
  };

  const RenderItem = (props: renderItemProps) => {
    const { item, index } = props;
    const lastItem = index === latestPosts.length - 1;
    return (
      <>
        <View>
          <View>
            {index === 4 ? (
              <>
                <AdsBanner
                  inList={true}
                  unitId={'/14628225/app_lista_1'}
                  hasBackground={true}
                  size={'MEDIUM_RECTANGLE'}
                  requestOptions={{
                    customTargeting: { position: '1' },
                  }}
                />
                <ArticleListsBorder border={true} />
              </>
            ) : null}
          </View>
          <ArticleInListWrapper post={item} />
          <ArticleListsBorder border={!lastItem} />
        </View>
      </>
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

  const keyExtractor = useCallback((item: Post, index: number) => item.id.toString() + index, []);

  return (
    <View style={[styles.container, { backgroundColor: themeState.themeColor.background }]}>
      {latestPosts.length == 0 && isLoading ? (
        <Loading color={themeState.themeColor.color} size={'small'} />
      ) : (
        <FlatList
          initialNumToRender={10}
          data={latestPosts}
          ref={ref}
          renderItem={RenderItem}
          onEndReached={() => {
            handlePageChange(false);
          }}
          onEndReachedThreshold={0.1}
          showsVerticalScrollIndicator={true}
          keyExtractor={keyExtractor}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={100}
          windowSize={10}
          refreshControl={
            <RefreshControl
              refreshing={latestPosts.length > 0 && page === 1 && isLoading}
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  footer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
});

export default Latest;
