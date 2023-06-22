import React, { useEffect, useRef, useState } from 'react';
import { Image, Linking, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, StatusBar } from 'react-native';
import { theme } from '../../../constants/theme';
import { apiPodcasts } from '../../../api/endpoints';
import Icon from '../../../components/icon';
import { getDate } from '../../../utils/date';
import Header from './components/header';
import { shareLink } from '../../../utils/share';
import Modal from 'react-native-modal';
import { checkSubscribed, subscribe, unsubscribe } from '../../../reducers/subscription';
import { Dialog } from 'react-native-elements';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import FollowButton from '../../../components/followButton';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { OS } from '../../../constants';
import Loading from '../../../components/loading';
import crashlytics from '@react-native-firebase/crashlytics';
import { AlertError } from '../../../error/errorAlert';
import { Analytics, Screens } from '../../../services/analytics';
import TrackPlayer from 'react-native-track-player';

interface EpisodeProps {
  route: {
    params: {
      platforms: [];
      wpid: number;
      uid: string;
      name: string;
      description: string;
      image_1x1: {
        alt: string;
        caption: string;
        credits: string;
        height: number;
        label: string;
        link: string;
        meta: string;
        orientation: string;
        src: string;
        url: string;
        width: number;
        x: number;
        y: number;
      };
    };
  };
}

interface renderItemProps {
  date_modified: string;
  title: string;
}

const Program = (props: EpisodeProps): JSX.Element => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  let { wpid, uid, name, description, image_1x1 } = props.route.params;
  const sheetRef = useRef(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [platforms, setPlatforms] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [program, setProgram] = useState<any>();
  const [episodes, setEpisodes] = useState<any>();
  const [loadingMore, setLoadingMore] = useState(false);
  const [showDialogLoading, setShowDialogLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState<boolean | any>();
  const user = useAppSelector(state => state.auth.user);
  const themeState = useAppSelector(state => state.theme);
  const [track, setTrack] = useState<any>();

  useEffect(() => {
    if (!program) {
      return;
    }
    // pageview
    const permalinkParts = program.permalink.split('observador.pt/programas/');
    const slug = permalinkParts[permalinkParts.length - 1];
    Analytics.trackPageView({ screen: Screens.PROGRAM, viewSlug: slug, viewName: name });
  }, [program]);

  useEffect(() => {
    dispatch(checkSubscribed({ id: wpid, type: 'program' })).then(x => {
      setIsSubscribed(x.payload);
    });
  }, []);

  useEffect(() => {
    setPlatforms(
      props.route.params.platforms.filter((i: { type: number }) => {
        if (Platform.OS === OS.android) {
          return i.type != 3;
        }
        if (Platform.OS === OS.ios) {
          return i.type != 4;
        }
      }),
    );
    loadProgram();
    loadEpisode();
    return navigation.addListener('focus', async () => {
      TrackPlayer.getTrack(0).then(value => setTrack(value));
    });
  }, []);

  async function loadProgram() {
    try {
      const resp = await apiPodcasts.get(`programs/${uid}`, {
        params: { limit: 10 },
      });
      if (resp?.data?.data) {
        setProgram(resp.data.data);
      }
    } catch (e: any) {
      crashlytics().recordError(new Error(e));
      crashlytics().log('Error: loadProgram');
      navigation.dispatch(CommonActions.goBack());
    }
  }

  async function loadEpisode(showLoading = true) {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const resp = await apiPodcasts.get(`episodes/${uid}`, {
        params: { offset: episodes?.offset, media: 1 },
      });
      if (!resp?.data?.data) {
        return;
      }
      resp.data.data = [...(episodes?.data ?? []), ...resp.data.data];
      setEpisodes(resp.data);
    } catch (e: any) {
      crashlytics().recordError(new Error(e));
      crashlytics().log('Error: loadEpisode');
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }

  const renderItem = (item: renderItemProps, index: number) => {
    let lastElement = index === Object.keys(episodes.data).length - 1;
    return (
      <View key={index} style={[styles.podcastListWrapper, { borderBottomWidth: lastElement ? 0 : 1 }]}>
        <Text style={styles.date}>{getDate(item.date_modified)}</Text>
        <Text style={[styles.podcastTitle, { color: themeState.themeColor.color }]}>{item.title}</Text>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            StatusBar.setBarStyle('light-content');
            navigation.dispatch(
              CommonActions.navigate('Episode', {
                ...item,
                program: program,
              }),
            );
          }}
        >
          <View style={[styles.playBtn, { borderColor: themeState.themeColor.color }]}>
            <Icon
              name={track?.title == item.title ? 'stop' : 'play'}
              size={12}
              disableFill
              fill={themeState.themeColor.color}
              color={themeState.themeColor.color}
              style={styles.iconPlay}
            />
            <Text style={[styles.playBtnText, { color: themeState.themeColor.color }]}>Reproduzir</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const toggleModal = () => {
    if (!loading) {
      setModalVisible(!isModalVisible);
    }
  };

  const handleModalValue = (url: string) => {
    Linking.canOpenURL(url).then(r => {
      if (r) {
        Linking.openURL(url);
      } else {
        AlertError('Errro', 'Não é possível abrir o link!', false);
      }
    });
    //@ts-ignore
    sheetRef.current?.close();
  };

  const RenderPlatformModal = () => {
    return (
      <View style={[styles.modalContainer, { backgroundColor: themeState.themeColor.background }]}>
        <View style={styles.center}>
          <View style={styles.barIcon} />
        </View>
        <View style={styles.modalContent}>
          {platforms.map((p: { url: string; name: string }, index: number) => {
            return (
              <View style={{ flexDirection: 'row' }} key={index}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => {
                    handleModalValue(p.url);
                  }}
                  style={styles.btn}
                >
                  <Text style={[styles.text, { color: themeState.themeColor.color }]}>{p.name}</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const handleFollowClick = () => {
    setShowDialogLoading(true);
    if (!user) {
      setShowDialogLoading(false);
      navigation.dispatch(CommonActions.navigate('Login'));
    }
    if (isSubscribed) {
      dispatch(unsubscribe({ id: wpid, type: 'program' }))
        .then(x => {
          setIsSubscribed(x.payload);
          setShowDialogLoading(false);
        })
        .catch(e => {
          crashlytics().recordError(new Error(e));
          crashlytics().log('Error Cancel Subscripton: handleFollowClick');
        });
    } else {
      dispatch(subscribe({ id: wpid, type: 'program' }))
        .then(x => {
          setIsSubscribed(x.payload);
        })
        .catch(e => {
          crashlytics().recordError(new Error(e));
          crashlytics().log('Error Subscripton: handleFollowClick');
        });
    }

    setShowDialogLoading(false);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeState.themeColor.background }]}>
      <Modal
        ref={sheetRef}
        onBackdropPress={() => setModalVisible(false)}
        onBackButtonPress={() => setModalVisible(false)}
        isVisible={isModalVisible}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropTransitionOutTiming={0}
        hideModalContentWhileAnimating={true}
        swipeDirection="down"
        onSwipeComplete={toggleModal}
        style={styles.modal}
      >
        <RenderPlatformModal />
      </Modal>

      <Dialog isVisible={showDialogLoading} overlayStyle={styles.loading}>
        <Dialog.Loading loadingProps={{ color: themeState.themeColor.color }} />
      </Dialog>

      <Header onShare={() => shareLink(program.name, program.permalink)} />

      <ScrollView
        showsVerticalScrollIndicator={true}
        contentContainerStyle={[styles.container, { maxWidth: themeState.themeOrientation.maxW }]}
        onMomentumScrollEnd={async ({ nativeEvent }) => {
          //@ts-ignore
          const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
            return layoutMeasurement.height + contentOffset.y >= contentSize.height - 40;
          };
          if (isCloseToBottom(nativeEvent)) {
            if (loadingMore || !episodes.offset) {
              return;
            }
            setLoadingMore(true);
            await loadEpisode(false);
            setLoadingMore(false);
          }
        }}
      >
        <View style={styles.podcastHeader}>
          <Image source={{ uri: image_1x1.src }} resizeMode="contain" resizeMethod="auto" style={styles.podcastHeaderImg} />
          <View style={styles.podcastContent}>
            <Text style={[styles.title, { color: themeState.themeColor.color }]}>{name}</Text>
            <View style={{ flexDirection: 'row' }}>
              <FollowButton
                color={isSubscribed ? theme.colors.brandBlue : undefined}
                onPress={handleFollowClick}
                txtColor={isSubscribed ? theme.colors.white : themeState.themeColor.color}
                isSubscribed={isSubscribed}
              />
              {platforms.length > 0 && (
                <TouchableOpacity activeOpacity={0.9} onPress={toggleModal}>
                  <View style={[styles.btnListen, { borderColor: themeState.themeColor.color }]}>
                    <Icon
                      name={'headphones'}
                      size={10}
                      disableFill
                      fill={themeState.themeColor.color}
                      color={themeState.themeColor.color}
                      style={styles.iconHeadphones}
                    />
                    <Text style={[styles.btnListenText, { color: themeState.themeColor.color }]}>Ouvir em...</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
        <Text style={[styles.description, { color: themeState.themeColor.color }]}>{description}</Text>
        {loading && <Loading color={themeState.themeColor.color} size={'small'} style={{ flex: 1 }} />}
        {!loading && (episodes?.length == 0 || !program) && (
          <Text style={[styles.error, { color: themeState.themeColor.color }]}>Ocorreu um erro, por favor tente mais tarde</Text>
        )}
        {!loading && episodes?.length > 0 && program && (
          <View>
            <Text style={[styles.episodeCount, { color: themeState.themeColor.color }]}>{program.episode_count} Episódios</Text>
            {episodes.data.map(renderItem)}
            {loadingMore && (
              <View style={styles.loadingEpisode}>
                <Loading color={themeState.themeColor.color} size={'small'} />
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 15,
    width: '100%',
    marginRight: 'auto',
    marginLeft: 'auto',
  },
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContainer: {
    paddingTop: 12,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    paddingBottom: Platform.OS === OS.android ? 0 : 20,
  },
  center: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  barIcon: {
    width: 60,
    height: 5,
    backgroundColor: '#bbb',
    borderRadius: 3,
    marginBottom: 10,
  },
  modalContent: {
    marginHorizontal: 15,
    paddingVertical: Platform.OS === OS.android ? 0 : 8,
  },
  btn: {
    paddingVertical: 8,
  },
  text: {
    fontSize: 16,
    fontFamily: theme.fonts.halyardRegular,
  },
  loading: {
    width: 100,
    height: 100,
    padding: 0,
    justifyContent: 'center',
  },
  podcastHeader: {
    flexDirection: 'row',
  },
  podcastHeaderImg: {
    width: 80,
    height: 80,
  },
  podcastContent: {
    marginHorizontal: 10,
    flex: 1,
    justifyContent: 'space-evenly',
  },
  title: {
    fontSize: 18,
    fontFamily: theme.fonts.halyardSemBd,
  },
  btnListen: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginHorizontal: 8,
  },
  iconHeadphones: {
    marginRight: 4,
  },
  btnListenText: {
    fontSize: 12,
    fontFamily: theme.fonts.halyardRegular,
  },
  description: {
    marginVertical: 10,
    fontSize: 12,
    fontFamily: theme.fonts.halyardRegular,
  },
  error: {
    fontSize: 14,
    fontFamily: theme.fonts.halyardRegular,
  },
  episodeCount: {
    marginBottom: 10,
    fontSize: 18,
    fontFamily: theme.fonts.halyardSemBd,
  },
  loadingEpisode: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  podcastListWrapper: {
    paddingVertical: 15,
    borderBottomColor: theme.colors.brandGrey,
  },
  date: {
    fontSize: 12,
    color: theme.colors.brandGrey,
    fontFamily: theme.fonts.halyardRegular,
  },
  podcastTitle: {
    fontSize: 14,
    marginVertical: 6,
    fontFamily: theme.fonts.halyardRegular,
    marginBottom: 10,
  },
  playBtn: {
    width: '26%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: 4,
  },
  playBtnText: {
    fontSize: 12,
    fontFamily: theme.fonts.halyardRegular,
  },
  iconPlay: {
    marginRight: 4,
  },
});

export default Program;
