import React, { useState, useEffect } from 'react';
import { Alert, FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View, RefreshControl } from 'react-native';
import { theme } from '../constants/theme';
import HeaderScreens from '../components/header/headerScreens';
import { apiBase, apiPodcasts, apiSininho } from '../api/endpoints';
import { imageURL } from '../utils/image';
import { getDate } from '../utils/date';
import { renderIcon } from '../utils/renderIcon';
import Icon from '../components/icon';
import { Dialog } from 'react-native-elements';
import { CommonActions, useNavigation } from '@react-navigation/native';
import AuthorImage from '../components/authorImage';
import { useAppSelector } from '../hooks';
import Loading from '../components/loading';
import { Analytics, Screens } from '../services/analytics';

interface AlertsEnvelope {
  unviewedNotifications: number;
  userId: string;
  data?: Alert[];
}

const Alerts = () => {
  const user = useAppSelector(state => state.auth.user);
  const [notifications, setNotifications] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [total, setTotal] = useState<number>(0);
  const [showDialogLoading, setShowDialogLoading] = useState(false);
  const navigation = useNavigation();
  const themeState = useAppSelector(state => state.theme);

  useEffect(() => {
    Analytics.trackPageView({ screen: Screens.ALERTS });
  }, []);

  useEffect(() => {
    markedViewed();
    getNotification();
    return navigation.addListener('focus', () => {
      setShowDialogLoading(false);
    });
  }, [user]);

  const markedViewed = async () => {
    try {
      if (!user) {
        return;
      }
      await apiSininho.put(
        `rest/notifications/user/${user.id}/viewed`,
        {},
        {
          headers: { Authorization: `Bearer ${user.access_token}` },
          params: {},
        },
      );
    } catch (e) {
      console.log('markedViewed: ', e);
    }
  };

  const getNotification = async (showLoading = true) => {
    try {
      if (!user) {
        return;
      }

      if (showLoading) {
        setLoading(true);
      }
      const resp = await apiSininho.get(`rest/notifications/user/${user.id}`, {
        headers: { Authorization: `Bearer ${user.access_token}` },
        params: { l: 10, o: total },
      });
      const env = resp.data as AlertsEnvelope;
      if (env?.data === undefined) {
        env.data = [];
      }
      setHasMore(env.data.length !== 0);
      setNotifications(notifications.concat(env.data));
      setTotal(total + env.data.length);
    } catch (e) {
      Alert.alert('Erro', 'Erro ao obter alertas, por favor tente mais tarde', [{ onPress: () => navigation.dispatch(CommonActions.goBack()) }], {
        cancelable: false,
        onDismiss: () => navigation.dispatch(CommonActions.goBack()),
      });
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const markAllRead = async () => {
    try {
      if (!user) {
        return;
      }
      setShowDialogLoading(true);
      await apiSininho.put(`rest/notifications/user/${user.id}/read`, {}, { headers: { Authorization: `Bearer ${user.access_token}` } });
      const temp = [...notifications];
      temp.forEach(i => {
        i.status = 'READ';
      });
      setNotifications(temp);
    } catch (e) {
      console.log('markAllRead: ', e);
    } finally {
      setShowDialogLoading(false);
    }
  };

  const markAsOneRead = async (id: number) => {
    try {
      if (!user) {
        return;
      }
      await apiSininho.put(
        `rest/notifications/user/${user.id}/read/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${user.access_token}` },
        },
      );
      const temp = [...notifications];
      temp.find(i => i.id === id).status = 'READ';
      setNotifications(temp);
    } catch (e) {
      console.log('markAsOneRead: ', e);
    }
  };

  const renderItemTitle = (what: string, boldInfo: string, title: string) => {
    switch (what) {
      case 'topic':
        return (
          <Text
            style={{
              fontSize: 14,
              fontFamily: theme.fonts.halyardRegular,
              color: themeState.themeColor.color,
            }}
          >
            Novo artigo sobre
            <Text
              style={{
                fontSize: 14,
                fontFamily: theme.fonts.halyardSemBd,
                color: themeState.themeColor.color,
              }}
            >
              {' ' + boldInfo}
            </Text>
            : {title}
          </Text>
        );
      case 'program':
        return (
          <Text>
            <Text
              style={{
                fontSize: 14,
                fontFamily: theme.fonts.halyardSemBd,
                color: themeState.themeColor.color,
              }}
            >
              {boldInfo + ' '}
            </Text>
            tem um novo vídeo:
            <Text
              style={{
                fontSize: 14,
                fontFamily: theme.fonts.halyardRegular,
                color: themeState.themeColor.color,
              }}
            >
              {' ' + title}
            </Text>
          </Text>
        );
      case 'post_comments':
        return (
          <Text>
            Tem{' '}
            <Text
              style={{
                fontSize: 14,
                fontFamily: theme.fonts.halyardSemBd,
                color: themeState.themeColor.color,
              }}
            >
              {boldInfo}
            </Text>
            {boldInfo > '1' ? (
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: theme.fonts.halyardSemBd,
                  color: themeState.themeColor.color,
                }}
              >
                {' '}
                comentários
              </Text>
            ) : (
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: theme.fonts.halyardSemBd,
                  color: themeState.themeColor.color,
                }}
              >
                {' '}
                comentários
              </Text>
            )}
            <Text> no artigo: {title}</Text>
          </Text>
        );
      default:
        return (
          <Text>
            <Text
              style={{
                fontSize: 14,
                fontFamily: theme.fonts.halyardSemBd,
                color: themeState.themeColor.color,
              }}
            >
              {boldInfo}
            </Text>{' '}
            publicou: {title}
          </Text>
        );
    }
  };

  const renderItem = ({ item, index }) => {
    return (
      <View key={index} style={[styles.renderItems, { maxWidth: themeState.themeOrientation.maxW }]}>
        <View
          style={{
            backgroundColor: item.status !== 'READ' ? themeState.themeColor.noReadAlert : themeState.themeColor.transparent,
          }}
        >
          <TouchableWithoutFeedback
            key={index}
            onPress={async () => {
              try {
                setShowDialogLoading(true);
                if (item.status == 'NEW') {
                  markAsOneRead(item.id);
                }
                const resp = await apiBase.get(`/items/post/${item.postId}`);
                const { type, program } = resp.data;
                if (type === 'obs_episode' && (program.programType.includes('podcast') || program.programType.includes('audio'))) {
                  const resp = await apiPodcasts.get(`episodes/${program.slug}/${item.postId}`);
                  if (resp?.data?.data) {
                    navigation.dispatch(CommonActions.navigate('Episode', resp?.data?.data));
                  }
                }
                navigation.dispatch(CommonActions.navigate('Article', resp.data));
              } catch (e) {
                console.log('apiBase.get: ', e);
              } finally {
                setShowDialogLoading(false);
              }
            }}
          >
            <View style={{ marginHorizontal: 15 }}>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingVertical: 12,
                }}
              >
                <View style={{ flex: 0, marginRight: 15 }}>
                  <View style={{ position: 'relative' }}>
                    <View
                      style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        zIndex: 1,
                        top: 0,
                        right: 0,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      {item.postType === 'episode' && (
                        <View
                          style={{
                            position: 'absolute',
                            zIndex: 999,
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: 25,
                            height: 25,
                            backgroundColor: 'rgba(255,255,255, 0.9)',
                            borderRadius: 100,
                          }}
                        >
                          <Icon
                            name={item.fotoGallery === 1 ? 'camera' : item.postType === 'episode' ? 'play' : 'undefined'}
                            size={14}
                            color={theme.colors.brandBlue}
                            fill={theme.colors.brandBlue}
                            disableFill={false}
                          />
                        </View>
                      )}
                    </View>
                    {item.postType === 'opinion' ? (
                      <View style={styles.border}>
                        <AuthorImage url={item.image} style={{ height: 40, width: 40, borderRadius: 40 }} />
                      </View>
                    ) : (
                      //TODO para o Paulo
                      <Image source={{ uri: imageURL(item.image, 400) }} style={{ height: 60, width: 60 }} />
                    )}
                  </View>
                </View>
                <View style={{ flex: 3, justifyContent: 'center' }}>
                  <Text
                    style={{
                      fontSize: 14,
                      color: themeState.themeColor.color,
                      fontFamily: theme.fonts.halyardRegular,
                    }}
                  >
                    {renderItemTitle(item.what, item.boldInfo, item.title)}
                  </Text>
                  <Text
                    style={{
                      color: theme.colors.brandBlue,
                      marginVertical: 4,
                      fontSize: 12,
                      fontFamily: theme.fonts.halyardRegular,
                    }}
                  >
                    {getDate(item.date)}
                  </Text>
                </View>
              </View>
              <View
                style={{
                  width: '100%',
                  borderBottomWidth: 1,
                  borderColor: theme.colors.brandGrey,
                  opacity: 0.2,
                }}
              ></View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeAreaView, { backgroundColor: themeState.themeColor.background }]}>
      <Dialog
        isVisible={showDialogLoading}
        overlayStyle={{
          width: 100,
          height: 100,
          padding: 0,
          justifyContent: 'center',
        }}
      >
        <Dialog.Loading loadingProps={{ color: theme.colors.brandGrey }} />
      </Dialog>
      <HeaderScreens isArticlePage={false} hasTitle={true} screenTitle={'Alertas'} />
      <View style={[styles.container, { maxWidth: themeState.themeOrientation.maxW }]}>
        <View style={{ marginRight: 20 }}>
          <TouchableOpacity onPress={() => markAllRead()} style={{ marginRight: 20 }}>
            <Text
              style={{
                fontSize: 14,
                fontFamily: theme.fonts.halyardRegular,
                color: theme.colors.brandBlue,
              }}
            >
              Marcar como lidos
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            onPress={() => {
              navigation.dispatch(CommonActions.navigate('ManageAlerts'));
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontFamily: theme.fonts.halyardRegular,
                color: theme.colors.brandBlue,
              }}
            >
              Gerir
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <View>
          {loading && (
            <View
              style={{
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Loading color={themeState.themeColor.color} size={'small'} />
            </View>
          )}
          <View style={{ flex: 1 }}>
            {loading && <Loading color={themeState.themeColor.color} size={'small'} style={{ flex: 1 }} />}
            {!loading && notifications?.length === 0 && !hasMore && (
              <View
                style={{
                  height: '100%',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    opacity: 0.3,
                  }}
                >
                  {renderIcon('alertas', 100, false, theme.colors.brandGrey)}
                </View>
                <View style={{ flexDirection: 'row', opacity: 0.7, marginTop: 8 }}>
                  <Text
                    style={{
                      color: themeState.themeColor.color,
                      fontSize: 14,
                      fontFamily: theme.fonts.halyardRegular,
                    }}
                  >
                    Alertas
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', opacity: 0.4, marginTop: 8 }}>
                  <Text
                    style={{
                      color: themeState.themeColor.color,
                      fontSize: 14,
                      fontFamily: theme.fonts.halyardRegular,
                    }}
                  >
                    Ainda não existem alertas
                  </Text>
                </View>
              </View>
            )}
          </View>
          {!loading && notifications?.length > 0 && (
            <FlatList
              data={notifications}
              showsVerticalScrollIndicator={true}
              removeClippedSubviews={true}
              refreshControl={<RefreshControl refreshing={loading} onRefresh={getNotification} tintColor={themeState.themeColor.color} />}
              onEndReached={async () => {
                if (loadingMore || !hasMore) {
                  return;
                }
                setLoadingMore(true);
                await getNotification(false);
                setLoadingMore(false);
              }}
              renderItem={renderItem}
              ListFooterComponent={() => {
                return loadingMore ? (
                  <View
                    style={{
                      flex: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginVertical: 10,
                    }}
                  >
                    <Loading color={themeState.themeColor.color} size={'small'} />
                  </View>
                ) : null;
              }}
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
    flexDirection: 'row',
    marginBottom: 20,
    paddingHorizontal: 15,
    width: '100%',
    marginRight: 'auto',
    marginLeft: 'auto',
  },
  renderItems: {
    width: '100%',
    marginRight: 'auto',
    marginLeft: 'auto',
  },
  border: {
    borderRadius: 100,
    overflow: 'hidden',
    borderWidth: 10,
    borderColor: theme.colors.brandGrey,
  },
});

export default Alerts;
