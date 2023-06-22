import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { theme } from '../constants/theme';
import { getDateHour } from '../utils/date';
import { Post } from '../models/articles';
import { Credit } from '../models/articleFields';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../hooks';

interface AuthorProps {
  post: Post;
}

const Author = (props: AuthorProps) => {
  const themeState = useAppSelector(state => state.theme);
  const { post } = props;
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.text,
          {
            fontSize: themeState.fontStyles.author.fontSize,
            fontFamily: themeState.fontStyles.author.fontFamily,
            lineHeight: themeState.fontStyles.author.lineHeight,
          },
        ]}
      >
        {getDateHour(post.pubDate)},
        <Text
          style={[
            styles.text,
            {
              fontSize: themeState.fontStyles.author.fontSize,
              fontFamily: themeState.fontStyles.author.fontFamily,
              lineHeight: themeState.fontStyles.author.lineHeight,
            },
          ]}
        >
          {post.credits?.map((c: Credit, index: number) => {
            const data = {
              author: {
                payload: {
                  id: c.author.id,
                  name: c.author.displayName,
                  image: c.author.authorImg.src,
                },
              },
            };
            return (
              <Text
                key={index}
                onPress={() => {
                  navigation.dispatch(CommonActions.navigate('Author', data));
                }}
              >
                <Text style={[styles.text, { color: theme.colors.brandGrey }]}>
                  {index >= 1 && post.credits.length - 1 === index
                    ? ' e ' + c.author.displayName
                    : index >= 1
                    ? ' , ' + c.author.displayName
                    : ' ' + c.author.displayName}
                </Text>
              </Text>
            );
          })}
        </Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexShrink: 1,
  },
  text: {
    color: theme.colors.brandGrey,
  },
});

export default Author;
