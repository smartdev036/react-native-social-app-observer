import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { apiBase } from '../../api/endpoints';
import ArticleInListWrapper from '../../components/article/articleInListWrapper';
import AdsBanner from '../../components/adsBanner';
import { Post } from '../../models/articles';
import { useNavigation, useScrollToTop } from '@react-navigation/native';
import Loading from '../../components/loading';
import { useAppSelector } from '../../hooks';
import { ArticleListsBorder } from '../../components/article/articleListBorder';
import { Analytics } from '../../services/analytics';
import { netAudienceEvents, netAudienceOthersEvent } from '../../constants/strings';

interface renderItemProps {
  item: Post;
  index: number;
}

const Popular = () => {
  const [getPopular, setGetPopular] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const themeState = useAppSelector(state => state.theme);
  const ref = React.useRef(null);
  const navigation = useNavigation();
  useScrollToTop(ref);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      Analytics.gemiusTrackEvent(netAudienceEvents.others);
    });

    return  unsubscribe;
  }, [navigation]);

  useEffect(() => {
    getPopularData().then();
    return () => {
      setLoading(false);
    };
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getPopularData().then(() => {
      setRefreshing(false);
    });
  }, []);

  // Get Popular
  const getPopularData = async () => {
    await apiBase
      .get('/lists/popular')
      .then(response => {
        const posts = response.data as Post[];
        setGetPopular(posts);
        setLoading(false);
        return posts;
      })
      .catch((err: Error) => {
        setLoading(true);
        console.log('Error: getPopularData - ', err);
      });
  };

  const RenderItem = (props: renderItemProps) => {
    const { item, index } = props;
    const lastItem = index === getPopular.length - 1;
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

  const keyExtractor = useCallback((item: Post, index: number) => item.id.toString() + index, []);

  return (
    <View style={[styles.container, { backgroundColor: themeState.themeColor.background }]}>
      {loading ? (
        <Loading color={themeState.themeColor.color} size={'small'} />
      ) : (
        <FlatList
          initialNumToRender={10}
          data={getPopular}
          ref={ref}
          renderItem={RenderItem}
          showsVerticalScrollIndicator={true}
          keyExtractor={keyExtractor}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={100}
          windowSize={10}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={themeState.themeColor.color} />}
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
});

export default Popular;
