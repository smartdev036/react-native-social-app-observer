import React, { useEffect, useState } from 'react';
import { Dimensions, Modal, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { imageURL } from '../../utils/image';
import { theme } from '../../constants/theme';
import { OS } from '../../constants';
import { apiPodcasts } from '../../api/endpoints';
import YoutubePlayer from 'react-native-youtube-iframe';
import Icon from '../../components/icon';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { Post } from '../../models/articles';
import { ObsOEmbedI, Topic } from '../../models/articleFields';
import axios from 'axios';
import Loading from '../../components/loading';
import { useAppSelector } from '../../hooks';
import { ObsArticleWrapper, ObsLead, ObsPostTitle, ObsTopic } from '../../components/global';
import { getYoutubeId } from '../../utils/getYoutubeVideoId';
import InlineTopic from '../../components/InlineTopic';
import { Skeleton } from '@rneui/themed';
import { Image } from '@rneui/themed';
import ImageViewer from 'react-native-image-zoom-viewer';

interface EpisodeTypeProps {
  post: Post;
}

const imageHeight = Math.round((Dimensions.get('window').width * 7) / 12.4);

const EpisodeType = (props: EpisodeTypeProps) => {
  const { post } = props;
  const navigation = useNavigation();
  const mainTopic = post.topics.find((t: Topic) => t.mainTopic) as Topic;
  const [loading, setLoading] = useState<boolean>();
  const [episodes, setEpisodes] = useState<any>();
  const [postBlocks, setPostBlocks] = useState(post.postBlocks);
  const themeState = useAppSelector(state => state.theme);
  const [visible, setIsVisible] = useState(false);

  useEffect(() => {
    let isMounted = true;
    loadEpisodes().then(resp => {
      if (isMounted) {
        setEpisodes(resp);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const loadEpisodes = async () => {
    try {
      // FIXME tipar isto
      setLoading(true);
      const resp = await apiPodcasts.get(`episodes/${post.program.slug}/${post.id}`);
      return resp.data.data;
    } catch (e) {
      console.log('apiPodcasts.get: ', e);
    } finally {
      setLoading(false);
    }
  };

  async function getPostBlocks() {
    const pbS = [];
    for (const pB of post.postBlocks) {
      if (pB.type === 'oEmbed') {
        const oEmbed = pB as ObsOEmbedI;
        const r = await axios(oEmbed.provider + '?url=' + oEmbed.url);
        oEmbed.html = r.data.html;
      }
      pbS.push(pB);
    }
    return pbS;
  }

  useEffect(() => {
    getPostBlocks().then(pBs => {
      setPostBlocks(pBs);
    });
  }, []);

  const handleInlineTopic = () => {
    navigation.dispatch(CommonActions.navigate('TopicsDetails', { topic: mainTopic }));
  };

  const RenderHeader = () => {
    return (
      <TouchableOpacity activeOpacity={0.9} onPress={() => setIsVisible(!visible)} style={styles.closeContainer}>
        <Icon name={'close'} size={20} disableFill={false} fill={theme.colors.white} color={theme.colors.white} />
      </TouchableOpacity>
    );
  };

  const imageUrl = imageURL(post.image, themeState.themeOrientation.imageW);
  const imageUrls = imageUrl ? [{ url: imageUrl }] : [];

  return (
    <ObsArticleWrapper related={post.id}>
      {post.program?.programType.includes('video') &&
        (loading ? (
          <Loading size={'small'} style={{ height: imageHeight }} />
        ) : (
          <YoutubePlayer
            webViewProps={{
              androidLayerType: Platform.OS === OS.android && Platform.Version <= 22 ? 'hardware' : 'none',
            }}
            height={imageHeight}
            videoId={getYoutubeId(episodes?.playback[0]?.platform?.url)}
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
        ))}
      {/* todo: remove later */}
      {(post.program?.programType.includes('podcast') || post.program?.programType.includes('audio')) && (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            if (episodes) {
              navigation.dispatch(CommonActions.navigate('Episode', episodes));
            }
          }}
        >
          <View>
            <>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => {
                  setIsVisible(true);
                }}
              >
                <Image
                  source={{ uri: imageURL(post.image, themeState.themeOrientation.imageW) }}
                  resizeMode="cover"
                  style={styles.image}
                  PlaceholderContent={<Skeleton width={themeState.themeOrientation.imageW} style={{ height: '100%' }} />}
                />
              </TouchableOpacity>
              <Modal visible={visible} statusBarTranslucent={true}>
                <ImageViewer
                  enableSwipeDown={true}
                  onSwipeDown={() => setIsVisible(false)}
                  swipeDownThreshold={40}
                  renderIndicator={() => <></>}
                  imageUrls={imageUrls}
                  renderHeader={() => <RenderHeader />}
                />
              </Modal>
            </>
            <View style={{ position: 'absolute', left: '50%', top: '50%' }}>
              <View style={{ position: 'relative', left: '-50%', top: '-50%' }}>
                <View
                  style={{
                    padding: 14,
                    backgroundColor: theme.colors.white,
                    borderRadius: 100,
                  }}
                >
                  <Icon name={'play'} size={24} color={theme.colors.brandBlue} fill={theme.colors.brandBlue} />
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      )}
      <ObsTopic>
        <InlineTopic topic={mainTopic} onPress={handleInlineTopic} />
      </ObsTopic>
      <ObsPostTitle title={post.fullTitle} />
      <ObsLead title={post.lead} />
    </ObsArticleWrapper>
  );
};

const styles = StyleSheet.create({
  image: {
    aspectRatio: 16 / 9,
    width: '100%',
  },
  separator: {
    borderWidth: 0.5,
    borderColor: theme.colors.brandGrey,
    flex: 1,
    width: 60,
    marginTop: 30,
    opacity: 0.4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeContainer: {
    padding: 10,
    position: 'absolute',
    zIndex: 1,
    right: 14,
    top: 50,
  },
});

export default EpisodeType;
