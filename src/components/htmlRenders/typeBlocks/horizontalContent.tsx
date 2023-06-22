import React, { FC } from "react";
import { Dimensions } from "react-native";
import { RenderHTMLSource } from "react-native-render-html";
import { theme } from "../../../constants/theme";
import { HorizontalContentI } from "../../../models/articleFields";
import { imageURL } from "../../../utils/image";
import { ObsColumnContainer, ObsTitle } from "../../global";
import ImageBlock from "./imageBlock";

export const HorizontalContent: FC<{ postBlock: HorizontalContentI }> = ({
  postBlock,
}) => {
  const { image, bg_color, subtitle, title, text } = postBlock;
  const width = Dimensions.get('screen').width;
  let imgSrc = imageURL(image, 1000);
  let bgColor: string;
  switch (bg_color) {
    case "blue":
      bgColor = theme.colors.brandBlue;
      break;
    default:
      bgColor = bg_color;
  }

  return (
    <ObsColumnContainer
      override={{ padding: 10, backgroundColor: bgColor, marginVertical: 10 }}>
      {imgSrc && <ImageBlock image={imgSrc} caption={""} credits={undefined} />}
      <ObsTitle title={subtitle ?? ""} override={{ fontSize: 14 }} />
      <ObsTitle title={title ?? ""} />
      <RenderHTMLSource source={{html: text ?? ""}} contentWidth={width} />
    </ObsColumnContainer>
  );
};
