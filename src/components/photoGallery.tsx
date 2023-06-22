import React, { useState } from "react";
import {Image, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {theme} from '../constants/theme';
import {LinearGradient} from 'expo-linear-gradient';
import {imageURL} from '../utils/image';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import ImageViewer from "react-native-image-zoom-viewer";
import { useAppSelector } from "../hooks";

interface PhotoGalleryProps {
  data: any;
}

const PhotoGallery = (props: PhotoGalleryProps) => {
  const { data } = props;
  const [valid, setValid] = useState(true);
  const [visible, setIsVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const marginBotInsets = insets.bottom > 0 ? 55 : 0;
  const themeState = useAppSelector((s) => s.theme);

  function itemCounter() {
    let index = 1;
    let galleryItems = data.length;
    if (galleryItems < 1) {
      return;
    }
    return <Text>{'Foto ' + index + ' / ' + galleryItems}</Text>;
  }

  let imagesIndex = [];
  data.forEach((element: {uri: string}) => {
    imagesIndex.push({'url': imageURL(element.uri, 800)});
  });

  return (
    <View style={{position: 'relative'}}>
      <TouchableOpacity activeOpacity={0.9} onPress={() => setIsVisible(true)}>
        <Image
          resizeMode={"cover"}
          style={styles.image}
          source={{uri: imageURL(data[0].uri, themeState.themeOrientation.imageW)}}
          onError={() => setValid(false)}
        />
        <LinearGradient
          colors={[
            themeState.themeColor.transparent,
            valid && data.uri ? 'rgba(0,0,0,0.3)' : themeState.themeColor.transparent,
            valid && data.uri ? 'rgba(0,0,0,0.6)' : themeState.themeColor.transparent,
          ]}
          style={styles.linearGradient}>
          <View style={{position: 'absolute', bottom: 6, right: 6}}>
            <Text
              style={{
                color: theme.colors.white,
                fontFamily: theme.fonts.halyardRegular,
              }}>
              {itemCounter()}
            </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
      <Modal visible={visible} transparent={true}>
        <ImageViewer
          imageUrls={imagesIndex}
          enableSwipeDown={true}
          onSwipeDown={() => setIsVisible(false)}
          swipeDownThreshold={40}
          renderIndicator={() => null}
          renderHeader={() => (
            <Pressable
              onPress={() => setIsVisible(false)}
              style={{
                position: 'absolute',
                zIndex: 1,
                right: 15,
                marginTop: marginBotInsets,
              }}>
              <Text
                style={{
                  fontSize: 19,
                  color: '#fff',
                }}>
                ✕
              </Text>
            </Pressable>
          )}
          footerContainerStyle={{
            left: 0,
            right: 0,
            marginBottom: marginBotInsets,
            alignItems: 'center',
          }}
          renderFooter={imageIndex => (
            <Text style={{color: theme.colors.white}}>
              {<Text>{imageIndex + 1 + ' / ' + imagesIndex.length}</Text>}
            </Text>
          )}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
});

export default PhotoGallery;
