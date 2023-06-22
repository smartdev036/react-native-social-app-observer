import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity, FlatList } from 'react-native';
import HeaderScreens from '../components/header/headerScreens';
import { theme } from '../constants/theme';
import { apiBase } from '../api/endpoints';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { AuthorUser } from '../models/articleFields';
import Loading from '../components/loading';
import { useAppSelector } from '../hooks';
import { Analytics, Screens } from '../services/analytics';

const Authors = () => {
  const themeState = useAppSelector(state => state.theme);
  const navigation = useNavigation();
  const [getAuthorsData, setGetAuthorsData] = useState<AuthorUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getAuthors().then(r => console.log('Error Getting Authors:', r));
    return () => {
      setIsLoading(false);
    };
  }, []);

  useEffect(() => {
    // pageview
    Analytics.trackPageView({ screen: Screens.AUTHORS });
  }, []);

  // Get Authors List
  const getAuthors = async () => {
    setIsLoading(true);
    await apiBase
      .get('/lists/authors')
      .then(response => {
        setGetAuthorsData(response.data as AuthorUser[]);
      })
      .catch((err: any) => {
        console.log('Error Getting Authors:', err);
      });
    setIsLoading(false);
  };

  const renderItem = ({ item }: { item: AuthorUser }) => <Item item={item} index={item.id} />;

  const Item = ({ item, index }: { item: AuthorUser; index: number }) => {
    const data = {
      author: {
        payload: {
          id: item.id,
          image: item.authorImg.src,
          name: item.displayName,
          userName: item.userName,
        },
      },
    };

    return (
      <View key={index}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            navigation.dispatch(CommonActions.navigate('Author', data));
          }}
          style={[styles.container, { maxWidth: themeState.themeOrientation.maxW }]}
        >
          <View style={styles.itemContainer}>
            <Image source={{ uri: item.authorImg.src }} resizeMode="cover" borderRadius={200} style={styles.image} />
          </View>
          <View style={styles.leftCol}>
            <Text style={[styles.authorText, { color: themeState.themeColor.color }]}>{item.displayName}</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeAreaView, { backgroundColor: themeState.themeColor.background }]}>
      <HeaderScreens isArticlePage={false} hasTitle={true} screenTitle={'Autores'} />
      <View style={[styles.articlesContent, { backgroundColor: themeState.themeColor.background }]}>
        {isLoading ? (
          <Loading color={themeState.themeColor.color} size={'small'} style={{ flex: 1 }} />
        ) : (
          <FlatList
            data={getAuthorsData}
            renderItem={renderItem}
            keyExtractor={(item, index) => item.id + '-' + index + 'authors'}
            showsVerticalScrollIndicator={true}
            initialNumToRender={20}
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
    flexDirection: 'row',
    paddingHorizontal: 15,
    width: '100%',
    marginRight: 'auto',
    marginLeft: 'auto',
  },
  itemContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 6,
  },
  leftCol: {
    flex: 6,
    justifyContent: 'center',
    marginLeft: 20,
  },
  image: {
    width: 40,
    height: 40,
  },
  authorText: {
    fontSize: 14,
    fontFamily: theme.fonts.halyardRegular,
  },
  articlesContent: {
    flex: 1,
  },
});

export default Authors;
