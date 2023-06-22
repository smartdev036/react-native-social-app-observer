import React, { FC } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { theme } from '../../../constants/theme';
import { QuoteBlockI } from '../../../models/articleFields';
import { imageURL } from '../../../utils/image';
import { useAppSelector } from '../../../hooks';

export const QuoteBlock: FC<{ postBlock: QuoteBlockI }> = ({ postBlock }) => {
  const themeState = useAppSelector(state => state.theme);
  const { author, back_color, image_url, mega_quote_type, quote } = postBlock;
  const authorMargin = author ? 10 : 0;
  const getBgColor = (bgColor: string) => {
    switch (back_color) {
      case 'preto':
        bgColor = theme.colors.brandBlack;
        break;
      case 'azul':
        bgColor = theme.colors.brandBlue;
        break;
      case 'branco':
        bgColor = theme.colors.white;
        break;
      case 'cinzento':
        bgColor = theme.colors.brandGrey;
        break;
      default:
        bgColor = theme.colors.brandBlack;
        break;
    }
    return bgColor;
  };

  return (
    <>
      <View style={{ marginVertical: 10 }}>
        {mega_quote_type === 'image' && !!image_url && <Image resizeMode={'contain'} style={styles.image} source={{ uri: imageURL(image_url, 800) }} />}
        <View
          style={[
            styles.container,
            {
              backgroundColor: back_color ? getBgColor(back_color) : undefined,
            },
          ]}
        >
          <Text
            style={{
              marginBottom: authorMargin,
              color: back_color === 'branco' ? theme.colors.brandBlue : theme.colors.white,
              fontSize: themeState.fontStyles.quote.fontSize,
              lineHeight: themeState.fontStyles.quote.lineHeight,
              fontFamily: themeState.fontStyles.quote.fontFamily,
            }}
          >{`${quote}`}</Text>
          {author ? (
            <Text
              style={{
                color: back_color === 'branco' ? theme.colors.brandBlack : theme.colors.white,
                fontSize: themeState.fontStyles.quoteAuthor.fontSize,
                fontFamily: themeState.fontStyles.quoteAuthor.fontFamily,
              }}
            >
              {author}
            </Text>
          ) : (
            <></>
          )}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
  },
  image: {
    aspectRatio: 16 / 9,
    width: '100%',
  },
});

export default QuoteBlock;
