import TrackPlayer, {Event, State} from 'react-native-track-player';

let wasPausedByDuck = false;

// eslint-disable-next-line no-undef
module.exports = async function setup() {
  TrackPlayer.addEventListener(Event.RemotePause, () => {
    TrackPlayer.pause();
  });
  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    TrackPlayer.play();
  });
  TrackPlayer.addEventListener(Event.RemoteStop, () => {
    TrackPlayer.stop();
  });
  TrackPlayer.addEventListener(Event.RemoteNext, () => {
    TrackPlayer.skipToNext();
  });
  TrackPlayer.addEventListener(Event.RemotePrevious, () => {
    TrackPlayer.skipToPrevious();
  });

  TrackPlayer.addEventListener(Event.RemoteDuck, async e => {
    if (e.permanent === true) {
      TrackPlayer.reset();
    } else {
      if (e.paused === true) {
        const state = await TrackPlayer.getState();
        if(state === State.Playing) {
          wasPausedByDuck = true;
        }
        await TrackPlayer.pause();
      } else {
        if (wasPausedByDuck === true) {
          await TrackPlayer.play();
          wasPausedByDuck = false;
        }
      }
    }
  });
};
