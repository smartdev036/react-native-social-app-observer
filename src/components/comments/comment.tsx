import React, { useEffect, useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import HeaderScreens from '../header/headerScreens';
import { FlatList } from 'react-native-gesture-handler';
import { apiBarbeiro } from '../../api/endpoints';
import Icon from '../icon';
import { Dialog } from 'react-native-elements';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useToast } from 'react-native-toast-notifications';
import { loadComments } from '../../api/commentsApi';
import { useAppSelector } from '../../hooks';
import Loading from '../loading';
import NoComments from './noComments';
import crashlytics from '@react-native-firebase/crashlytics';
import NotAllowedComment from './notAllowedComment';
import BoxComment from './boxComment';
import UserComment from './userComment';
import { strings } from '../../constants/strings';
import { theme } from '../../constants/theme';
import { Analytics, Screens } from '../../services/analytics';

interface ArticleCommentProps {
  id: number;
  route: {
    params: {
      id: number;
    };
  };
}

const Comment = (props: ArticleCommentProps) => {
  const { id } = props.route.params;
  const toast = useToast();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<any>();
  const [comment, setComment] = useState<string | null>();
  const [showDialogLoading, setShowDialogLoading] = useState(false);
  const [expandText, setExpandText] = useState<any>([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [voteLoading, setVoteLoading] = useState<any>();
  const themeState = useAppSelector(state => state.theme);
  const { user, piano } = useAppSelector(state => ({ user: state.auth.user, piano: state.piano }));

  const onHandlerGoBack = (data: any) => {
    if (!data) {
      return;
    }
    const t = [...comments];
    t[comments.findIndex((i: any) => i.id === data.id)] = data;
    setComments(t);
  };

  useEffect(() => {
    Analytics.trackPageView({ screen: Screens.COMMENTS });
    setLoading(true);
    loadComments(id, user)
      .then(x => {
        setLoading(false);
        setComments(x.data);
      })
      .catch(err => {
        console.log('Error: Loading Comments', err);
        crashlytics().recordError(err);
        setLoading(false);
      });
    // eslint-disable-next-line
  }, []);

  const renderItem = ({ item, index }) => {
    const onSelectReport = async () => {
      try {
        if (!user) {
          navigation.dispatch(CommonActions.navigate('Login'));
        }
        if (!piano.isPremium) {
          toast.hideAll();
          return toast.show('Torna-te premium para acederes a esta funcionalidade');
        }
        await apiBarbeiro.post(
          `comments/${item.id}/report`,
          { report: true },
          {
            headers: {
              Authorization: `Bearer ${user.access_token}`,
            },
          },
        );
        Alert.alert(
          '',
          'Obrigado pela sua denúncia. Dependendo do número de denúncias recebidas, este comentário será revisto pela nossa equipa de moderação.',
        );
        loadComments(id, user)
          .then(x => {
            setComments(x.data);
          })
          .catch(err => {
            console.log('error loading comments', err);
          });
      } catch (e) {
        console.log('comment report: ', e);
      }
    };

    const onSelectDelete = async () => {
      try {
        setShowDialogLoading(true);
        if (!user) {
          navigation.dispatch(CommonActions.navigate('Login'));
        }
        await apiBarbeiro.delete(`comments/${item.id}`, {
          headers: {
            Authorization: `Bearer ${user?.access_token}`,
          },
        });
        loadComments(id, user)
          .then(x => {
            setComments(x.data);
          })
          .catch(err => {
            console.log('error loading comments', err);
          });
      } catch (e) {
        toast.hideAll();
        toast.show('Não é possível apagar o comentário');
        console.log('comment delete: ', e);
      } finally {
        setShowDialogLoading(false);
      }
    };

    const expandTextFn = () => {
      const t = [...expandText];
      const indexT = t.findIndex(i => i === item.id);
      indexT === -1 ? t.push(item.id) : t.splice(index, 1);
      setExpandText(t);
    };

    const vote = async () => {
      if (!user) {
        navigation.dispatch(CommonActions.navigate('Login'));
      }
      if (voteLoading) {
        return;
      }
      if (!piano.isPremium) {
        toast.hideAll();
        return toast.show('Torna-te premium para acederes a esta funcionalidade');
      }
      try {
        setVoteLoading(item.id);
        const resp = await apiBarbeiro.post(
          `comments/${item.id}/vote`,
          { score: item.user_score > 0 ? 0 : 1 },
          {
            headers: {
              Authorization: `Bearer ${user?.access_token}`,
            },
          },
        );
        const temp = [...comments];
        temp[temp.findIndex(e => e.id === item.id)].upvotes = resp.data.upvotes;
        temp[temp.findIndex(e => e.id === item.id)].user_score = item.user_score > 0 ? 0 : 1;
        setComments(temp);
      } catch (e) {
        console.log('comment vote : ', e);
      } finally {
        setVoteLoading(null);
      }
    };

    const reply = () => {
      navigation.dispatch(
        CommonActions.navigate('CommentReply', {
          comment: item,
          id,
          user,
          isReponder: true,
          result: onHandlerGoBack,
          index: index,
        }),
      );
    };

    const replyTo = () => {
      navigation.dispatch(
        CommonActions.navigate('CommentReply', {
          comment: item,
          id,
          user,
          result: onHandlerGoBack,
          index: index,
        }),
      );
    };

    return (
      <UserComment
        index={index}
        item={item}
        user={user}
        onSelectReport={onSelectReport}
        onSelectDelete={onSelectDelete}
        expandText={expandTextFn}
        textNumberLines={expandText.find((i: any) => i === item.id) ? undefined : 3}
        vote={vote}
        voteLoading={voteLoading}
        reply={reply}
        replyTo={replyTo}
      />
    );
  };

  const sendComment = async () => {
    if (comment != null && comment.trim() != '') {
      try {
        setCommentLoading(true);
        const resp = await apiBarbeiro.post(
          'comments',
          {
            text: comment,
            html: `<div>${comment}</div>`,
            content_type: 'post',
            object_id: id.toString(),
          },
          {
            headers: {
              Authorization: `Bearer ${user?.access_token}`,
            },
          },
        );
        setComments([resp.data, ...(comments ?? [])]);
      } finally {
        setComment(null);
        setCommentLoading(false);
      }
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeState.themeColor.background }]}>
      <HeaderScreens screenTitle={strings.comments.screenTitle} isArticlePage={false} hasTitle={true} />
      <Dialog isVisible={showDialogLoading} overlayStyle={styles.dialog}>
        <Dialog.Loading loadingProps={{ color: theme.colors.brandBlack }} />
      </Dialog>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{
          flex: 1,
          maxWidth: themeState.themeOrientation.maxW,
          width: '100%',
          marginLeft: 'auto',
          marginRight: 'auto',
          height: '100%',
        }}
      >
        {loading && <Loading color={themeState.themeColor.color} size={'small'} style={styles.loading} />}

        {!loading && (comments?.length ?? 0) === 0 && <NoComments />}

        {!loading && comments?.length > 0 && (
          <FlatList
            data={comments}
            onRefresh={() => {
              loadComments(id, user)
                .then(x => {
                  setComments(x.data);
                })
                .catch(err => {
                  console.log('Error: Loading Comments', err);
                  crashlytics().recordError(err);
                });
            }}
            renderItem={renderItem}
            showsVerticalScrollIndicator={true}
          />
        )}

        {!loading && (!piano.isPremium || !user) && <NotAllowedComment />}

        {!loading && user !== null && piano.isPremium && (
          <BoxComment
            value={comment ?? undefined}
            onChangeText={setComment}
            rightIcon={
              commentLoading ? (
                <Loading color={themeState.themeColor.color} size={'small'} />
              ) : (
                <TouchableOpacity activeOpacity={0.9} onPress={sendComment}>
                  <Icon name="send" size={14} fill={theme.colors.brandBlue} color={theme.colors.brandBlue} />
                </TouchableOpacity>
              )
            }
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  dialog: {
    width: 100,
    height: 100,
  },
  loading: {
    flex: 1,
  },
});

export default Comment;
