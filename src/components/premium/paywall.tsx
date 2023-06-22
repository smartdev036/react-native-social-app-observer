import React from 'react';
import { View, Text, StyleSheet, Platform, ScrollView, Linking, SafeAreaView, Pressable, Modal, Alert } from 'react-native';
import { Post } from '../../models/articles';
import { theme } from '../../constants/theme';
import Box from './box';
import { OS } from '../../constants';
import { strings } from '../../constants/strings';
import { URL_POLICY_COOKIES, URL_TERMS } from '../../api';
import Icon from '../icon';
import { logout, setArticleId, setLoading } from '../../reducers/auth';
import { getSubscriptions, requestSubscription } from 'react-native-iap';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { useNavigation } from '@react-navigation/core';
import { CommonActions } from '@react-navigation/native';
import crashlytics from '@react-native-firebase/crashlytics';
import Loading from '../loading';

interface PaywallProps {
  post?: Post;
  hasCloseBtn?: boolean;
}

interface ValuesProps {
  id: number;
  title: string;
  priceAndroid: string;
  priceIos: string;
  titleMonth: string;
  onClick: any;
}

const Paywall = (props: PaywallProps) => {
  const post = props;
  const { themeState, auth } = useAppSelector(state => ({
    themeState: state.theme,
    auth: state.auth,
  }));
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const canMakePayments = useAppSelector(s => s.piano.canMakePayments);
  const canNotMakePaymentsMsg = 'Detetámos um problema nas suas configurações de pagamento. Ative as compras integradas para poder assinar agora';

  const handlePress = async (value: any) => {
    if (!canMakePayments) {
      Alert.alert('Atenção', canNotMakePaymentsMsg);
      return;
    }
    console.log(value);
    if (Platform.OS === OS.ios) {
      try {
        return await handleSubscriptionRequest(
          value.id === 1
            ? 'pt.observador.ios.Observador.subscriptions.monthly.multiplatform'
            : 'pt.observador.ios.Observador.subscriptions.yearly.multiplatform',
        );
      } catch (e: Error | unknown) {
        console.log('error handleSubscriptionRequest: ', e);
        if ((e as Error).message) {
          crashlytics().recordError(e as Error);
        }
        crashlytics().log('error handleSubscriptionRequest: ios');
      }
    }
    if (Platform.OS === OS.android) {
      try {
        return await handleSubscriptionRequest(value.id === 1 ? 'app_individual_monthly_multiplatform' : 'app_individual_yearly_multiplatform');
      } catch (e) {
        console.log('error handleSubscriptionRequest: android ', e);
        if ((e as Error).message) {
          crashlytics().recordError(e as Error);
        }
        crashlytics().log('error handleSubscriptionRequest: android');
      }
    }
  };

  const values = [
    {
      id: 1,
      title: 'Mensal',
      priceAndroid: '6,60€',
      priceIos: '6,49€',
      titleMonth: ' /mês',
      onClick: null,
      termId: Platform.OS === OS.ios ? 'TM07FOM500X0' : 'TMJUF6ZO0D1O',
    },
    {
      id: 2,
      title: 'Anual',
      priceAndroid: '66€',
      priceIos: '65,99€',
      titleMonth: ' /ano',
      onClick: null,
      termId: Platform.OS === OS.ios ? 'TMWCO0BT9XSB' : 'TMMUES5BH7Q2',
    },
  ];

  function dispatchArticleId() {
    dispatch(
      setArticleId({
        name: 'Article',
        key: navigation.getState().key,
        params: post.post,
      }),
    );
  }

  async function handleSubscriptionRequest(
    type:
      | 'app_individual_monthly_multiplatform'
      | 'app_individual_yearly_multiplatform'
      | 'pt.observador.ios.Observador.subscriptions.monthly.multiplatform'
      | 'pt.observador.ios.Observador.subscriptions.yearly.multiplatform',
  ) {
    try {
      await getSubscriptions({ skus: [type] });
      dispatchArticleId();
      dispatch(setLoading(true));
      await requestSubscription({
        sku: type,
        subscriptionOffers: [{ sku: type, offerToken: '' }],
      });
    } catch (err) {
      console.log('Error: Request subscription failed @@@@@@@@@@@@@@@@@@@@', err);
    }
  }

  return (
    <SafeAreaView accessible={false} style={[styles.wrapper, { backgroundColor: themeState.themeColor.background }]}>
      <Modal transparent={true} statusBarTranslucent={true} visible={auth.stateLoading}>
        <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <Loading size={'small'} color={theme.colors.white} />
        </View>
      </Modal>
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        contentContainerStyle={{ position: 'relative' }}
        style={[styles.wrapper, { backgroundColor: themeState.themeColor.background }]}
      >
        {props.hasCloseBtn ? (
          <Pressable
            accessibilityLabel={'Fechar'}
            style={styles.closeBtn}
            onPress={() => {
              if (navigation.canGoBack()) {
                const state = navigation.getState();
                if (state.index === 0) {
                  navigation.dispatch(
                    CommonActions.reset({
                      index: 1,
                      routes: [{ name: 'Home' }],
                    }),
                  );
                } else {
                  navigation.dispatch(CommonActions.goBack);
                }
              }
            }}
          >
            <Icon name="close" size={20} color={themeState.themeColor.color} fill={themeState.themeColor.color} />
          </Pressable>
        ) : null}

        <View style={[styles.container, { paddingTop: props.hasCloseBtn ? 62 : 0 }]}>
          <Text
            style={[
              styles.title,
              {
                color: themeState.themeColor.color,
                fontSize: themeState.fontStyles.paywallTitle.fontSize,
                lineHeight: themeState.fontStyles.paywallTitle.lineHeight,
                fontFamily: themeState.fontStyles.paywallTitle.fontFamily,
              },
            ]}
          >
            {strings.paywall.title}
          </Text>
          {values.map((value: ValuesProps) => {
            return (
              <View key={value.id}>
                <Box
                  title={value.title}
                  priceAndroid={value.priceAndroid}
                  priceIos={value.priceIos}
                  titleMonth={value.titleMonth}
                  onClick={() => handlePress(value)}
                />
              </View>
            );
          })}
          {Platform.OS === OS.ios ? (
            <View style={styles.iosTextWrapper}>
              <View style={styles.infoWrapper}>
                {!canMakePayments && (
                  <View style={{ paddingBottom: 10 }}>
                    <Text style={{ fontSize: 12, color: theme.colors.brandRed }}>
                      {canNotMakePaymentsMsg + ' ou entre em contacto com o Apoio ao cliente.'}
                    </Text>
                  </View>
                )}
                <Text
                  style={{
                    color: themeState.themeColor.color,
                    fontSize: themeState.fontStyles.paywallInfo.fontSize,
                    lineHeight: themeState.fontStyles.paywallInfo.lineHeight,
                    fontFamily: themeState.fontStyles.paywallInfo.fontFamily,
                  }}
                >
                  {strings.paywall.info}
                </Text>
                <View style={[styles.links, { marginTop: 14 }]}>
                  <Text
                    style={{
                      color: themeState.themeColor.color,
                      fontSize: themeState.fontStyles.paywallTextLinks.fontSize,
                      lineHeight: themeState.fontStyles.paywallTextLinks.lineHeight,
                      fontFamily: themeState.fontStyles.paywallTextLinks.fontFamily,
                    }}
                  >
                    Consulte aqui a
                  </Text>
                  <Pressable
                    onPress={() => {
                      Linking.openURL(URL_POLICY_COOKIES);
                    }}
                  >
                    <Text
                      style={{
                        color: theme.colors.brandBlue,
                        fontSize: themeState.fontStyles.paywallTextLinks.fontSize,
                        lineHeight: themeState.fontStyles.paywallTextLinks.lineHeight,
                        fontFamily: themeState.fontStyles.paywallTextLinks.fontFamily,
                      }}
                    >
                      {' '}
                      Política de Privacidade
                    </Text>
                  </Pressable>
                </View>
                <View style={[styles.links, { marginBottom: 12 }]}>
                  <Text
                    style={{
                      color: themeState.themeColor.color,
                      fontSize: themeState.fontStyles.paywallTextLinks.fontSize,
                      lineHeight: themeState.fontStyles.paywallTextLinks.lineHeight,
                      fontFamily: themeState.fontStyles.paywallTextLinks.fontFamily,
                    }}
                  >
                    Consulte aqui os
                  </Text>
                  <Pressable
                    onPress={() => {
                      Linking.openURL(URL_TERMS).then();
                    }}
                  >
                    <Text
                      style={{
                        color: theme.colors.brandBlue,
                        fontSize: themeState.fontStyles.paywallTextLinks.fontSize,
                        lineHeight: themeState.fontStyles.paywallTextLinks.lineHeight,
                        fontFamily: themeState.fontStyles.paywallTextLinks.fontFamily,
                      }}
                    >
                      {' '}
                      Termos e Condições
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ) : (
            <View />
          )}
        </View>
      </ScrollView>
      <View
        style={[
          styles.footerWrapper,
          {
            backgroundColor: themeState.themeColor.background,
            borderColor: themeState.themeColor.paywall.border,
          },
        ]}
      >
        <View style={styles.footer}>
          <Text
            style={{
              color: themeState.themeColor.color,
              fontSize: themeState.fontStyles.paywallFooterText.fontSize,
              lineHeight: themeState.fontStyles.paywallFooterText.lineHeight,
              fontFamily: themeState.fontStyles.paywallFooterText.fontFamily,
            }}
          >
            Já tem assinatura?
          </Text>
          <Pressable
            onPress={() => {
              dispatchArticleId();
              dispatch(logout());
              navigation.dispatch(CommonActions.navigate('Login'));
            }}
          >
            <Text
              style={{
                color: theme.colors.brandBlue,
                fontSize: themeState.fontStyles.paywallFooterText.fontSize,
                lineHeight: themeState.fontStyles.paywallFooterText.lineHeight,
                fontFamily: themeState.fontStyles.paywallFooterText.fontFamily,
              }}
            >
              {' '}
              Faça login
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

const sizeFooter = 23;

const styles = StyleSheet.create({
  closeBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 3,
  },
  wrapper: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 3,
    width: '100%',
    height: '100%',
  },
  container: {
    width: '100%',
  },
  title: {
    textAlign: 'center',
    marginBottom: 23,
  },
  iosTextWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20 + sizeFooter,
  },
  infoWrapper: {
    paddingHorizontal: 20,
  },
  links: {
    flexDirection: 'row',
    paddingVertical: 6,
  },
  footerWrapper: {
    borderTopWidth: 1,
    position: 'absolute',
    bottom: 0,
    left: 0,
    zIndex: 3,
    width: '100%',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
  },
});

export default Paywall;
