import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, StyleProp, ImageStyle, Modal, Dimensions } from 'react-native';
import { theme } from '../../../constants/theme';
import Icon from '../../icon';
import { useImageAspectRatio } from '../../../utils/image';
import DeviceInfo from 'react-native-device-info';
import { decodeHTMLEntities } from '../../../utils/decodeHtmlEntities';
import { useAppSelector } from '../../../hooks';
import ImageViewer from 'react-native-image-zoom-viewer';

interface imageBlockProps {
  caption: string;
  credits: string | undefined;
  image: string;
  override?: StyleProp<ImageStyle>;
}

const ImageBlock = (props: imageBlockProps): JSX.Element => {
  const themeState = useAppSelector(state => state.theme);
  const { caption, credits, image, override } = props;
  const [toggle, setToggle] = useState(false);
  const [visible, setIsVisible] = useState(false);
  const aspectRatio = useImageAspectRatio(image);
  const imgWidthContainer = Dimensions.get('screen').width - theme.styles.articleContentHorizontalPadding * 2;
  const isTablet = DeviceInfo.isTablet();

  const toggleFunction = () => {
    setToggle(!toggle);
  };

  if (!image || !aspectRatio) {
    return <></>;
  }

  const RenderHeader = () => {
    return (
      <TouchableOpacity activeOpacity={0.9} onPress={() => setIsVisible(!visible)} style={styles.closeContainer}>
        <Icon name={'close'} size={20} disableFill={false} fill={theme.colors.white} color={theme.colors.white} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { width: isTablet ? '100%' : imgWidthContainer }]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          setIsVisible(true);
        }}
      >
        <Image style={[{ aspectRatio }, override]} source={{ uri: image }} />
      </TouchableOpacity>
      <Modal visible={visible} statusBarTranslucent={true}>
        <ImageViewer
          enableSwipeDown={true}
          onSwipeDown={() => setIsVisible(false)}
          swipeDownThreshold={40}
          renderIndicator={() => <></>}
          imageUrls={[
            {
              url: image,
            },
          ]}
          renderHeader={() => <RenderHeader />}
        />
      </Modal>
      {caption ? (
        <TouchableOpacity activeOpacity={0.9} onPress={() => toggleFunction()} style={styles.captionBtnContainer}>
          <View style={styles.circleBtn}>
            <Icon size={14} name="info-2" fill={theme.colors.brandBlack} color={theme.colors.brandBlack} disableFill={false} />
          </View>
        </TouchableOpacity>
      ) : null}
      {caption || credits
        ? toggle && (
            <View style={styles.overlay}>
              <Text
                style={[
                  styles.captions,
                  {
                    fontSize: themeState.fontStyles.captions.fontSize,
                    lineHeight: themeState.fontStyles.captions.lineHeight,
                    fontFamily: themeState.fontStyles.captions.fontFamily,
                  },
                ]}
              >
                {decodeHTMLEntities(caption.trimStart() as string)}
              </Text>
              {credits && (
                <Text style={[styles.credits, { fontSize: themeState.fontStyles.credits.fontSize, fontFamily: themeState.fontStyles.credits.fontFamily }]}>
                  {decodeHTMLEntities(credits.trimStart() as string)}
                </Text>
              )}
            </View>
          )
        : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginVertical: 10,
  },
  captionBtnContainer: {
    zIndex: 999,
    position: 'absolute',
    bottom: 12,
    right: 12,
  },
  circleBtn: {
    backgroundColor: theme.colors.white,
    borderRadius: 100,
    padding: 4,
    opacity: 0.8,
  },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0, 0.5)',
    padding: 15,
  },
  captions: {
    color: theme.colors.white,
  },
  credits: {
    color: theme.colors.white,
    marginTop: 10,
  },
  closeContainer: {
    padding: 10,
    position: 'absolute',
    zIndex: 1,
    right: 14,
    top: 50,
  },
});

export default ImageBlock;
