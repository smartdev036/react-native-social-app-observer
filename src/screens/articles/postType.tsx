import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, StatusBar, View } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { Post } from '../../models/articles';
import { ObsOEmbedI, Topic } from '../../models/articleFields';
import InlineTopic from '../../components/InlineTopic';
import { imageURL } from '../../utils/image';
import PhotoGallery from '../../components/photoGallery';
import Author from '../../components/author';
import { useAppSelector } from '../../hooks';
import { ObsArticleWrapper, ObsLead, ObsPostTitle, ObsState, ObsDate, ObsTopic } from '../../components/global';
import { RenderPostHtml } from '../../components/htmlRenders/RenderPost';
import { Skeleton } from '@rneui/themed';
import { Image } from '@rneui/themed';
import Icon from '../../components/icon';
import { theme } from '../../constants/theme';
import ImageViewer from 'react-native-image-zoom-viewer';

interface PostTypeProps {
  post: Post;
}

export const PostType = (props: PostTypeProps) => {
  const { post } = props;
  const navigation = useNavigation();
  const mainTopic = post.topics.find((t: Topic) => t.mainTopic) as Topic;
  const [postBlocks, setPostBlocks] = useState(post.postBlocks);
  const themeState = useAppSelector(state => state.theme);
  const [visible, setIsVisible] = useState(false);

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
      {post.image ? (
        <>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => {
              setIsVisible(true);
            }}
          >
            <Image
              source={{ uri: imageUrl }}
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
      ) : (
        <PhotoGallery data={post.mainGallery} />
      )}
      <ObsTopic>
        <InlineTopic topic={mainTopic} onPress={handleInlineTopic} />
      </ObsTopic>
      <ObsPostTitle title={post.fullTitle} />
      <ObsLead title={post.lead} />
      <ObsDate>
        <Author post={post} />
        {post.state === 'Em atualização' && <ObsState title={post.state} />}
      </ObsDate>
      <RenderPostHtml post={post} />
    </ObsArticleWrapper>
  );
};

const styles = StyleSheet.create({
  image: {
    aspectRatio: 16 / 9,
    width: '100%',
  },
  closeContainer: {
    padding: 10,
    position: 'absolute',
    zIndex: 1,
    right: 14,
    top: 50,
  },
});

export default PostType;
