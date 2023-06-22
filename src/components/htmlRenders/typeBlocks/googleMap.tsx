import React from "react";
import { Platform, StyleSheet, useWindowDimensions, View } from "react-native";
import { GoogleMapsBlock } from "../../../models/articleFields";
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  PROVIDER_DEFAULT,
} from "react-native-maps";
import { OS } from "../../../constants";

export const GoogleMap: React.FC<{ postBlock: GoogleMapsBlock }> = ({
  postBlock,
}) => {
  const { width } = useWindowDimensions();

  if (!postBlock?.location?.lat || !postBlock?.location?.lng) {
    return <></>;
  }
  return (
    <View style={styles.container}>
      <MapView
        provider={
          Platform.OS === OS.android ? PROVIDER_GOOGLE : PROVIDER_DEFAULT
        }
        style={[styles.map, {width: width - 30}]}
        region={{
          latitude: postBlock.location.lat,
          longitude: postBlock.location.lng,
          latitudeDelta: 0.915,
          longitudeDelta: 0.121,
        }}
      >
        <Marker
          coordinate={{
            latitude: postBlock.location.lat,
            longitude: postBlock.location.lng,
          }}
          title={postBlock.title || ''}
          description={postBlock.description || ''}
        />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 400,
    width: '100%',
    marginRight: 10,
    marginVertical: 10,
    overflow: 'hidden'
  },
  map: {
    height: 400,
  },
});
