import React, { useState } from 'react';
import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../../../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { imageURL } from '../../../utils/image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ImageViewer from 'react-native-image-zoom-viewer';
import Icon from '../../icon';
import { GalleryBlockI } from '../../../models/articleFields';
import { useAppSelector } from '../../../hooks';
import { Analytics, Screens } from '../../../services/analytics';

interface RenderIndicatorProps {
  currentIndex: number | undefined;
  allSize: number | undefined;
}

export const GalleryBlock: React.FC<{ postBlock: GalleryBlockI }> = ({ postBlock }) => {
  const { images } = postBlock;
  const [valid, setValid] = useState(true);
  const [visible, setIsVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const marginBottomInsets = insets.bottom > 0 ? 55 : 10;
  const themeState = useAppSelector(state => state.theme);

  function itemCounter() {
    const index = 1;
    let galleryItems = images && images.length;
    if (images && images.length < 1) {
      return;
    }
    return <Text>{'Foto ' + index + ' / ' + galleryItems}</Text>;
  }

  let imagesIndex: { url: string }[] | undefined = [];
  images &&
    images.forEach((element: { url: string }) => {
      imagesIndex?.push({ url: imageURL(element.url, 800) });
    });

  const RenderIndicator = (props: RenderIndicatorProps) => {
    const { currentIndex, allSize } = props;
    return (
      <View style={[styles.overlayCountBox, { bottom: marginBottomInsets }]}>
        <Text>{images[0].credits}</Text>
        <Text
          style={[
            styles.textOverlayCountBox,
            {
              fontSize: themeState.fontStyles.galleryBlockCountBox.fontSize,
              fontFamily: themeState.fontStyles.galleryBlockCountBox.fontFamily,
            },
          ]}
        >
          {currentIndex} / {allSize}
        </Text>
      </View>
    );
  };

  const RenderHeader = () => {
    return (
      <TouchableOpacity onPress={() => setIsVisible(!visible)} style={styles.closeContainer}>
        <Icon name={'close'} size={20} disableFill={false} fill={theme.colors.white} color={theme.colors.white} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          setIsVisible(true);
        }}
      >
        {images && (
          <Image
            resizeMode={'cover'}
            style={styles.image}
            source={{ uri: imageURL(images[0].url, themeState.themeOrientation.imageW) }}
            onError={() => setValid(false)}
          />
        )}
        <LinearGradient
          colors={[
            themeState.themeColor.transparent,
            valid && images ? 'rgba(0,0,0,0.3)' : themeState.themeColor.transparent,
            valid && images ? 'rgba(0,0,0,0.6)' : themeState.themeColor.transparent,
          ]}
          style={styles.linearGradient}
        >
          <View style={styles.countBox}>
            <Text
              style={[
                styles.textCountBox,
                {
                  fontSize: themeState.fontStyles.galleryBlockCountBox.fontSize,
                  fontFamily: themeState.fontStyles.galleryBlockCountBox.fontFamily,
                },
              ]}
            >
              {itemCounter()}
            </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
      <Modal visible={visible} statusBarTranslucent={true}>
        <ImageViewer
          imageUrls={imagesIndex}
          enableSwipeDown={true}
          onSwipeDown={() => setIsVisible(false)}
          swipeDownThreshold={40}
          renderIndicator={(currentIndex, allSize) => {
            return <RenderIndicator currentIndex={currentIndex} allSize={allSize} />;
          }}
          onChange={() => {
            Analytics.trackPageView({ screen: Screens.GALLERY });
          }}
          renderHeader={() => <RenderHeader />}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginVertical: 10,
  },
  image: {
    aspectRatio: 16 / 9,
    width: '100%',
  },
  linearGradient: {
    flex: 1,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingHorizontal: 10,
    paddingBottom: 10,
    paddingTop: 30,
  },
  countBox: {
    position: 'absolute',
    bottom: 6,
    right: 6,
  },
  textCountBox: {
    color: theme.colors.white,
  },
  closeContainer: {
    padding: 10,
    position: 'absolute',
    zIndex: 1,
    right: 14,
    top: 50,
  },
  overlayCountBox: {
    position: 'absolute',
    zIndex: 1,
    width: '100%',
  },
  textOverlayCountBox: {
    textAlign: 'center',
    color: theme.colors.white,
  },
});

export default GalleryBlock;
