import React from 'react';
import { ImageStyle, Platform, StyleProp } from 'react-native';
import { imageURL } from '../utils/image';
import { OS } from '../constants';
import { Image, Skeleton } from '@rneui/themed';
import { useAppSelector } from '../hooks';

interface AuthorImageProps {
  url: string;
  border?: boolean;
  style?: StyleProp<ImageStyle> | any;
}

const AuthorImage = (props: AuthorImageProps) => {
  const image = imageURL(props.url, 400);
  const themeState = useAppSelector(state => state.theme);

  let finalStyle: StyleProp<ImageStyle> = { ...props.style };
  if (props.border) {
    finalStyle = { ...finalStyle, ...{ borderWidth: 15, borderColor: themeState.themeColor.opinionBackgroundImage } };
  }

  return (
    <Image
      source={{ uri: image }}
      resizeMode={Platform.OS === OS.ios ? 'cover' : 'contain'}
      borderRadius={50}
      containerStyle={finalStyle}
      PlaceholderContent={<Skeleton circle />}
      style={{ borderRadius: 50 }}
    />
  );
};

export default AuthorImage;
