import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Linking, Alert, Pressable } from 'react-native';
import { Input, Overlay } from 'react-native-elements';
import Icon from '../../components/icon';
import { theme } from '../../constants/theme';
import HeaderScreens from '../../components/header/headerScreens';
import CustomButton from '../../components/customButton';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import { URL_POLICY_COOKIES, URL_TERMS } from '../../api';
import { register } from '../../reducers/auth';
import { siteKey, testUrl } from './login';
import Recaptcha, { RecaptchaHandles } from 'react-native-recaptcha-that-works';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { UserRegister } from '../../services/auth';
import { CommonActions, useNavigation } from '@react-navigation/native';
import Loading from '../../components/loading';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isRejected } from '@reduxjs/toolkit';
import { BarqueiroResponse } from '../../services/barqueiro';

const Register = () => {
  const navigation = useNavigation();
  const [values, setValues] = useState<UserRegister>({
    firstName: undefined,
    lastName: undefined,
    email: undefined,
    password: undefined,
    passwordCheck: undefined,
  });
  const [errors, setErrors] = useState<UserRegister>({
    firstName: undefined,
    lastName: undefined,
    email: undefined,
    password: undefined,
    passwordCheck: undefined,
  });
  const [showPassword, setShowPassword] = useState(true);
  const [showPasswordCheck, setShowPasswordCheck] = useState(true);
  const [acceptTerms, setAcceptTerms] = useState({
    term: false,
    cookie: false,
  });

  const recaptchaRef = useRef<RecaptchaHandles>();
  const dispatch = useAppDispatch();

  const themeState = useAppSelector(state => state.theme);
  const isLoading = useAppSelector(state => state.auth.stateLoading);

  const lastName = useRef();
  const email = useRef();
  const passsword = useRef();
  const confirmPasssword = useRef();
  const insets = useSafeAreaInsets();

  const errorMessages = {
    firstName: 'Por favor, insira o seu primeiro nome',
    lastName: 'Por favor, insira o seu último nome',
    email: 'Por favor, insira um email valido',
    emailExists: 'O email já se encontra registado',
    password: 'Por favor, insira a sua password',
    passwordCheck: 'Por favor, confirme a sua password',
    passwordCheckInvalid: 'As passwords que colocou não são iguais',
    passwordWeak: 'A password tem que ter mais que 6 caracteres',
    invalidRecaptcha: 'Recaptcha inválido',
  };

  const TextComp = (props: any) => {
    const { number } = props;
    return (
      <View style={{ marginLeft: 10 }}>
        <Text
          style={{
            color: themeState.themeColor.color,
            fontSize: 13,
            fontFamily: theme.fonts.halyardRegular,
          }}
        >
          {`Aceito ${number === 1 ? 'os' : 'a'} `}
          <Text
            onPress={() => {
              Linking.openURL(number === 1 ? URL_TERMS : URL_POLICY_COOKIES);
            }}
            style={{
              color: theme.colors.brandBlue,
            }}
          >
            {`${number === 1 ? 'Termos e Condições' : 'Política de Privacidade e Cookies'} `}
          </Text>
        </Text>
      </View>
    );
  };

  const validation = () => {
    const { firstName, lastName, email, password, passwordCheck } = values;
    const result = Object.create({});
    if (!firstName?.trim()) {
      result.firstName = errorMessages.firstName;
    }
    if (!lastName?.trim()) {
      result.lastName = errorMessages.lastName;
    }
    if (!email?.trim()) {
      result.email = errorMessages.email;
    }
    if (!password?.trim()) {
      result.password = errorMessages.password;
    }
    if (!passwordCheck?.trim()) {
      result.passwordCheck = errorMessages.passwordCheck;
    }
    if (password !== passwordCheck) {
      result.passwordCheck = errorMessages.passwordCheckInvalid;
    }
    setErrors(result);
    return Object.entries(result).length == 0;
  };

  return (
    <SafeAreaView style={[styles.safeAreaView, { backgroundColor: themeState.themeColor.background }]}>
      <HeaderScreens isArticlePage={false} hasTitle={true} screenTitle={'Registar'} />
      <Overlay overlayStyle={{ backgroundColor: themeState.themeColor.transparent, elevation: 0 }} isVisible={isLoading}>
        <Loading size={'small'} color={theme.colors.white} />
      </Overlay>

      <KeyboardAwareScrollView
        enableAutomaticScroll={true}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        extraScrollHeight={-insets.bottom}
        style={[
          styles.container,
          {
            backgroundColor: themeState.themeColor.background,
            maxWidth: themeState.themeOrientation.maxWLogin,
          },
        ]}
      >
        <View style={{ marginTop: 20, marginBottom: 10 }}>
          <Text
            style={{
              fontSize: 14,
              color: themeState.themeColor.color,
              fontFamily: theme.fonts.halyardRegular,
              lineHeight: 22,
            }}
          >
            Já tem conta no Observador?
          </Text>
          <Pressable
            onPress={() => {
              navigation.dispatch(CommonActions.navigate('Login'));
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
              Clique aqui para iniciar sessão
            </Text>
          </Pressable>
        </View>
        <View style={styles.form}>
          <Input
            autoFocus={true}
            inputContainerStyle={{
              borderBottomWidth: 0,
              maxHeight: 40,
            }}
            containerStyle={styles.input}
            onChangeText={v => setValues({ ...values, firstName: v })}
            value={values.firstName}
            autoCorrect={false}
            placeholder={'Primeiro nome'}
            placeholderTextColor={theme.colors.brandGrey}
            style={{
              color: theme.colors.brandGrey,
              fontSize: 14,
              fontFamily: theme.fonts.halyardRegular,
            }}
            editable={true}
            secureTextEntry={false}
            keyboardType={'default'}
            returnKeyType={'next'}
            onSubmitEditing={() => lastName.current.focus()}
            rightIcon={
              values.firstName ? (
                <Pressable accessibilityLabel={'Apagar'} onPress={() => setValues({ ...values, firstName: '' })}>
                  <Icon name={'close'} size={14} disableFill={false} color={themeState.themeColor.color} fill={themeState.themeColor.color} />
                </Pressable>
              ) : null
            }
            clearButtonMode="never"
            errorMessage={errors && errors.firstName ? errors.firstName : undefined}
            errorStyle={{ margin: 0, padding: 0, fontSize: 11, marginLeft: -10 }}
          />
          <Input
            ref={lastName}
            inputContainerStyle={{
              borderBottomWidth: 0,
              maxHeight: 40,
            }}
            autoCorrect={false}
            containerStyle={styles.input}
            onChangeText={v => setValues({ ...values, lastName: v })}
            value={values.lastName}
            placeholder={'Último nome'}
            placeholderTextColor={theme.colors.brandGrey}
            style={{
              color: theme.colors.brandGrey,
              fontSize: 14,
              fontFamily: theme.fonts.halyardRegular,
            }}
            editable={true}
            secureTextEntry={false}
            keyboardType={'default'}
            returnKeyType={'next'}
            onSubmitEditing={() => email.current.focus()}
            rightIcon={
              values.lastName ? (
                <Pressable accessibilityLabel={'Apagar'} onPress={() => setValues({ ...values, lastName: null })}>
                  <Icon name={'close'} size={14} disableFill={false} color={themeState.themeColor.color} fill={themeState.themeColor.color} />
                </Pressable>
              ) : null
            }
            clearButtonMode="never"
            errorMessage={errors && errors.lastName ? errors.lastName : undefined}
            errorStyle={{ margin: 0, padding: 0, fontSize: 11, marginLeft: -10 }}
          />
          <Input
            ref={email}
            inputContainerStyle={{
              borderBottomWidth: 0,
              maxHeight: 40,
            }}
            containerStyle={styles.input}
            onChangeText={v => setValues({ ...values, email: v })}
            value={values && values.email ? values.email : undefined}
            placeholder={'E-mail'}
            placeholderTextColor={theme.colors.brandGrey}
            style={{
              color: theme.colors.brandGrey,
              fontSize: 14,
              fontFamily: theme.fonts.halyardRegular,
            }}
            autoCompleteType={'email'}
            autoCorrect={false}
            editable={true}
            secureTextEntry={false}
            keyboardType={'email-address'}
            returnKeyType={'next'}
            onSubmitEditing={() => passsword.current.focus()}
            rightIcon={
              values.email ? (
                <Pressable accessibilityLabel={'Apagar'} onPress={() => setValues({ ...values, email: null })}>
                  <Icon name={'close'} size={14} disableFill={false} color={themeState.themeColor.color} fill={themeState.themeColor.color} />
                </Pressable>
              ) : null
            }
            clearButtonMode="never"
            errorMessage={errors.email}
            errorStyle={{ margin: 0, padding: 0, fontSize: 11, marginLeft: -10 }}
          />
          <Input
            ref={passsword}
            inputContainerStyle={{
              borderBottomWidth: 0,
              maxHeight: 40,
            }}
            containerStyle={styles.input}
            style={{
              color: theme.colors.brandGrey,
              fontSize: 14,
              fontFamily: theme.fonts.halyardRegular,
            }}
            onChangeText={v => setValues({ ...values, password: v })}
            value={values.password}
            placeholder={'Palavra-passe'}
            autoCorrect={false}
            placeholderTextColor={theme.colors.brandGrey}
            autoCompleteType={'password'}
            editable={true}
            secureTextEntry={showPassword}
            blurOnSubmit={false}
            keyboardType={'default'}
            returnKeyType={'next'}
            onSubmitEditing={() => confirmPasssword.current.focus()}
            rightIcon={
              <Pressable accessibilityLabel={'Mostrar/Esconder Password'} onPress={() => setShowPassword(!showPassword)}>
                <Icon
                  name={showPassword ? 'eye' : 'eye-off'}
                  size={14}
                  disableFill={false}
                  color={themeState.themeColor.color}
                  fill={themeState.themeColor.color}
                />
              </Pressable>
            }
            clearButtonMode="never"
            errorMessage={errors.password ?? undefined}
            errorStyle={{ margin: 0, padding: 0, fontSize: 11, marginLeft: -10 }}
          />
          <Input
            ref={confirmPasssword}
            inputContainerStyle={{
              borderBottomWidth: 0,
              maxHeight: 40,
            }}
            containerStyle={styles.input}
            style={{
              color: theme.colors.brandGrey,
              fontSize: 14,
              fontFamily: theme.fonts.halyardRegular,
            }}
            value={values && values.passwordCheck ? values.passwordCheck : undefined}
            onChangeText={v => setValues({ ...values, passwordCheck: v })}
            placeholder={'Confirme a Senha'}
            placeholderTextColor={theme.colors.brandGrey}
            autoCompleteType={'password'}
            editable={true}
            autoCorrect={false}
            secureTextEntry={showPasswordCheck}
            keyboardType={'default'}
            returnKeyType={'done'}
            rightIcon={
              <Pressable accessibilityLabel={'Mostrar/Esconder Password'} onPress={() => setShowPasswordCheck(!showPasswordCheck)}>
                <Icon
                  name={showPasswordCheck ? 'eye' : 'eye-off'}
                  size={14}
                  disableFill={false}
                  color={themeState.themeColor.color}
                  fill={themeState.themeColor.color}
                />
              </Pressable>
            }
            clearButtonMode="never"
            errorMessage={errors && errors.passwordCheck ? errors.passwordCheck : undefined}
            errorStyle={{ margin: 0, padding: 0, fontSize: 11, marginLeft: -10 }}
          />
        </View>
        <View style={{ paddingVertical: 10 }}>
          <BouncyCheckbox
            style={{ marginBottom: 10 }}
            size={16}
            fillColor={theme.colors.brandBlue}
            unfillColor={theme.colors.white}
            textComponent={<TextComp number={1} />}
            iconStyle={{
              borderColor: theme.colors.brandGrey,
              borderRadius: 40,
            }}
            isChecked={acceptTerms.term}
            onPress={v => setAcceptTerms({ ...acceptTerms, term: v })}
          />
          <BouncyCheckbox
            size={16}
            fillColor={theme.colors.brandBlue}
            unfillColor={theme.colors.white}
            textComponent={<TextComp number={2} />}
            iconStyle={{
              borderColor: theme.colors.brandGrey,
              borderRadius: 40,
            }}
            isChecked={acceptTerms.cookie}
            onPress={v => setAcceptTerms({ ...acceptTerms, cookie: v })}
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
          onVerify={v =>
            dispatch(register({ ...values, recaptcha: v })).then((r: any) => {
              if (isRejected(r)) {
                const result = Object.create({});
                const payload = r.payload as BarqueiroResponse;
                if (Array.isArray(payload.errors) && payload.errors.length > 0) {
                  for (const error of payload.errors) {
                    switch (error) {
                      case 'pwd_weak':
                        result.password = errorMessages.passwordWeak;
                        break;
                      case 'pwd_not_match':
                        result.passwordCheck = errorMessages.passwordCheckInvalid;
                        break;
                      case 'firstname_empty':
                        result.firstName = errorMessages.firstName;
                        break;
                      case 'lastname_empty':
                        result.lastName = errorMessages.lastName;
                        break;
                      case 'invalid_email':
                        result.invalidEmail = errorMessages.lastName;
                        break;
                      case 'pwd_empty':
                        result.password = errorMessages.password;
                        break;
                      case 'email_exists':
                        result.email = errorMessages.emailExists;
                        break;
                      case 'invalid_recaptcha':
                        // TODO não estamos a fazer nada com isto (adicionar um aviso de repcatcha)
                        result.recaptcha = errorMessages.invalidRecaptcha;
                        break;
                    }
                  }
                  setErrors(result);
                }
                Alert.alert('Registo', 'Por favor corrija os campos errados\n');
              } else {
                Alert.alert(
                  'Register success',
                  'Please check your email address to active your account',
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
            })
          }
        />
        <CustomButton
          title={'Registar'}
          bgColor={theme.colors.brandBlue}
          textColor={theme.colors.white}
          disable={!acceptTerms.term || !acceptTerms.cookie}
          onPress={() => {
            if (validation()) {
              recaptchaRef?.current?.open();
            }
          }}
          customStyle={{ marginTop: 20 }}
        />
      </KeyboardAwareScrollView>
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

export default Register;
