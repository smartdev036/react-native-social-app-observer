import React, { FC } from 'react';
import { Linking } from 'react-native';
import { HtmlBlockI } from '../../../models/articleFields';
import AutoHeightWebView from 'react-native-autoheight-webview';
import { useAppSelector } from '../../../hooks';

export const HtmlBlock: FC<{ postBlock: HtmlBlockI }> = ({ postBlock }) => {
  const themeState = useAppSelector(state => state.theme);

  return (
    <>
      {postBlock.html ? (
        <AutoHeightWebView
          style={{
            opacity: 0.99,
            minHeight: 1,
            width: '100%',
          }}
          customStyle={`*{background-color:${themeState.themeColor.background};color:${themeState.themeColor.color}}`}
          originWhitelist={['*']}
          containerStyle={{ marginBottom: 15, width: '100%' }}
          source={{ html: postBlock.html }}
          scalesPageToFit={false}
          scrollEnabledWithZoomedin={false}
          automaticallyAdjustContentInsets={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          mixedContentMode={'always'}
          scrollEnabled={false}
          bounces={false}
          javaScriptEnabled={true}
          allowsFullscreenVideo={true}
          viewportContent="width=device-width, user-scalable=no"
          onShouldStartLoadWithRequest={event => {
            const { url } = event;
            const fbURL = url.includes('facebook') && url.includes('share');
            const lkURL = url.includes('linkedin') && url.includes('share');
            const twURL = url.includes('twitter') && url.includes('share');
            if (fbURL || lkURL || twURL) {
              Linking.openURL(url);
              return false;
            }
            return true;
          }}
          removeClippedSubviews={true}
          setSupportMultipleWindows={false}
        />
      ) : (
        <></>
      )}
    </>
  );
};
