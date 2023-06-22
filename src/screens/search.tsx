import React, { useCallback, useEffect, useState, SetStateAction } from 'react';
import { FlatList, Platform, SafeAreaView, StyleSheet, Text, Pressable, View } from 'react-native';
import HeaderScreens from '../components/header/headerScreens';
import { theme } from '../constants/theme';
import SearchBar from 'react-native-dynamic-search-bar';
import { apiBase, apiPodcasts } from '../api/endpoints';
import ArticleInListWrapper from '../components/article/articleInListWrapper';
import Icon from '../components/icon';
import { Post } from '../models/articles';
import { Credit, Program, Topic } from '../models/articleFields';
import { Taxonomy } from '../models/taxonomy';
import { CommonActions, useNavigation } from '@react-navigation/native';
import AuthorImage from '../components/authorImage';
import Loading from '../components/loading';
import { useAppSelector } from '../hooks';
import { Analytics, Screens } from '../services/analytics';
import { ArticleListsBorder } from '../components/article/articleListBorder';
import crashlytics from '@react-native-firebase/crashlytics';
import { netAudienceEvents, strings } from '../constants/strings';

interface SearchResult {
  author: Credit[];
  post: Post[];
  program: Program[];
  topic: Topic[];
}

interface renderItemProps {
  key: number;
  payload: any;
  type: string;
}

const Search = () => {
  const [searchResult, setSearchResult] = useState<SearchResult>({
    author: [],
    post: [],
    program: [],
    topic: [],
  });
  const [searchInput, setSearchInput] = useState('');
  const [showArray, setShowArray] = useState([]);
  const [isLoading, setIsLoding] = useState(false);
  const navigation = useNavigation();
  const themeState = useAppSelector(state => state.theme);

  useEffect(() => {
    Analytics.trackPageView({ screen: Screens.SEARCH });
  }, []);

  const renderItem = ({ item, index }: { item: renderItemProps; index: number }) => {
    const lastItem = index === showArray.length - 1;
    if (item.type === 'head') {
      return (
        <View style={[styles.titleContainer, { marginBottom: item.key === 0 ? 0 : 20, marginTop: item.key === 1 ? 0 : 20 }]}>
          <Text style={[styles.title, { color: themeState.themeColor.search.results.title }]}>{item.payload}</Text>
        </View>
      );
    }

    if (item.type === 'author') {
      return (
        <Pressable
          onPress={() => {
            navigation.dispatch(CommonActions.navigate('Author', { author: item, navigation }));
          }}
          style={{ flex: 1, flexDirection: 'row', marginHorizontal: 15 }}
        >
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginVertical: 6 }}>
            <AuthorImage url={item.payload.image} style={styles.image} />
          </View>
          <View style={{ flex: 6, justifyContent: 'center', marginLeft: 20 }}>
            <Text style={[styles.authorText, { color: themeState.themeColor.search.results.name }]}>{item.payload.name}</Text>
          </View>
        </Pressable>
      );
    }
    if (item.type == 'topic') {
      return (
        <Pressable
          onPress={() => {
            const t: Taxonomy = {
              term_id: item.payload.id,
              name: item.payload.name,
              permalink: '',
              slug: '',
              type: '',
            };
            navigation.dispatch(CommonActions.navigate('TopicsDetails', { topic: t }));
          }}
          style={styles.topicContainer}
        >
          <Text style={[styles.topicText, { color: themeState.themeColor.search.results.name }]}>{item.payload.name}</Text>
        </Pressable>
      );
    }
    if (item.type === 'program') {
      return (
        <Pressable
          onPress={async () => {
            try {
              const resp = await apiPodcasts.get(`programs/${item.payload.slug}`);
              navigation.dispatch(CommonActions.navigate('Program', resp.data.data));
            } catch (e) {
              console.log('Error: Search Program API:', e);
            }
          }}
        >
          <View style={styles.programContainer}>
            <Text style={[styles.programText, { color: themeState.themeColor.search.results.name }]}>{item.payload.title}</Text>
          </View>
        </Pressable>
      );
    }
    if (item.type === 'post') {
      return (
        <>
          <ArticleInListWrapper post={item.payload} />
          <ArticleListsBorder border={!lastItem} />
        </>
      );
    }
  };

  useEffect(() => {
    const arr = [];
    let key = 0;

    if (searchResult?.author?.length > 0) {
      key += 1;
      arr.push({ type: 'head', payload: 'Autores', key: key });
      searchResult.author.map(res => {
        key += 1;
        arr.push({ type: 'author', payload: res, key: key });
      });
    }

    if (searchResult?.topic?.length > 0) {
      key += 1;
      arr.push({ type: 'head', payload: 'Tópicos', key: key });
      searchResult.topic.map(res => {
        key += 1;
        arr.push({ type: 'topic', payload: res, key: key });
      });
    }

    if (searchResult?.program?.length > 0) {
      key += 1;
      arr.push({ type: 'head', payload: 'Programas' });
      searchResult.program.map(res => {
        arr.push({ type: 'program', payload: res, key: key });
      });
    }

    if (searchResult?.post?.length > 0) {
      key += 1;
      arr.push({ type: 'head', payload: 'Artigos' });
      searchResult.post.map(res => {
        key += 1;
        arr.push({ type: 'post', payload: res, key: key });
      });
    }

    setShowArray(arr);
  }, [searchResult]);

  const getSearchData = async (text: string) => {
    setIsLoding(true);
    Analytics.gemiusTrackEvent(netAudienceEvents.search);
    await apiBase
      .get('/search/' + encodeURIComponent(text))
      .then(response => {
        const res = response.data as SearchResult;
        setSearchResult(res);
        return res;
      })
      .catch((e: Error) => {
        setSearchResult({ author: [], post: [], program: [], topic: [] });
        crashlytics().recordError(e);
        crashlytics().log('Error: getSearchData');
      });
    setIsLoding(false);
  };

  const filterList = (text: SetStateAction<string>) => {
    const searchText: string = text.toString();
    setSearchInput(searchText);
    if (searchText.length > 2) {
      try {
        getSearchData(searchText);
      } catch (e: Error | any) {
        crashlytics().recordError(e);
        crashlytics().log('Error: filterList');
      }
    } else if (searchText.length !== 1) {
      setSearchResult({ author: [], post: [], program: [], topic: [] });
    }
  };

  const SearchComp = () => {
    const fill = themeState.themeColor.search.input.iconColor;
    const color = themeState.themeColor.search.input.iconColor;
    return <Icon name="search" size={18} fill={fill} color={color} disableFill={false} />;
  };

  const ClearComp = () => {
    const fill = themeState.themeColor.search.input.iconColor;
    const color = themeState.themeColor.search.input.iconColor;
    return <Icon name="close" size={18} fill={fill} color={color} disableFill={false} />;
  };

  const keyExtractor = useCallback((item: any, index: number) => item.id + index.toString(), []);

  return (
    <SafeAreaView style={[styles.safeAreaView, { backgroundColor: themeState.themeColor.background }]}>
      <HeaderScreens isArticlePage={false} hasTitle={true} screenTitle={strings.search.screenTitle} />
      <View style={[styles.container, { maxWidth: themeState.themeOrientation.maxW }]}>
        <View style={styles.searchContainer}>
          <SearchBar
            placeholder={strings.search.placeholder}
            value={searchInput}
            placeholderTextColor={themeState.themeColor.search.input.colorText}
            style={[
              styles.searchBox,
              {
                backgroundColor: themeState.themeColor.search.input.bgColor,
                shadowColor: themeState.themeColor.search.input.shadowColor,
              },
            ]}
            textInputStyle={[styles.textInputStyle, { color: themeState.themeColor.search.input.colorText }]}
            onChangeText={text => {
              filterList(text);
            }}
            onClearPress={() => {
              setSearchInput('');
              setSearchResult({ author: [], post: [], program: [], topic: [] });
            }}
            clearIconComponent={<ClearComp />}
            searchIconComponent={<SearchComp />}
            autoFocus={true}
          />
        </View>
        <View style={styles.content}>
          {isLoading ? (
            <Loading color={themeState.themeColor.color} size={'small'} style={styles.loading} />
          ) : (
            <FlatList
              showsVerticalScrollIndicator={true}
              data={showArray}
              renderItem={renderItem}
              onEndReachedThreshold={0.1}
              maxToRenderPerBatch={7}
              initialNumToRender={20}
              removeClippedSubviews={true}
              updateCellsBatchingPeriod={100}
              windowSize={10}
              keyExtractor={keyExtractor}
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
    marginTop: 10,
    width: '100%',
    marginRight: 'auto',
    marginLeft: 'auto',
  },
  loading: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 15,
  },
  searchBox: {
    width: '100%',
    ...Platform.select({
      android: {
        elevation: 10,
      },
    }),
  },
  textInputStyle: {
    fontFamily: theme.fonts.halyardRegular,
    fontSize: 14,
  },
  content: {
    flex: 1,
    marginTop: 20,
  },
  titleContainer: {
    marginHorizontal: 15,
    width: '100%',
  },
  title: {
    fontSize: 14,
    fontFamily: theme.fonts.halyardRegular,
  },
  image: {
    height: 40,
    width: 40,
    borderRadius: 40,
  },
  authorText: {
    fontSize: 14,
    fontFamily: theme.fonts.halyardRegular,
  },
  topicContainer: {
    marginBottom: 15,
    marginHorizontal: 15,
  },
  topicText: {
    fontSize: 14,
    fontFamily: theme.fonts.halyardRegular,
  },
  programContainer: {
    marginBottom: 15,
    marginHorizontal: 15,
  },
  programText: {
    fontSize: 14,
    fontFamily: theme.fonts.halyardRegular,
  },
});

export default Search;
