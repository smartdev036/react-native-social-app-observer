import React, { useState } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from '@rneui/themed';
import InlineTopic from '../InlineTopic';
import { theme } from '../../constants/theme';
import { imageURL } from '../../utils/image';
import { Post } from '../../models/articles';
import { Topic } from '../../models/articleFields';
import { useAppSelector } from '../../hooks';
import { Skeleton } from '@rneui/themed';

interface HeadlineProp {
  post: Post;
}

const Headline = (props: HeadlineProp) => {
  const { post } = props;
  const [valid, setValid] = useState(true);
  const isLive = post.type === 'obs_liveblog';
  const mainTopic = post.topics.find((t: Topic) => t.mainTopic) as Topic;
  const themeState = useAppSelector(state => state.theme);

  return (
    <>
      <View>
        <View style={styles.container}>
          <Image
            onError={() => setValid(false)}
            source={{ uri: post.headline_image ? imageURL(post.headline_image, themeState.themeOrientation.imageW) : undefined }}
            resizeMode="cover"
            style={styles.image}
            PlaceholderContent={<Skeleton width={themeState.themeOrientation.imageW} style={{ height: '100%' }} />}
          />
          <LinearGradient
            colors={[
              themeState.themeColor.transparent,
              valid && post.image ? 'rgba(0,0,0,0.8)' : themeState.themeColor.transparent,
              valid && post.image ? 'rgba(0,0,0,1)' : themeState.themeColor.transparent,
            ]}
            style={styles.linearGradient}
          >
            <InlineTopic topic={mainTopic} isHeadline={true} />
            <Text
              style={[
                styles.title,
                {
                  fontSize: themeState.fontStyles.headline.fontSize,
                  lineHeight: themeState.fontStyles.headline.lineHeight,
                  fontFamily: themeState.fontStyles.headline.fontFamily,
                },
              ]}
            >
              {isLive && post.liveblog_active && <Text style={styles.liveText}>Em direto/ </Text>}
              {post.title}
              {isLive && !post.liveblog_active && <Text> - como aconteceu</Text>}
            </Text>
          </LinearGradient>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  image: {
    aspectRatio: 16 / 9,
    width: '100%',
  },
  linearGradient: {
    flex: 1,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingHorizontal: 15,
    paddingBottom: 15,
    paddingTop: 30,
  },
  title: {
    color: theme.colors.white,
    textAlign: 'left',
  },
  liveText: {
    color: theme.colors.brandBlue,
  },
});

export default Headline;
