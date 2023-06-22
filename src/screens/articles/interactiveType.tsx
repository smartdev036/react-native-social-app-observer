import React, { useState } from 'react';
import { StyleSheet, Text, View, Linking, TouchableOpacity, Modal } from 'react-native';
import { theme } from '../../constants/theme';
import InlineTopic from '../../components/InlineTopic';
import { imageURL } from '../../utils/image';
import PhotoGallery from '../../components/photoGallery';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { Post } from '../../models/articles';
import { Topic } from '../../models/articleFields';
import Author from '../../components/author';
import { useAppSelector } from '../../hooks';
import { ObsArticleWrapper, ObsDate, ObsLead, ObsPostTitle, ObsState, ObsTopic } from '../../components/global';
import { Skeleton } from '@rneui/themed';
import { Image } from '@rneui/themed';
import Icon from '../../components/icon';
import ImageViewer from 'react-native-image-zoom-viewer';

interface InteractiveTypeProps {
  post: Post;
}
export const ThisIsAWebArticle: React.FC<{ link: string }> = ({ link }) => {
  const themeState = useAppSelector(state => state.theme);
  const handleLink = () => {
    if (link) {
      Linking.openURL(link).then(r => console.log(r));
    } else {
      return;
    }
  };

  return (
    <View
      style={[
        styles.grayBox,
        {
          backgroundColor: themeState.themeColor.backgroudGray,
        },
      ]}
    >
      <Text
        style={{
          fontSize: themeState.fontStyles.interactiveText.fontSize,
          color: themeState.themeColor.color,
          fontFamily: themeState.fontStyles.interactiveText.fontFamily,
        }}
      >
        Para conseguir ver este artigo,{' '}
      </Text>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          handleLink();
        }}
      >
        <Text
          style={{
            fontSize: themeState.fontStyles.interactiveText.fontSize,
            color: theme.colors.brandBlue,
            fontFamily: themeState.fontStyles.interactiveText.fontFamily,
          }}
        >
          clique aqui para abri-lo no seu browser.
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const InteractiveType = (props: InteractiveTypeProps) => {
  const { post } = props;
  const navigation = useNavigation();
  const mainTopic = post.topics.find((t: Topic) => t.mainTopic) as Topic;
  const handleInlineTopic = () => {
    navigation.dispatch(CommonActions.navigate('TopicsDetails', { topic: mainTopic }));
  };
  const themeState = useAppSelector(state => state.theme);
  const [visible, setIsVisible] = useState(false);

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
      <ThisIsAWebArticle link={post.links.webUri ?? ''} />
    </ObsArticleWrapper>
  );
};

const styles = StyleSheet.create({
  image: {
    aspectRatio: 16 / 9,
    width: '100%',
  },
  grayBox: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    marginTop: 20,
    padding: 5,
  },
  closeContainer: {
    padding: 10,
    position: 'absolute',
    zIndex: 1,
    right: 14,
    top: 50,
  },
});

export default InteractiveType;
