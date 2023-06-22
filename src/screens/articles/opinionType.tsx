import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../../constants/theme';
import { Post } from '../../models/articles';
import AuthorImage from '../../components/authorImage';
import { useAppSelector } from '../../hooks';
import { ObsArticleWrapper, ObsDate, ObsLead, ObsState } from '../../components/global';
import { RenderPostHtml } from '../../components/htmlRenders/RenderPost';
import { ObsPostTitle } from '../../components/global';
import Author from '../../components/author';

interface OpinionTypeProps {
  post: Post;
}

const OpinionType = (args: OpinionTypeProps) => {
  const post = args.post as Post;
  const image = post.credits[0].author.authorImg.src;
  const themeState = useAppSelector(state => state.theme);

  return (
    <ObsArticleWrapper related={post.id}>
      <View style={styles.imgContainer}>
        {image && <AuthorImage url={image} border={true} style={styles.image} />}
        <Text style={[styles.author, { color: themeState.themeColor.color }]}>{post.credits[0].author.displayName}</Text>
      </View>
      <View style={styles.fullTitleContainer}>
        <ObsPostTitle title={post.fullTitle} override={{ textAlign: 'center' }} />
      </View>
      <ObsLead title={post.lead} override={styles.leadText} />
      <ObsDate override={{ display: 'flex', alignItems: 'center' }}>
        <Author post={post} />
        {post.state === 'Em atualização' && <ObsState title={post.state} />}
      </ObsDate>
      <RenderPostHtml post={post} />
    </ObsArticleWrapper>
  );
};

const styles = StyleSheet.create({
  imgContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    height: 100,
    width: 100,
    borderRadius: 100,
  },
  author: {
    marginTop: 8,
    textAlign: 'center',
    fontFamily: theme.fonts.halyardBook,
    fontSize: 12,
  },
  fullTitleContainer: {
    justifyContent: 'center',
    marginVertical: 10,
  },
  leadText: {
    textAlign: 'center',
  },
});

export default OpinionType;
