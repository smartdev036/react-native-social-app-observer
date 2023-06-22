import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { theme } from '../../constants/theme';
import { useAppSelector } from '../../hooks';
import Icon from '../icon';

interface ItemProps {
  item: {
    id: number;
    icon: string;
    title: string;
    descr: string;
  };
}

const SliderItem = (props: ItemProps) => {
  const { id, icon, title, descr } = props.item;
  const themeState = useAppSelector(state => state.theme);
  const { width } = useWindowDimensions();

  return (
    <View key={id} style={[styles.container, { width }]}>
      <Icon name={icon} size={60} fill={theme.colors.brandBlue} color={theme.colors.brandBlue} />
      <Text
        style={[
          styles.title,
          {
            color: themeState.themeColor.color,
            fontSize: themeState.fontStyles.sliderItem.fontSize,
            lineHeight: themeState.fontStyles.sliderItem.lineHeight,
          },
        ]}
      >
        {title}
      </Text>
      <Text
        style={[
          styles.descr,
          {
            color: themeState.themeColor.color,
            fontSize: themeState.fontStyles.sliderDescr.fontSize,
            lineHeight: themeState.fontStyles.sliderDescr.lineHeight,
          },
        ]}
      >
        {descr}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: theme.fonts.halyardSemBd,
    marginVertical: 15,
  },
  descr: {
    fontFamily: theme.fonts.halyardRegular,
    textAlign: 'center',
  },
});

export default SliderItem;
