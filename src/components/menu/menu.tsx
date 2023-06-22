import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { theme } from '../../constants/theme';
import Icon from '../icon';
import { apiBase, apiSininho } from '../../api/endpoints';
import { useDrawerStatus } from '@react-navigation/drawer';
import { logout } from '../../reducers/auth';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { Taxonomy } from '../../models/taxonomy';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { OS } from '../../constants';
import Item from './item';
import RenderUser from './renderUser';
import Sections from './sections';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { subscribeUser } from '../../utils/piano';
import { store } from '../../store';
import { checkIfUserIsPremiumAndDispatchIfHasPianoAccess } from '../../services/auth';
import { Purchase } from 'react-native-iap';
import { Analytics } from '../../services/analytics';
import { netAudienceEvents } from '../../constants/strings';
import Games from './games';

const DrawerContentMenu = () => {
  const [sections, setSections] = useState<Taxonomy[]>([]);
  const [showMoreSection, setShowMoreSection] = useState(false);
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
  const [unreadAlert, setUnreadAlert] = useState<any>();
  const isDrawerOpen = useDrawerStatus();
  const ref = useRef<any>();
  const navigation = useNavigation();
  const { user, purchase, themeState } = useAppSelector(state => {
    return {
      user: state.auth ? state.auth.user : null,
      purchase: state.piano.purchase,
      themeState: state.theme,
    };
  });
  const dispatch = useAppDispatch();

  useEffect(() => {
    apiBase
      .get('/lists/menu/topics')
      .then(r => setSections(r.data))
      .catch(e => console.log('apiBase error', e));
  }, []);

  useEffect(() => {
    getUnreadNotification();
    return navigation.addListener('focus', () => {
      getUnreadNotification();
    });
  }, [user]);

  useEffect(() => {
    setShowMoreSection(false);
    ref.current.scrollTo({ x: 0 });
  }, [isDrawerOpen]);

  const getUnreadNotification = () => {
    if (!user) {
      setUnreadAlert(0);
      return;
    }
    apiSininho
      .get(`rest/notifications/user/${user.id}/viewed`, {
        headers: { Authorization: `Bearer ${user.access_token}` },
      })
      .then(r => {
        setUnreadAlert(r.data.unviewedNotifications);
      })
      .catch(e => console.log('apiSininho error menu:', e));
  };

  const handlerCloseMenu = async () => {
    await AsyncStorage.removeItem('index');
    const routeName = await AsyncStorage.getItem('routeName');
    if (routeName == null) {
      navigation.dispatch(CommonActions.navigate('Inicio'));
    } else {
      navigation.dispatch(CommonActions.navigate(routeName));
    }
    setShowMoreSection(false);
    setIsSubMenuOpen(false);
    ref.current.scrollTo({ x: 0 });
  };

  const userItems = [
    {
      id: 1,
      title: 'Exclusivos',
      iconName: 'exclusivos',
      iconColor: theme.colors.premium,
      onPress: () => navigation.dispatch(CommonActions.navigate('Premium')),
      show: true,
    },
    {
      id: 2,
      title: 'Alertas',
      iconName: 'alertas',
      onPress: () => {
        if (user) {
          navigation.dispatch(CommonActions.navigate('Alerts'));
        } else {
          navigation.dispatch(CommonActions.navigate('Login'));
        }
      },
      value: unreadAlert,
      show: true,
    },
    {
      id: 3,
      title: 'Guardados',
      iconName: 'guardados-1',
      onPress: () => {
        if (user) {
          navigation.dispatch(CommonActions.navigate('Saved'));
        } else {
          navigation.dispatch(CommonActions.navigate('Login'));
        }
      },
      show: true,
    },

    {
      id: 4,
      title: 'Histórico',
      iconName: 'historico',
      onPress: () => {
        if (user) {
          navigation.dispatch(CommonActions.navigate('History'));
        } else {
          navigation.dispatch(CommonActions.navigate('Login'));
        }
      },
      show: true,
    },
  ];

  const items = [
    {
      id: 1,
      title: 'Tópicos',
      iconName: 'topicos',
      onPress: () => {
        Analytics.gemiusTrackEvent(netAudienceEvents.others);
        navigation.dispatch(CommonActions.navigate('Topics'));
      },
      show: true,
    },
    {
      id: 2,
      title: 'Autores',
      iconName: 'autores',
      onPress: () => navigation.dispatch(CommonActions.navigate('Authors')),
      show: true,
    },
    {
      id: 3,
      title: 'Colunistas',
      iconName: 'colonistas',
      onPress: () => navigation.dispatch(CommonActions.navigate('Columnists')),
      show: true,
    },
    {
      id: 4,
      title: 'Definições',
      iconName: 'settings',
      onPress: () => navigation.dispatch(CommonActions.navigate('Settings')),
      show: true,
    },
    {
      id: 5,
      title: 'Feedback',
      iconName: 'feedback',
      onPress: () => navigation.dispatch(CommonActions.navigate('Feedback')),
      show: true,
    },
    {
      id: 6,
      title: 'Sair',
      iconName: 'sair',
      onPress: () =>
        dispatch(logout()).then(() =>
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            }),
          ),
        ),
      show: user !== null,
    },
  ];

  function shouldShowSignatureActivation(): boolean {
    const { piano, auth } = store.getState();
    if (piano.hasPurchase && (!auth.user || !checkIfUserIsPremiumAndDispatchIfHasPianoAccess(auth.user.user.sub))) {
      return true;
    }
    return false;
  }

  return (
    <SafeAreaView style={[styles.safeAreaView, { backgroundColor: themeState.themeColor.background }]}>
      <TouchableOpacity
        accessibilityLabel={'Fechar'}
        activeOpacity={0.9}
        style={[
          styles.btnClose,
          {
            backgroundColor: themeState.themeColor.closeBtnBgColor,
            shadowColor: themeState.themeColor.shadowColor,
          },
        ]}
        onPress={() => handlerCloseMenu()}
      >
        <Icon name="close" size={20} color={themeState.themeColor.color} fill={themeState.themeColor.color} disableFill={false} />
      </TouchableOpacity>
      <ScrollView ref={ref} showsVerticalScrollIndicator={false} style={[styles.container, { maxWidth: themeState.themeOrientation.maxW }]}>
        <RenderUser
          title={user ? user.user.name : 'Entrar/Registar'}
          iconName={'user'}
          onPress={() => (!user ? navigation.dispatch(CommonActions.navigate('Login')) : null)}
          onPressSub={() => navigation.dispatch(CommonActions.navigate('Subscribe'))}
          user={user}
        />

        <View style={styles.search}>
          <Item
            title={'Pesquisar'}
            iconName={'search'}
            onPress={() => {
              navigation.dispatch(CommonActions.navigate('Search'));
            }}
            show={true}
          />
        </View>

        <View style={shouldShowSignatureActivation() && styles.signature}>
          <Item
            title={'Ativar assinatura'}
            iconName={'assign-check'}
            onPress={() => {
              subscribeUser(purchase as Purchase);
              navigation.dispatch(CommonActions.navigate('Login', { activateSignature: true }));
            }}
            show={shouldShowSignatureActivation()}
          />
        </View>

        {userItems.map(i => {
          return (
            <View key={i.id}>
              <Item
                title={i.title}
                iconName={i.iconName}
                iconColor={i.iconColor}
                onPress={i.onPress}
                unreadAlert={unreadAlert}
                show={i.show !== undefined ? i.show : true}
              />
              {i.id % 4 === 0 && <View style={styles.separator} />}
            </View>
          );
        })}

        <Games title={'Jogos'} iconName={'jogos'} isSubMenuOpen={isSubMenuOpen} setIsSubMenuOpen={() => setIsSubMenuOpen(!isSubMenuOpen)} />

        <Sections
          title={'Secções'}
          iconName={'seccoes'}
          sections={sections}
          showMoreSection={showMoreSection}
          setShowMoreSection={() => setShowMoreSection(!showMoreSection)}
        />

        {items.map(i => {
          return (
            <View key={i.id}>
              <Item title={i.title} iconName={i.iconName} onPress={i.onPress} unreadAlert={unreadAlert} show={i.show !== undefined ? i.show : true} />
              {i.id % 3 === 0 && i.id !== 6 && <View style={styles.separator} />}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  btnClose: {
    position: 'absolute',
    bottom: Platform.OS === OS.android ? 25 : 55,
    right: 15,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 1,
    elevation: 2,
    zIndex: 999,
  },
  container: {
    paddingHorizontal: 15,
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  search: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.brandGrey,
    marginBottom: 10,
  },
  signature: {
    borderBottomWidth: 1,
    paddingVertical: 10,
    borderBottomColor: theme.colors.brandGrey,
  },
  separator: {
    borderBottomWidth: 1,
    borderColor: theme.colors.brandGrey,
    marginTop: 10,
    marginBottom: 10,
  },
});

export default DrawerContentMenu;
