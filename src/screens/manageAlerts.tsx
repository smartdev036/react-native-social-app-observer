import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableHighlight, Dimensions } from 'react-native';
import { theme } from '../constants/theme';
import HeaderScreens from '../components/header/headerScreens';
import { apiBase, apiPodcasts, apiQuiosque } from '../api/endpoints';
import AlertSearch from '../components/alertSearch';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Dialog } from 'react-native-elements';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { Taxonomy } from '../models/taxonomy';
import { useAppSelector } from '../hooks';
import { AuthorUser } from '../models/articleFields';
import { store } from '../store';
import Loading from '../components/loading';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface ProgramI {
  term_id: number;
  name: string;
  permalink: string;
  slug: string;
  type: string;
}

export interface TopicI {
  term_id: number;
  name: string;
  permalink: string;
  slug: string;
  type: string;
}

export interface SubscriptionsI {
  author?: AuthorUser[];
  program?: ProgramI[];
  topic?: TopicI[];
}

export interface UserSubscriptionI {
  channel_id: number;
  context_id: number;
  context_instance_id: number;
  context_name: string;
  id: number;
  periodicity: number;
  user_id: string;
}

const ManageAlerts = () => {
  const navigation = useNavigation();
  const user = useAppSelector(state => state.auth.user);
  const [loading, setLoading] = useState<boolean>(true);
  const [subscriptions, setSubscriptions] = useState<SubscriptionsI>();
  const [subLoading, setSubLoading] = useState<any[]>([]);
  const [dialogLoading, setDialogLoading] = useState<boolean>(false);
  const themeState = useAppSelector(state => state.theme);
  let insets = useSafeAreaInsets();

  useEffect(() => {
    loadSubscriptions();
    return () => {
      setLoading(false);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (user) {
        loadSubscriptions(false);
      }
    });
    return unsubscribe;
  }, [navigation]);

  const loadSubscriptions = async (showLoading = true) => {
    const user = store.getState().auth.user;
    if (!user) {
      return;
    }
    try {
      if (showLoading) {
        setLoading(true);
      }
      const resp = await apiQuiosque.get(`subscriptions/user/${user.id}`, {
        headers: { Authorization: `Bearer ${user.access_token}` },
      });
      if (resp.data) {
        const t: { [key: string]: number[] } = {};
        resp.data.forEach((i: UserSubscriptionI) => {
          if (!t[i.context_name]) {
            t[i.context_name] = [];
          }
          if (!t[i.context_name].includes(i.context_instance_id)) {
            t[i.context_name].push(i.context_instance_id);
          }
        });
        const bulk = await apiBase.post('/search/bulk', t);
        setSubscriptions(bulk.data);
      }
    } catch (e) {
      // TODO send data to collectors
      console.log('loadSubscriptions: ', e);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const renderItem = (item: AuthorUser | ProgramI | TopicI, index: number, type: 'author' | 'program' | 'topic') => {
    const id = (item as AuthorUser).id ?? (item as ProgramI | TopicI).term_id;
    const unsubscribe = async () => {
      try {
        if (subLoading.find(i => i === id)) {
          return;
        }
        setSubLoading([...subLoading, id]);
        await apiQuiosque.delete(`subscriptions/user/${user?.id}/subscribe/${type}/${id}`, { headers: { Authorization: `Bearer ${user?.access_token}` } });
        const t = { ...subscriptions } as SubscriptionsI;
        (t[type] as AuthorUser[] | ProgramI[] | TopicI[]).splice(
          (t[type] as AuthorUser[] | ProgramI[] | TopicI[]).findIndex(i => {
            if ((i as AuthorUser).id) {
              return (i as AuthorUser).id === id;
            } else {
              return (i as ProgramI | TopicI).term_id === id;
            }
          }),
          1,
        );
        setSubscriptions(t);
      } catch (e) {
        console.log('unsubscribe: ', e);
      } finally {
        const t = [...subLoading];
        t.splice(
          t.findIndex(i => i === id),
          1,
        );
        setSubLoading(t);
      }
    };

    return (
      <View
        key={index}
        style={{
          marginBottom: 10,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <TouchableOpacity
          onPress={async () => {
            if (type === 'topic') {
              const top = item as TopicI;
              let t: Taxonomy = {
                term_id: top.term_id,
                name: top.name,
                permalink: '',
                slug: '',
                type: '',
              };
              navigation.dispatch(CommonActions.navigate('TopicsDetails', { topic: t }));
            } else if (type === 'author') {
              const a = item as AuthorUser;
              const data = {
                author: {
                  payload: {
                    id: a.id,
                    name: a.displayName,
                    image: a.authorImg.src,
                  },
                },
              };
              navigation.dispatch(CommonActions.navigate('Author', data));
            } else if (type === 'program') {
              const p = item as ProgramI;
              try {
                const resp = await apiPodcasts.get(`programs/${p.slug}`);
                navigation.dispatch(CommonActions.navigate('PodcastEpisode', resp.data.data));
              } catch (e) {
                console.log('apiPodcasts.get: ', e);
              }
            }
          }}
          containerStyle={{ flex: 1 }}
        >
          <Text
            style={{
              color: themeState.themeColor.color,
              fontSize: 14,
              fontFamily: theme.fonts.halyardRegular,
            }}
          >
            {(item as TopicI)?.name ?? (item as ProgramI)?.name ?? (item as AuthorUser)?.displayName}
          </Text>
        </TouchableOpacity>
        <TouchableHighlight onPress={unsubscribe}>
          <View
            style={{
              width: 70,
              backgroundColor: theme.colors.brandBlue,
              paddingVertical: 4,
              alignItems: 'center',
            }}
          >
            {subLoading?.find(i => i === id) ? (
              <Loading color={themeState.themeColor.color} size={'small'} />
            ) : (
              <Text style={{ color: theme.colors.white }}>A seguir</Text>
            )}
          </View>
        </TouchableHighlight>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeAreaView, { backgroundColor: themeState.themeColor.background }]}>
      <HeaderScreens isArticlePage={false} hasTitle={false} />
      <Dialog
        isVisible={dialogLoading}
        overlayStyle={{
          width: 100,
          height: 100,
          padding: 0,
          justifyContent: 'center',
        }}
      >
        <Dialog.Loading loadingProps={{ color: theme.colors.brandGrey }} />
      </Dialog>
      {loading && <Loading color={themeState.themeColor.color} size={'small'} style={{ flex: 1 }} />}
      {!loading && (
        <KeyboardAwareScrollView
          enableAutomaticScroll={true}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          extraScrollHeight={-insets.bottom}
          contentContainerStyle={[styles.container, { maxWidth: themeState.themeOrientation.maxW }]}
        >
          <>
            <Text
              style={{
                fontSize: 18,
                fontFamily: theme.fonts.halyardSemBd,
                marginBottom: 15,
                color: themeState.themeColor.color,
              }}
            >
              Autores
            </Text>
            <AlertSearch
              zIndex={3}
              type={'author'}
              user={user}
              subscriptions={subscriptions}
              onSubSuccess={() => {
                loadSubscriptions(false);
              }}
              onUnsubSuccess={() => {
                loadSubscriptions(false);
              }}
            />
            {!subscriptions?.author?.length && (
              <Text
                style={{
                  marginVertical: 10,
                  color: themeState.themeColor.color,
                  fontFamily: theme.fonts.halyardRegular,
                  fontSize: 14,
                }}
              >
                Não está a seguir nenhum autor
              </Text>
            )}
            {subscriptions && subscriptions.author?.map((item, index: number) => renderItem(item, index, 'author'))}
          </>
          <>
            <Text
              style={{
                fontSize: 18,
                fontFamily: theme.fonts.halyardSemBd,
                marginBottom: 15,
                color: themeState.themeColor.color,
              }}
            >
              Programas
            </Text>
            <AlertSearch
              zIndex={2}
              type={'program'}
              user={user}
              subscriptions={subscriptions}
              onSubSuccess={() => {
                loadSubscriptions(false);
              }}
              onUnsubSuccess={() => {
                loadSubscriptions(false);
              }}
            />
            {!subscriptions?.program?.length && (
              <Text
                style={{
                  marginVertical: 10,
                  color: themeState.themeColor.color,
                  fontFamily: theme.fonts.halyardRegular,
                  fontSize: 14,
                }}
              >
                Não está a seguir nenhum programa
              </Text>
            )}
            {subscriptions && subscriptions.program?.map((item, index) => renderItem(item, index, 'program'))}
          </>
          <View
            style={{
              height: (subscriptions?.topic?.length ?? 0) <= 5 ? Dimensions.get('window').height / 2.4 : undefined,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontFamily: theme.fonts.halyardSemBd,
                marginBottom: 15,
                color: themeState.themeColor.color,
              }}
            >
              Tópicos
            </Text>
            <AlertSearch
              zIndex={1}
              type={'topic'}
              user={user}
              subscriptions={subscriptions}
              onSubSuccess={() => {
                loadSubscriptions(false);
              }}
              onUnsubSuccess={() => {
                loadSubscriptions(false);
              }}
            />
            {!subscriptions?.topic?.length && (
              <Text
                style={{
                  marginVertical: 10,
                  color: themeState.themeColor.color,
                  fontFamily: theme.fonts.halyardRegular,
                  fontSize: 14,
                }}
              >
                Não está a seguir nenhum tópico
              </Text>
            )}
            {subscriptions && subscriptions.topic?.map((item, index) => renderItem(item, index, 'topic'))}
          </View>
        </KeyboardAwareScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 15,
    width: '100%',
    marginRight: 'auto',
    marginLeft: 'auto',
  },
});

export default ManageAlerts;
