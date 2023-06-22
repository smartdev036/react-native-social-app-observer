import React, { Ref } from 'react';

import { strings } from '../../constants/strings';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { theme } from '../../constants/theme';
import { useAppSelector } from '../../hooks';

interface BoxCommentProps {
  innerRef?: Ref<any> | undefined;
  value: string | undefined;
  onChangeText: ((text: string) => void) | undefined;
  rightIcon: JSX.Element;
}

const BoxComment = (props: BoxCommentProps) => {
  const { innerRef, value, onChangeText, rightIcon } = props;
  const themeState = useAppSelector(state => state.theme);

  return (
    <View style={[styles.container, { shadowColor: themeState.themeColor.color, backgroundColor: themeState.themeColor.boxCommentsBg }]}>
      <View style={styles.inputWrapper}>
        <Text style={[styles.inputLabelStyle, { color: themeState.themeColor.color }]}>{strings.comments.sendComment}</Text>
        <TextInput
          ref={innerRef}
          multiline={true}
          placeholder={strings.comments.placeholder}
          placeholderTextColor={theme.colors.brandGrey}
          value={value}
          onChangeText={onChangeText}
          style={[styles.inputStyle, { color: themeState.themeColor.color }]}
        />
      </View>
      <View style={styles.iconContainer}>{rightIcon}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingVertical: 5,
    paddingHorizontal: 10,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    elevation: 9,
  },
  inputWrapper: {
    flex: 1,
    maxHeight: 200,
  },
  inputContainer: {
    borderBottomWidth: 0,
  },
  inputLabelStyle: {
    fontSize: 16,
    paddingVertical: 5,
    fontFamily: theme.fonts.halyardBold,
  },
  inputStyle: {
    fontSize: 14,
    fontFamily: theme.fonts.halyardRegular,
    paddingHorizontal: 0,
    maxHeight: 100,
    paddingBottom: 10,
  },
  iconContainer: {
    marginBottom: 15,
    marginRight: 15,
    marginLeft: 5,
  },
});

export default BoxComment;
