import React, { useEffect, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import { apiBase } from '../api/endpoints';
import { theme } from '../constants/theme';
import ArticleInListWrapper from './article/articleInListWrapper';
import { Post } from '../models/articles';
import Loading from './loading';
import { ArticleListsBorder } from './article/articleListBorder';
import { useAppSelector } from '../hooks';

interface RelatedProps {
  id: number;
  onLayout: (e: LayoutChangeEvent) => void;
}

interface renderItemProps {
  item: Post;
  index: number;
}

const Related = (props: RelatedProps) => {
  const themeState = useAppSelector(state => state.theme);
  const [getRelated, setGetRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { id } = props;

  useEffect(() => {
    getRelatedData();
  }, []);

  // Get Related
  const getRelatedData = async () => {
    await apiBase
      .get(`/lists/related/${id}`)
      .then(response => {
        const posts = response.data as Post[];
        setGetRelated(posts);
        setLoading(false);
      })
      .catch((err: any) => {
        setLoading(true);
        console.log('Error Related', err);
      });
  };

  const RenderItem = (props: renderItemProps) => {
    const { item, index } = props;
    const lastItem = index === getRelated.length - 1;
    return (
      <>
        <ArticleInListWrapper key={index} post={item} />
        <ArticleListsBorder border={!lastItem} />
      </>
    );
  };

  return (
    <View onLayout={props.onLayout} style={{maxWidth: theme.styles.containerMaxWidth, width: '100%', marginRight: 'auto', marginLeft: 'auto'}}>
      {getRelated.length !== 0 && (
        <View style={styles.container}>
          <Text style={[styles.title, { fontSize: themeState.fontStyles.related.fontSize, fontFamily: themeState.fontStyles.related.fontFamily }]}>
            Relacionados
          </Text>
          <View style={styles.border} />
        </View>
      )}
      {loading ? (
        <View style={styles.loading}>
          <Loading color={theme.colors.brandBlack} size={'small'} />
        </View>
      ) : (
        getRelated &&
        getRelated.map((item: Post, index: number) => {
          return (
            <View key={index}>
              <RenderItem item={item} index={index} />
            </View>
          );
        })
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 15,
  },
  title: {
    textTransform: 'uppercase',
    color: theme.colors.brandBlue,
  },
  border: {
    borderWidth: 1,
    borderColor: theme.colors.brandBlue,
    width: 22,
    marginLeft: 2,
  },
  loading: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 30,
  },
});

export default Related;
