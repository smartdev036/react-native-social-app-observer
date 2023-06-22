import React from 'react';
import { WebView } from 'react-native-webview';
import { SafeAreaView, Alert, Dimensions, StyleSheet } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';
import { useAppSelector } from '../hooks';

export function Feedback() {
  const user = useAppSelector(s => s.auth.user);
  const version = DeviceInfo.getVersion();
  const system = DeviceInfo.getSystemName() + ' ' + DeviceInfo.getSystemVersion();
  const device = DeviceInfo.getBrand() + ' ' + DeviceInfo.getModel();
  //const url=`https://observador.typeform.com/to/me8Cbya0?device=${device}&appversion=${version}&system=${system}&email=${user?.user.email}`
  const themeState = useAppSelector(state => state.theme);

  const searchParams = new URLSearchParams({
    device: device,
    appversion: version,
    system: system,
    email: user?.user.email || '',
  });

  const url = `https://observador.typeform.com/to/me8Cbya0?${searchParams.toString()}`;

  const navigation = useNavigation();

  const onSubmit = () => {
    Alert.alert('Sucesso', 'O seu feedback foi recebido com sucesso.\nObrigado por nos ajudar a melhorar a app do Observador.', [
      {
        onPress() {
          navigation.dispatch(CommonActions.goBack());
        },
      },
    ]);
  };
  const onClose = () => navigation.dispatch(CommonActions.goBack());

  let typeformElm: WebView<{
    originWhitelist: string[];
    ref: unknown;
    style: { height: number };
    source: { html: string };
    scrollEnabled: true;
    onLoadEnd: () => void;
    onMessage: (event: any) => void;
  }> | null = null;

  const onLoad = () => {
    const options = {
      mode: 'popup',
      hideHeaders: true,
      hideFooter: true,
      opacity: 1,
      buttonText: '',
    };

    if (typeformElm) {
      const stringifedOptions = JSON.stringify(JSON.stringify(options));
      const embedCode = `
      {
        const onSubmit = () => window.ReactNativeWebView.postMessage("onSubmit")
        const onClose = () => window.ReactNativeWebView.postMessage("onClose")
        const options = Object.assign({}, JSON.parse(${stringifedOptions}), {onSubmit,onClose})
        const ref = typeformEmbed.makePopup('${url}', options)
        ref.open()
      }
      true
      `;
      typeformElm.injectJavaScript(embedCode);
    }
  };

  const onMessage = (event: { nativeEvent: { data: any } }) => {
    const { data } = event.nativeEvent;
    if (data === 'onSubmit') return onSubmit();
    if (data === 'onClose') return onClose();
  };

  return (
    <SafeAreaView style={[styles.safeAreaView, { backgroundColor: themeState.themeColor.background }]}>
      <WebView
        originWhitelist={['*']}
        ref={el => (typeformElm = el)}
        style={{ height: Dimensions.get('screen').height }}
        source={{
          html: '<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><script src="https://embed.typeform.com/embed.js"></script></head><div id="typeform-embed">Loading...</div></html>',
        }}
        scrollEnabled={true}
        onLoadEnd={onLoad}
        onMessage={onMessage}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
  },
});
