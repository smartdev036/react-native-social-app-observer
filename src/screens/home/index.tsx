import React, { useEffect, useState } from 'react';
import { Dimensions, Linking, Platform, StatusBar, StyleSheet, Text, View, NativeModules, BackHandler } from 'react-native';
import CustomHeader from '../../components/header/header';
import { TabBar, TabView } from 'react-native-tab-view';
import Featured from './featured';
import Latest from './latest';
import Popular from './popular';
import { theme } from '../../constants/theme';
import messaging from '@react-native-firebase/messaging';
import { apiBase, apiQuiosqueRegister } from '../../api/endpoints';
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';
import mobileAds from 'react-native-google-mobile-ads';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { OS } from '../../constants';
import SharedGroupPreferences from 'react-native-shared-group-preferences';
import { getDate } from '../../utils/date';
import BackgroundFetch from 'react-native-background-fetch';
import { store } from '../../store';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { initThemeMode } from '../../reducers/theme';
import { channels, Notifications } from '../../services/notifications';
import axios from 'axios';
import { useAndroidBackHandler } from 'react-navigation-backhandler';
import { Analytics, Screens } from '../../services/analytics';
import { LOG, LogToAll } from '../../utils/logger';

const { SharedStorage, ChartbeatModule } = NativeModules;
const group = 'group.obsWidget';

// Google Ads
mobileAds().setRequestConfiguration({ testDeviceIdentifiers: ['48F973F3CCA3018C1EA968780590B99E', 'EMULATOR'] });
mobileAds().initialize();

interface RenderSceneProps {
  route: any;
}

export interface deviceInfoProps {
  token: string | undefined;
  uuid: string;
  type: string;
  app_version: string;
  device_model: string;
  device_os: string;
  test_device: string;
  provider: 1;
}

const Home = () => {
  const navigation = useNavigation();
  const themeState = useAppSelector(state => state.theme);
  const initialLayout = { height: 0, width: Dimensions.get('window').width };
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'featured', title: 'Destaques' },
    { key: 'latest', title: 'Últimas' },
    { key: 'popular', title: 'Populares' },
  ]);
  const dispatch = useAppDispatch();

  useAndroidBackHandler(() => {
    BackHandler.exitApp();
    return true;
  });

  useEffect(() => {
    messaging()
      .getInitialNotification()
      .then(m => {
        if (m && m.data) {
          const postId = JSON.parse(m.data['pt.observador.post.v4']).post_id;
          Notifications.openFromNotification(postId, m.messageId || '');
        }
      });

    messaging().onNotificationOpenedApp(m => {
      if (m && m.data) {
        const postId = JSON.parse(m.data['pt.observador.post.v4']).post_id;
        Notifications.openFromNotification(postId, m.messageId || '');
      }
    });
  }, []);

  const loadDataWidget = async (
    title: string,
    pubdate: string,
    url: string,
    title1: string,
    pubdate1: string,
    url1: string,
    title2: string,
    pubdate2: string,
    url2: string,
    title3: string,
    pubdate3: string,
    url3: string,
  ) => {
    if (Platform.OS === OS.android) {
      SharedStorage.set(
        JSON.stringify({ text: url }),
        JSON.stringify({ text: title }),
        JSON.stringify({ text: pubdate }),
        JSON.stringify({ text: url1 }),
        JSON.stringify({ text: title1 }),
        JSON.stringify({ text: pubdate1 }),
        JSON.stringify({ text: url2 }),
        JSON.stringify({ text: title2 }),
        JSON.stringify({ text: pubdate2 }),
        JSON.stringify({ text: url3 }),
        JSON.stringify({ text: title3 }),
        JSON.stringify({ text: pubdate3 }),
      );
    } else {
      try {
        await SharedGroupPreferences.setItem(
          'widgetKey',
          {
            title: title,
            pubdate: pubdate,
            url: url,
            title1: title1,
            pubdate1: pubdate1,
            url1: url1,
            title2: title2,
            pubdate2: pubdate2,
            url2: url2,
            title3: title3,
            pubdate3: pubdate3,
            url4: url3,
          },
          group,
        );
      } catch (error) {
        console.log({ error });
      }
    }
  };

  useEffect(() => {
    dispatch(initThemeMode());
  }, []);

  useEffect(() => {
    const loadFunc = async () => {
      try {
        Linking.getInitialURL().then(url => {
          if (!url) {
            return;
          }
          axios
            .create({
              baseURL: 'https://observador.pt/wp-json/obs/v5/',
              headers: { 'Content-Type': 'application/json' },
            })
            .get(`/items/url/${url}`)
            .then(r => {
              navigation.dispatch(CommonActions.navigate({ name: 'Article', params: r.data }));
            });
        });
        return Linking.addEventListener('url', url => {
          if (!url) {
            return;
          }
          axios
            .create({
              baseURL: 'https://observador.pt/wp-json/obs/v5/',
              headers: { 'Content-Type': 'application/json' },
            })(`/items/url/${url.url}`)
            .then(r => {
              navigation.dispatch(CommonActions.navigate({ name: 'Article', params: r.data }));
            });
        });
      } catch (e) {
        console.log('Error getInitialURL', e);
      }
    };
    loadFunc();
  }, []);

  useEffect(() => {
    ChartbeatModule.setup();
  }, []);

  useEffect(() => {
    try {
      initBackgroundFetch();
      getLatestData();
    } catch (e) {
      console.log('initBackgroundFetch && getLatestData Failed ', e);
    }
  }, []);

  const getLatestData = async () => {
    await apiBase
      .get(`/lists/latest?page=${1}`)
      .then(async response => {
        const data = response.data[0];
        const data1 = response.data[1];
        const data2 = response.data[2];
        const data3 = response.data[4];
        await loadDataWidget(
          data.title,
          getDate(data.pubDate),
          data.links.webUri.toString().substring(22),
          data1.title,
          getDate(data1.pubDate),
          data1.links.webUri.toString().substring(22),
          data2.title,
          getDate(data2.pubDate),
          data2.links.webUri.toString().substring(22),
          data3.title,
          getDate(data3.pubDate),
          data3.links.webUri.toString().substring(22),
        );
      })
      .catch((err: any) => {
        LOG.error('Error Get Latest Data (Widget)', err);
      });
  };

  const initBackgroundFetch = async () => {
    await scheduleTaskWidget();
    await BackgroundFetch.configure(
      {
        minimumFetchInterval: 15, // <-- minutes (15 is minimum allowed)
        stopOnTerminate: false,
        enableHeadless: true,
        startOnBoot: true,
        // Android options
        forceAlarmManager: false, // <-- Set true to bypass JobScheduler.
        requiredNetworkType: BackgroundFetch.NETWORK_TYPE_NONE, // DefaultType
        requiresCharging: false, // DefaultType
        requiresDeviceIdle: false, // DefaultType
        requiresBatteryNotLow: false, // DefaultType
        requiresStorageNotLow: false, //
      },
      async (taskId: any) => {
        await getLatestData();
        await scheduleTaskWidget();
        //BackgroundFetch.finish(taskId);
      },
      async (taskId: any) => {
        await getLatestData();
        await scheduleTaskWidget();
        BackgroundFetch.finish(taskId);
      },
    );
  };

  const scheduleTaskWidget = async () => {
    await BackgroundFetch.scheduleTask({
      taskId: 'update.widget',
      delay: 60000,
      forceAlarmManager: true,
    });
  };

  useEffect(() => {
    postDeviceInfoToServer();
  }, []);

  const renderScene = (props: RenderSceneProps) => {
    const { route } = props;
    switch (route.key) {
      case 'featured':
        return <Featured />;
      case 'latest':
        return <Latest />;
      case 'popular':
        return <Popular />;
      default:
        return null;
    }
  };

  const renderTabBar = (props: any) => (
    <TabBar
      pressColor={themeState.themeColor.transparent}
      {...props}
      indicatorStyle={{ backgroundColor: themeState.themeColor.transparent }}
      style={[styles.tabBarStyle, { backgroundColor: themeState.themeColor.background }]}
      renderLabel={({ route, focused }) => (
        <Text
          accessibilityLabel={route.title}
          style={[
            styles.title,
            {
              color: focused ? themeState.themeColor.color : theme.colors.brandGrey,
            },
          ]}
        >
          {route.title}
        </Text>
      )}
    />
  );

  const postDeviceInfoToServer = async () => {
    const user = store.getState().auth.user;
    try {
      const token = await messaging().getToken();
      LOG.info('token', token);
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

      const savedChannelsSTR = await AsyncStorage.getItem('channels');

      if (savedChannelsSTR !== null) {
        const savedChannels = JSON.parse(savedChannelsSTR);
        // subscribed channels
        const toSub = savedChannels
          //FIXME Typescript
          .filter((x: any) => {
            return x.active;
          })
          .map((x: any) => {
            return x.name;
          });
        //FIXME Typescript
        deviceInfo.push_types = toSub;
      }

      let id = 'dummy';
      try {
        id = !user ? 'dummy' : user.id;
      } catch (err1) {
        LogToAll({
          type: 'send_push_subs ',
          message: err1,
        });
      }

      const firstRegis = await apiQuiosqueRegister.post('', deviceInfo, {
        headers: {
          'Content-Type': 'application/json',
          'X-Adamastor-User-Id': id,
        },
      });

      if (firstRegis.data != null) {
        const channels: any = [];
        for (const item of firstRegis.data) {
          channels.push(item);
        }
        await AsyncStorage.setItem('channels', JSON.stringify(channels));
      }
    } catch (e) {
      const isEmulator = await DeviceInfo.isEmulator();
      if (isEmulator && Platform.OS === OS.ios) {
        return;
      }
    }
  };

  const color = themeState.themeColor.barStyle;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: themeState.themeColor.background,
          paddingLeft: themeState.themeOrientation.padding,
          paddingRight: themeState.themeOrientation.padding,
          paddingTop: themeState.themeOrientation.padding,
          maxWidth: themeState.themeOrientation.maxWHome,
          alignSelf: 'center',
          width: '100%',
        },
      ]}
    >
      <StatusBar backgroundColor={themeState.themeColor.colorStatusbar} barStyle={color} />
      <CustomHeader menuColor={theme.colors.brandBlack} isHome={true} />
      <TabView
        lazy={true}
        navigationState={{ index, routes }}
        renderScene={renderScene}
        renderTabBar={renderTabBar}
        onIndexChange={i => {
          switch (i) {
            case 0:
              Analytics.trackPageView({ screen: Screens.FEATURED });
              break;
            case 1:
              Analytics.trackPageView({ screen: Screens.LATEST });
              break;
            case 2:
              Analytics.trackPageView({ screen: Screens.POPULAR });
              break;
          }
          setIndex(i);
        }}
        initialLayout={initialLayout}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBarStyle: {
    backgroundColor: theme.colors.white,
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.brandBlack,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  title: {
    textAlign: 'center',
    fontSize: 13,
    textTransform: 'uppercase',
    fontFamily: theme.fonts.halyardSemBd,
  },
});

export default Home;
