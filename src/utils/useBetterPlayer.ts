import TrackPlayer, { State, Track, usePlaybackState, useProgress } from 'react-native-track-player';

export const useBetterPlayer = () => {
  const progress = useProgress();
  const state = usePlaybackState();

  async function getCurrentTrack(): Promise<Track | null> {
    const i = await TrackPlayer.getCurrentTrack();
    if (i !== null) {
      return await TrackPlayer.getTrack(i);
    }
    return null;
  }

  async function switchTrackAndPlay(newTrack: Track) {
    const currT = await getCurrentTrack();
    if (!currT || currT.url !== newTrack.url) {
      await TrackPlayer.reset();
      await TrackPlayer.add(newTrack);
      await TrackPlayer.play();
      return;
    }
    await TrackPlayer.play();
  }

  async function switchToRadioAndPlay(newTrack: Track) {
    const currT = await getCurrentTrack();
    if (!currT || currT.description !== 'radio') {
      await TrackPlayer.reset();
      await TrackPlayer.add(newTrack);
      await TrackPlayer.play();
      return;
    }
    await TrackPlayer.play();
  }

  async function stopRadio() {
    // TODO check if new versions has a stop option
    await TrackPlayer.reset();
  }

  async function pauseTrack() {
    const currT = await getCurrentTrack();
    if (currT) {
      if (currT.description !== 'radio') {
        await TrackPlayer.pause();
      } else {
        await stopRadio();
      }
    }
  }

  async function getState(): Promise<{ currState: State; currTrack: Track | null }> {
    const currState = await TrackPlayer.getState();
    const currTrack = await getCurrentTrack();
    return {
      currState,
      currTrack,
    };
  }

  async function seek(a: 1 | -1) {
    await TrackPlayer.seekTo(progress.position + 15 * a);
  }

  return {
    pauseTrack,
    switchToRadioAndPlay,
    stopRadio,
    getState,
    switchTrackAndPlay,
    seek,
    progress,
    playing: state === State.Playing,
  };
};
