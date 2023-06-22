import React, { useState } from 'react';
import { TextInput, View, Text, Alert } from 'react-native';
import { apiBase, apiPodcasts, apiQuiosque } from '../api/endpoints';
import { theme } from '../constants/theme';
import { TouchableHighlight, TouchableOpacity } from 'react-native-gesture-handler';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { Taxonomy } from '../models/taxonomy';
import { renderIcon } from '../utils/renderIcon';
import { ProgramI, SubscriptionsI, TopicI } from '../screens/manageAlerts';
import { AuthorUser } from '../models/articleFields';
import Loading from './loading';
import { useAppSelector } from '../hooks';

interface AlertSearchProps {
  type: 'program' | 'topic' | 'author';
  user: any;
  subscriptions?: SubscriptionsI;
  onSubSuccess: any;
  onUnsubSuccess: any;
  zIndex: number;
}

export interface resultTopicI {
  associatedUrl: string;
  id: number;
  name: string;
}

interface Links {
  webUri: string;
}

export interface resultProgramI {
  id: number;
  title: string;
  description: string;
  episodesCount: number;
  slug: string;
  links: Links;
}

export interface resultAuthorI {
  id: number;
  name: string;
  uri: string;
  image: string;
  description: string;
  role: string;
  url: string;
}

type resultI = resultAuthorI[] | resultProgramI[] | resultTopicI[];

const AlertSearch = (props: AlertSearchProps) => {
  const { type, user, subscriptions, onSubSuccess, onUnsubSuccess, zIndex } = props;

  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<resultI | [] | null>();
  const [text, setText] = useState<any>();
  const [subLoading, setSubLoading] = useState<any[]>([]);
  const themeState = useAppSelector(state => state.theme);

  const onSearch = async (txt: string | null) => {
    if (txt == null || txt == '') {
      setText(null);
      return setResult(null);
    }
    try {
      setLoading(true);
      setText(txt);
      const resp = await apiBase.get(`/search/${type}/${txt}`);
      if (resp.data) {
        setResult(resp.data[`${type}`]);
      }
    } catch (e) {
      console.log('onSearch: ', e);
    } finally {
      setLoading(false);
    }
  };

  const onSub = async (item: resultAuthorI | resultProgramI | resultTopicI) => {
    try {
      if (subLoading.find(i => i === item.id)) {
        return;
      }
      if (!user) {
        return;
      }
      setSubLoading([...subLoading, item.id]);
      await apiQuiosque.get(`subscriptions/user/${user.id}/subscribe/${type}/${item.id}`, { headers: { Authorization: `Bearer ${user.access_token}` } });
      onSubSuccess();
    } catch (e) {
      // TODO send data to collectors
      console.log('onSub Exception: ', e);
    } finally {
      const t = [...subLoading];
      t.splice(
        t.findIndex(i => i === item.id),
        1,
      );
      setSubLoading(t);
    }
  };

  const onUnSub = async (item: resultAuthorI | resultProgramI | resultTopicI) => {
    try {
      if (subLoading.find(i => i === item.id)) {
        return;
      }
      if (!user) {
        return;
      }
      setSubLoading([...subLoading, item.id]);
      await apiQuiosque.delete(`subscriptions/user/${user.id}/subscribe/${type}/${item.id}`, { headers: { Authorization: `Bearer ${user.access_token}` } });
      onUnsubSuccess();
    } catch (e) {
      // TODO send data to collectors
      console.log('onUnSub: ', e);
    } finally {
      const t = [...subLoading];
      t.splice(
        t.findIndex(i => i === item.id),
        1,
      );
      setSubLoading(t);
    }
  };

  return (
    <View style={{ zIndex: zIndex, marginBottom: 10 }}>
      {result && (
        <View
          style={{
            position: 'absolute',
            top: 30,
            width: '100%',
            backgroundColor: themeState.themeColor.background,
            paddingTop: 10,
            paddingBottom: 10,
          }}
        >
          {result.length == 0 && (
            <Text
              style={{
                fontSize: 14,
                color: themeState.themeColor.color,
                fontFamily: theme.fonts.halyardRegular,
              }}
            >
              Nenhum autor encontrado
            </Text>
          )}
          {result.map(i => {
            const isFollow =
              subscriptions &&
              subscriptions[type]?.find((s: ProgramI | AuthorUser | TopicI) => {
                if ((s as AuthorUser).id) {
                  return (s as AuthorUser).id === i.id;
                } else {
                  return (s as ProgramI | TopicI).term_id === i.id;
                }
              }) !== undefined;
            return (
              <View
                key={i.id}
                style={{
                  flexDirection: 'row',
                  marginBottom: 6,
                  marginTop: 10,
                  alignItems: 'center',
                }}
              >
                <TouchableHighlight
                  onPress={async () => {
                    isFollow ? await onUnSub(i) : await onSub(i);
                    setText(null);
                    setResult(null);
                  }}
                >
                  <View
                    style={{
                      width: 70,
                      backgroundColor: isFollow ? theme.colors.brandBlue : theme.colors.white,
                      borderColor: isFollow ? theme.colors.brandBlue : theme.colors.brandBlack,
                      borderWidth: 0.6,
                      paddingVertical: 4,
                      alignItems: 'center',
                    }}
                  >
                    {subLoading?.find(s => s === i.id) ? (
                      <Loading color={isFollow ? theme.colors.white : theme.colors.brandBlack} size={'small'} />
                    ) : (
                      <Text
                        style={{
                          fontSize: 12,
                          fontFamily: theme.fonts.halyardRegular,
                          color: isFollow ? theme.colors.white : theme.colors.brandBlack,
                        }}
                      >
                        {isFollow ? 'A seguir' : 'Seguir'}
                      </Text>
                    )}
                  </View>
                </TouchableHighlight>
                <TouchableOpacity
                  onPress={async () => {
                    if (type === 'topic') {
                      // FIXME uma pequena martelada porque APIs com tipos diferentes
                      const t: Taxonomy = {
                        term_id: i.id,
                        permalink: '',
                        slug: '',
                        type: '',
                        name: (i as resultTopicI).name,
                      };
                      const data = { topic: t };
                      navigation.dispatch(CommonActions.navigate('TopicsDetails', data));
                    } else if (type === 'author') {
                      const data = {
                        author: {
                          payload: {
                            id: i.id,
                            name: (i as resultAuthorI).name,
                            image: (i as resultAuthorI).image,
                          },
                        },
                      };
                      navigation.dispatch(CommonActions.navigate('Author', data));
                    } else if (type === 'program') {
                      try {
                        const resp = await apiPodcasts.get(`programs/${(i as resultProgramI).slug}`);
                        navigation.dispatch(CommonActions.navigate('PodcastEpisode', resp.data.data));
                      } catch (e) {
                        Alert.alert('Erro', 'Not found item');
                        console.log('apiPodcasts.get: ', e);
                      }
                    }
                  }}
                  containerStyle={{ flex: 1, marginLeft: 10 }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      color: themeState.themeColor.color,
                      fontFamily: theme.fonts.halyardRegular,
                    }}
                    numberOfLines={1}
                    ellipsizeMode={'tail'}
                  >
                    {(i as resultAuthorI | resultTopicI).name ?? (i as resultProgramI).title}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      )}
      <View
        style={{
          marginBottom: 10,
          flexDirection: 'row',
          borderBottomColor: theme.colors.brandGrey,
          borderBottomWidth: 1,
          backgroundColor: themeState.themeColor.background,
          justifyContent: 'center',
        }}
      >
        {renderIcon('search', 18, true, themeState.themeColor.color, themeState.themeColor.color, undefined, { marginTop: 7 })}
        <TextInput
          value={text}
          style={{
            flex: 1,
            marginLeft: 4,
            paddingVertical: 6,
            fontSize: 14,
            color: themeState.themeColor.color,
            fontFamily: theme.fonts.halyardRegular,
          }}
          onChangeText={onSearch}
        />
        {loading && <Loading color={themeState.themeColor.color} size={'small'} />}
        {!loading && ((result && result.length > 0) || text) && (
          <TouchableOpacity
            onPress={() => {
              setText(null);
              return setResult(null);
            }}
          >
            {renderIcon('close', 18, true, themeState.themeColor.color, themeState.themeColor.color, undefined, { marginTop: 7 })}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default AlertSearch;
