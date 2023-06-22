import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View, SafeAreaView } from 'react-native';
import HeaderScreens from '../components/header/headerScreens';
import { apiBase } from '../api/endpoints';
import { theme } from '../constants/theme';
import SectionListItem from '../components/sectionListItem';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { Taxonomy } from '../models/taxonomy';
import { letters } from '../constants/';
import Loading from '../components/loading';
import { useAppSelector } from '../hooks';
import { Analytics, Screens } from '../services/analytics';
import { strings } from '../constants/strings';
import crashlytics from '@react-native-firebase/crashlytics';

const Topics = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState<boolean>(true);
  const [selectTitle, setSelectTitle] = useState<string>('A');
  const [topics, setTopics] = useState<Taxonomy[]>([]);
  const themeState = useAppSelector(state => state.theme);

  useEffect(() => {
    Analytics.trackPageView({ screen: Screens.TOPICS });
  }, []);

  useEffect(() => {
    setLoading(true);
    setSelectTopics('A');
    return () => {
      setLoading(false);
    };
  }, []);

  const renderItem = ({ item, index }: { item: Taxonomy; index: number }) => {
    return (
      <Pressable
        key={index}
        onPress={() => {
          navigation.dispatch(CommonActions.navigate('TopicsDetails', { topic: item }));
        }}
      >
        <Text style={[styles.topicText, { color: themeState.themeColor.color }]}>{item.name}</Text>
      </Pressable>
    );
  };

  const setSelectTopics = async (letter: string) => {
    if (letter === '#') {
      letter = '@';
    }
    setLoading(true);
    apiBase
      .get(`/lists/topics/${letter}/`)
      .then(r => {
        setTopics(r.data as Taxonomy[]);
        setLoading(false);
      })
      .catch((e: Error) => {
        crashlytics().recordError(e);
        crashlytics().log('Error: setSelectTopics');
      });
  };

  const keyExtractor = useCallback((item: Taxonomy) => item.term_id.toString(), []);

  return (
    <SafeAreaView style={[styles.safeAreaView, { backgroundColor: themeState.themeColor.background }]}>
      <HeaderScreens isArticlePage={false} hasTitle={true} screenTitle={strings.topics.screenTitle} />
      <View style={[styles.container, { maxWidth: themeState.themeOrientation.maxW }]}>
        {loading && <Loading color={themeState.themeColor.color} size={'small'} style={styles.loading} />}
        {!loading && topics && (
          <FlatList
            showsVerticalScrollIndicator={false}
            data={topics}
            renderItem={renderItem}
            maxToRenderPerBatch={17}
            initialNumToRender={17}
            removeClippedSubviews={true}
            updateCellsBatchingPeriod={100}
            windowSize={17}
            keyExtractor={keyExtractor}
          />
        )}
        <View style={styles.lettersContainer}>
          {letters.map((letter: string, index: number) => (
            <Pressable
              key={index}
              onPress={async () => {
                setSelectTitle(letter);
                await setSelectTopics(letter);
              }}
            >
              <SectionListItem height={25.5} title={letter} active={selectTitle === letter} />
            </Pressable>
          ))}
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
    width: '100%',
    marginRight: 'auto',
    marginLeft: 'auto',
  },
  loading: {
    flex: 1,
  },
  topicText: {
    padding: 10,
    fontSize: 14,
    fontFamily: theme.fonts.halyardRegular,
    paddingHorizontal: 15,
  },
  lettersContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 15,
    zIndex: 1,
    height: '100%',
  },
});

export default Topics;
