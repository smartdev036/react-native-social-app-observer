import React, { useEffect, useState } from 'react';
import { Dimensions, Linking, StyleSheet, Text, Pressable, View } from 'react-native';
import { URL_PROGRAMMING, URL_PROGRAMS } from '../api';
import AnimatedText from './animatedText';
import Icon from './icon';
import { theme } from '../constants/theme';
import { shareLink } from '../utils/share';
import Loading from './loading';
import { useLiveString } from '../utils/usePolling';
import { useAppSelector } from '../hooks';

interface RadioContentProps {
  musicPlay: any;
  isPlaying: boolean;
  loading: boolean;
}

interface RadioInfo {
  city: string;
  freq: string;
  label: boolean;
}

const windowHeight = Dimensions.get('window').height;

const RadioContent = (props: RadioContentProps) => {
  const themeState = useAppSelector(state => state.theme);
  const { musicPlay, isPlaying, loading } = props;
  const [index, setIndex] = useState(0);
  const { currentText } = useLiveString();

  const radioInfo: RadioInfo[] = [
    {
      city: 'No grande Porto',
      freq: '98.4 fm\n88.1 fm',
      label: false,
    },
    {
      city: 'Na grande Lisboa',
      freq: '93.7 fm\n98.7 fm',
      label: false,
    },
    {
      city: 'No Ribatejo',
      freq: '92.6 fm\n99.5 fm (Rio Maior)',
      label: true,
    },
    {
      city: 'No Oeste',
      freq: '92.6 fm\n\u00A0',
      label: true,
    },
  ];

  const placeholderText = radioInfo.map((item, index) => (
    <View key={index} style={styles.labelContainer}>
      {item.label ? (
        <View style={[styles.label, { backgroundColor: theme.colors.brandBlue }]}>
          <Text style={styles.labelText}>Novo</Text>
        </View>
      ) : (
        <View style={styles.label}>
          <Text style={styles.labelText}>{'\u00A0'}</Text>
        </View>
      )}
      <Text style={[styles.city, { fontSize: themeState.fontStyles.city.fontSize }]}>{item.city}</Text>
      <Text style={[styles.freq, { fontSize: themeState.fontStyles.city.fontSize }]}>{item.freq}</Text>
    </View>
  ));

  useEffect(() => {
    const timer = () => {
      setIndex(prevIndex => {
        if (prevIndex === placeholderText.length - 1) {
          return 0;
        }
        return prevIndex + 1;
      });
    };
    const timerId = setInterval(timer, 10000);
    return () => {
      clearInterval(timerId);
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.pollingContent}>
        {!isPlaying ? (
          <Text style={styles.pollingText}>Aconteça o que acontecer</Text>
        ) : windowHeight < 569 || (currentText && currentText.length > 40) ? (
          <AnimatedText>
            <Text style={styles.pollingText}>{currentText ? currentText : null}</Text>
          </AnimatedText>
        ) : (
          <Text style={styles.pollingText}>{currentText ? currentText : null}</Text>
        )}
      </View>
      <View style={styles.middleContent}>
        {isPlaying ? (
          <View style={styles.btnLive}>
            <Text style={styles.btnLiveText}>Direto</Text>
          </View>
        ) : (
          <View style={[styles.btnLive, { opacity: 0 }]}>
            <Text style={styles.btnLiveText}>Direto</Text>
          </View>
        )}
        <View style={styles.playerContainer}>
          <Pressable
            accessibilityLabel={'Play/Stop'}
            onPress={() => {
              musicPlay();
            }}
            style={styles.btnMedia}
          >
            {loading ? (
              <Loading color={theme.colors.white} size={'small'} />
            ) : (
              <Icon name={isPlaying ? 'stop' : 'play'} size={24} fill={theme.colors.white} color={theme.colors.white} disableFill={false} />
            )}
          </Pressable>
          <Pressable
            onPress={() => shareLink('Rádio Observador em Direto - Emissão Online 24h', 'https://observador.pt/radio/player')}
            style={styles.shareContainer}
          >
            <Icon name="share" size={18} fill={theme.colors.white} color={theme.colors.white} disableFill={false} />
            <Text style={styles.shareText}>Partilhar</Text>
          </Pressable>
        </View>
        <View style={styles.footer}>
          <View style={styles.marqueeContainer}>
            <View
              style={{
                width: '100%',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: 'white',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                }}
              >
                {placeholderText[index]}
              </Text>
            </View>
          </View>
          <View style={styles.btnContainer}>
            <View style={styles.btnContent}>
              <View>
                <Pressable
                  onPress={() => {
                    Linking.openURL(URL_PROGRAMS);
                  }}
                  style={styles.btn}
                >
                  <View style={styles.btnWIcon}>
                    <Icon name="programas" size={14} color={theme.colors.white} fill={theme.colors.white} style={styles.icon} disableFill={false} />
                    <Text style={styles.textButtons}>Programas</Text>
                  </View>
                </Pressable>
              </View>
              <View style={styles.btnMargin}>
                <Pressable
                  onPress={() => {
                    Linking.openURL(URL_PROGRAMMING);
                  }}
                  style={styles.btn}
                >
                  <View style={styles.btnWIcon}>
                    <Icon name="programacao" size={14} color={theme.colors.white} fill={theme.colors.white} style={styles.icon} disableFill={false} />
                    <Text style={styles.textButtons}>Programação</Text>
                  </View>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  pollingContent: {
    marginTop: 32,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  pollingText: {
    fontFamily: theme.fonts.halyardRegular,
    fontSize: 18,
    color: theme.colors.white,
  },
  middleContent: {
    marginTop: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnLive: {
    backgroundColor: theme.colors.brandBlue,
    borderRadius: 5,
    width: 71,
    padding: 4,
  },
  btnLiveText: {
    fontSize: 14,
    fontFamily: theme.fonts.halyardSemBd,
    textTransform: 'uppercase',
    color: theme.colors.white,
    textAlign: 'center',
  },
  playerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareContainer: {
    marginTop: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareText: {
    fontSize: 10,
    fontFamily: theme.fonts.halyardRegular,
    color: theme.colors.white,
    marginTop: 4,
  },
  footer: {
    justifyContent: 'flex-end',
    marginBottom: 80,
  },
  marqueeContainer: {
    flexDirection: 'row',
  },
  btnContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
    borderColor: theme.colors.white,
    marginBottom: 20,
  },
  btnMedia: {
    borderWidth: 2,
    borderColor: theme.colors.white,
    borderRadius: 100,
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btn: {
    width: 117,
    height: 26,
    borderRadius: 5,
    backgroundColor: 'rgba(206, 206, 219, 0.1)',
  },
  btnWIcon: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    marginRight: 6,
  },
  btnMargin: {
    marginLeft: 20,
  },
  textButtons: {
    fontFamily: theme.fonts.halyardRegular,
    color: theme.colors.white,
    fontSize: 13,
  },
  city: {
    color: theme.colors.white,
    fontFamily: theme.fonts.halyardRegular,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  freq: {
    color: theme.colors.white,
    fontFamily: theme.fonts.halyardBold,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  labelContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    marginVertical: 2,
    paddingHorizontal: 4,
    paddingVertical: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelText: {
    color: theme.colors.white,
    textTransform: 'uppercase',
    fontSize: 12,
    fontFamily: theme.fonts.halyardRegular,
    textAlign: 'center',
  },
});

export default RadioContent;
