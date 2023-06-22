import { CommonActions, useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import Author from '../../components/author';
import { ObsArticleWrapper, ObsDate, ObsLead, ObsPostTitle, ObsState, ObsTopic } from '../../components/global';
import { RenderPostHtml } from '../../components/htmlRenders/RenderPost';
import InlineTopic from '../../components/InlineTopic';
import PhotoGallery from '../../components/photoGallery';
import { useAppSelector } from '../../hooks';
import { Topic } from '../../models/articleFields';
import { Post } from '../../models/articles';
import { imageURL } from '../../utils/image';
import { Skeleton } from '@rneui/themed';
import { Image } from '@rneui/themed';
import { Modal, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from '../../components/icon';
import { theme } from '../../constants/theme';
import ImageViewer from 'react-native-image-zoom-viewer';

export const EventType: React.FC<{ post: Post }> = ({ post }) => {
  const navigation = useNavigation();
  const mainTopic = post.topics.find((t: Topic) => t.mainTopic) as Topic;
  const [postBlocks, setPostBlocks] = useState(post.postBlocks);
  const themeState = useAppSelector(state => state.theme);
  const [visible, setIsVisible] = useState(false);

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
        <InlineTopic topic={mainTopic ?? ''} onPress={handleInlineTopic ?? ''} />
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
