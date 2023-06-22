import React, {useCallback, useEffect, useState} from 'react';
import {View, Text, StyleSheet, SafeAreaView, FlatList, RefreshControl} from 'react-native';
import {theme} from '../constants/theme';
import HeaderScreens from '../components/header/headerScreens';
import {apiEvent} from '../api/endpoints';
import ArticleInListWrapper from '../components/article/articleInListWrapper';
import {Post} from '../models/articles';
import {useAppSelector} from '../hooks';
import Loading from '../components/loading';
import {Analytics, Screens} from '../services/analytics';
import {ArticleListsBorder} from '../components/article/articleListBorder';
import Icon from '../components/icon';
import {strings} from '../constants/strings';

const History = () => {
  const [loading, setLoading] = useState(true);
  const [histories, setHistories] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const themeState = useAppSelector((s) => s.theme);
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    Analytics.trackPageView({screen: Screens.READING_HISTORY});
  }, []);

  useEffect(() => {
    loadHistories().then(() => {
      setLoading(false);
      setLoadingMore(false);
    });
  }, [page]);

  const loadHistories = async () => {
    try {
      const resp = await apiEvent.get(
        `v2/article/user/${user?.id}/history/events`,
        {
          params: {page: 1},
          headers: {Authorization: `Bearer ${user?.access_token}`},
        },
      );
      if (resp.data) {
        setHistories(resp.data as Post[]);
      }
    } catch(e) {
      // TODO send data to collectors
      console.log("loadHistories", e);
    }
  };

  const renderItem = ({item, index}: { item: Post, index: number}) => {
    const lastItem = index === histories.length - 1;
    return (
      <>
        <ArticleInListWrapper post={item}/>
        <ArticleListsBorder border={!lastItem}/>
      </>
    );
  };

  const NoHistoryArticles = () => {
    const color = theme.colors.brandGrey;
    return (
      <View style={styles.noHistoryContainer}>
        <View style={styles.noHistoryIconContainer}>
          <Icon name={'historico'} size={100} disableFill={false} fill={color} color={color}/>
        </View>
        <View style={styles.noHistoryTextContainer}>
          <Text style={[styles.noHistoryText, {color: themeState.themeColor.color}]}>{strings.history.noHistoryText}</Text>
        </View>
      </View>
    );
  };

  const FooterComp = () => {
    return (
      <View style={styles.footer}>
        <Loading color={themeState.themeColor.color} size={'small'}/>
      </View>
    )
  }

  const keyExtractor = useCallback((item: Post, index: number) => item.id.toString() + index, []);

  return (
    <SafeAreaView style={[styles.safeAreaView, {backgroundColor: themeState.themeColor.background}]}>
      <HeaderScreens isArticlePage={false} hasTitle={true} screenTitle={strings.history.screenTitle}/>
      <View style={[styles.container, {maxWidth: themeState.themeOrientation.maxW}]}>
        {loading && <Loading color={themeState.themeColor.color} size={'small'} style={styles.loading}/>}
        {!loading && histories?.length === 0 && <NoHistoryArticles/>}
        {!loading && histories?.length > 0 && (
          <FlatList
            showsVerticalScrollIndicator={true}
            data={histories}
            renderItem={renderItem}
            maxToRenderPerBatch={6}
            initialNumToRender={6}
            removeClippedSubviews={true}
            updateCellsBatchingPeriod={100}
            windowSize={10}
            keyExtractor={keyExtractor}
            onEndReachedThreshold={0.1}
            onEndReached={() => {
              if (loadingMore || histories?.length < 20) {
                return;
              }
              setPage(page + 1);
              setLoadingMore(true);
            }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={async () => {
                  setRefreshing(true);
                  await loadHistories();
                  setRefreshing(false);
                }}
                tintColor={themeState.themeColor.color}
              />
            }
            ListFooterComponent={() => {
              return loadingMore ? <FooterComp /> : null;
            }}
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
    width: '100%',
    marginRight: 'auto',
    marginLeft: 'auto',
  },
  noHistoryContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noHistoryIconContainer: {
    flexDirection: 'row',
    opacity: 0.5,
  },
  noHistoryTextContainer: {
    flexDirection: 'row',
    opacity: 0.5,
    marginTop: 8,
  },
  noHistoryText: {
    fontSize: 14,
    fontFamily: theme.fonts.halyardRegular,
  },
  loading: {
    flex: 1,
  },
  footer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
});

export default History;
