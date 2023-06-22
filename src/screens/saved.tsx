import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, RefreshControl } from 'react-native';
import { theme } from '../constants/theme';
import HeaderScreens from '../components/header/headerScreens';
import { apiSave } from '../api/endpoints';
import ArticleInListWrapper, { getPostInfo } from '../components/article/articleInListWrapper';
import { Post } from '../models/articles';
import { useAppSelector } from '../hooks';
import Loading from '../components/loading';
import { useNavigation } from '@react-navigation/native';
import { Analytics, Screens } from '../services/analytics';
import { strings } from '../constants/strings';
import { ArticleListsBorder } from '../components/article/articleListBorder';
import Icon from '../components/icon';
import { createTable, getDBConnection, insertArticle } from '../services/db-service';
import { useConnectivity } from '../services/useConnectivity';
import { useDispatch } from 'react-redux';

const Saved = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saveArticle, setSaveArticle] = useState<Post[]>();
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const themeState = useAppSelector(state => state.theme);
  const user = useAppSelector(state => state.auth.user);
  const offlineArticles = useAppSelector(state => state.common.offlineArticles);
  const downloadComplete = useAppSelector(state => state.common.downloadComplete);
  const connectivity = useConnectivity();
  const isConnected = connectivity ? connectivity[0] : null;
  const dispatch = useDispatch();

  useEffect(() => {
    console.log('Está nas definições', offlineArticles);
    if (downloadComplete) {
      console.log('Download está completo');
      return;
    }
    handlerDownload();
  }, [offlineArticles, downloadComplete]);

  useEffect(() => {
    Analytics.trackPageView({ screen: Screens.SAVED });
  }, []);

  useEffect(() => {
    if (isConnected) {
      return;
    }
    loadDatabaseArticle();
  }, [isConnected]);

  useEffect(() => {
    loadArticle(true).then(() => {
      setLoading(false);
      setLoadingMore(false);
      return () => {
        setLoading(false);
      };
    });
    return navigation.addListener('focus', () => {
      loadArticle(true).then(() => {
        setLoading(false);
        setLoadingMore(false);
        return () => {
          setLoading(false);
        };
      });
    });
  }, [page]);

  const loadDatabaseArticle = useCallback(async () => {
    const db = await getDBConnection();
    const tableName = 'posts';
    await createTable(db);
    const query = `SELECT *
                   FROM ${tableName}`;
    const [results] = await db.executeSql(query);
    if (results.rows.length > 0) {
      const savedArticles = [];
      for (let i = 0; i < results.rows.length; i++) {
        const article = results.rows.item(i);
        savedArticles.push(JSON.parse(article.json));
      }
      console.log('savedArticles', savedArticles);
      setSaveArticle(savedArticles);
    }
  }, []);

  const loadArticle = async (isLoadMore = false) => {
    if (!user) {
      return;
    }
    try {
      const resp = await apiSave.get('v2/save/' + user.id, {
        headers: { Authorization: `Bearer ${user.access_token}` },
        params: { page: page },
      });
      if (resp.data) {
        const res = resp.data as Post[];
        isLoadMore ? setSaveArticle([...(saveArticle ?? []), ...res]) : setSaveArticle(res);
      }
    } catch (e) {
      // TODO send data to collectors
      console.log('loadArticle', e);
    }
  };

  const renderItem = ({ item, index }: { item: Post; index: number }) => {
    const lastItem = index === saveArticle.length - 1;
    return (
      <>
        <ArticleInListWrapper post={item} />
        <ArticleListsBorder border={!lastItem} />
      </>
    );
  };

  const NoSavedArticles = () => {
    const color = theme.colors.brandGrey;
    return (
      <View style={styles.noSavedContainer}>
        <View style={styles.noSavedIconContainer}>
          <Icon name={'guardados-2'} size={100} disableFill={false} fill={color} color={color} />
        </View>
        <View style={styles.noSavedTextContainer}>
          <Text style={[styles.noSavedText, { color: themeState.themeColor.color }]}>{strings.saved.noSavedText}</Text>
        </View>
      </View>
    );
  };

  const FooterComp = () => {
    return (
      <View style={styles.footer}>
        <Loading color={themeState.themeColor.color} size={'small'} />
      </View>
    );
  };

  const keyExtractor = useCallback((item: Post, index: number) => item.id.toString() + index, []);

  /*  const handlerDownload = async () => {
      if (downloadComplete) {
        console.log('DOWNLOAD JÁ FOI CONCLUÍDO');
        return;
      }
      console.log('A INICIAR DOWNLOAD');
      const db = await getDBConnection();
      const downloadDate = new Date().toISOString();
      await createTable(db);

      if (saveArticle) {
        for (const article of saveArticle) {
          const episode = article.type === 'obs_episode';
          const liveBlog = article.type === 'obs_liveblog';
          if (episode || liveBlog) {
            continue;
          }
          const fullArticle = await getPostInfo(article.id, false, '');
          await insertArticle(db, article.id, JSON.stringify(fullArticle.data), downloadDate);
        }
      }
      console.log('DOWNLOAD COMPLETE');
      dispatch(setDownloadComplete(true));
    };*/

  return (
    <SafeAreaView style={[styles.safeAreaView, { backgroundColor: themeState.themeColor.background }]}>
      <HeaderScreens isArticlePage={false} hasTitle={true} screenTitle={strings.saved.screenTitle} />
      <View style={[styles.container, { maxWidth: themeState.themeOrientation.maxW }]}>
        {loading && <Loading color={themeState.themeColor.color} size={'small'} style={styles.loading} />}
        {!loading && saveArticle && saveArticle.length === 0 && <NoSavedArticles />}
        {!loading && saveArticle && saveArticle.length > 0 && (
          <FlatList
            showsVerticalScrollIndicator={true}
            data={saveArticle}
            renderItem={renderItem}
            maxToRenderPerBatch={6}
            initialNumToRender={6}
            removeClippedSubviews={true}
            updateCellsBatchingPeriod={100}
            windowSize={10}
            keyExtractor={keyExtractor}
            onEndReachedThreshold={0.1}
            onEndReached={() => {
              if (loadingMore || saveArticle?.length < 20) {
                return;
              }
              setPage(page + 1);
              setLoadingMore(true);
            }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={async () => {
                  if (!isConnected) {
                    return;
                  }
                  setRefreshing(true);
                  await loadArticle();
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
  noSavedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noSavedIconContainer: {
    flexDirection: 'row',
    opacity: 0.5,
  },
  noSavedTextContainer: {
    flexDirection: 'row',
    opacity: 0.5,
    marginTop: 8,
  },
  noSavedText: {
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

export default Saved;
