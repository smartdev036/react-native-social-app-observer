import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from '../icon';
import { theme } from '../../constants/theme';
import { shareLink } from '../../utils/share';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../../hooks';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ArticleHeaderProps {
  commentEnabled?: boolean;
  commentCount?: number;
  onComment?: any;
  title?: string;
  permalink?: string | '';
  isArticlePage: boolean;
  hasTitle: boolean;
  screenTitle?: string;
  onSaved?: any;
  isSaved?: boolean;
  onBack?: () => void;
  hasDownload?: boolean;
  download?: () => void;
}

const ArticleHeader = (props: ArticleHeaderProps) => {
  const { commentEnabled, commentCount, onComment, title, hasTitle, screenTitle, permalink, isArticlePage, onSaved, isSaved, hasDownload, download } = props;
  const navigation = useNavigation();
  const themeState = useAppSelector(state => state.theme);

  const accessibilityLabel = (commentCount: number | undefined) => {
    if (commentCount === undefined) {
      return 'Comentários. Este artigo ainda não tem comentários.';
    }
    if (commentCount === 1) {
      return `Comentário. Este artigo tem ${commentCount} comentário.`;
    }
    return `Comentários. Este artigo tem ${commentCount} comentários.`;
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: themeState.themeColor.background,
          maxWidth: themeState.themeOrientation.maxW,
        },
      ]}
    >
      <View style={[styles.btnWrapper, { flex: 1, alignItems: 'flex-start', paddingHorizontal: 15 }]}>
        <Pressable
          accessibilityLabel={'Voltar'}
          onPress={async () => {
            if (navigation.getState().routes.length == 2) {
              await AsyncStorage.removeItem('index');
              navigation.dispatch(CommonActions.goBack);
            } else {
              navigation.dispatch(CommonActions.goBack());
            }
          }}
        >
          <Icon name="arrow" size={18} color={themeState.themeColor.color} fill={themeState.themeColor.color} disableFill={false} />
        </Pressable>
      </View>
      <View style={[styles.btnWrapper, { flex: 1, alignItems: 'center' }]}>
        <Text style={[styles.title, { color: themeState.themeColor.title.color }]}>{screenTitle}</Text>
      </View>
      {hasDownload ? (
        <View style={[styles.btnWrapper, { flex: 1, alignItems: 'flex-end', paddingHorizontal: 15 }]}>
          <Pressable accessibilityLabel={'Download'} onPress={download}>
            <Text style={[styles.titleBtn, { color: themeState.themeColor.title.color }]}>Download</Text>
          </Pressable>
        </View>
      ) : (
        <View style={[styles.btnWrapper, { flex: 1, alignItems: 'flex-end', paddingHorizontal: 15 }]} />
      )}
      {!hasTitle && (
        <View style={{ flex: 2, flexDirection: 'row', justifyContent: 'flex-end' }}>
          <Pressable
            accessibilityLabel={'Partilhar'}
            onPress={() => {
              if (permalink) {
                shareLink(title ?? '', permalink);
              }
            }}
            style={[styles.btnContainer, { flex: commentEnabled ? 1 : 2 }]}
          >
            {isArticlePage && (
              <Icon name="share-article" size={18} fill={themeState.themeColor.color} color={themeState.themeColor.color} disableFill={false} />
            )}
          </Pressable>
          <Pressable
            accessibilityLabel={'Guardar artigos ou remover'}
            onPress={() => onSaved()}
            style={[styles.btnContainer, { flex: commentEnabled ? 1 : 2 }]}
          >
            {isArticlePage && (
              <Icon
                name={isSaved ?? false ? 'guardados-2' : 'guardados-1'}
                size={18}
                fill={isSaved ?? false ? theme.colors.brandBlue : themeState.themeColor.color}
                color={isSaved ?? false ? theme.colors.brandBlue : themeState.themeColor.color}
                disableFill={false}
              />
            )}
          </Pressable>
          {commentEnabled && (
            <Pressable accessibilityLabel={accessibilityLabel(commentCount)} onPress={onComment} style={[styles.btnContainer, { flex: 1 }]}>
              <Icon name="comment" size={18} fill={themeState.themeColor.color} color={themeState.themeColor.color} disableFill={false} />
              {commentCount != null && commentCount > 0 && (
                <View style={styles.commentBalloon}>
                  <Text style={[styles.ballonText, { fontSize: commentCount >= 100 ? 10 : 8 }]}>{commentCount >= 100 ? '+99' : commentCount}</Text>
                </View>
              )}
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: theme.styles.headerScreenHeight,
    marginRight: 'auto',
    marginLeft: 'auto',
  },
  btnWrapper: {
    justifyContent: 'center',
  },
  btnContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 40,
  },
  commentBalloon: {
    position: 'absolute',
    top: 10,
    right: 4,
    height: 17,
    width: 17,
    backgroundColor: theme.colors.brandBlue,
    borderRadius: 16 / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ballonText: {
    color: theme.colors.white,
    fontFamily: theme.fonts.halyardRegular,
    textAlign: 'center',
  },
  title: {
    fontSize: 16,
    fontFamily: theme.fonts.halyardSemBd,
  },
  titleBtn: {
    fontSize: 16,
    fontFamily: theme.fonts.halyardRegular,
  },
});

export default ArticleHeader;
