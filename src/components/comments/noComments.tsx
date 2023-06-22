import React from 'react';
import {Text, View, StyleSheet} from 'react-native';
import {theme} from '../../constants/theme';
import {strings} from '../../constants/strings';
import {useAppSelector} from '../../hooks';

const NoComments = () => {
  const themeState = useAppSelector((s) => s.theme);
  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.info,
          {
            color: themeState.themeColor.color,
          },
        ]}
      >
        {strings.comments.noComments}
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
  info: {
    fontSize: 14,
    fontFamily: theme.fonts.halyardRegular,
    textAlign: 'center',
  },
});

export default NoComments;
