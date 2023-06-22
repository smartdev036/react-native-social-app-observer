import React, { memo, useEffect, useRef, useState } from 'react';
import { Dimensions, Platform, StyleSheet, View } from 'react-native';
import { TNode } from 'react-native-render-html';
import YoutubePlayer from 'react-native-youtube-iframe';
import { OS } from '../../../constants';
import { ObsOEmbedI, VideoBlockI } from '../../../models/articleFields';
import { Video, AVPlaybackStatusSuccess, AVPlaybackStatusError, ResizeMode } from 'expo-av';
import { theme } from '../../../constants/theme';

function isOembed(pb: VideoBlockI | ObsOEmbedI): pb is ObsOEmbedI {
  return typeof (pb as ObsOEmbedI)?.provider === 'string';
}

export const YoutubeVideoBlock = memo(function VideoBlock({ postBlock }: { postBlock: VideoBlockI | ObsOEmbedI }) {
  const playing = useRef(false);
  const [url, setUrl] = useState<string>();
  const onStateChange = (state: string) => {
    if (state === 'ended') {
      playing.current = false;
    }
  };

  useEffect(() => {
    let urlPre;
    if (isOembed(postBlock)) {
      urlPre = postBlock.url;
      urlPre = urlPre.split('?v=')[1]?.split('&')[0];
      if (typeof urlPre === 'string') {
        setUrl(urlPre);
      } else {
        console.log('YOUTUBE VIDEO BLOCK OEMBED ERROR: ', postBlock.url);
      }
    } else {
      urlPre = postBlock.iframe;
      urlPre = urlPre.split('embed/')[1]?.split('?')[0];
      if (typeof urlPre === 'string') {
        setUrl(urlPre);
      } else {
        console.log('YOUTUBE VIDEO BLOCK ERROR: ', postBlock.iframe);
      }
    }
  }, []);

  return (
    <>
      {url && (
        <YoutubePlayer
          webViewStyle={{ opacity: 0.99 }}
          webViewProps={{
            androidLayerType: Platform.OS === OS.android && Platform.Version <= 22 ? 'hardware' : 'none',
          }}
          height={(Dimensions.get('window').width / 16) * 9}
          play={playing.current}
          videoId={url}
          onChangeState={onStateChange}
          initialPlayerParams={{
            loop: false,
            controls: true,
            showClosedCaptions: false,
            modestbranding: false,
            iv_load_policy: 3,
            rel: false,
            playerLang: 'pt',
            preventFullScreen: false,
          }}
        />
      )}
    </>
  );
});

export function ObsVideo({ tnode }: { tnode: TNode }) {
  const video = React.useRef(null);
  const [status, setStatus] = useState<AVPlaybackStatusSuccess | AVPlaybackStatusError | {}>({});

  return (
    <View style={styles.container}>
      <Video
        ref={video}
        style={{
          width: '100%',
          height: 200,
        }}
        source={{
          uri: tnode.attributes.src,
        }}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        isLooping={false}
        onPlaybackStatusUpdate={status => setStatus(() => status)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    alignItems: 'center',
    width: Dimensions.get('window').width - theme.styles.articleContentHorizontalPadding * 2,
    marginVertical: 10,
  },
});
