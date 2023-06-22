import React from 'react';
import { Text, View } from 'react-native';
import TwitterBlock from './typeBlocks/twitterBlock';
import { obsDevWithHttp, obsDevWithHttps, obsWithHttp, obsWithHttps, twitterProvider, youtubeProvider } from '../../constants';
import ObsBlock from './typeBlocks/obsBlock';
import { ObsOEmbedI } from '../../models/articleFields';
import { YoutubeVideoBlock } from './typeBlocks/videoBlock';

export function ObsOEmbed({ postBlock }: { postBlock: ObsOEmbedI }) {
  const { provider, url } = postBlock;
  if (
    provider?.startsWith(obsWithHttps) ||
    provider?.startsWith(obsWithHttp) ||
    provider?.startsWith(obsDevWithHttps) ||
    provider?.startsWith(obsDevWithHttp) ||
    url.startsWith(obsWithHttp) ||
    url.startsWith(obsWithHttps) ||
    url.startsWith(obsDevWithHttp) ||
    url.startsWith(obsDevWithHttps)
  ) {
    return <ObsBlock postBlock={postBlock} />;
  } else if (provider === twitterProvider) {
    return <TwitterBlock postBlock={postBlock} />;
  } else if (provider?.startsWith(youtubeProvider)) {
    return <YoutubeVideoBlock postBlock={postBlock} />;
  }
  console.log('@@@@@@@@@@@@@@@@@@@@ outro embed @@@@@@@@@@@@@@@@@@@', postBlock);
  return (
    <View>
      <Text></Text>
    </View>
  );
}
