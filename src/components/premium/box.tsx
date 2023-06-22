import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Platform } from 'react-native';
import { OS } from '../../constants';
import { TouchableOpacity } from 'react-native';
import { theme } from '../../constants/theme';
import { strings } from '../../constants/strings';
import { useAppSelector } from '../../hooks';

interface BoxProps {
  title: string;
  priceAndroid: string;
  priceIos: string;
  titleMonth: string;
  onClick: () => void;
}

const Box = (props: BoxProps) => {
  const { title, priceAndroid, priceIos, titleMonth, onClick } = props;
  const themeState = useAppSelector(state => state.theme);

  return (
    <View style={styles.boxWrapper}>
      <View style={[styles.box, { borderColor: themeState.themeColor.paywall.border }]}>
        <Text
          style={[
            styles.boxTitle,
            {
              fontSize: themeState.fontStyles.premiumBox.fontSize,
              lineHeight: themeState.fontStyles.premiumBox.lineHeight,
              fontFamily: themeState.fontStyles.premiumBox.fontFamily,
            },
          ]}
        >
          {title}
        </Text>
        <Text
          style={[
            styles.boxPrice,
            {
              color: themeState.themeColor.color,
              fontSize: themeState.fontStyles.premiumBoxPrice.fontSize,
              lineHeight: themeState.fontStyles.premiumBoxPrice.lineHeight,
              fontFamily: themeState.fontStyles.premiumBoxPrice.fontFamily,
            },
          ]}
        >
          {Platform.OS === OS.android ? priceAndroid : priceIos}
          <Text
            style={{
              fontSize: themeState.fontStyles.premiumBoxMonthOrYear.fontSize,
              fontFamily: themeState.fontStyles.premiumBoxMonthOrYear.fontFamily,
            }}
          >
            {titleMonth}
          </Text>
        </Text>
        <View style={styles.boxBtnWrapper}>
          <TouchableOpacity activeOpacity={0.9} onPress={onClick} style={[styles.boxBtn, { backgroundColor: themeState.themeColor.paywall.BtnBackground }]}>
            <Text
              style={[
                styles.boxBtnTitle,
                {
                  fontSize: themeState.fontStyles.premiumButton.fontSize,
                  lineHeight: themeState.fontStyles.premiumButton.lineHeight,
                  fontFamily: themeState.fontStyles.premiumButton.fontFamily,
                },
              ]}
            >
              {strings.paywall.boxBtnTitle}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  boxWrapper: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  box: {
    borderWidth: 1,
    width: 218,
    paddingVertical: 10,
    borderRadius: 3,
  },
  boxTitle: {
    color: theme.colors.brandGrey,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  boxPrice: {
    textAlign: 'center',
  },
  boxBtnWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
  },
  boxBtn: {
    width: 149,
    height: 43,
    justifyContent: 'center',
    marginBottom: 10,
  },
  boxBtnTitle: {
    textAlign: 'center',
    color: theme.colors.brandBlack,
  },
});

export default Box;
