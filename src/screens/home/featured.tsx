import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { apiBase } from '../../api/endpoints';
import ArticleInListWrapper from '../../components/article/articleInListWrapper';
import AdsBanner from '../../components/adsBanner';
import { Post } from '../../models/articles';
import { useNavigation, useScrollToTop } from '@react-navigation/native';
import Loading from '../../components/loading';
import { useAppSelector } from '../../hooks';
import { Analytics, Screens } from '../../services/analytics';
import { ArticleListsBorder } from '../../components/article/articleListBorder';
import { LogToAll } from '../../utils/logger';

interface renderItemProps {
  item: Post;
  index: number;
}

function parseDateToOffSet(date: Date) {
  let m: string | number = date.getMonth();
  let d: string | number = date.getDate();
  if (m < 10) {
    m = '0' + m;
  }
  if (d < 10) {
    d = '0' + d;
  }
  return String(date.getFullYear()) + String(m) + String(d);
}

const Featured = () => {
  const [getFeatured, setGetFeatured] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { themeState, commonState } = useAppSelector(state => ({
    themeState: state.theme,
    commonState: state.common,
  }));
  const ref = useRef(null);
  const navigation = useNavigation();
  const isFetching = useRef(false);
  useScrollToTop(ref);
  const offSet = useRef('');
  const lastRefreshRef = useRef(0);

  useEffect(() => {
    const now = Math.round(new Date().getTime() / 1000);
    const lastRefresh = lastRefreshRef.current;
    if (lastRefresh > 0 && now - lastRefresh > 15 * 60) {
      getFeaturedData();
      ref.current?.scrollToIndex({
        index: 0,
        animated: true,
      });
    }
  }, [commonState]);

  useEffect(() => {
    const unsubscribeFocus = navigation.addListener('focus', () => {
      Analytics.trackPageView({ screen: Screens.FEATURED, section: 'homepage'});
    });

    return unsubscribeFocus;
  }, [navigation]);

  useEffect(() => {
    getFeaturedData();
    return () => {
      setLoading(false);
    };
  }, []);

  const onRefresh = useCallback(() => {
    offSet.current = '';
    setRefreshing(true);
    getFeaturedData(true, false, false).then(() => {
      setRefreshing(false);
    });
  }, []);

  useEffect(() => {
    const newOffSet = getFeatured[getFeatured.length - 1]?.pubDate;
    if (!newOffSet) {
      return;
    }

    offSet.current = parseDateToOffSet(new Date(newOffSet));
  }, [getFeatured]);

  const getFeaturedData = async (reset = false, infiniteScroll = false, shouldSetLoading = true) => {
    if (infiniteScroll) {
      Analytics.trackInfiniteScroll();
    }
    if (isFetching.current) {
      return;
    }

    let url = '/lists/featured/';
    if (offSet.current !== '') {
      url = url + '?offset=' + offSet.current;
    }

    try {
      isFetching.current = true;
      shouldSetLoading && setLoading(true);
      const response = await apiBase.get(url);
      const posts = response.data as Post[];
      if (!posts || posts.length === 0) {
        throw 'invalid reponse';
      }
      setGetFeatured(currentPosts => {
        if (reset === true) {
          return posts;
        }
        return [...currentPosts, ...posts];
      });
    } catch (e) {
      LogToAll({ message: e?.message ?? JSON.stringify(e), type: 'fetch_featured' });
    } finally {
      shouldSetLoading && setLoading(false);
      isFetching.current = false;
      lastRefreshRef.current = Math.round(new Date().getTime() / 1000);
    }
  };

  const RenderEachItem = (props: renderItemProps) => {
    const { item, index } = props;
    const lastItem = index === getFeatured.length - 1;
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
          <ArticleInListWrapper post={item} headLine={index === 0} />
          <ArticleListsBorder border={!(index === 0 || lastItem)} />
        </View>
      </>
    );
  };

  const memoizedValue = useMemo(() => RenderEachItem, [getFeatured]);
  const keyExtractor = useCallback((item: Post, index: number) => item.id.toString() + index, []);

  return (
    <View style={[styles.container, { backgroundColor: themeState.themeColor.background }]}>
      {getFeatured.length > 0 && (
        <FlatList
          initialNumToRender={20}
          data={getFeatured}
          ref={ref}
          renderItem={memoizedValue}
          showsVerticalScrollIndicator={true}
          keyExtractor={keyExtractor}
          removeClippedSubviews={true}
          updateCellsBatchingPeriod={100}
          windowSize={15}
          onEndReached={() => getFeaturedData(false, true)}
          onEndReachedThreshold={20}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={themeState.themeColor.color} />}
        />
      )}
      {loading && <Loading color={themeState.themeColor.color} size={'small'} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Featured;
