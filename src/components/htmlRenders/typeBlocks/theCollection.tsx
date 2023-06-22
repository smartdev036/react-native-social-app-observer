import React from 'react';
import { Image, Linking, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../../constants/theme';
import { useAppSelector } from '../../../hooks';
import { TheCollectionBlock } from '../../../models/articleFields';
import { imageURL, useImageAspectRatio } from '../../../utils/image';
import CustomButton from '../../customButton';
import { ObsColumnContainer, ObsRowContainer, ObsText, ObsTitle } from '../../global';
import Icon from '../../icon';

export const TheCollection: React.FC<{ postBlock: TheCollectionBlock }> = ({ postBlock }) => {
  const { image, title, cta_text, cta_url, description } = postBlock;

  const imgSrc = imageURL(image, 800);
  const aspectRatio = useImageAspectRatio(imgSrc as string);
  const themeState = useAppSelector(state => state.theme);
  const styles = StyleSheet.create({
    cantinho: {
      position: 'absolute',
      top: 0,
      right: 0,
      borderTopColor: themeState.themeColor.background,
      borderLeftColor: themeState.themeColor.transparent,
      borderTopWidth: 45,
      borderLeftWidth: 45,
      width: 0,
      height: 0,
    },
    image: {
      width: '100%',
    },
  });

  function handleCtaPress() {
    Linking.canOpenURL(cta_url).then(supported => {
      if (supported) {
        Linking.openURL(cta_url);
      }
    });
  }

  return (
    <ObsColumnContainer override={{ backgroundColor: theme.colors.lightGrey, marginVertical: 10 }}>
      <View style={{ position: 'relative' }}>
        {imgSrc && (
          <>
            {imgSrc && aspectRatio && <Image style={[styles.image, { aspectRatio }]} source={{ uri: imgSrc }} />}
            <Text style={styles.cantinho}></Text>
          </>
        )}
      </View>

      <ObsColumnContainer override={{ paddingTop: 10, paddingHorizontal: 10 }}>
        {title && <ObsTitle title={title} override={{ color: theme.colors.brandBlack }} />}
        {description && <ObsText title={description} override={{ marginBottom: 10, color: theme.colors.brandBlack }} />}
        <ObsRowContainer override={{ justifyContent: 'space-between', alignItems: 'center' }}>
          {cta_text && (
            <CustomButton
              title={cta_text}
              onPress={handleCtaPress}
              bgColor={theme.colors.lightGrey}
              textColor={theme.colors.brandBlack}
              borderColor={theme.colors.brandBlack}
              border={true}
            />
          )}
          <Icon size={40} name="thecollection-logo" fill={theme.colors.brandBlack} color={theme.colors.brandBlack} disableFill={false} />
          <Icon size={80} name="obslifestyle-logo" fill={theme.colors.brandBlack} color={theme.colors.brandBlack} disableFill={false} />
        </ObsRowContainer>
      </ObsColumnContainer>
    </ObsColumnContainer>
  );
};
