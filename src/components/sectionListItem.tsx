import React, { FC } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../constants/theme';
import { useAppSelector } from '../hooks';

interface IProps {
  title: string;
  height: number;
  active: boolean;
}

const SectionListItem: FC<IProps> = function (props) {
  const { title, height, active } = props;
  const themeState = useAppSelector(state => state.theme);
  return (
    <View style={[styles.sectionListItemContainer, { height: height }]}>
      <View style={[styles.sectionListItemWrapper, { backgroundColor: active ? theme.colors.brandBlue : themeState.themeColor.transparent }]}>
        <Text style={[styles.sectionListItemText, { color: active ? theme.colors.white : themeState.themeColor.color }]}>{title}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionListItemContainer: {
    justifyContent: 'center',
    margin: -0.66,
  },
  sectionListItemWrapper: {
    width: 20,
    height: 20,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionListItemText: {
    fontSize: 12,
    textAlign: 'center',
    fontFamily: theme.fonts.halyardRegular,
  },
});

export default SectionListItem;
