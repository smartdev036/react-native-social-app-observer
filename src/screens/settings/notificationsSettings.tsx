import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { theme } from '../../constants/theme';
import HeaderScreens from '../../components/header/headerScreens';
import { apiBase, apiQuiosque, apiQuiosqueRegister } from '../../api/endpoints';
import { Dialog, Switch } from 'react-native-elements';
import DeviceInfo from 'react-native-device-info';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OS } from '../../constants';
import { Taxonomy } from '../../models/taxonomy';
import { AuthorUser } from '../../models/articleFields';
import { strings } from '../../constants/strings';
import { useAppSelector } from '../../hooks';
import { deviceInfoProps } from '../home';
import { LOG } from '../../utils/logger';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { UserToken } from '../../services/auth';
import Icon from '../../components/icon';

interface Subscriptions {
  author: Subscription[];
  program: Subscription[];
  topic: Subscription[];
}

interface Subscription {
  channel_id: number;
  context_id: number;
  context_instance_id: number;
  context_name: string;
  id: number;
  periodicity: number;
  user_id: string;
  active: boolean;
  info: Taxonomy | AuthorUser;
}

const CustomNotificationsComponent = (
  user: UserToken | null,
  subs: Subscriptions | null,
  toggleNotification: { (item: Subscription): Promise<any> },
): JSX.Element | JSX.Element[] => {
  const navigation = useNavigation();
  const themeState = useAppSelector(state => state.theme);

  let hasSubscriptions = false;
  if (subs) {
    Object.keys(subs).map(key => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if ((subs[key] as Subscription[]).length > 0) {
        hasSubscriptions = true;
      }
    });
  }

  if (!user || !hasSubscriptions) {
    return (
      <View style={[styles.alertsEmptyWrapper]}>
        <View style={[styles.alertsEmptyIconWrapper]}>
          <Icon name={!user ? 'user' : 'alertas'} size={45} fill={themeState.themeColor.colorInfo} color={themeState.themeColor.colorInfo} disableFill />
        </View>
        <Text style={[styles.alertsEmptyTitle, { color: themeState.themeColor.colorInfo }]}>{!user ? 'Sem sessão inciada' : 'Sem alertas'}</Text>

        {!user ? (
          <>
            <Text style={[styles.alertsEmptyText, { color: themeState.themeColor.colorInfo }]}>Não tem sessão iniciada. Para definir alertas deve.</Text>
            <TouchableOpacity
              onPress={() => {
                navigation.dispatch(CommonActions.navigate('Login'));
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: theme.colors.brandBlue,
                }}
              >
                Iniciar sessão
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={[styles.alertsEmptyText, { color: themeState.themeColor.colorInfo }]}>Ainda não tem alertas definidos.</Text>
            <TouchableOpacity
              onPress={() => {
                navigation.dispatch(CommonActions.navigate('ManageAlerts'));
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: theme.colors.brandBlue,
                }}
              >
                Adicionar alertas
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  } else {
    /**
     * Mesmo que no commit apareça que foi o Pinheiro a fazer este codigo, ele nao teve tempo de olhar para ele.. :P
     */
    const data: JSX.Element[] = [];

    Object.keys(subs).map(x => {
      data.push(
        <View key={x} style={styles.authorContainer}>
          <Text
            style={[
              styles.titleType,
              {
                color: themeState.themeColor.colorInfo,
              },
            ]}
          >
            {strings.notifications.subsTitle[x]}
          </Text>
        </View>,
      );

      if (subs[x].length > 0) {
        subs[x].forEach((item: Subscription) => {
          data.push(
            <View key={item.id} style={styles.subscriptionsItems}>
              <Text
                style={[
                  styles.displayName,
                  {
                    color: themeState.themeColor.color,
                  },
                ]}
              >
                {item.info.displayName ? item.info.displayName : item.info.name}
              </Text>
              <Switch
                thumbColor={theme.colors.white}
                value={item.active}
                onValueChange={() => {
                  toggleNotification(item);
                }}
                color={theme.colors.brandBlue}
                style={styles.switchStyle}
              />
            </View>,
          );
        });
      } else {
        data.push(
          <Text
            style={[
              styles.info,
              {
                color: themeState.themeColor.color,
              },
            ]}
          >
            {strings.notifications.noSub}
          </Text>,
        );
      }
    });
    return data;
  }
};

const NotificationsSettings = () => {
  const user = useAppSelector(state => state.auth.user);
  const [subscriptions, setSubscriptions] = useState<any>();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState<boolean>(true);
  const [showDialogLoading, setShowDialogLoading] = useState(false);
  const [channels, setChannels] = useState<any>();
  const pushChannel = 3; //FIXME - Devia vir do Backend
  const themeState = useAppSelector(state => state.theme);
  const navigation = useNavigation();
  useEffect(() => {
    loadPush().then();
    loadSubscriptions(user, true).then();
    return () => {
      setShowDialogLoading(false);
    };
  }, []);

  const loadPush = async () => {
    try {
      const savedChannelsSTR = await AsyncStorage.getItem('channels');
      if (savedChannelsSTR !== null) {
        const savedChannels = JSON.parse(savedChannelsSTR);
        setChannels(savedChannels);
      } else {
        //TODO Get from API
      }
    } catch (e) {
      LOG.error('loadPush: ', e);
    }
  };

  const loadSubscriptions = async (showLoading = true) => {
    try {
      if (!user) {
        return;
      }
      if (showLoading) {
        setLoading(true);
      }
      const resp = await apiQuiosque.get(`subscriptions/user/${user.id}`, {
        headers: { Authorization: `Bearer ${user.access_token}` },
      });
      if (resp.data) {
        const t: Subscriptions = { author: [], program: [], topic: [] };
        const b: { author: number[]; program: number[]; topic: number[] } = {
          author: [],
          program: [],
          topic: [],
        };

        const pushSubs = resp.data.filter((x: { channel_id: number }) => {
          return x.channel_id == pushChannel;
        });
        const otherSubs = resp.data.filter((x: { channel_id: number }) => {
          return x.channel_id != pushChannel;
        });
        pushSubs.forEach((i: { context_name: string | number }) => {
          t[i.context_name].push(i);
        });
        otherSubs.forEach((i: { context_name: string | number; context_instance_id: any }) => {
          if (
            !t[i.context_name].find((e: { context_instance_id: any; context_name: any }) => {
              return e.context_instance_id == i.context_instance_id && e.context_name == i.context_name;
            })
          ) {
            t[i.context_name].push(i);
          }
        });

        b.author = t.author.map(x => {
          return x.context_instance_id;
        });

        b.program = t.program.map(x => {
          return x.context_instance_id;
        });

        b.topic = t.topic.map(x => {
          return x.context_instance_id;
        });

        const bulk = await apiBase.post('/search/bulk', b);
        t.author.forEach(e => {
          e.active = e.channel_id == pushChannel;
          bulk.data.author.forEach((x: AuthorUser) => {
            if (e.context_instance_id === x.id) {
              e.info = x;
            }
          });
        });
        t.program.forEach(e => {
          e.active = e.channel_id == pushChannel;
          bulk.data.program.forEach((x: Taxonomy) => {
            if (e.context_instance_id == x.term_id) {
              e.info = x;
            }
          });
        });
        t.topic.forEach(e => {
          e.active = e.channel_id == pushChannel;
          bulk.data.topic.forEach((x: Taxonomy) => {
            if (e.context_instance_id == x.term_id) {
              e.info = x;
            }
          });
        });
        setSubscriptions(t);
      }
    } catch (e) {
      LOG.error('loadSubscriptions: ', e);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const removePush = async (item: { id: any }, showLoading = true) => {
    try {
      if (!user) {
        return;
      }
      if (showLoading) {
        setLoading(true);
      }
      await apiQuiosque.delete(`subscriptions/${item.id}`, {
        headers: { Authorization: `Bearer ${user.access_token}` },
      });
    } catch (e) {
      LOG.error('removePush: ', e);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const addPush = async (
    item: {
      user_id: any;
      channel_id: number;
      context_name: any;
      context_instance_id: any;
      periodicity: number;
    }[],
    showLoading = true,
  ) => {
    try {
      if (!user) {
        return;
      }
      if (showLoading) {
        setLoading(true);
      }
      await apiQuiosque.post('subscriptions', item, {
        headers: { Authorization: `Bearer ${user.access_token}` },
      });
    } catch (e) {
      LOG.error('addPush: ', e);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const toggleNotification = async (value: any) => {
    setShowDialogLoading(true);
    if (value.active) {
      await removePush(value, false);
    } else {
      const temp = {
        user_id: value.user_id,
        channel_id: pushChannel,
        context_name: value.context_name,
        context_instance_id: value.context_instance_id,
        periodicity: 1,
      };
      await addPush([temp]);
    }
    await loadSubscriptions(false);
    setShowDialogLoading(false);
  };

  const savePushInfo = async (v: boolean, item: any) => {
    channels.forEach((e: any) => {
      if (e.name === item.name) {
        e.active = v;
      }
    });

    const token = await messaging().getToken();
    //TODO O Pinheiro disse que isto é para remover e unificar
    const uniqueId = DeviceInfo.getUniqueIdSync();
    const version = DeviceInfo.getVersion();
    const deviceID = DeviceInfo.getDeviceId();
    const deviceInfo: deviceInfoProps = {
      token: token,
      uuid: uniqueId,
      type: Platform.OS,
      app_version: version,
      device_model: deviceID,
      device_os: '' + Platform.Version,
      test_device: '',
      provider: 1,
    };

    // subscribed channels
    const toSub = channels
      .filter((x: any) => {
        return x.active;
      })
      .map((x: any) => {
        return x.name;
      });
    deviceInfo.push_types = toSub;

    const id = !user ? 'dummy' : user.id;

    const firstRegis = await apiQuiosqueRegister.post('', deviceInfo, {
      headers: {
        'Content-Type': 'application/json',
        'X-Adamastor-User-Id': id,
      },
    });

    if (firstRegis.data != null) {
      const c: any = [];
      for (const item of firstRegis.data) {
        c.push(item);
      }
      await AsyncStorage.setItem('channels', JSON.stringify(c));
      setChannels(c);
    }
  };

  return (
    <SafeAreaView style={[styles.safeAreaView, { backgroundColor: themeState.themeColor.background }]}>
      <HeaderScreens isArticlePage={false} hasTitle={true} screenTitle={strings.notifications.screenTitle} />
      <Dialog isVisible={showDialogLoading} overlayStyle={styles.dialogOverlay}>
        <Dialog.Loading loadingProps={{ color: themeState.themeColor.color }} />
      </Dialog>
      <View
        style={[
          styles.container,
          {
            backgroundColor: themeState.themeColor.background,
            maxWidth: themeState.themeOrientation.maxW,
          },
        ]}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View>
            <Text
              style={[
                styles.titles,
                {
                  color: themeState.themeColor.color,
                },
              ]}
            >
              {strings.notifications.notificationsPush}
            </Text>
            <Text style={{ fontSize: 12, color: themeState.themeColor.colorInfo }}>{strings.notifications.notificationsPushDesc}</Text>
            <View style={styles.notificationContainer}>
              {channels?.map((item: any, index: number) => {
                return (
                  <View key={index} style={styles.notificationContainerItem}>
                    <Text style={[styles.notificationContainerItemText, { color: themeState.themeColor.color }]}>{item.human_name}</Text>
                    <Switch
                      thumbColor={theme.colors.white}
                      value={item.active}
                      onValueChange={async v => {
                        savePushInfo(v, item).then();
                      }}
                      color={theme.colors.brandBlue}
                      style={styles.switchStyle}
                    />
                  </View>
                );
              })}
            </View>
            <View style={styles.autoContainer}>
              <Text style={[styles.titles, { color: themeState.themeColor.color }]}>{strings.notifications.automatic}</Text>
              <Text style={{ fontSize: 12, color: themeState.themeColor.colorInfo, fontFamily: theme.fonts.halyardRegular }}>
                {strings.notifications.automaticDesc}
              </Text>
              {user && (
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => {
                    navigation.dispatch(CommonActions.navigate('ManageAlerts'));
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      color: theme.colors.brandBlue,
                      marginTop: 4,
                    }}
                  >
                    Gerir alertas
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            {CustomNotificationsComponent(user, subscriptions, item => {
              toggleNotification(item);
            })}
            <View></View>
          </View>
        </ScrollView>
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
    paddingHorizontal: 15,
    width: '100%',
    marginRight: 'auto',
    marginLeft: 'auto',
  },
  dialogOverlay: {
    width: 100,
    height: 100,
    padding: 0,
    justifyContent: 'center',
  },
  titles: {
    fontSize: 18,
    fontFamily: theme.fonts.halyardSemBd,
  },
  notificationContainer: {
    paddingTop: 10,
    paddingBottom: 20,
  },
  notificationContainerItem: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  notificationContainerItemText: {
    fontSize: 14,
    fontFamily: theme.fonts.halyardRegular,
  },
  autoContainer: {
    marginBottom: 20,
  },
  titleType: {
    fontSize: 14,
    fontFamily: theme.fonts.halyardRegular,
    textTransform: 'uppercase',
  },
  info: {
    fontSize: 14,
    fontFamily: theme.fonts.halyardRegular,
    paddingVertical: 4,
  },
  switchStyle: {
    transform: Platform.OS !== OS.android ? [{ scaleX: 0.7 }, { scaleY: 0.7 }] : [{ scaleX: 1 }, { scaleY: 1 }],
  },
  displayName: {
    fontSize: 14,
    fontFamily: theme.fonts.halyardRegular,
  },
  typeContainer: {
    marginBottom: 10,
    marginTop: 20,
  },
  authorContainer: {
    marginBottom: 0,
    marginTop: 20,
  },
  subscriptionsItems: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },

  alertsEmptyWrapper: {
    flex: 1,
    alignItems: 'center',
    marginTop: 30,
  },
  alertsEmptyIconWrapper: {
    marginBottom: 9,
  },
  alertsEmptyTitle: {
    marginBottom: 15,
    fontWeight: 'bold',
    fontSize: 20,
    fontFamily: theme.fonts.halyardRegular,
  },
  alertsEmptyText: {
    fontSize: 12,
    fontFamily: theme.fonts.halyardRegular,
    textAlign: 'center',
  },
});

export default NotificationsSettings;
