import React, { useEffect, useRef, useState } from 'react';
import { Image, Linking, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { theme } from '../../../constants/theme';
import { shareLink } from '../../../utils/share';
import Icon from '../../../components/icon';
import Header from './components/header';
import TrackPlayer, { State } from 'react-native-track-player';
import { getDate } from '../../../utils/date';
import { OS } from '../../../constants';
import Loading from '../../../components/loading';
import { AlertError } from '../../../error/errorAlert';
import Modal from 'react-native-modal';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { useNavigation } from '@react-navigation/native';
import { Analytics, Screens } from '../../../services/analytics';
import { useBetterPlayer } from '../../../utils/useBetterPlayer';
import { netAudienceStrings } from '../../../constants/strings';
import { sendQualityReadsArticle } from '../../../reducers/analytics';
import { ContentType, EVENT_KIND_VIEW } from '../../../utils/qualityReads';
import crashlytics from '@react-native-firebase/crashlytics';

interface PlayerProps {
  route: object | any;
}

interface CategoryProps {
  background_color: string;
  color: string;
  count: number;
  description: string;
  icon_url: string;
  name: string;
  parent: null | any;
  permalink: string;
  slug: string;
  uid: string;
  wpid: number;
}

const getTopCategory = (cat: CategoryProps) => {
  if (cat.parent) {
    return getTopCategory(cat.parent);
  }
  return cat;
};

const Episode = (props: PlayerProps) => {
  const navigation = useNavigation();
  const { wpid, title, date_modified, premium, permalink, image_1x1, program, playback, main_category } = props.route.params;
  const { getState, playing, pauseTrack, switchTrackAndPlay, progress, seek } = useBetterPlayer();
  const [platforms, setPlatforms] = useState<any>([]);
  const sheetRef = useRef(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { themeState } = useAppSelector(state => ({
    themeState: state.theme,
    piano: state.piano,
  }));
  const [currentTrackisPlaying, setCurrentTrackisPlaying] = useState(false);
  const [isCurrent, setIsCurrent] = useState<boolean>(false);
  const dispatch = useAppDispatch();

  let utm = '?utm_source=CustomPlayer3';
  if (Platform.OS === OS.ios) {
    utm = '?utm_source=CustomPlayer2';
  }

  const episodeUrl = playback[0].platform.url + utm;

  useEffect(() => {
    const unsubFocus = navigation.addListener('focus', () => {
      Analytics.trackPageView({
        screen: Screens.ARTICLE,
        title: title ?? '',
        url: permalink ?? '',
        topic: getTopCategory(main_category),
        isPremium: premium ?? false,
      });

      getState().then(async s => {
        if (s.currTrack?.url === episodeUrl && s.currState === State.Playing) {
          setCurrentTrackisPlaying(true);
          setIsLoading(false);
          setIsCurrent(true);
        } else {
          setCurrentTrackisPlaying(false);
          setIsLoading(false);
        }
      });
      dispatch(
        sendQualityReadsArticle({
          e: EVENT_KIND_VIEW,
          ct: ContentType.POST,
          ci: String(wpid),
          cp: false,
          cu: false,
          si: false,
          d1: 'READ_PERC',
          d2: 'PERC_ARTICLE',
        }),
      );
    });

    const unsubBlur = navigation.addListener('blur', () => {
      setIsCurrent(false);
    });
    setPlatforms(
      program.platforms.filter((i: { type: number }) => {
        if (Platform.OS === OS.android) {
          return i.type != 3;
        }
        if (Platform.OS === OS.ios) {
          return i.type != 4;
        }
      }),
    );
    return () => {
      unsubFocus();
      unsubBlur();
    };
  }, [navigation]);

  useEffect(() => {
    getState().then(s => {
      if (s.currTrack?.url === episodeUrl) {
        setCurrentTrackisPlaying(playing);
        setIsCurrent(true);
        if (playing) {
          setIsLoading(false);
        }
      } else {
        //This is necessary because we are listening also to radio
        setCurrentTrackisPlaying(false);
      }
    });
  }, [playing]);

  const toggleModal = () => {
    if (!isLoading) {
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

  async function handlePress() {
    setIsLoading(false);
    if (currentTrackisPlaying) {
      await pauseTrack();
      Analytics.clearAudioRefreshInterval();
    } else {
      try {
        setIsLoading(true);
        await switchTrackAndPlay({
          id: wpid,
          url: episodeUrl,
          title: title,
          artwork: image_1x1.src,
          artist: main_category.name,
          description: `podcast-${wpid}`,
        });
        Analytics.startAudioRefresh(netAudienceStrings.radioRefresh);
      } catch (e) {
        setIsLoading(true);
        crashlytics().log('Error: Playing Podcast');
        console.log('Error: Playing Podcast');
      }
    }
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.brandBlack }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.brandBlack} />
      <Header onShare={() => shareLink(program.name + ' - ' + title, permalink)} iconColor={theme.colors.white} />
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

      <View style={[styles.playerWrapper, { maxWidth: themeState.themeOrientation.maxW }]}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.date}>{getDate(date_modified)}</Text>
        <Image resizeMode="contain" resizeMethod="auto" style={styles.image} source={{ uri: image_1x1.src }} />
        <Text style={styles.programName}>{program.name}</Text>
        <View style={styles.playerContainer}>
          <Slider
            accessibilityLabel={'Slider'}
            value={isCurrent ? progress.position : 0}
            minimumValue={0}
            maximumValue={progress?.duration ?? 0}
            minimumTrackTintColor={theme.colors.brandBlue}
            maximumTrackTintColor={theme.colors.brandGrey}
            onSlidingComplete={TrackPlayer.seekTo}
            thumbTintColor={theme.colors.white}
            disabled={!isCurrent}
          />
          <View style={styles.time}>
            <Text style={styles.timeText}>{isCurrent ? new Date(progress.position * 1000).toISOString().slice(14, 19) : '00:00'}</Text>
            <Text style={styles.timeText}>{isCurrent ? new Date(progress.duration * 1000).toISOString().slice(14, 19) : ''}</Text>
          </View>
        </View>
        <View style={styles.btnContainer} accessibilityLabel={'Controlos'}>
          <TouchableWithoutFeedback accessibilityLabel={'Recuar 15 segundos'} onPress={() => currentTrackisPlaying && seek(-1)}>
            <View>
              <Icon name={'seg1'} size={36} color={theme.colors.white} fill={currentTrackisPlaying ? theme.colors.white : theme.colors.brandGrey} />
            </View>
          </TouchableWithoutFeedback>
          {isLoading ? (
            <Loading color={theme.colors.brandGrey} size={'large'} style={styles.loading} />
          ) : (
            <TouchableWithoutFeedback accessibilityLabel={'Play/Pause'} onPress={handlePress}>
              <View>
                <Icon
                  name={currentTrackisPlaying ? 'circle-pause' : 'play'}
                  size={36}
                  color={theme.colors.white}
                  fill={theme.colors.white}
                  style={styles.iconPlayStop}
                />
              </View>
            </TouchableWithoutFeedback>
          )}
          <TouchableWithoutFeedback accessibilityLabel={'Recuar 15 segundos'} onPress={() => currentTrackisPlaying && seek(1)}>
            <View>
              <Icon name={'seg2'} size={36} color={theme.colors.white} fill={currentTrackisPlaying ? theme.colors.white : theme.colors.brandGrey} />
            </View>
          </TouchableWithoutFeedback>
        </View>
        <View style={styles.listenContainer}>
          {platforms.length > 0 && (
            <TouchableWithoutFeedback onPress={toggleModal}>
              <View style={styles.listenBtn}>
                <Icon name={'headphones'} size={12} color={theme.colors.white} fill={theme.colors.white} style={styles.iconHeadphones} />
                <Text style={styles.listenText}>Ouvir em...</Text>
              </View>
            </TouchableWithoutFeedback>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
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
  playerWrapper: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 20,
    paddingHorizontal: 15,
    justifyContent: 'space-between',
    width: '100%',
    marginRight: 'auto',
    marginLeft: 'auto',
  },
  title: {
    color: theme.colors.white,
    fontSize: 18,
    fontFamily: theme.fonts.halyardRegular,
    textAlign: 'center',
  },
  date: {
    color: theme.colors.brandGrey,
    fontSize: 16,
    fontFamily: theme.fonts.halyardRegular,
  },
  image: {
    height: 200,
    width: 200,
  },
  programName: {
    color: theme.colors.white,
    fontSize: 18,
    fontFamily: theme.fonts.halyardRegular,
  },
  playerContainer: {
    width: '100%',
  },
  time: {
    paddingHorizontal: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    color: theme.colors.white,
    fontSize: 14,
    fontFamily: theme.fonts.halyardRegular,
  },
  btnContainer: {
    flexDirection: 'row',
  },
  listenContainer: {
    flexDirection: 'row',
  },
  listenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  iconHeadphones: {
    marginRight: 6,
  },
  listenText: {
    color: theme.colors.white,
    fontSize: 14,
    fontFamily: theme.fonts.halyardRegular,
  },
  loading: {
    marginHorizontal: 30,
  },
  iconPlayStop: {
    marginHorizontal: 30,
  },
});

export default Episode;
