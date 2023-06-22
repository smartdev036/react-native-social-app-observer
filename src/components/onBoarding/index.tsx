import React, { useState, useRef, FC, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Animated,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ViewToken,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StatusBar,
} from 'react-native';
import { useAppSelector } from '../../hooks';
import { theme } from '../../constants/theme';
import Icon from '../icon';
import SliderItem from './sliderItem';
import { slides } from './data';
import Paginator from './paginator';
import { strings } from '../../constants/strings';
import { Analytics } from '../../services/analytics';

export interface OnBoardingProps {
  onFinish: () => void;
  onSkip: () => void;
}

interface SlideItem {
  id: number;
  icon: string;
  title: string;
  descr: string;
}

const OnBoarding: FC<OnBoardingProps> = ({ onFinish, onSkip }) => {
  const themeState = useAppSelector(state => state.theme);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = new Animated.Value(0);
  const slidesRef = useRef<FlatList<SlideItem> | null>(null);
  const viewConfig = { viewAreaCoveragePercentThreshold: 50 };

  const viewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      const index = viewableItems[0].index ?? 0;
      setCurrentIndex(index);
    }
  }, []);

  const handlerNextBtn = () => {
    if (currentIndex < slides.length - 1 && slidesRef.current) {
      Analytics.sendClickEvent({ event_name: 'onboard', click_action: 'next', click_location: 'bottom', click_label: slides[currentIndex].title });
      slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      Analytics.sendClickEvent({ event_name: 'onboard', click_action: 'next', click_location: 'bottom', click_label: slides[currentIndex].title });
      onFinish();
    }
  };

  const handlerPrevBtn = () => {
    if (currentIndex > 0 && slidesRef.current) {
      slidesRef.current.scrollToIndex({ index: currentIndex - 1 });
    }
  };

  const handlerSkipStep = () => {
    onSkip();
  };

  function handleOnScrollEnd(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const { contentOffset, layoutMeasurement } = event.nativeEvent;
    const currentIndex = Math.floor(contentOffset.x / layoutMeasurement.width);
    Analytics.sendClickEvent({ event_name: 'onboard', click_action: 'next', click_location: 'bottom', click_label: slides[currentIndex].title });
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeState.themeColor.onBoardingBg.background }]}>
      <StatusBar
        backgroundColor={themeState.themeColor.theme === 'dark' ? themeState.themeColor.background : themeState.themeColor.onBoardingBg.background}
        barStyle={themeState.themeColor.theme === 'dark' ? 'light-content' : 'dark-content'}
      />
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.logo}>
            <Icon name={'logo-observador'} size={150} fill={themeState.themeColor.color} color={themeState.themeColor.color} disableFill={false} />
          </View>
          <Text
            style={[
              styles.headerTitle,
              {
                color: themeState.themeColor.color,
                fontSize: themeState.fontStyles.onBoardingTitle.fontSize,
                lineHeight: themeState.fontStyles.onBoardingTitle.lineHeight,
              },
            ]}
          >
            {strings.onBoarding.headerTitle}
          </Text>
        </View>
        <View style={styles.sliderContainer}>
          <FlatList
            data={slides}
            renderItem={({ item }) => <SliderItem item={item} />}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            bounces={false}
            keyExtractor={item => item.id.toString()}
            onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
              useNativeDriver: false,
            })}
            onScrollEndDrag={handleOnScrollEnd}
            onViewableItemsChanged={viewableItemsChanged}
            viewabilityConfig={viewConfig}
            scrollEventThrottle={32}
            ref={slidesRef}
          />
        </View>
        <View style={styles.paginatorContainer}>
          <View style={styles.col}>
            {currentIndex > 0 && (
              <TouchableOpacity
                accessibilityLabel={'Recuar'}
                activeOpacity={0.8}
                onPress={handlerPrevBtn}
                style={[styles.btn, { backgroundColor: theme.colors.mediumGrey }]}
              >
                <View style={styles.iconContainer}>
                  <Icon name={'arrow-intro'} size={20} fill={theme.colors.white} color={theme.colors.white} style={styles.icon} />
                </View>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.col}>
            <Paginator data={slides} scrollX={scrollX} />
          </View>
          <View style={[styles.col, { alignItems: 'flex-end' }]}>
            <TouchableOpacity
              accessibilityLabel={'Avançar'}
              activeOpacity={0.8}
              onPress={handlerNextBtn}
              style={[styles.btn, { backgroundColor: theme.colors.brandBlue }]}
            >
              <View style={styles.iconContainer}>
                <Icon name={'arrow-intro'} size={20} fill={theme.colors.white} color={theme.colors.white} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity activeOpacity={0.8} onPress={handlerSkipStep} style={styles.skipContainer}>
          <View style={styles.skipWrapper}>
            <Text style={[styles.skipText, { fontSize: themeState.fontStyles.onBoardingskipText.fontSize }]}>{strings.onBoarding.skipThisStep}</Text>
            <View style={styles.skipIconContainer}>
              <Icon
                name={'arrow-intro'}
                size={15 * themeState.fontScaleFactor}
                fill={theme.colors.brandGrey}
                color={theme.colors.brandGrey}
                style={styles.skipIcon}
              />
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  logo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 24,
  },
  headerTitle: {
    fontFamily: theme.fonts.halyardRegular,
  },
  sliderContainer: {
    flex: 2,
  },
  paginatorContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 40,
  },
  col: {
    flex: 1,
  },
  btn: {
    height: 32,
    width: 32,
    borderRadius: 50,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  icon: {
    transform: [{ rotate: '180deg' }],
  },
  skipContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: theme.colors.mediumGrey,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipWrapper: {
    flexDirection: 'row',
    paddingVertical: 20,
  },
  skipText: {
    color: theme.colors.brandGrey,
    fontFamily: theme.fonts.halyardRegular,
  },
  skipIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipIcon: {
    marginHorizontal: 8,
    marginTop: 3,
  },
});

export default OnBoarding;
