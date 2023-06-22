import React, {useEffect, useState} from "react";
import AutoHeightWebView from "react-native-autoheight-webview";
import {Linking, Platform, StyleSheet, View} from "react-native";
import {OS} from "../../../constants";
import {theme} from "../../../constants/theme";
import Loading from "../../loading";
import {PostBlock} from "../../../models/articleFields";
import axios from "axios";
import {useAppSelector} from "../../../hooks";

interface TwitterBlockProps {
  postBlock: PostBlock;
}

const handleClickTweet = (event: { navigationType: string; url: string }) => {
  const { navigationType, url } = event;
  const isExternalLink =
    Platform.OS === OS.ios ? navigationType === "click" : true;
  if (isExternalLink) {
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      }
    });
    return false;
  }
  return true;
};

function TwitterBlock(props: TwitterBlockProps){
  const { postBlock } = props;
  const [html, setHtml] = useState<string | null>(null);
  const themeState = useAppSelector((s) => s.theme);
  useEffect(() => {
    if (postBlock?.url) {
      axios
        .get(
          `https://publish.twitter.com/oembed?lang=pt&align=center&width=250&theme=${themeState.themeColor.theme}&url=${postBlock.url}`
        )
        .then((r) => {
          if(r?.data?.html) {
            let html = getBody(r.data.html)
            setHtml(html);
          }
        });
    }
  }, []);

  function getBody(html: string) {
    return `<!DOCTYPE html>\
    <html>\
      <head>\
        <meta charset="utf-8">\
        <meta name="viewport" content="width=device-width, initial-scale=1.0">\
        </head>\
        <body>\
          ${html}\
        </body>\
    </html>`;
  }
  return (
    <>
      {html ? (
        <AutoHeightWebView
          style={{
            flex: 1,
            opacity: 0.99,
            minHeight: 100,
            width: "100%",
          }}
          originWhitelist={["*"]}
          containerStyle={{marginBottom: 15, width: '100%'}}
          source={{ html: html }}
          scalesPageToFit={false}
          scrollEnabledWithZoomedin={false}
          automaticallyAdjustContentInsets={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          mixedContentMode={"always"}
          scrollEnabled={false}
          bounces={false}
          javaScriptEnabled={true}
          allowsFullscreenVideo={true}
          viewportContent="width=device-width, user-scalable=no"
          onShouldStartLoadWithRequest={handleClickTweet}
        />
      ) : (
        <View style={styles.loadingContainer}>
          <Loading color={theme.colors.brandBlack} size={"small"} />
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
    height: 400,
  },
});

export default TwitterBlock;
