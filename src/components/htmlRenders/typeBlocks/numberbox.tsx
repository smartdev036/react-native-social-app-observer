import React from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { RenderHTMLSource } from 'react-native-render-html';
import { theme } from '../../../constants/theme';
import { useAppSelector } from '../../../hooks';
import { NumberBoxBlock } from '../../../models/articleFields';

export const NumberBox: React.FC<{ postBlock: NumberBoxBlock }> = ({ postBlock }) => {
  const themeState = useAppSelector(state => state.theme);
  const { width } = useWindowDimensions();
  const styles = StyleSheet.create({
    container: {
      backgroundColor: themeState.themeColor.theme === 'dark' ? theme.colors.brandGrey : theme.colors.lightGrey,
      paddingLeft: 10,
      paddingBottom: 10,
    },
    header: {
      fontSize: themeState.fontStyles.numberBoxHeader.fontSize,
      fontFamily: themeState.fontStyles.numberBoxHeader.fontFamily,
      color: theme.colors.brandBlue,
    },
    credits: {
      fontSize: themeState.fontStyles.numberBoxCredits.fontSize,
      color: themeState.themeColor.theme === 'dark' ? theme.colors.white : theme.colors.brandBlack,
      fontFamily: themeState.fontStyles.numberBoxCredits.fontFamily,
    },
  });
  return (
    <View style={styles.container}>
      <Text style={styles.header}>{postBlock.title}</Text>
      <RenderHTMLSource source={{ html: postBlock.text }} contentWidth={width} />
      <Text style={styles.credits}>{postBlock.credits}</Text>
    </View>
  );
};
