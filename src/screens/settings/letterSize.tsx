import React, { useState } from 'react';
import { Text, View, StyleSheet, SafeAreaView } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { strings } from '../../constants/strings';
import HeaderScreens from '../../components/header/headerScreens';
import { theme } from '../../constants/theme';
import { Slider } from '../../components/slider';
import { SliderOnChangeCallback } from '../../components/slider/types';
import { setFontScaleFactor } from '../../reducers/theme';

const LetterSize = () => {
  const themeState = useAppSelector(state => state.theme);
  const dispatch = useAppDispatch();

  const handleSliderComplete: SliderOnChangeCallback = value => {
    dispatch(setFontScaleFactor(value[0]));
  };

  const SliderContainer = (props: { children: React.ReactElement; sliderValue?: Array<number>; trackMarks?: Array<number> }) => {
    const { sliderValue, trackMarks } = props;
    const [value, setValue] = useState(sliderValue ? sliderValue : themeState.fontScaleFactor);
    let renderTrackMarkComponent: (index: number) => JSX.Element;

    const borderWidth = 3;
    const trackMarkStyles = StyleSheet.create({
      activeMark: {
        borderColor: theme.colors.brandGrey,
        borderWidth,
        borderRadius: 20,
        marginLeft: 10,
      },
      inactiveMark: {
        borderColor: theme.colors.brandBlue,
        borderWidth,
        borderRadius: 20,
        marginLeft: 10,
      },
    });

    if (trackMarks?.length && (!Array.isArray(value) || value?.length === 1)) {
      renderTrackMarkComponent = (index: number) => {
        const currentMarkValue = trackMarks[index];
        const currentSliderValue = value || (Array.isArray(value) && value[0]) || 0;

        let style = trackMarkStyles.inactiveMark;
        if (currentMarkValue === 0.8) {
          style = {
            ...trackMarkStyles.inactiveMark,
            marginLeft: 0,
          };
        } else if (currentMarkValue === 1.2) {
          style = {
            ...trackMarkStyles.activeMark,
            marginLeft: 14,
          };
        } else if (currentMarkValue > Math.max(currentSliderValue)) {
          style = trackMarkStyles.activeMark;
        }
        return <View style={style} />;
      };
    }

    const renderChildren = () => {
      return React.Children.map(props.children, (child: React.ReactElement) => {
        if (!!child && child.type === Slider) {
          return React.cloneElement(child, {
            onSlidingComplete: handleSliderComplete,
            renderTrackMarkComponent,
            trackMarks,
            value,
          });
        }
        return child;
      });
    };
    return <>{renderChildren()}</>;
  };

  return (
    <SafeAreaView style={[styles.safeAreaView, { backgroundColor: themeState.themeColor.background }]}>
      <HeaderScreens isArticlePage={false} hasTitle={true} screenTitle={strings.letterSize.screenTitle} />
      <View style={[styles.container, { maxWidth: themeState.themeOrientation.maxW }]}>
        <View style={styles.contentWrapper}>
          <View style={styles.previewContainer}>
            <Text style={[styles.previewText, { fontSize: 14 * themeState.fontScaleFactor }]}>O texto principal terá esta aparência.</Text>
          </View>
          <View style={styles.labelContainer}>
            <Text style={[styles.label, { color: themeState.themeColor.color }]}>Tamanho do tipo de letra</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center' }}>
            <Text style={[styles.smallLetter, { color: themeState.themeColor.color }]}>A</Text>
            <View style={{ flex: 1, paddingHorizontal: 10 }}>
              <SliderContainer trackMarks={[0.8, 0.9, 1, 1.1, 1.2]}>
                <Slider
                  maximumValue={1.2}
                  minimumValue={0.8}
                  step={0.1}
                  onSlidingComplete={handleSliderComplete}
                  minimumTrackTintColor={theme.colors.brandBlue}
                  maximumTrackTintColor={theme.colors.brandGrey}
                  thumbStyle={styles.thumb}
                  trackStyle={styles.track}
                />
              </SliderContainer>
            </View>
            <Text style={[styles.bigLetter, { color: themeState.themeColor.color }]}>A</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
  },
  container: {
    flex: 1,
    width: '100%',
    marginRight: 'auto',
    marginLeft: 'auto',
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'gray',
    maxHeight: 200,
    width: '100%',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  previewText: {
    color: theme.colors.white,
    fontFamily: theme.fonts.halyardRegular,
  },
  labelContainer: {
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontFamily: theme.fonts.halyardRegular,
  },
  thumb: {
    backgroundColor: theme.colors.brandBlue,
  },
  track: {
    height: 4,
  },
  smallLetter: {
    fontSize: 18,
    fontFamily: theme.fonts.halyardBold,
  },
  bigLetter: {
    fontSize: 24,
    fontFamily: theme.fonts.halyardBold,
  },
});

export default LetterSize;
