import React from 'react';
import { View, Text, SafeAreaView, StyleSheet } from 'react-native';
import { useAppSelector } from '../../hooks';
import { theme } from '../../constants/theme';
import Icon from '../icon';
import Form from './form';

const RegisterWindow = () => {
  const themeState = useAppSelector(state => state.theme);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.lightGrey }]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.logo}>
            <Icon name={'logo-observador'} size={150} fill={themeState.themeColor.color} color={themeState.themeColor.color} disableFill={false} />
          </View>
          <Text
            style={[
              styles.headerTitle,
              {
                color: themeState.themeColor.color,
                fontSize: themeState.fontStyles.onBoardingTitle.fontSize,
                lineHeight: themeState.fontStyles.onBoardingTitle.lineHeight,
              },
            ]}
          >
            Crie uma conta gratuita ou inicie sessão na sua conta.
          </Text>
        </View>
        <View style={styles.formContainer}>
          <Form />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  logo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 24,
  },
  headerTitle: {
    fontFamily: theme.fonts.halyardRegular,
  },
  formContainer: { flex: 1 },
});

export default RegisterWindow;
