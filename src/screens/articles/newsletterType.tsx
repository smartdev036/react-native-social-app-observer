import React from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { theme } from '../../constants/theme';
import { Post } from '../../models/articles';
import AutoHeightWebView from 'react-native-autoheight-webview';
import Author from '../../components/author';
import Loading from '../../components/loading';
import { useAppSelector } from '../../hooks';
import { ObsArticleWrapper, ObsDate, ObsLead, ObsPostTitle, ObsState } from '../../components/global';
import { LOG } from '../../utils/logger';

interface NewsletterTypeProps {
  post: Post;
}

const NewsletterType = (props: NewsletterTypeProps) => {
  const { post } = props;
  const source = { html: post.body };
  const themeState = useAppSelector(state => state.theme);

  return (
    <ObsArticleWrapper related={post.id}>
      <ObsPostTitle title={post.fullTitle} override={{textAlign: 'justify', marginHorizontal: theme.styles.articleContentHorizontalPadding}} />
      <ObsLead title={post.lead} />
      <ObsDate>
        <Author post={post} />
        {post.state === 'Em atualização' && <ObsState title={post.state} />}
      </ObsDate>
      <AutoHeightWebView
        scalesPageToFit={false}
        bounces={false}
        minimumFontSize={themeState.fontStyles.text.fontSize * themeState.fontScaleFactor}
        scrollEnabled={false}
        cacheEnabled={false}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        injectedJavaScript={"document.body.style.userSelect = 'none'"}
        viewportContent="width=device-width, user-scalable=no"
        customStyle={`
            .opinion-right-side table {
              width: 272px;
            }
            .opiniao-col-lead {
              width: 97%;
            }
            table {
              background-color: ${themeState.themeColor.background}
            }
            p, b, span, td, tr, li, h1, h2, h3, h4, h5, h6 {
              color: ${themeState.themeColor.color}
            }
            #tr-newsletter-header {
              display: none;
            }
            #tr-newslleter-top-header {
              display: none;
            }
            #tr-newsletter-footer {
              display: none;
            }
            .newsletter-cta {
              display: none;
            }
          `}
        onShouldStartLoadWithRequest={request => {
          Linking.openURL(request.url).catch(x => {
            LOG.info('ERROR OPEN URL', x);
          });
          return false;
        }}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={{ marginVertical: 20 }}>
            <Loading color={themeState.themeColor.color} size={'small'} />
          </View>
        )}
        style={{ maxWidth: '100%' }}
        source={source}
      />
    </ObsArticleWrapper>
  );
};

export default NewsletterType;
