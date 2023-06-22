import React from 'react';
import { StyleSheet, SafeAreaView, Pressable, View, Platform, Text } from 'react-native';
import HeaderScreens from '../components/header/headerScreens';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../hooks';
import { ObsRowContainer, ObsTitle } from '../components/global';
import { Switch } from 'react-native-elements';
import Icon from '../components/icon';
import { strings } from '../constants/strings';
import { theme } from '../constants/theme';
import { OS } from '../constants';
import { useDispatch } from 'react-redux';
import { toggleSwitch } from '../reducers/common';

interface itemsProps {
  id: number;
  title: string;
  iconName: string;
  onPress?: () => void;
  hasSwitch?: boolean;
}

const Settings = () => {
  const navigation = useNavigation();
  const themeState = useAppSelector(state => state.theme);
  const offlineArticles = useAppSelector(state => state.common.offlineArticles);
  const dispatch = useDispatch();

  console.log('Estado Switch', offlineArticles);

  const handleSwitchToggle = () => {
    dispatch(toggleSwitch(true));
  };

  const items: itemsProps[] = [
    {
      id: 1,
      title: 'Notificações',
      iconName: 'notification',
      onPress: () => navigation.dispatch(CommonActions.navigate('NotificationsSettings')),
    },
    {
      id: 2,
      title: 'Tema',
      iconName: 'theme',
      onPress: () => navigation.dispatch(CommonActions.navigate('Theme')),
    },
    {
      id: 3,
      title: 'Letra',
      iconName: 'Aa',
      onPress: () => navigation.dispatch(CommonActions.navigate('LetterSize')),
    },
    {
      id: 4,
      title: 'Sobre',
      iconName: 'info',
      onPress: () => navigation.dispatch(CommonActions.navigate('About')),
    },
    {
      id: 5,
      title: 'Licenças',
      iconName: 'licencas',
      onPress: () => navigation.dispatch(CommonActions.navigate('Licenses')),
    },
    {
      id: 6,
      title: 'Transferência de artigos',
      iconName: 'download',
      hasSwitch: true,
    },
  ];

  return (
    <SafeAreaView style={[styles.safeAreaView, { backgroundColor: themeState.themeColor.background }]}>
      <HeaderScreens isArticlePage={false} hasTitle={true} screenTitle={strings.settings.screenTitle} />
      <View style={[styles.container, { maxWidth: themeState.themeOrientation.maxW }]}>
        {items.map(i => {
          return (
            <View key={i.id}>
              {i.hasSwitch ? (
                <>
                  <ObsRowContainer override={[styles.btnContainer, { paddingVertical: 4 }]}>
                    <Icon name={i.iconName} size={20} color={themeState.themeColor.menuIcons} fill={themeState.themeColor.menuIcons} />
                    <ObsTitle title={i.title} override={styles.title} />
                    <View style={styles.switchWrapper}>
                      <Switch
                        thumbColor={theme.colors.white}
                        value={offlineArticles}
                        onValueChange={handleSwitchToggle}
                        color={theme.colors.brandBlue}
                        style={styles.switchStyle}
                      />
                    </View>
                  </ObsRowContainer>
                  <View style={styles.switchInfoWrapper}>
                    <Text style={styles.switchInfoText}>
                      Transferência automática dos últimos{'\n'}80 artigos para leitura offline.{'\n'}
                      {offlineArticles ? <>Última transferência: 16 jun 2023, 6:33 (1.7MB)</> : null}
                    </Text>
                    <View style={{ marginTop: 4 }}>
                      <Text style={styles.switchInfoText}>Nota: Será transferido apenas texto</Text>
                    </View>
                  </View>
                </>
              ) : (
                <Pressable onPress={i.onPress}>
                  <ObsRowContainer override={styles.btnContainer}>
                    <Icon name={i.iconName} size={20} color={themeState.themeColor.menuIcons} fill={themeState.themeColor.menuIcons} />
                    <ObsTitle title={i.title} override={styles.title} />
                  </ObsRowContainer>
                </Pressable>
              )}
            </View>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 15,
    width: '100%',
    marginRight: 'auto',
    marginLeft: 'auto',
  },
  btnContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  title: {
    fontSize: 14,
    marginLeft: 10,
    marginBottom: 0,
  },
  switchWrapper: {
    flex: 1,
    alignItems: 'flex-end',
  },
  switchStyle: {
    transform: Platform.OS !== OS.android ? [{ scaleX: 0.7 }, { scaleY: 0.7 }] : [{ scaleX: 1 }, { scaleY: 1 }],
    marginRight: -6,
  },
  switchInfoWrapper: {
    paddingLeft: 30,
  },
  switchInfoText: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.brandGrey,
    fontFamily: theme.fonts.halyardRegular,
  },
});

export default Settings;
