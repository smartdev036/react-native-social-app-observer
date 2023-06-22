import React, { useRef, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Pressable, Alert, Platform, Modal } from 'react-native';
import HeaderScreens from '../../components/header/headerScreens';
import { loginWithEmail, loginWithFacebook, loginWithGoogle, loginWithApple } from '../../reducers/auth';
import { theme } from '../../constants/theme';
import SocialButton from '../../components/socialButton';
import CustomButton from '../../components/customButton';
import { Input } from 'react-native-elements';
import Icon from '../../components/icon';
import Recaptcha, { RecaptchaHandles } from 'react-native-recaptcha-that-works';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { CommonActions, useNavigation } from '@react-navigation/native';
import Loading from '../../components/loading';
import { ObsText } from '../../components/global';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OS } from '../../constants';
import { BarqueiroLoginRequest, BarqueiroResponse } from '../../services/barqueiro';
import { isRejected } from '@reduxjs/toolkit';
import { LOG, LogToAll } from '../../utils/logger';

export const siteKey = '6LcGdUwUAAAAAEdlBPCpW7tsy8WC9fM4U-y9Kudl';
export const testUrl = 'https://observador.pt/';

export interface LoginProps {
  route: {
    key: string;
    name?: undefined;
    params?: {
      activateSignature?: boolean;
    };
    path?: string;
    merge?: boolean;
  };
}

const Login = (props: LoginProps) => {
  const isActivateSignature = props.route.params?.activateSignature === true;
  const navigation = useNavigation();
  const [values, setValues] = useState<{ email: null | string; password: null | string }>({ email: null, password: null });
  const [showPassword, setShowPassword] = useState(true);
  const recaptchaRef = useRef<RecaptchaHandles>();
  const dispatch = useAppDispatch();
  const themeState = useAppSelector(state => state.theme);
  const isLoading = useAppSelector(state => state.auth.stateLoading);
  const password = useRef();
  const insets = useSafeAreaInsets();

  function goBack() {
    navigation.dispatch(CommonActions.goBack());
    // TODO Resolver Paywall quando se faz login
    /*const aId = store.getState().auth.articleId;
    if (aId) {
      navigation.dispatch(CommonActions.navigate(aId.name, aId.params));
      dispatch(setArticleId(null));
    } else {
      navigation.dispatch(CommonActions.goBack());
    }*/
  }

  return (
    <SafeAreaView style={[styles.safeAreaView, { backgroundColor: themeState.themeColor.background }]}>
      <HeaderScreens isArticlePage={false} hasTitle={true} screenTitle="Iniciar sessão" />
      <Modal transparent={true} statusBarTranslucent={true} visible={isLoading}>
        <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <Loading size={'small'} color={theme.colors.white} />
        </View>
      </Modal>
      <KeyboardAwareScrollView
        enableAutomaticScroll={true}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        extraScrollHeight={-insets.bottom}
        style={[styles.container, { maxWidth: themeState.themeOrientation.maxWLogin }]}
      >
        {isActivateSignature && (
          <ObsText
            title="Para poder usufruir da sua subscrição em todas as plataformas, deve
          associá-la ao email que pretende utilizar. Para tal deverá fazer login."
            override={{ marginTop: 10 }}
          />
        )}
        <View style={{ marginTop: 20, marginBottom: 26 }}>
          <Text
            style={{
              fontSize: 14,
              color: themeState.themeColor.color,
              fontFamily: theme.fonts.halyardRegular,
              lineHeight: 22,
            }}
          >
            Ainda não tem conta no Observador?
          </Text>
          <Pressable
            style={{ width: '40%' }}
            onPress={() => {
              navigation.dispatch(CommonActions.navigate('Register'));
            }}
          >
            <Text
              style={{
                fontSize: 14,
                color: theme.colors.brandBlue,
                fontFamily: theme.fonts.halyardRegular,
                lineHeight: 22,
              }}
            >
              Clique aqui para criar
            </Text>
          </Pressable>
        </View>
        <View style={styles.socialBtns}>
          <SocialButton
            title="Entrar com Facebook"
            icon="facebook"
            iconColor={theme.colors.white}
            bgColor={theme.colors.facebookBg}
            textColor={theme.colors.white}
            onPress={() => {
              dispatch(loginWithFacebook()).then(r => {
                if (!r.error) {
                  goBack();
                } else {
                  LogToAll({
                    type: 'facebook_login ',
                    message: r,
                  });
                }
              });
            }}
            disableFill={true}
          />
          <SocialButton
            title="Entrar com Google"
            icon="google"
            bgColor={themeState.themeColor.transparent}
            textColor={themeState.themeColor.googleText}
            border={true}
            borderColor={theme.colors.lightGrey}
            onPress={() => {
              dispatch(loginWithGoogle())
                .then((r: any) => {
                  if (!r.error) {
                    goBack();
                  }
                })
                .catch(e => {
                  LogToAll({
                    type: 'google_login ',
                    message: e,
                  });
                });
            }}
            disableFill={false}
          />
          {Platform.OS === OS.ios && (
            <SocialButton
              title={'Entrar com Apple'}
              icon={'apple'}
              iconColor={theme.colors.white}
              bgColor={theme.colors.brandBlack}
              textColor={theme.colors.white}
              border={true}
              borderColor={themeState.themeColor.color}
              disableFill
              onPress={() => {
                dispatch(loginWithApple()).then((r: any) => {
                  if (!r.error) {
                    goBack();
                  }
                });
              }}
            />
          )}
        </View>
        <View
          style={{
            width: '100%',
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.brandGrey,
            opacity: 0.2,
            marginVertical: 10,
          }}
        />
        <View style={styles.form}>
          <Input
            inputContainerStyle={{
              borderBottomWidth: 0,
              maxHeight: 40,
            }}
            containerStyle={[styles.input, { borderColor: theme.colors.brandGrey }]}
            onChangeText={v => setValues({ ...values, email: v })}
            value={values.email}
            placeholder="E-mail"
            autoFocus={false}
            placeholderTextColor={theme.colors.brandGrey}
            style={{
              color: themeState.themeColor.color,
              fontSize: 14,
              fontFamily: theme.fonts.halyardRegular,
            }}
            autoCompleteType="email"
            autoCapitalize="none"
            editable={true}
            blurOnSubmit={false}
            secureTextEntry={false}
            returnKeyType="next"
            keyboardType="email-address"
            onSubmitEditing={() => password.current.focus()}
            rightIcon={
              values.email ? (
                <Pressable accessibilityLabel={'Apagar'} onPress={() => setValues({ ...values, email: null })}>
                  <Icon name={'close'} size={14} disableFill={false} color={themeState.themeColor.color} fill={themeState.themeColor.color} />
                </Pressable>
              ) : (
                <View />
              )
            }
            clearButtonMode="never"
          />
          <Input
            ref={password}
            inputContainerStyle={{
              borderBottomWidth: 0,
              maxHeight: 40,
            }}
            containerStyle={[styles.input, { borderColor: theme.colors.brandGrey }]}
            style={{
              color: themeState.themeColor.color,
              fontSize: 14,
              fontFamily: theme.fonts.halyardRegular,
            }}
            onChangeText={v => setValues({ ...values, password: v })}
            value={values.password}
            placeholder="Palavra-passe"
            placeholderTextColor={theme.colors.brandGrey}
            autoCompleteType="password"
            editable={true}
            blurOnSubmit={true}
            secureTextEntry={showPassword}
            returnKeyType="done"
            keyboardType="default"
            rightIcon={
              <Pressable accessibilityLabel={'Mostrar/Esconder Password'} onPress={() => setShowPassword(!showPassword)}>
                <Icon name={showPassword ? 'eye-off' : 'eye'} size={14} disableFill={false} color={theme.colors.brandGrey} fill={theme.colors.brandGrey} />
              </Pressable>
            }
            clearButtonMode="never"
          />
          <Pressable
            style={{ paddingVertical: 10 }}
            onPress={() => {
              navigation.dispatch(CommonActions.navigate('ForgotPassword'));
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontFamily: theme.fonts.halyardRegular,
                color: theme.colors.brandBlue,
                textAlign: 'center',
              }}
            >
              Esqueceu-se da palavra-passe?
            </Text>
          </Pressable>
        </View>
        <View>
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
              const authData: BarqueiroLoginRequest = {
                email: values.email as string,
                password: values.password as string,
                recaptcha: v,
              };
              dispatch(loginWithEmail(authData)).then((r: any) => {
                if (isRejected(r)) {
                  const payload = r.payload as BarqueiroResponse;
                  if (Array.isArray(payload?.errors) && payload.errors.length > 0) {
                    switch (payload.errors[0]) {
                      case 'authentication_fail':
                        Alert.alert('Erro ao iniciar sessão', 'Os dados introduzidos não estão correctos.\nPor favor valide os dados introduzidos');
                        return;
                      case 'not_verified':
                        Alert.alert('Erro ao iniciar sessão', 'Para poder continuar tem que validar o seu email.');
                        return;
                      case 'invalid_email':
                        Alert.alert('Erro ao iniciar sessão', 'Email inválido');
                        return;
                      case 'pwd_empty':
                        Alert.alert('Erro ao iniciar sessão', 'Password vazia');
                        return;
                      case 'invalid_recaptcha':
                        Alert.alert('Erro ao iniciar sessão', 'Recaptcha invlálido');
                        return;
                      case 'not_found':
                        Alert.alert('Erro ao iniciar sessão', 'Utilizador não foi encontrado');
                        return;
                    }
                  }
                  Alert.alert('Iniciar sessão', 'Erro ao iniciar sessão.\nPor for tente mais tarde.');
                  return;
                } else {
                  goBack();
                }
              });
            }}
            onClose={() => {
              LOG.info('@@@@@@@@@@@@@@@@@@ recaptcha close');
            }}
            onError={e => {
              LOG.info('@@@@@@@@@@@@@@@@@@ recaptcha error');
            }}
            onLoad={() => {
              LOG.info('@@@@@@@@@@@@@@@@@@ recaptcha Load');
            }}
            onExpire={() => {
              LOG.info('@@@@@@@@@@@@@@@@@@ recaptcha Expire');
            }}
          />
        </View>
        <View style={{ marginTop: 10, alignItems: 'center' }}>
          <CustomButton
            title="Iniciar sessão"
            bgColor={theme.colors.brandBlue}
            textColor={theme.colors.white}
            onPress={() => {
              if (values.email && values.password) {
                recaptchaRef?.current?.open();
              } else {
                Alert.alert('Erro', 'E-mail ou password inválidos.');
              }
            }}
          />
        </View>
      </KeyboardAwareScrollView>
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
  socialBtns: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    width: '100%',
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    height: 40,
    marginBottom: 20,
  },
});

export default Login;
