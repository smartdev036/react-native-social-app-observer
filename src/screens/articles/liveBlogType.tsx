import React, { FC, useEffect, useMemo, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { theme } from '../../constants/theme';
import InlineTopic from '../../components/InlineTopic';
import { imageURL } from '../../utils/image';
import { apiBase } from '../../api/endpoints';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { Post } from '../../models/articles';
import { PostBlock, Topic } from '../../models/articleFields';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { ObsArticleWrapper, ObsColumnContainer, ObsLead, ObsRowContainer, ObsText, ObsTopic } from '../../components/global';
import { getDate } from '../../utils/date';
import { RenderHTMLSource } from 'react-native-render-html';
import { RenderPostHtml } from '../../components/htmlRenders/RenderPost';
import { Analytics } from '../../services/analytics';
import { Skeleton } from '@rneui/themed';
import { Image } from '@rneui/themed';
import { ScrollEndT, handleScrollEndDrag } from '../../reducers/analytics';
import ImageViewer from 'react-native-image-zoom-viewer';
import Icon from '../../components/icon';

export interface EntryI {
  blocks: PostBlock[];
  apiContent: string;
  timestamp: string;
  human_time: string;
  fixed: boolean;
  highlight: string;
  icon: string;
  id: number;
  title: string;
  author_photo: string;
  author_name: string;
  post_id: string;
}

export interface EntryContainerI {
  id: number;
  type: string;
  entry: EntryI;
}

interface LiveBlogTypeI extends Post {
  liveblog_data?: EntryContainerI[];
}

export const LiveBlogType: FC<{
  post: LiveBlogTypeI;
}> = ({ post }) => {
  const navigation = useNavigation();
  const [liveblogData, setLiveblogData] = useState<EntryContainerI[]>();
  const mainTopic = post.topics.find((t: Topic) => t.mainTopic) as Topic;
  const socketUrl = `wss://sws.observador.pt/ws?topics=liveblog-${post.id}`;
  const themeState = useAppSelector(state => state.theme);
  const ws = useRef<WebSocket>();
  const [hardRefresh, setHardRefresh] = useState(0);
  const [newEntryIndex, setNewEntryIndex] = useState<0 | 1>(0);
  const [hasNewEntry, setHasNewEntry] = useState(false);
  const flatListRef = useRef<FlatList>();
  const { width } = useWindowDimensions();
  const dispatch = useAppDispatch();
  const [visible, setIsVisible] = useState(false);

  useEffect(() => {
    if (post.liveblog_active) {
      ws.current = new WebSocket(socketUrl, [], {
        headers: {
          ['Origin']: 'https://observador.pt',
        },
      });
      ws.current.onclose = e => {
        console.log('CLOSING SOCKET: ', e.message, ' - code: ', e.code);
      };
      ws.current.onerror = e => {
        console.log('ERROR SOCKET: ', e.message);
      };
      ws.current.onopen = () => {
        console.log('OPENEND SOCKET: ');
      };
      ws.current.onmessage = e => onMessComming(e);
    }

    const fixedIndex = post.liveblog_data.findIndex(e => e.entry.fixed);
    const data = post.liveblog_data;
    if (fixedIndex !== -1) {
      const entry = data.splice(fixedIndex, 1);
      data.unshift(entry[0]);
    }
    setLiveblogData(data);

    return () => {
      ws.current?.close();
    };
  }, []);

  function onMessComming(mess: WebSocketMessageEvent) {
    const data = JSON.parse(mess.data).data;
    if (!data?.message) {
      console.log('ON MESSAGE RETURN 1', data);
      return;
    }
    const msg = JSON.parse(data.message);
    if (!msg.type) {
      console.log('ON MESSAGE RETURN 2', data);
      return;
    }
    switch (msg.type) {
      case 'add':
        setLiveblogData(oldState => {
          if (!oldState) {
            return oldState;
          }
          let updatedState = [...oldState];
          if (msg.appData) {
            if (msg.appData.entry.fixed) {
              updatedState = removeFixedAndOrder(updatedState);
              updatedState.unshift(msg.appData);
            } else if (updatedState[0].entry.fixed) {
              updatedState.splice(1, 0, msg.appData);
            } else {
              updatedState.unshift(msg.appData);
            }
            setNewEntryIndex(0);
            setHasNewEntry(true);
          }
          return updatedState;
        });
        break;
      case 'update':
        setLiveblogData(oldState => {
          if (!oldState) {
            return;
          }
          let updatedState = [...oldState];
          if (msg.appData) {
            if (msg.appData.entry.fixed) {
              updatedState = removeFixedAndOrder(updatedState);
              const index = updatedState.findIndex(e => e.entry.id === msg.appData.entry.id);
              if (index !== -1) {
                updatedState.splice(index, 1);
              }
              updatedState.unshift(msg.appData);
              return updatedState;
            }
            const index = updatedState.findIndex(e => e.entry.id === msg.appData.entry.id);
            if (index !== -1) {
              updatedState[index] = msg.appData;
            }
          }
          return updatedState;
        });
        break;
      case 'delete':
        setLiveblogData(oldState => {
          if (!oldState) {
            return;
          }
          const updatedState = [...oldState];
          if (msg.appData.id) {
            const index = updatedState.findIndex(e => e.entry.id === msg.appData.id);
            if (index !== -1) {
              updatedState.splice(index, 1);
            }
          }
          return updatedState;
        });
        break;
    }
  }

  function removeFixedAndOrder(updatedState: EntryContainerI[]) {
    updatedState[0].entry.fixed = false;
    return updatedState.sort((a, b) => new Date(b.entry.timestamp).getTime() - new Date(a.entry.timestamp).getTime());
  }

  const handleInlineTopic = () => {
    navigation.dispatch(CommonActions.navigate('TopicsDetails', { topic: mainTopic }));
  };

  async function handleLoadMore() {
    if (!liveblogData) {
      return;
    }
    Analytics.trackInfiniteScroll(true);
    const resp = await apiBase.get(`/lists/getCompactEntries?id=${post.id}&entryId=${liveblogData[liveblogData.length - 1].id}`);
    const entries = JSON.parse(resp.data);
    if (entries.length > 0) {
      setLiveblogData(oldState => {
        if (!oldState) {
          return;
        }
        const updatedState = [...oldState, ...entries];
        return updatedState;
      });
    }
  }

  const RenderHeader = () => {
    return (
      <TouchableOpacity activeOpacity={0.9} onPress={() => setIsVisible(!visible)} style={styles.closeContainer}>
        <Icon name={'close'} size={20} disableFill={false} fill={theme.colors.white} color={theme.colors.white} />
      </TouchableOpacity>
    );
  };

  const imageUrl = imageURL(post.image, themeState.themeOrientation.imageW);
  const imageUrls = imageUrl ? [{ url: imageUrl }] : [];

  function liveblogHeader() {
    return (
      <>
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
          <></>
        )}
        <ObsColumnContainer
          override={{
            paddingHorizontal: theme.styles.articleContentHorizontalPadding,
          }}
        >
          <ObsTopic>
            <InlineTopic topic={mainTopic} onPress={handleInlineTopic} />
          </ObsTopic>
          <View style={styles.fullTitleContainer}>
            <Text style={[styles.fullTitle, { color: themeState.themeColor.color }]}>
              {post.liveblog_active && <Text style={styles.liveText}>Em direto/ </Text>}
              {post.fullTitle}
              {!post.liveblog_active && <Text> - como aconteceu</Text>}
            </Text>
          </View>
          <ObsLead title={post.lead} />
        </ObsColumnContainer>
      </>
    );
  }

  function VisibleItems({ item, index }: { item: EntryContainerI; index: number }) {
    return useMemo(() => {
      const { entry } = item;
      return (
        //FIXME last block don't show all text without paddingBottom
        <ObsColumnContainer
          key={item.id + '-' + index}
          override={{
            marginVertical: 10,
            paddingHorizontal: 15,
          }}
        >
          <View
            style={{
              borderBottomWidth: 1,
              borderColor: theme.colors.brandGrey,
              backgroundColor: entry.fixed ? themeState.themeColor.backgroudGray : themeState.themeColor.background,
            }}
          >
            {entry.fixed && <ObsText title="Entrada em destaque" override={{ color: theme.colors.brandBlue, marginVertical: 10 }} />}
            <ObsRowContainer>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: theme.colors.brandBlue,
                      fontSize: 12 * themeState.fontScaleFactor,
                      fontFamily: theme.fonts.halyardRegular,
                    }}
                  >
                    {getDate(entry.timestamp)}
                  </Text>
                  <Text
                    style={{
                      color: theme.colors.brandGrey,
                      fontSize: 12 * themeState.fontScaleFactor,
                      fontFamily: theme.fonts.halyardRegular,
                    }}
                  >
                    {entry.human_time.split(' ', 2)[1]}
                  </Text>
                </View>
                <View
                  style={{
                    flex: 5,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Image
                    style={{ height: 20, width: 20, borderRadius: 100 }}
                    source={{
                      uri: imageURL(entry.author_photo, 100),
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 12 * themeState.fontScaleFactor,
                      marginLeft: 8,
                      color: themeState.themeColor.color,
                    }}
                  >
                    {entry.author_name}
                  </Text>
                </View>
              </View>
            </ObsRowContainer>
            {entry.title && (
              <Text
                style={{
                  color: themeState.themeColor.color,
                  marginVertical: 10,
                  fontFamily: theme.fonts.halyardSemBd,
                  fontSize: 22,
                  lineHeight: 29,
                }}
              >
                {entry.title}
              </Text>
            )}
            <RenderHTMLSource contentWidth={width} source={{ html: entry.apiContent }} />
          </View>
        </ObsColumnContainer>
      );
    }, [liveblogData]);
  }

  function handleBulletPress() {
    flatListRef.current?.scrollToIndex({
      index: newEntryIndex,
      animated: true,
    });
    setHasNewEntry(false);
  }
  function handleScrollEnd(e: NativeSyntheticEvent<NativeScrollEvent>) {
    dispatch(handleScrollEndDrag({ scrollPosition: e.nativeEvent.contentOffset.y, contentHeight: e.nativeEvent.contentSize.height } as ScrollEndT));
  }

  return liveblogData ? (
    <ObsArticleWrapper scrollView={false} override={{ marginHorizontal: 0 }}>
      <RenderPostHtml post={post}>
        {hasNewEntry && (
          <ObsRowContainer override={{ justifyContent: 'center' }}>
            <Pressable onPress={handleBulletPress}>
              <Text style={styles.bullet}>Nova Entrada</Text>
            </Pressable>
          </ObsRowContainer>
        )}
        <FlatList
          onScrollEndDrag={handleScrollEnd}
          ListHeaderComponent={liveblogHeader}
          initialNumToRender={10}
          data={liveblogData}
          ref={flatListRef}
          renderItem={({ item, index }) => <VisibleItems item={item} index={index} />}
          extraData={hardRefresh}
          showsVerticalScrollIndicator={true}
          keyExtractor={(item, i) => item.entry.id + '-' + i}
          removeClippedSubviews={true}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={5}
          decelerationRate={'normal'}
        />
      </RenderPostHtml>
    </ObsArticleWrapper>
  ) : (
    <></>
  );
};

const styles = StyleSheet.create({
  bullet: {
    backgroundColor: theme.colors.brandBlue,
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 20,
    marginVertical: 10,
    color: theme.colors.white,
    fontFamily: theme.fonts.halyardRegular,
  },
  image: {
    aspectRatio: 16 / 9,
    width: '100%',
  },
  fullTitleContainer: {
    marginBottom: 10,
  },
  fullTitle: {
    fontFamily: theme.content.title.fontFamily,
    fontSize: theme.content.title.fontSize,
    lineHeight: theme.content.title.lineHeight,
  },
  liveText: {
    color: theme.colors.brandBlue,
  },
  lineContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  line: {
    width: 50,
    borderWidth: 1,
    borderColor: theme.colors.brandGrey,
  },
  btnContainer: {
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    backgroundColor: theme.colors.brandBlue,
    padding: 6,
  },
  btnText: {
    color: theme.colors.white,
    fontFamily: theme.fonts.halyardRegular,
    fontSize: 12,
  },
  closeContainer: {
    padding: 10,
    position: 'absolute',
    zIndex: 1,
    right: 14,
    top: 50,
  },
});

export default LiveBlogType;
