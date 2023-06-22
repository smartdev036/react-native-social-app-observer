import React from 'react';
import {View, Text, StyleSheet, SafeAreaView, Linking} from 'react-native';
import HeaderScreens from '../../components/header/headerScreens';
import DeviceInfo from 'react-native-device-info';
import {useAppSelector} from '../../hooks';
import Item from '../../components/menu/item';
import {theme} from '../../constants/theme';
import {obsContact, obsHelp, obsPeople, obsPolicyPrivacy, obstTerms} from '../../constants';
import {netAudienceEvents, strings} from '../../constants/strings';
import { Analytics } from '../../services/analytics';

const About = () => {
  const version = DeviceInfo.getVersion();
  const buildNumber = DeviceInfo.getBuildNumber();
  const system = DeviceInfo.getSystemName();
  const sytemVersion = DeviceInfo.getSystemVersion();
  const themeState = useAppSelector((s) => s.theme);
  const device = DeviceInfo.getBrand() + ' ' + DeviceInfo.getModel();

  const menuValue = [
    {
      id: 1,
      title: strings.about.tech,
      show: true,
      showIconLeft: true,
      onPress: null,
    },
    {
      id: 2,
      title: strings.about.contacts,
      show: true,
      showIconLeft: true,
      onPress: null,
    },
    {
      id: 3,
      title: strings.about.help,
      show: true,
      showIconLeft: true,
      onPress: null,
    },
    {
      id: 4,
      title: strings.about.policy,
      show: true,
      showIconLeft: true,
      onPress: null,
    },
    {
      id: 5,
      title: strings.about.terms,
      show: true,
      showIconLeft: true,
      onPress: null,
    },
  ];

  const infoValue = [
    {
      title: strings.about.appVersion,
      info: version,
    },
    {
      title: strings.about.buildVersion,
      info: buildNumber,
    },
    {
      title: strings.about.device,
      info: device,
    },
    {
      title: strings.about.system,
      info: system + ' ' + sytemVersion,
    },
  ];

  const handlerMenu = (id: number) => {
    switch (id) {
      case 1:
        Linking.openURL(obsPeople);
        break;
      case 2:
        Linking.openURL(obsContact);
        break;
      case 3:
        Linking.openURL(obsHelp);
        break;
      case 4:
        Linking.openURL(obsPolicyPrivacy);
        break;
      case 5:
        Analytics.gemiusTrackEvent(netAudienceEvents.others)
        Linking.openURL(obstTerms);
        break;
    }
  };

  return (
    <SafeAreaView style={[styles.safeAreaView, {backgroundColor: themeState.themeColor.background}]}>
      <HeaderScreens isArticlePage={false} hasTitle={true} screenTitle={strings.about.screenTitle}/>
      <View style={[styles.container, {maxWidth: themeState.themeOrientation.maxW}]}>
        {menuValue.map((i, index: number) => {
          return (
            <View key={index}>
              <Item title={i.title} show={i.show} showIconLeft={i.show} onPress={() => handlerMenu(i.id)}/>
            </View>);
        })}
        <View style={[styles.infoContainer, {borderColor: themeState.themeColor.lines}]}>
          {infoValue.map((value, index: number) => {
            return (
              <View key={index} style={styles.col}>
                <Text style={[styles.margin, styles.info, {color: themeState.themeColor.aboutScreen.title}]}>
                  {value.title}
                </Text>
                <Text style={[styles.info, {color: themeState.themeColor.color}]}>{value.info}</Text>
              </View>
            );
          })}
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
    paddingHorizontal: 15,
    width: '100%',
    marginRight: 'auto',
    marginLeft: 'auto',
  },
  col: {
    flexDirection: 'column',
    marginTop: 15,
  },
  margin: {
    marginBottom: 6,
  },
  infoContainer: {
    flex: 1,
    marginTop: 15,
    borderTopWidth: 1,
  },
  info: {
    fontSize: 14,
    fontFamily: theme.fonts.halyardRegular,
  },
});

export default About;
