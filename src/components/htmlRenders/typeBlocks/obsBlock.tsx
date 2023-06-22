import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../../../constants/theme';
import { apiBase } from '../../../api/endpoints';
import { Post } from '../../../models/articles';
import { getDate } from '../../../utils/date';
import { imageURL } from '../../../utils/image';
import InlineTopic from '../../InlineTopic';
import { StackActions, useNavigation } from '@react-navigation/native';
import { ObsOEmbedI, Topic } from '../../../models/articleFields';
import { useAppSelector } from '../../../hooks';

interface ObsBlockProps {
  postBlock: ObsOEmbedI;
}

const ObsBlock = (props: ObsBlockProps) => {
  const { url } = props.postBlock;
  const [data, setData] = useState<Post>();
  const mainTopic = data?.topics.find((x: Topic) => x.mainTopic) as Topic;
  const navigation = useNavigation();
  const themeState = useAppSelector(state => state.theme);

  useEffect(() => {
    if (url) {
      getArticleIdByUrl();
    }
  }, []);

  const getArticleIdByUrl = async () => {
    await apiBase
      .get(`/items/url/${url}`)
      .then(response => {
        const posts = response.data as Post;
        setData(posts);
      })
      .catch((err: any) => {
        console.log('Error: Obsblock Getting Article ID by URL', err, url);
      });
  };

  return (
    <View style={styles.container}>
      {data && (
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.wrapper, { backgroundColor: themeState.themeColor.background }]}
          onPress={() => {
            const pushAction = StackActions.push('Article', data);
            navigation.dispatch(pushAction);
          }}
        >
          <View style={styles.textContainer}>
            <View style={{ marginVertical: 2 }}>
              <InlineTopic topic={mainTopic} />
            </View>
            <Text
              numberOfLines={2}
              style={{
                color: themeState.themeColor.color,
                fontSize: themeState.fontStyles.obsBlockTitle.fontSize,
                lineHeight: themeState.fontStyles.obsBlockTitle.lineHeight,
                fontFamily: themeState.fontStyles.obsBlockTitle.fontFamily,
              }}
            >
              {data.title}
            </Text>
            <View style={styles.footer}>
              <Text style={[styles.date, { fontSize: themeState.fontStyles.obsBlockDate.fontSize }]}>{getDate(data.pubDate)}</Text>
            </View>
          </View>
          <Image source={{ uri: imageURL(data.image, 260) }} style={styles.photo} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 10,
  },
  wrapper: {
    flex: 1,
    borderColor: theme.colors.brandGrey,
    borderWidth: 1,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    flexDirection: 'column',
    marginRight: 15,
  },
  footer: {
    flex: 1,
    flexDirection: 'column-reverse',
  },
  date: {
    alignItems: 'baseline',
    color: theme.colors.brandGrey,
  },
  photo: {
    height: 70,
    width: 70,
  },
});

export default ObsBlock;
