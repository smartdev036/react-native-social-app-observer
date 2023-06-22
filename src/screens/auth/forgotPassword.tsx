import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { Input, Overlay } from 'react-native-elements';
import { theme } from '../../constants/theme';
import HeaderScreens from '../../components/header/headerScreens';
import CustomButton from '../../components/customButton';
import Icon from '../../components/icon';
import { recoverPassword } from '../../reducers/auth';
import Recaptcha, { RecaptchaHandles } from 'react-native-recaptcha-that-works';
import { siteKey, testUrl } from './login';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { CommonActions, useNavigation } from '@react-navigation/native';
import Loading from '../../components/loading';
import { isRejected } from '@reduxjs/toolkit';
import { BarqueiroResponse } from '../../services/barqueiro';

const ForgotPassword = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const recaptchaRef = useRef<RecaptchaHandles>();
  const dispatch = useAppDispatch();
  const themeState = useAppSelector(state => state.theme);
  const isLoading = useAppSelector(state => state.auth.stateLoading);

  return (
    <SafeAreaView style={[styles.safeAreaView, { backgroundColor: themeState.themeColor.background }]}>
      <HeaderScreens isArticlePage={false} hasTitle={true} screenTitle={'Recuperar palavra-passe'} />

      <Overlay
        overlayStyle={{
          backgroundColor: themeState.themeColor.transparent,
          elevation: 0,
        }}
        isVisible={isLoading}
      >
        <Loading size={'small'} color={theme.colors.white} />
      </Overlay>

      <View
        style={[
          styles.container,
          {
            backgroundColor: themeState.themeColor.background,
            maxWidth: themeState.themeOrientation.maxWLogin,
          },
        ]}
      >
        <View style={{ marginVertical: 20 }}>
          <Text
            style={{
              color: themeState.themeColor.color,
              lineHeight: 19,
              fontSize: 14,
              fontFamily: theme.fonts.halyardRegular,
            }}
          >
            Esqueceu-se da sua password? Insira o seu e-mail para recuperar a sua conta.
          </Text>
          <View style={styles.form}>
            <Input
              autoFocus={true}
              inputContainerStyle={{
                borderBottomWidth: 0,
                maxHeight: 40,
              }}
              containerStyle={styles.input}
              onChangeText={setEmail}
              value={email}
              placeholder={'E-mail'}
              placeholderTextColor={themeState.themeColor.color}
              style={{
                color: theme.colors.brandGrey,
                fontSize: 14,
                fontFamily: theme.fonts.halyardRegular,
              }}
              autoCompleteType={'email'}
              editable={true}
              secureTextEntry={false}
              keyboardType={'email-address'}
              returnKeyType={'done'}
              rightIcon={
                email ? (
                  <TouchableOpacity accessibilityLabel={'Apagar'} activeOpacity={0.8} onPress={() => setEmail('')}>
                    <Icon name={'close'} size={14} disableFill={false} color={theme.colors.brandBlack} fill={theme.colors.brandBlack} />
                  </TouchableOpacity>
                ) : null
              }
              clearButtonMode="never"
            />
          </View>
          <Recaptcha
            ref={recaptchaRef}
            siteKey={siteKey}
            baseUrl={testUrl}
            hideBadge={true}
            lang={'pt'}
            size={'normal'}
            theme={themeState.themeColor.theme}
            loadingComponent={<Loading size={'small'} color={theme.colors.white} />}
            onVerify={v => {
              dispatch(recoverPassword({ email: email, recaptcha: v })).then((r: any) => {
                if (isRejected(r)) {
                  // WARNING: so mostra ao user o primeiro erro apanhado pelo servidor
                  const payload = r.payload as BarqueiroResponse;
                  if (Array.isArray(payload.errors) && payload.errors.length > 0) {
                    switch (payload.errors[0]) {
                      case 'not_found':
                        Alert.alert('Recuperação da Password', 'Email não encontrado.');
                        return;
                      case 'invalid_email':
                        Alert.alert('Recuperação da Password', 'Email inválido.');
                        return;
                    }
                  }
                  Alert.alert('Recuperação da Password', 'Erro na recuperação da password\nPor for tente mais tarde.');
                  return;
                } else {
                  Alert.alert(
                    'Recuperação da Password',
                    'Por favor, verifique o seu e-mail',
                    [
                      {
                        text: 'OK',
                        onPress: () => navigation.dispatch(CommonActions.goBack()),
                      },
                    ],
                    {
                      cancelable: false,
                      onDismiss: () => navigation.dispatch(CommonActions.goBack()),
                    },
                  );
                }
              });
            }}
          />
          <CustomButton
            title={'Enviar e-mail'}
            bgColor={theme.colors.brandBlue}
            textColor={theme.colors.white}
            onPress={() => {
              if (email) {
                recaptchaRef?.current?.open();
              } else {
                Alert.alert('Erro', 'E-mail inválido');
              }
            }}
          />
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
  form: {
    width: '100%',
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    height: 40,
    borderColor: theme.colors.lightGrey,
    paddingHorizontal: 10,
    color: theme.colors.brandGrey,
    fontSize: 14,
    fontFamily: theme.fonts.halyardRegular,
    marginBottom: 20,
  },
});

export default ForgotPassword;
