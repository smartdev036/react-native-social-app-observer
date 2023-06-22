import React from 'react';
import {StyleSheet, View} from 'react-native';
import {theme} from '../../constants/theme';

interface ArticleListsBorderProps {
  border: boolean;
}

export const ArticleListsBorder = (props: ArticleListsBorderProps) => {
  const {border} = props;
  return (
    <>
      {border ? <View style={styles.borderContainer}><View style={styles.border}/></View> : null}
    </>
  );
};

const styles = StyleSheet.create({
  borderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  border: {
    width: '100%',
    borderBottomWidth: 1,
    borderColor: theme.colors.brandGrey,
    opacity: 0.2,
  },
});
