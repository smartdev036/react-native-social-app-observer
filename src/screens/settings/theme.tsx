import React from 'react';
import {SafeAreaView, StyleSheet, View} from 'react-native';
import HeaderScreens from '../../components/header/headerScreens';
import {useAppDispatch, useAppSelector} from '../../hooks';
import {setThemeColor} from '../../reducers/theme';
import RadioGroup from '../../components/radioButton';

interface RadioButtonI {
  id: number;
  label: string;
  value: 'dark' | 'light' | 'auto';
  selected: boolean;
}

const Theme = () => {
  const themeState = useAppSelector((s) => s.theme);
  const dispatch = useAppDispatch();

  const radioButtons: RadioButtonI[] = [
    {
      id: 0,
      label: 'Claro',
      value: 'light',
      selected:
        themeState.themeColor.theme === 'light' &&
        themeState.themeColorAuto === false,
    },
    {
      id: 1,
      label: 'Escuro',
      value: 'dark',
      selected:
        themeState.themeColor.theme === 'dark' && themeState.themeColorAuto === false,
    },
    {
      id: 2,
      label: 'Predefinição do Sistema',
      value: 'auto',
      selected: themeState.themeColorAuto,
    },
  ];

  function onPressRadioButton(id: number) {
    dispatch(setThemeColor(radioButtons[id].value));
  }

  return (
    <SafeAreaView style={[styles.safeAreaView, {backgroundColor: themeState.themeColor.background}]}>
      <HeaderScreens isArticlePage={false} hasTitle={true} screenTitle={'Tema'}/>
      <View style={[styles.container, {maxWidth: themeState.themeOrientation.maxW}]}>
        <RadioGroup radioButtons={radioButtons} onPress={onPressRadioButton} />
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
    paddingHorizontal: 15,
    marginRight: 'auto',
    marginLeft: 'auto',
  },
});

export default Theme;
