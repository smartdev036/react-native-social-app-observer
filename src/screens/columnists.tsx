import React, {useCallback, useEffect, useState} from 'react';
import {View, Text, StyleSheet, SafeAreaView, FlatList, Pressable} from 'react-native';
import HeaderScreens from '../components/header/headerScreens';
import {theme} from '../constants/theme';
import {apiBase} from '../api/endpoints';
import {CommonActions, useNavigation} from '@react-navigation/native';
import {AuthorUser} from '../models/articleFields';
import Loading from '../components/loading';
import {useAppSelector} from '../hooks';
import {Analytics, Screens} from '../services/analytics';
import crashlytics from '@react-native-firebase/crashlytics';
import {Image} from '@rneui/themed';
import {Skeleton} from '@rneui/themed';
import {strings} from '../constants/strings';

interface ColumnistsPayload {
  columnist: AuthorUser[];
  noColumnist: AuthorUser[];
}

const Columnists = () => {
  const navigation = useNavigation();
  const [columnists, setColumnists] = useState<ColumnistsPayload>(
    {
      columnist: [], noColumnist: []
    },
  );
  const [isLoading, setIsLoading] = useState(false);
  const themeState = useAppSelector((s) => s.theme);

  useEffect(() => {
    Analytics.trackPageView({screen: Screens.COLUMNISTS});
  }, []);

  useEffect(() => {
    getColumnists();
    return () => {
      setIsLoading(false);
    };
  }, []);

  const getColumnists = async () => {
    setIsLoading(true);
    await apiBase.get('/lists/authors/columnists').then((response) => {
      setColumnists(response.data.colunistas as ColumnistsPayload);
      return response.data.colunistas;
    })
      .catch((e: Error) => {
        crashlytics().recordError(e);
        crashlytics().log('Error: getColumnists');
      });
    setIsLoading(false);
  };

  const renderItem = ({item, index}: { item: AuthorUser, index: number }) => {
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
        <Pressable
          onPress={() => {
            navigation.dispatch(CommonActions.navigate('Columnist', data));
          }}
          style={[styles.container, {maxWidth: themeState.themeOrientation.maxW}]}
        >
          <View style={styles.itemContainer}>
            <Image
              source={{uri: item.authorImg.src}}
              resizeMode="cover"
              containerStyle={styles.image}
              PlaceholderContent={<Skeleton circle/>}
            />
          </View>
          <View style={styles.leftCol}>
            <Text style={[styles.authorText, {color: themeState.themeColor.color}]}>{item.displayName}</Text>
          </View>
        </Pressable>
      </View>
    );
  };

  const keyExtractor = useCallback((item: any) => item.id.toString(), []);

  return (
    <SafeAreaView style={[styles.safeAreaView, {backgroundColor: themeState.themeColor.background}]}>
      <HeaderScreens isArticlePage={false} hasTitle={true} screenTitle={strings.columnists.screenTitle}/>
      <View style={[styles.articlesContent, {backgroundColor: themeState.themeColor.background}]}>
        {isLoading ? (
          <Loading color={themeState.themeColor.color} size={'small'} style={{flex: 1}}/>
        ) : (
          <FlatList
            showsVerticalScrollIndicator={true}
            // @ts-ignore
            data={columnists}
            renderItem={renderItem}
            maxToRenderPerBatch={14}
            initialNumToRender={14}
            removeClippedSubviews={true}
            updateCellsBatchingPeriod={100}
            windowSize={14}
            keyExtractor={keyExtractor}
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
    borderRadius: 40,
  },
  authorText: {
    fontSize: 14,
    fontFamily: theme.fonts.halyardRegular,
  },
  articlesContent: {
    flex: 1,
  },
});

export default Columnists;
