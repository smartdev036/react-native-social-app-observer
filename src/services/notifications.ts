import notifee, { Event, EventType, Notification } from '@notifee/react-native';
import { apiBase, apiQuiosque } from '../api/endpoints';
import * as RootNavigation from '../rootNavigation';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { Post } from '../models/articles';
import { navigationRefPromise } from '../rootNavigation';
import { Platform } from 'react-native';
import { PostType } from '../models/articleFields';
import { OS } from '../constants';
import { LOG } from '../utils/logger';

type CustomPushData = {
  post_id: number;
  post_type: PostType;
  post_url: string;
  push_id: string;
};

export const channels = {
  name: 'default',
  displayName: 'Notificações',
};

export class Notifications {
  public static async initHandlers() {
    await messaging().setDeliveryMetricsExportToBigQuery(true);
    // show notification app closes
    messaging().setBackgroundMessageHandler(
      async () => undefined,
      //Notifications.receivedNotificationHandlder
    );

    if (Platform.OS === OS.ios) {
      messaging().onMessage(Notifications.displayNotificationiOS);
      notifee.onForegroundEvent(Notifications.notifeeEvent);
    }
  }

  static async notifeeEvent(event: Event) {
    if (event.type === EventType.PRESS) {
      if (event.detail.notification?.data) {
        const cpd = event.detail.notification.data as CustomPushData;
        if (cpd.post_id) {
          Notifications.openFromNotification(cpd.post_id, cpd.push_id);
        } else {
          const c = Notifications.ExtractCustomData(event.detail.notification.data);
          if (c) {
            Notifications.openFromNotification(c.post_id, c.push_id);
          }
        }
      }
    }
  }

  static ExtractCustomData(data?: { [key: string]: string } | { [key: string]: string | number | object }): CustomPushData | undefined {
    if (data !== undefined && typeof data['pt.observador.post.v4'] === 'string') {
      const extratData = JSON.parse(data['pt.observador.post.v4']);
      return {
        post_id: extratData.post_id,
        post_type: extratData.post_type,
        post_url: extratData.post_url,
        push_id: typeof data['pt.observador.analytics_label'] === 'string' ? data['pt.observador.analytics_label'] : '',
      };
    }
  }

  static async displayNotificationiOS(remoteMessage: FirebaseMessagingTypes.RemoteMessage): Promise<string | void> {
    const customData = Notifications.ExtractCustomData(remoteMessage.data);
    if (!customData) {
      LOG.warn('CUSTOM DATA undefined');
      return;
    }

    // Display a notification
    const notification: Notification = {
      title: 'Observador',
      body: remoteMessage?.notification?.body,
      data: customData,
      ios: {},
    };

    const image = (remoteMessage?.data?.fcm_options as { image?: string })?.image;
    if (image && notification.ios) {
      notification.ios.attachments = [{ url: image }];
    }

    return await notifee.displayNotification(notification);
  }

  static openFromNotification(post_id: number, notification_id: string) {
    // TODO ERROR in quiosque invalid ID
    apiQuiosque.get(`notification/${notification_id}/open?provider=1`).catch(e => {
      LOG.error('Error: SEND OPEN TO SININHO - ', e);
    });

    if (post_id == 4279865) {
      navigationRefPromise.then(() => {
        RootNavigation.navigate('Radio', {});
      });
    } else {
      apiBase
        .get(`/items/post/${post_id}`)
        .then(response => {
          navigationRefPromise.then(() => {
            RootNavigation.navigate('Article', response.data as Post);
          });
        })
        .catch(err => {
          LOG.error('Error Getting Article Notification', err);
        });
    }
  }
}
