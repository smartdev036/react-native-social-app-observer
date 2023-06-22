import React from "react";
import { ActivityIndicator, StyleProp, ViewStyle } from "react-native";

interface loadingProps {
  color?: string;
  size: number | "small" | "large" | undefined;
  style?: StyleProp<ViewStyle> | undefined;
}

const Loading = (props: loadingProps) => {
  const { color, size, style } = props;
  return <ActivityIndicator color={color} size={size} style={style} />;
};

export default Loading;
