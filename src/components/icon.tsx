import React from "react";
import IcoMoon from "react-icomoon";
import { Svg, Path } from "react-native-svg";
import iconSet from "../assets/icons/selection.json";

interface IconProps {
  onPress?: () => void;
  name: string;
  size?: string | number;
  fill?: string;
  color?: string;
  disableFill?: boolean;
  style?: any;
}

const Icon = (props: IconProps) => {
  const { name, size, color, disableFill, fill, onPress, style } = props;
  return (
    <IcoMoon
      native
      fill={fill}
      color={color}
      icon={name}
      size={size}
      disableFill={disableFill}
      onClick={onPress}
      style={style}
      iconSet={iconSet}
      SvgComponent={Svg}
      PathComponent={Path}
    />
  );
};

export default Icon;
