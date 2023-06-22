import React from 'react';
import { Image, Platform, StyleSheet, Text, View } from 'react-native';
import Icon from '../icon';
import InlineTopic from '../InlineTopic';
import { getDate } from '../../utils/date';
import { imageURL } from '../../utils/image';
import { theme } from '../../constants/theme';
import { getIconByType } from '../../utils/renderIcon';
import { Post } from '../../models/articles';
import { Topic } from '../../models/articleFields';
import { OS } from '../../constants';
import AuthorImage from '../authorImage';
import { useAppSelector } from '../../hooks';

interface ArticlesListProps {
  post: Post;
}

const ArticleInList = (props: ArticlesListProps) => {
  const { post } = props;
  const iconName = getIconByType(post.type);
  const isLive = post.type === 'obs_liveblog';
  let authorImg: string | undefined = '';
  let authorName = '';

  if (post?.credits[0]?.author) {
    authorImg = imageURL(post.credits[0].author.authorImg.src, 400);
    authorName = post.credits[0].author.displayName;
  } else {
    // TODO Alguem deve ter feito merda com o serialize dos episodios no php
    console.info('CREDITS: ', post.credits[0], post.id);
  }

  const mainTopic = post.topics.find((t: Topic) => t.mainTopic) as Topic;
  const themeState = useAppSelector(state => state.theme);

  return (
    <>
      <View style={styles.container}>
        <InlineTopic topic={mainTopic} />
        <View style={styles.titleContainer}>
          <Text
            style={{
              color: themeState.themeColor.title.color,
              fontSize: themeState.fontStyles.listTitle.fontSize,
              lineHeight: themeState.fontStyles.listTitle.lineHeight,
              fontFamily: themeState.fontStyles.listTitle.fontFamily,
            }}
          >
            {iconName && (post.type === 'obs_opinion' || post.type === 'obs_episode') && (
              <View style={[styles.iconContainer, post.type === 'obs_opinion' && { marginTop: Platform.OS === OS.ios ? 2.3 : 0 }]}>
                <Icon
                  name={iconName}
                  size={16 * themeState.fontScaleFactor}
                  fill={theme.colors.brandBlue}
                  color={theme.colors.brandBlue}
                  disableFill={false}
                  style={Platform.select({
                    ios: {
                      marginRight: 2,
                    },
                    android: {
                      marginRight: 4,
                      marginBottom: post.type === 'obs_episode' ? -3 : 0,
                    },
                  })}
                />
              </View>
            )}
            {isLive && post.liveblog_active && <Text style={styles.liveText}>Em direto/ </Text>}
            {post.title.trim()}
            {isLive && !post.liveblog_active && <Text> - como aconteceu</Text>}
          </Text>
        </View>
        <View style={styles.footer}>
          {post.type !== 'obs_opinion' ? (
            <Text
              style={[
                styles.date,
                {
                  color: themeState.themeColor.color,
                  fontSize: themeState.fontStyles.listDate.fontSize,
                  fontFamily: themeState.fontStyles.listDate.fontFamily,
                },
              ]}
            >
              {getDate(post.pubDate)}
            </Text>
          ) : (
            <Text
              style={[
                styles.date,
                {
                  color: themeState.themeColor.color,
                  fontSize: themeState.fontStyles.listDate.fontSize,
                  fontFamily: themeState.fontStyles.listDate.fontFamily,
                },
              ]}
            >
              {authorName}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.imageContainer}>
        {(post.type === 'obs_episode' || post.hasMainPhotoGallery) && (
          <View style={styles.iconImageContainer}>
            <Icon
              name={post.hasMainPhotoGallery ? 'camera' : 'play'}
              size={18}
              fill={theme.colors.brandBlue}
              color={theme.colors.brandBlue}
              disableFill={false}
            />
          </View>
        )}
        {authorImg && post.type === 'obs_opinion' ? (
          <View
            style={[
              styles.authorContainer,
              {
                backgroundColor: themeState.themeColor.opinionBackgroundImage,
              },
            ]}
          >
            <AuthorImage url={authorImg} style={styles.authorImage} border={false} />
          </View>
        ) : (
          <Image resizeMode="cover" resizeMethod="auto" style={styles.image} source={{ uri: imageURL(post.image, 400) }} />
        )}
      </View>
    </>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 3,
  },
  titleContainer: {
    flexDirection: 'row',
    paddingRight: 15,
    marginTop: 6,
  },
  iconContainer: {
    marginRight: 3,
  },
  liveText: {
    color: theme.colors.brandBlue,
    fontFamily: theme.fonts.halyardSemBd,
  },
  footer: {
    flex: 1,
    flexDirection: 'column-reverse',
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    height: 100,
  },
  iconImageContainer: {
    position: 'absolute',
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
    width: 35,
    height: 35,
    backgroundColor: 'rgba(255,255,255, 0.9)',
    borderRadius: 100,
  },
  image: {
    width: 100,
    height: 100,
    backgroundColor: theme.colors.brandGrey,
  },
  date: {
    alignItems: 'baseline',
  },
  authorContainer: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    width: 85,
    height: 85,
    borderRadius: 50,
  },
  authorImage: {
    height: 55,
    width: 55,
    borderRadius: 55,
  },
});

export default ArticleInList;
