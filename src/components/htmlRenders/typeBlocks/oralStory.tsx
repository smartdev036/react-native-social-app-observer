import React, { FC } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { RenderHTMLSource } from 'react-native-render-html';
import { theme } from '../../../constants/theme';
import { OralStoryI } from '../../../models/articleFields';
import { imageURL } from '../../../utils/image';
import { ObsColumnContainer, ObsRowContainer, ObsText, ObsTitle } from '../../global';
import Icon from '../../icon';
import ImageBlock from './imageBlock';
import { useAppSelector } from '../../../hooks';

export const OralStory: FC<{ postBlock: OralStoryI }> = ({ postBlock }) => {
  const { width } = useWindowDimensions();
  const { image, quote, quote_author, quote_author_details } = postBlock;
  const imgSrc = imageURL(image, 180);
  const themeState = useAppSelector(s => s.theme)

  return (
    <ObsColumnContainer override={{ padding: 10 }}>
      <ObsRowContainer override={{ alignItems: 'center' }}>
        <View>
          {imgSrc && (
            <ImageBlock
              override={{
                borderRadius: 90,
                height: 180,
                width: 180,
                resizeMode: 'cover',
              }}
              caption=""
              image={imgSrc}
              credits={undefined}
            />
          )}
        </View>
        <ObsColumnContainer override={{ marginLeft: 20 }}>
          {quote_author && <ObsTitle title={quote_author} />}
          {quote_author_details && <ObsText title={quote_author_details} />}
        </ObsColumnContainer>
      </ObsRowContainer>
      <ObsRowContainer override={{ marginTop: 10 }}>
        <Icon name="quote" size={20 * themeState.fontScaleFactor} fill={theme.colors.brandBlue} color={theme.colors.brandBlue} disableFill={false} style={{ marginRight: 2 }} />
        {quote && <RenderHTMLSource contentWidth={width} source={{ html: quote }} />}
      </ObsRowContainer>
    </ObsColumnContainer>
  );
};
