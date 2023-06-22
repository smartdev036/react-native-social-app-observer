import React from 'react';
import {Linking, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View} from 'react-native';
import {IFinalLicense, ILicense} from './licenses';
import HeaderScreens from '../../components/header/headerScreens';
import {useAppSelector} from '../../hooks';
import {theme} from '../../constants/theme';
import Icon from '../../components/icon';
import {strings} from '../../constants/strings';

interface LicensesDetailProps {
  route: {
    params: {
      licenseSpecs: ILicense;
    }
  };
}

const LicensesDetail = (props: LicensesDetailProps) => {
  const themeState = useAppSelector((s) => s.theme);
  const license = props.route.params as IFinalLicense;
  let isHTML = RegExp.prototype.test.bind(/<([A-Za-z][A-Za-z0-9]*)\b[^>]*>(.*?)<\/\1>/i);

  let infoValue = [
    {
      title: strings.licensesDetail.name,
      info: license.name ?? '',
      click: null,
    },
    {
      title: strings.licensesDetail.version,
      info: license.version ?? '',
      click: null,
    },
    {
      title: strings.licensesDetail.author,
      info: license.licenseSpecs.publisher ?? '',
      click: null,
    },
    {
      title: strings.licensesDetail.website,
      info: license.licenseSpecs.url ?? '',
      click: () => {
        Linking.openURL(license.licenseSpecs.url ?? '');
      },
    },
    {
      title: strings.licensesDetail.repository,
      info: license.licenseSpecs.repository ?? '',
      click: () => {
        Linking.openURL(license.licenseSpecs.repository ?? '');
      },
    },
    {
      title: strings.licensesDetail.license,
      info: license.licenseSpecs.licenses ?? '',
      click: null,
    },
  ];

  return (
    <SafeAreaView style={[styles.safeAreaView, {backgroundColor: themeState.themeColor.background}]}>
      <HeaderScreens isArticlePage={false} hasTitle={true} screenTitle={strings.licensesDetail.screenTitle}/>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={true}>
        <View style={[styles.infoContainer, {borderColor: themeState.themeColor.lines}]}>
          {infoValue.map((value, index: number) => {
            if (!value.info) {
              return;
            }
            return (
              <View key={index} style={styles.col}>
                <Text style={[styles.margin, styles.info, {color: themeState.themeColor.aboutScreen.title}]}>
                  {value.title}
                </Text>
                <Pressable style={styles.value} onPress={value.click}>
                  <Text style={[styles.info, {color: themeState.themeColor.color, maxWidth: '80%'}]}>
                    {value.info}
                  </Text>
                  {value.click &&
                    <Icon
                      name={'arrow'}
                      size={14}
                      fill={theme.colors.brandGrey}
                      color={theme.colors.brandGrey}
                      style={styles.iconArrow}
                    />
                  }
                </Pressable>
              </View>
            );
          })}
          {!isHTML(license.licenseSpecs.licenseText) &&
            <>
              <View key={Math.random().toString()} style={[styles.col, {paddingBottom: 10}]}>
                <Text style={[styles.margin, styles.info, {color: themeState.themeColor.aboutScreen.title}]}>
                  {strings.licensesDetail.textlLicense}
                </Text>
                <Text style={[styles.info, styles.licenceText, themeState.themeColor.licences.licenseText]}>
                  {license.licenseSpecs.licenseText}
                </Text>
              </View>
            </>
          }
        </View>
      </ScrollView>
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
  },
  margin: {
    marginBottom: 4,
  },
  infoContainer: {
    flex: 1,
  },
  info: {
    fontSize: 13,
    fontFamily: theme.fonts.halyardRegular,
  },
  licenceText: {
    fontSize: 11,
    fontFamily: theme.fonts.halyardRegular,
    borderColor: theme.colors.brandGrey,
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
  },
  col: {
    flexDirection: 'column',
    marginTop: 10,
  },
  value: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconArrow: {
    transform: [{rotate: '180deg'}],
  },
});

export default LicensesDetail;
