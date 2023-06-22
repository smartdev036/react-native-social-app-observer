import React, {useCallback} from 'react';
import {View, StyleSheet, SafeAreaView, FlatList} from 'react-native';
import HeaderScreens from '../../components/header/headerScreens';
import {useAppSelector} from '../../hooks';
import {CommonActions, useNavigation} from '@react-navigation/native';
import Item from '../../components/menu/item';
import {strings} from '../../constants/strings';

export interface ILicense {
  url: string;
  licenses: string;
  repository: string;
  licenseFile: string;
  publisher: string;
  licenseText: string;
}

export interface IFinalLicense {
  name: string;
  version: string;
  licenseSpecs: ILicense;
}

const Licenses = () => {
  const themeState = useAppSelector((s) => s.theme);
  const navigation = useNavigation();
  const licenses: { [id: string]: ILicense } = require('../../../licenses.json');
  const numberRegex = /\d+(\.\d+)*/;
  const atRegex = /(?:@)/gi;
  let finalLicense: IFinalLicense[] = [];

  Object.keys(licenses).map((idx) => {
    let item = licenses[idx];
    // Extract the version of the library from the name
    const version = idx.match(numberRegex);
    // Removes the part after the @
    const nameWithoutVersion = idx
      .replace(atRegex, '')
      .replace(version ? version[0] : '', '');
    finalLicense.push({
      name: nameWithoutVersion,
      version: version ? version[0] : '',
      licenseSpecs: item,
    });
  });

  const renderItem = ({item, index}: { item: IFinalLicense, index: number }) => {
    return (
      <View key={index}>
        <Item
          title={item.name}
          showIconLeft={true}
          onPress={() => {
            navigation.dispatch(CommonActions.navigate('LicensesDetail', item));
          }}
          show={true}
        />
      </View>
    );
  };

  const keyExtractor = useCallback((item: IFinalLicense, index: number) => index.toString(), []);

  return (
    <SafeAreaView style={[styles.safeAreaView, {backgroundColor: themeState.themeColor.background}]}>
      <HeaderScreens isArticlePage={false} hasTitle={true} screenTitle={strings.licenses.screenTitle}/>
      <View style={[styles.container, {maxWidth: themeState.themeOrientation.maxW}]}>
        <FlatList
          style={{paddingHorizontal: 15}}
          keyboardShouldPersistTaps={'handled'}
          showsVerticalScrollIndicator={true}
          data={finalLicense}
          renderItem={renderItem}
          maxToRenderPerBatch={6}
          initialNumToRender={6}
          removeClippedSubviews={true}
          updateCellsBatchingPeriod={100}
          windowSize={10}
          keyExtractor={keyExtractor}
          onEndReachedThreshold={0.1}
        />
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
    width: '100%',
    marginRight: 'auto',
    marginLeft: 'auto',
  },
});

export default Licenses;
