import React, { useState } from 'react';
import { StyleSheet, View, Linking, TouchableOpacity, Modal } from 'react-native';
import { theme } from '../../constants/theme';
import InlineTopic from '../../components/InlineTopic';
import { imageURL } from '../../utils/image';
import PhotoGallery from '../../components/photoGallery';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { Topic } from '../../models/articleFields';
import { Post } from '../../models/articles';
import Author from '../../components/author';
import { useAppSelector } from '../../hooks';
import { ObsArticleWrapper, ObsDate, ObsLead, ObsPostTitle, ObsState, ObsText, ObsTopic } from '../../components/global';
import { Skeleton } from '@rneui/themed';
import { Image } from '@rneui/themed';
import ImageViewer from 'react-native-image-zoom-viewer';
import Icon from '../../components/icon';

interface DefaultTypeProps {
  post: Post;
}

const DefaultType = (props: DefaultTypeProps) => {
  const { post } = props;
  const navigation = useNavigation();
  const mainTopic = post.topics.find((t: Topic) => t.mainTopic) as Topic;
  const themeState = useAppSelector(state => state.theme);
  const [visible, setIsVisible] = useState(false);

  const handleLink = () => {
    if (post && post.links.webUri) {
      Linking.openURL(post.links.webUri).then(r => console.log(r));
    } else {
      return;
    }
  };

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
      <View style={styles.textContainer}>
        <ObsText
          title={'Para conseguir ver este artigo, '}
          override={{ fontSize: themeState.fontStyles.defaultTypeText.fontSize, fontFamily: themeState.fontStyles.defaultTypeText.fontFamily }}
        />
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            handleLink();
          }}
        >
          <ObsText
            title={'clique aqui para abri-lo no seu browser.'}
            override={{
              fontSize: themeState.fontStyles.defaultTypeText.fontSize,
              fontFamily: themeState.fontStyles.defaultTypeText.fontFamily,
              color: theme.colors.brandBlue,
            }}
          />
        </TouchableOpacity>
      </View>
    </ObsArticleWrapper>
  );
};

const styles = StyleSheet.create({
  image: {
    aspectRatio: 16 / 9,
    width: '100%',
  },
  textContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  closeContainer: {
    padding: 10,
    position: 'absolute',
    zIndex: 1,
    right: 14,
    top: 50,
  },
});

export default DefaultType;
