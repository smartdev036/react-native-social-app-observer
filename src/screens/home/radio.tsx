import React, { useEffect, useState } from 'react';
import { View, Platform, SafeAreaView, StyleSheet } from 'react-native';
import CustomHeader from '../../components/header/header';
import RadioContent from '../../components/radioContent';
import { theme } from '../../constants/theme';
import { useNavigation } from '@react-navigation/native';
import { State, TrackType } from 'react-native-track-player';
import { API_RADIO_STREAM_URL } from '../../api';
import { Analytics, Screens } from '../../services/analytics';
import { useBetterPlayer } from '../../utils/useBetterPlayer';
import crashlytics from '@react-native-firebase/crashlytics';
import { netAudienceEvents, netAudienceStrings } from '../../constants/strings';

const Radio = () => {
  const navigation = useNavigation();
  const [isRadioPlaying, setIsRadioPlaying] = useState(false);
  const [isLoading, setIsloading] = useState(false);
  const { switchToRadioAndPlay, stopRadio, getState, playing } = useBetterPlayer();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      Analytics.trackPageView({ screen: Screens.RADIO, section: 'Rádio' });

      getState().then(async s => {
        //Pay attention because in here you just have access to the initial state
        if (s.currTrack?.description === 'radio' && s.currState === State.Playing) {
          setIsRadioPlaying(true);
          setIsloading(false);
        } else {
          setIsRadioPlaying(false);
          setIsloading(false);
        }
      });
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    getState().then(s => {
      if (s.currTrack?.description === 'radio') {
        setIsRadioPlaying(playing);
        if (playing) {
          setIsloading(false);
        }
        Analytics.gemiusTrackEvent(netAudienceEvents.radioPlay);
      } else {
        //This is necessary because we are listening also to episodes
        setIsRadioPlaying(isPlaying => {
          if (isPlaying) {
            Analytics.gemiusTrackEvent(netAudienceEvents.radioPause);
          }
          return false;
        });
      }
    });
  }, [playing]);

  async function handleClick() {
    setIsloading(false);
    if (isRadioPlaying) {
      await stopRadio();
      Analytics.clearAudioRefreshInterval();
    } else {
      try {
        setIsloading(true);
        await switchToRadioAndPlay({
          id: 1,
          url: API_RADIO_STREAM_URL + `?dist=app-react-${Platform.OS}`,
          artwork: require('../../assets/images/icon_radio.png'),
          artist: 'Observador',
          type: TrackType.HLS,
          description: 'radio',
          title: 'Rádio Observador',
        });
        Analytics.startAudioRefresh(netAudienceStrings.radioRefresh);
      } catch (e) {
        setIsloading(true);
        crashlytics().log('Error: Playing Radioo');
        console.log('Error: Playing Radioo');
      }
    }
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <CustomHeader isHome={false} menuColor={theme.colors.white} />
        <RadioContent musicPlay={handleClick} isPlaying={isRadioPlaying} loading={isLoading} />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.radioBg,
  },
});

export default Radio;
