import { FC, memo, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../../constants/theme';
import Icon from '../../icon';
import { AudioBlockI } from '../../../models/articleFields';
import React from 'react';
import { State } from 'react-native-track-player';
import { TNode } from 'react-native-render-html';
import { useBetterPlayer } from '../../../utils/useBetterPlayer';
import { Analytics } from '../../../services/analytics';
import { netAudienceStrings } from '../../../constants/strings';
import { useAppSelector } from '../../../hooks';

export const AudioPlayerBlock: FC<{ postBlock: AudioBlockI | { audio: string; caption: string } }> = ({ postBlock }) => {
  const themeState = useAppSelector(state => state.theme);
  const { audio, caption } = postBlock;
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [icon, setIcon] = useState('circle-play');
  const { getState, playing, switchTrackAndPlay, pauseTrack } = useBetterPlayer();

  useEffect(() => {
    getState().then(s => {
      if (s.currTrack?.url === audio && s.currState === State.Playing) {
        setIsPlaying(true);
        setIcon('circle-pause');
      } else {
        setIcon('circle-play');
        setIsPlaying(false);
      }
    });
  }, [playing]);

  return (
    <>
      <View style={styles.container}>
        <View style={styles.playerContainer}>
          <View style={styles.btnContainer}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={async () => {
                if (!isPlaying) {
                  await switchTrackAndPlay({
                    url: audio,
                    description: caption,
                    artwork: require('../../../assets/images/icon_radio.png'),
                    artist: 'Observador',
                    title: caption,
                  });
                  Analytics.startAudioRefresh(netAudienceStrings.audioRefresh);
                } else {
                  await pauseTrack();
                  Analytics.clearAudioRefreshInterval();
                }
              }}
              style={styles.circleBtn}
            >
              <Icon name={icon} size={24} color={theme.colors.white} fill={theme.colors.white} disableFill={false} />
            </TouchableOpacity>
          </View>
          <View style={styles.captionContainer}>
            <Text
              numberOfLines={3}
              style={[
                styles.caption,
                { fontSize: themeState.fontStyles.audioBlockCaption.fontSize, fontFamily: themeState.fontStyles.audioBlockCaption.fontFamily },
              ]}
            >
              {caption}
            </Text>
          </View>
        </View>
      </View>
    </>
  );
};

export const AudioPlayerTag = memo(
  function AudioPlayerTag({ tnode }: { tnode: TNode }) {
    return <AudioPlayerBlock postBlock={{ audio: tnode.attributes.src, caption: '' }} />;
  },
  (old, next) => old.tnode.attributes.src !== next.tnode.attributes.src,
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.brandDarkBlue,
    padding: 15,
    marginVertical: 10,
  },
  playerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  btnContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleBtn: {
    borderWidth: 2,
    borderColor: theme.colors.white,
    borderRadius: 100,
    padding: 10,
  },
  captionContainer: {
    flexDirection: 'row',
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  caption: {
    color: theme.colors.white,
  },
});
