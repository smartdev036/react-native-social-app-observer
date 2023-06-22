import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../../constants/theme';
import { strings } from '../../constants/strings';
import { useAppSelector } from '../../hooks';
import { CommonActions, useNavigation } from '@react-navigation/native';

const NotPremium = () => {
  const themeState = useAppSelector(state => state.theme);
  const navigation = useNavigation();
  return (
    <Text style={[styles.text, { color: themeState.themeColor.boxPremiumText }]}>
      {strings.comments.toComment}
      <Text
        style={styles.link}
        onPress={() => {
          navigation.dispatch(CommonActions.navigate('Subscribe'));
        }}
      >
        {strings.comments.premium}
      </Text>
      <Text>{strings.comments.or}</Text>
      <Text
        style={styles.link}
        onPress={() => {
          navigation.dispatch(CommonActions.navigate('Login'));
        }}
      >
        {' ' + strings.comments.login}
      </Text>
      <Text>{strings.comments.toComment1}</Text>
    </Text>
  );
};

const NotLogged = () => {
  const themeState = useAppSelector(state => state.theme);
  const navigation = useNavigation();
  return (
    <Text style={[styles.text, { color: themeState.themeColor.boxPremiumText }]}>
      {strings.comments.toComment}
      <Text
        style={styles.link}
        onPress={() => {
          navigation.dispatch(CommonActions.navigate('Login'));
        }}
      >
        {strings.comments.login}
      </Text>
      <Text>{strings.comments.withPremium}</Text>
    </Text>
  );
};

const NotAllowedComment = () => {
  const themeState = useAppSelector(state => state.theme);
  const { piano } = useAppSelector(state => ({ piano: state.piano }));

  return (
    <View style={[styles.container, { backgroundColor: themeState.themeColor.boxPremiumBg }]}>
      <View style={styles.textContainer}>{!piano.isPremium ? <NotPremium /> : <NotLogged />}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    paddingVertical: 16,
  },
  textContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    fontFamily: theme.fonts.halyardRegular,
  },
  link: {
    fontSize: 16,
    color: theme.colors.brandBlue,
    fontFamily: theme.fonts.halyardRegular,
  },
});

export default NotAllowedComment;
