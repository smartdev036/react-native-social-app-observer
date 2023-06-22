import React, { FC } from "react";
import { Image, Linking, Pressable, TextStyle, ViewStyle } from "react-native";

import { useAppSelector } from "../../../hooks";
import { CollectionIndexBlock } from "../../../models/articleFields";
import {
  ObsColumnContainer,
  ObsRowContainer,
  ObsText,
  ObsTitle,
} from "../../global";
import Icon from "../../icon";

export const CollectionIndex: FC<{ postBlock: CollectionIndexBlock }> = ({
  postBlock,
}) => {
  const themeState = useAppSelector((s) => s.theme);
  const { title, posts } = postBlock;

  const flexRowOverride: ViewStyle = {
    justifyContent: "flex-start",
    marginVertical: 5,
    alignItems: "center",
    paddingHorizontal: 5

  };

  const textOverride: TextStyle = {
    marginLeft: 15,
    width: "70%",
  };

  function handleOnPress(url: string) {
    Linking.canOpenURL(url).then((response) => {
      if (response) {
        Linking.openURL(url).then((r) =>
          console.log("Error: Can't Open URL", r)
        );
      }
    });
  }
  return (
    <ObsColumnContainer
      override={{ padding: 10, backgroundColor: themeState.themeColor.backgroudGray }}>
      <ObsTitle title={title ?? ""} override={{ textAlign: "center" }} />
      <ObsColumnContainer>
        {posts && posts.map((p, i) => {
          if (p?.image?.src) {
            return (
              <Pressable key={i} onPress={() => handleOnPress(p?.permalink || '')}>
                <ObsRowContainer override={flexRowOverride}>
                  <Image
                    source={{ uri: p.image.src }}
                    style={{ width: 100, height: 100, borderRadius: 50 }}
                  />
                  <ObsText title={p.title ?? ""} override={textOverride} />
                </ObsRowContainer>
              </Pressable>
            );
          } else {
            return (
              <Pressable key={i} onPress={() => handleOnPress(p?.permalink || '')}>
                <ObsRowContainer override={flexRowOverride}>
                  <Icon
                    name="user"
                    size={100}
                    fill={themeState.themeColor.color}
                    color={themeState.themeColor.color}
                    disableFill={false}
                    style={{ borderRadius: 50 }}
                  />
                  <ObsText title={p.title ?? ""} override={textOverride} />
                </ObsRowContainer>
              </Pressable>
            );
          }
        })}
      </ObsColumnContainer>
    </ObsColumnContainer>
  );
};
