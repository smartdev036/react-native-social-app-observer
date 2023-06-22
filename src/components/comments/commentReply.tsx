import React, { useEffect, useRef, useState } from 'react';
import { Alert, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { theme } from '../../constants/theme';
import HeaderScreens from '../header/headerScreens';
import { apiBarbeiro } from '../../api/endpoints';
import Icon from '../icon';
import { getDate } from '../../utils/date';
import { Dialog } from 'react-native-elements';
import { Menu, MenuTrigger, MenuOptions, MenuOption } from 'react-native-popup-menu';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useToast } from 'react-native-toast-notifications';
import { useAppSelector } from '../../hooks';
import Loading from '../loading';
import { strings } from '../../constants/strings';
import BoxComment from './boxComment';
import { UserToken } from '../../services/auth';

interface CommentReplyProps {
  route: {
    params: {
      id: number;
      isReponder: any;
      result: any;
      comment: any;
    };
  };
  user: {
    user: UserToken;
  };
}

const CommentReply = (props: CommentReplyProps) => {
  const navigation = useNavigation();
  const { id, isReponder, result } = props.route.params;
  const inputRef = useRef<any>(null);
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const user = useAppSelector(state => state.auth.user);
  const [comment, setComment] = useState<any>();
  const [text, setText] = useState<string | any>();
  const [expandText, setExpandText] = useState<any>([]);
  const [voteLoading, setVoteLoading] = useState<number | null>();
  const [commentLoading, setCommentLoading] = useState(false);
  const [reply, setReply] = useState<any>();
  const { themeState, piano } = useAppSelector(state => ({ themeState: state.theme, piano: state.piano }));

  useEffect(() => {
    setComment(props.route.params.comment);
    setReply(props.route.params.comment);
    if (isReponder) {
      inputRef?.current?.focus();
    }
  }, []);

  async function vote({ item, isRep }) {
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
      const resp = await apiBarbeiro.post(`comments/${item.id}/vote`, item.user_score > 0 ? { score: 0 } : { score: 1 }, {
        headers: { Authorization: `Bearer ${user.access_token}` },
      });
      if (isRep) {
        const t = comment;
        t.replies[t.replies.findIndex(i => i.id === item.id)].upvotes = resp.data.upvotes;
        t.replies[t.replies.findIndex(i => i.id === item.id)].user_score = item.user_score > 0 ? 0 : 1;
        return setComment(t);
      }
      resp.data.replies = comment.replies;
      resp.data.user_score = item.user_score > 0 ? 0 : 1;
      setComment(resp.data);
    } catch (e) {
      console.log('Comment Vote (i) : ', e);
    } finally {
      setVoteLoading(null);
    }
  }

  return (
    <SafeAreaView
      onLayout={() => {
        if (isReponder) {
          inputRef?.current?.focus();
        }
      }}
      style={[styles.safeArea, { backgroundColor: themeState.themeColor.background }]}
    >
      <HeaderScreens screenTitle={strings.comments.screenTitleReply} isArticlePage={false} hasTitle={true} onBack={() => result(comment)} />
      <Dialog isVisible={loading} overlayStyle={styles.dialog}>
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
        }}
      >
        {comment && (
          <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
            <View
              style={[
                styles.container,
                {
                  backgroundColor: themeState.themeColor.background,
                },
              ]}
            >
              <View style={[styles.boxCommentWrapper, { borderBottomColor: themeState.themeColor.lines }]}>
                <Image source={{ uri: comment.created_by.picture }} resizeMode="cover" resizeMethod="auto" borderRadius={200} style={styles.image} />
                <View style={styles.userCommentWrapper}>
                  <View style={styles.userCommentHeader}>
                    <View style={styles.nameContainer}>
                      <Text numberOfLines={1} style={[styles.name, { color: themeState.themeColor.color }]}>
                        {comment.created_by.name}
                      </Text>
                    </View>
                    <View style={styles.dateContainer}>
                      <Text style={[styles.date, { color: themeState.themeColor.color }]}>{getDate(comment.created_at)}</Text>
                    </View>
                    <View style={styles.moreContainer}>
                      <Menu>
                        <MenuTrigger
                          children={
                            <Icon
                              name="mais"
                              size={14}
                              color={themeState.themeColor.color}
                              fill={themeState.themeColor.color}
                              disableFill
                              style={styles.moreIcon}
                            />
                          }
                        />
                        <MenuOptions
                          customStyles={{
                            optionWrapper: { padding: 10 },
                            optionText: { color: themeState.themeColor.menuOptionsText },
                          }}
                          optionsContainerStyle={[styles.optionsMenu, { backgroundColor: themeState.themeColor.menuOptions }]}
                        >
                          <MenuOption
                            onSelect={async () => {
                              try {
                                if (!user) {
                                  navigation.dispatch(CommonActions.navigate('Login'));
                                }
                                if (!piano.isPremium) {
                                  toast.hideAll();
                                  return toast.show('Torna-te premium para acederes a esta funcionalidade');
                                }
                                await apiBarbeiro.post(
                                  `comments/${comment.id}/report`,
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
                              } catch (e) {
                                console.log('Comment Report:', e);
                              }
                            }}
                            text={strings.comments.report}
                          />
                          {user?.id === comment.created_by.id && (
                            <MenuOption
                              onSelect={async () => {
                                try {
                                  setLoading(true);
                                  if (!user) {
                                    navigation.dispatch(CommonActions.navigate('Login'));
                                  }
                                  await apiBarbeiro.delete(`comments/${comment.id}`, {
                                    headers: {
                                      Authorization: `Bearer ${user?.access_token}`,
                                    },
                                  });
                                } catch (e) {
                                  toast.hideAll();
                                  toast.show('Não é possível apagar o comentário');
                                  console.log('Comment Delete: ', e);
                                } finally {
                                  setLoading(false);
                                  result(comment);
                                  navigation.dispatch(CommonActions.goBack());
                                }
                              }}
                              text={strings.comments.delete}
                            />
                          )}
                        </MenuOptions>
                      </Menu>
                    </View>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => {
                      const t = [...expandText];
                      const index = t.findIndex(i => i === comment.id);
                      index === -1 ? t.push(comment.id) : t.splice(index, 1);
                      setExpandText(t);
                    }}
                  >
                    <Text
                      numberOfLines={expandText.find((i: number | undefined) => i === comment.id) ? undefined : 3}
                      ellipsizeMode="tail"
                      style={[styles.comment, { color: themeState.themeColor.color }]}
                    >
                      {comment.text.trim('\n', '')}
                    </Text>
                  </TouchableOpacity>
                  <View style={styles.menuWrapper}>
                    {voteLoading === comment.id ? (
                      <Loading color={themeState.themeColor.color} size={'small'} />
                    ) : (
                      <TouchableOpacity activeOpacity={0.9} style={styles.vote} onPress={() => vote({ item: comment, isRep: false })}>
                        <Icon
                          name="arrow"
                          size={14}
                          fill={themeState.themeColor.color}
                          color={themeState.themeColor.color}
                          disableFill
                          style={styles.arrowIcon}
                        />
                        <Text
                          style={[
                            styles.voteText,
                            {
                              color: comment.user_score > 0 ? theme.colors.brandBlue : themeState.themeColor.color,
                            },
                          ]}
                        >
                          {comment.upvotes}
                        </Text>
                      </TouchableOpacity>
                    )}
                    <Text style={[styles.bull, { color: themeState.themeColor.color }]}>&bull;</Text>
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => {
                        if (!user) {
                          navigation.dispatch(CommonActions.navigate('Login'));
                        }
                        if (!piano.isPremium) {
                          toast.hideAll();
                          return toast.show('Torna-te premium para acederes a esta funcionalidade');
                        }
                        setReply(comment);
                        inputRef?.current?.focus();
                      }}
                    >
                      <Text style={[styles.replyText, { color: themeState.themeColor.color }]}>{strings.comments.reply}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
            {comment.replies?.length > 0 &&
              comment.replies.map(i => {
                return (
                  <View key={i.id} style={styles.container}>
                    <View
                      style={[
                        styles.boxCommentWrapper,
                        {
                          borderBottomColor: themeState.themeColor.lines,
                        },
                      ]}
                    >
                      <Image source={{ uri: i.created_by.picture }} resizeMode="cover" resizeMethod="auto" borderRadius={200} style={styles.image} />
                      <View style={styles.userCommentWrapper}>
                        <View style={styles.userCommentHeader}>
                          <View style={styles.nameContainer}>
                            <Text numberOfLines={1} style={[styles.name, { color: themeState.themeColor.color }]}>
                              {i.created_by.name}
                            </Text>
                          </View>
                          <View style={styles.dateContainer}>
                            <Text style={[styles.date, { color: themeState.themeColor.color }]}>{getDate(i.created_at)}</Text>
                          </View>
                          <View style={styles.moreContainer}>
                            <Menu>
                              <MenuTrigger
                                children={
                                  <Icon
                                    name="mais"
                                    size={14}
                                    color={themeState.themeColor.color}
                                    fill={themeState.themeColor.color}
                                    disableFill
                                    style={styles.moreIcon}
                                  />
                                }
                              />
                              <MenuOptions
                                customStyles={{
                                  optionWrapper: { padding: 10 },
                                  optionText: {
                                    color: themeState.themeColor.menuOptionsText,
                                  },
                                }}
                                optionsContainerStyle={[styles.optionsMenu, { backgroundColor: themeState.themeColor.menuOptions }]}
                              >
                                <MenuOption
                                  onSelect={async () => {
                                    try {
                                      if (!user) {
                                        navigation.dispatch(CommonActions.navigate('Login'));
                                      }
                                      if (!piano.isPremium) {
                                        toast.hideAll();
                                        return toast.show('Torna-te premium para acederes a esta funcionalidade');
                                      }
                                      await apiBarbeiro.post(
                                        `comments/${i.id}/report`,
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
                                    } catch (e) {
                                      console.log('Comment Report:', e);
                                    }
                                  }}
                                  text={strings.comments.report}
                                />
                                {user?.id === i.created_by.id && (
                                  <MenuOption
                                    onSelect={async () => {
                                      try {
                                        setLoading(true);
                                        if (!user) {
                                          navigation.dispatch(CommonActions.navigate('Login'));
                                        }
                                        await apiBarbeiro.delete(`comments/${i.id}`, {
                                          headers: {
                                            Authorization: `Bearer ${user?.access_token}`,
                                          },
                                        });
                                        const t = comment;
                                        t.replies.splice(
                                          t.replies.findIndex(e => e.id === i.id),
                                          1,
                                        );
                                        setComment(t);
                                      } catch (e) {
                                        toast.hideAll();
                                        toast.show('Não é possível apagar o comentário');
                                        console.log('Comment Delete: ', e);
                                      } finally {
                                        setLoading(false);
                                      }
                                    }}
                                    text={strings.comments.delete}
                                  />
                                )}
                              </MenuOptions>
                            </Menu>
                          </View>
                        </View>
                        <TouchableOpacity
                          activeOpacity={0.9}
                          onPress={() => {
                            const t = [...expandText];
                            const index = t.findIndex(e => e === i.id);
                            index === -1 ? t.push(i.id) : t.splice(index, 1);
                            setExpandText(t);
                          }}
                        >
                          <Text
                            numberOfLines={expandText.find(e => e === i.id) ? undefined : 3}
                            ellipsizeMode="tail"
                            style={[styles.comment, { color: themeState.themeColor.color }]}
                          >
                            {i.text.trim('\n', '')}
                          </Text>
                        </TouchableOpacity>
                        <View style={styles.menuWrapper}>
                          {voteLoading === i.id ? (
                            <Loading color={themeState.themeColor.color} size={'small'} />
                          ) : (
                            <TouchableOpacity activeOpacity={0.9} style={styles.vote} onPress={() => vote({ item: i, isRep: true })}>
                              <Icon
                                name="arrow"
                                size={14}
                                fill={themeState.themeColor.color}
                                color={themeState.themeColor.color}
                                disableFill
                                style={styles.arrowIcon}
                              />
                              <Text
                                style={[
                                  styles.voteText,
                                  {
                                    color: i.user_score > 0 ? theme.colors.brandBlue : themeState.themeColor.color,
                                  },
                                ]}
                              >
                                {i.upvotes}
                              </Text>
                            </TouchableOpacity>
                          )}
                          <Text style={[styles.bull, { color: themeState.themeColor.color }]}>&bull;</Text>
                          <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={() => {
                              if (!user) {
                                navigation.dispatch(CommonActions.navigate('Login'));
                              }
                              if (!piano.isPremium) {
                                toast.hideAll();
                                return toast.show('Torna-te premium para acederes a esta funcionalidade');
                              }
                              setReply(i);
                              inputRef?.current?.focus();
                            }}
                          >
                            <Text style={[styles.replyText, { color: themeState.themeColor.color }]}>{strings.comments.reply}</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                    {i.replies?.length > 0 &&
                      i.replies.map(i2 => {
                        return (
                          <View
                            key={i2.id}
                            style={[
                              styles.containerRep,
                              {
                                backgroundColor: themeState.themeColor.background,
                                paddingTop: 10,
                                paddingBottom: 10,
                              },
                            ]}
                          >
                            <View style={[styles.boxCommentWrapper, { borderBottomColor: themeState.themeColor.lines }]}>
                              <Image source={{ uri: i2.created_by.picture }} resizeMode="cover" resizeMethod="auto" borderRadius={200} style={styles.image} />
                              <View style={styles.userCommentWrapper}>
                                <View style={styles.userCommentHeader}>
                                  <View style={styles.nameContainer}>
                                    <Text numberOfLines={1} style={[styles.name, { color: themeState.themeColor.color }]}>
                                      {i2.created_by.name}
                                    </Text>
                                  </View>
                                  <View style={styles.dateContainer}>
                                    <Text style={[styles.date, { color: themeState.themeColor.color }]}>{getDate(i2.created_at)}</Text>
                                  </View>
                                  <View style={styles.moreContainer}>
                                    <Menu>
                                      <MenuTrigger
                                        children={
                                          <Icon
                                            name="mais"
                                            size={14}
                                            color={themeState.themeColor.color}
                                            fill={themeState.themeColor.color}
                                            disableFill
                                            style={styles.moreIcon}
                                          />
                                        }
                                      />
                                      <MenuOptions
                                        customStyles={{
                                          optionWrapper: { padding: 10 },
                                          optionText: {
                                            color: themeState.themeColor.menuOptionsText,
                                          },
                                        }}
                                        optionsContainerStyle={[
                                          styles.optionsMenu,
                                          {
                                            backgroundColor: themeState.themeColor.menuOptions,
                                          },
                                        ]}
                                      >
                                        <MenuOption
                                          onSelect={async () => {
                                            try {
                                              if (!user) {
                                                navigation.dispatch(CommonActions.navigate('Login'));
                                              }
                                              if (!piano.isPremium) {
                                                toast.hideAll();
                                                return toast.show('Torna-te premium para acederes a esta funcionalidade');
                                              }
                                              await apiBarbeiro.post(
                                                `comments/${i2.id}/report`,
                                                { report: true },
                                                {
                                                  headers: {
                                                    Authorization: `Bearer ${user?.access_token}`,
                                                  },
                                                },
                                              );
                                              Alert.alert(
                                                '',
                                                'Obrigado pela sua denúncia. Dependendo do número de denúncias recebidas, este comentário será revisto pela nossa equipa de moderação.',
                                              );
                                            } catch (e) {
                                              console.log('Comment Report:', e);
                                            }
                                          }}
                                          text={strings.comments.report}
                                        />
                                        {user?.id == i2.created_by.id && (
                                          <MenuOption
                                            onSelect={async () => {
                                              try {
                                                setLoading(true);
                                                if (!user) {
                                                  navigation.dispatch(CommonActions.navigate('Login'));
                                                }
                                                console.log('Error Reply', i2.id);
                                                await apiBarbeiro.delete(`comments/${i2.id}`, {
                                                  headers: {
                                                    Authorization: `Bearer ${user?.access_token}`,
                                                  },
                                                  data: {
                                                    updated_at: Date.now().toString(),
                                                  },
                                                });
                                                const t = comment;
                                                const index = t.replies.findIndex(e => e.id == reply.id);
                                                t.replies[index].replies.splice(
                                                  t.replies[index].replies.findIndex(e => e.id === i2.id),
                                                  1,
                                                );
                                                setComment(t);
                                              } catch (e) {
                                                toast.hideAll();
                                                toast.show('Não é possível apagar o comentário');
                                                console.log('Comment Delete: ', e);
                                              } finally {
                                                setLoading(false);
                                              }
                                            }}
                                            text={strings.comments.delete}
                                          />
                                        )}
                                      </MenuOptions>
                                    </Menu>
                                  </View>
                                </View>
                                <View>
                                  <Text numberOfLines={1} style={[styles.name, { color: themeState.themeColor.color }]}>
                                    {strings.comments.inRepyTo} {''}
                                    <Text
                                      style={{
                                        fontFamily: theme.fonts.halyardSemBd,
                                      }}
                                    >
                                      {i.created_by.name}
                                    </Text>
                                  </Text>
                                </View>

                                <TouchableOpacity
                                  activeOpacity={0.9}
                                  onPress={() => {
                                    const t = [...expandText];
                                    const index = t.findIndex(e => e === i2.id);
                                    index === -1 ? t.push(i2.id) : t.splice(index, 1);
                                    setExpandText(t);
                                  }}
                                >
                                  <Text
                                    numberOfLines={expandText.find(e => e === i2.id) ? undefined : 3}
                                    ellipsizeMode="tail"
                                    style={[styles.comment, { color: themeState.themeColor.color }]}
                                  >
                                    {i2.text.trim('\n', '')}
                                  </Text>
                                </TouchableOpacity>
                                <View style={styles.menuWrapper}>
                                  {voteLoading == i2.id ? (
                                    <Loading color={themeState.themeColor.color} size={'small'} />
                                  ) : (
                                    <TouchableOpacity activeOpacity={0.9} style={styles.vote} onPress={() => vote({ item: i2, isRep: true })}>
                                      <Icon
                                        name="arrow"
                                        size={14}
                                        fill={themeState.themeColor.color}
                                        color={themeState.themeColor.color}
                                        disableFill
                                        style={styles.arrowIcon}
                                      />
                                      <Text
                                        style={[
                                          styles.voteText,
                                          {
                                            color: i2.user_score > 0 ? theme.colors.brandBlue : themeState.themeColor.color,
                                          },
                                        ]}
                                      >
                                        {i2.upvotes}
                                      </Text>
                                    </TouchableOpacity>
                                  )}
                                </View>
                              </View>
                            </View>
                          </View>
                        );
                      })}
                  </View>
                );
              })}
          </ScrollView>
        )}
        {user !== null && piano.isPremium && (
          <View style={{ justifyContent: 'flex-end' }}>
            {reply && (
              <View style={[styles.boxReplyTo, { backgroundColor: themeState.themeColor.boxInReplyTo }]}>
                <View style={styles.boxReplyToContainer}>
                  <Text style={[{ color: themeState.themeColor.color }]}>
                    {strings.comments.answerTo} {reply.created_by.name}
                  </Text>
                </View>
                <View style={styles.boxReplyToContent}>
                  {reply.id != comment.id && (
                    <TouchableOpacity activeOpacity={0.9} onPress={() => setReply(comment)}>
                      <Icon name={'close'} size={16} color={theme.colors.brandBlack} fill={theme.colors.brandBlack} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
            <BoxComment
              innerRef={inputRef}
              value={text ?? undefined}
              onChangeText={setText}
              rightIcon={
                commentLoading ? (
                  <Loading color={themeState.themeColor.color} size={'small'} />
                ) : (
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={async () => {
                      if (reply?.id && text != null && text.trim() != '') {
                        try {
                          setCommentLoading(true);
                          const resp = await apiBarbeiro.post(
                            'comments',
                            {
                              text,
                              html: '<div>test</div>',
                              content_type: 'post',
                              parent_id: reply.id,
                              object_id: id.toString(),
                            },
                            {
                              headers: {
                                Authorization: `Bearer ${user.access_token}`,
                              },
                            },
                          );
                          const t = comment;
                          if (reply.id === comment.id) {
                            t.replies = [...(t.replies ?? []), resp.data];
                          } else {
                            t.replies[t.replies.findIndex(e => e.id == reply.id)].replies = [
                              ...(t.replies[t.replies.findIndex(e => e.id == reply.id)].replies ?? []),
                              resp.data,
                            ];
                          }
                          setComment(t);
                        } catch (e) {
                          console.log('Error Reply', e);
                        } finally {
                          setText(null);
                          setCommentLoading(false);
                        }
                      }
                    }}
                  >
                    <Icon name="send" size={14} fill={theme.colors.brandBlue} color={theme.colors.brandBlue} />
                  </TouchableOpacity>
                )
              }
            />
          </View>
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
  container: {
    flex: 1,
    padding: 10,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  containerRep: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  boxCommentWrapper: {
    flex: 1,
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingBottom: 12,
  },
  image: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  userCommentWrapper: {
    flex: 1,
    flexDirection: 'column',
  },
  userCommentHeader: {
    flex: 1,
    flexDirection: 'row',
  },
  nameContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  name: {
    fontSize: 14,
    fontFamily: theme.fonts.halyardRegular,
  },
  dateContainer: {
    alignItems: 'flex-end',
  },
  date: {
    fontSize: 14,
    fontFamily: theme.fonts.halyardRegular,
  },
  moreContainer: {
    justifyContent: 'center',
    paddingLeft: 10,
  },
  moreIcon: {
    transform: [{ rotate: '-90deg' }],
  },
  optionsMenu: {
    flex: 1,
    padding: 2,
  },
  comment: {
    fontSize: 14,
    fontFamily: theme.fonts.halyardRegular,
    paddingTop: 6,
    paddingBottom: 12,
  },
  menuWrapper: {
    flexDirection: 'row',
  },
  vote: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voteText: {
    fontSize: 14,
    fontFamily: theme.fonts.halyardRegular,
  },
  arrowIcon: {
    marginRight: 2,
    transform: [{ rotate: '90deg' }],
  },
  bull: {
    paddingHorizontal: 10,
    fontSize: 14,
    fontFamily: theme.fonts.halyardRegular,
  },
  replyText: {
    fontSize: 14,
    fontFamily: theme.fonts.halyardRegular,
  },
  boxAnswered: {
    marginTop: 10,
    padding: 8,
  },
  boxAnsweredText: {
    fontSize: 14,
    fontFamily: theme.fonts.halyardRegular,
  },
  boxReplyTo: {
    flexDirection: 'row',
    padding: 10,
  },
  boxReplyToContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  boxReplyToContent: {
    flexDirection: 'row',
  },
});

export default CommentReply;
