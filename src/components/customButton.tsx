import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { theme } from "../constants/theme";
import { useAppSelector } from "../hooks";

interface CustomButtonProps {
  title: string;
  bgColor: string;
  textColor: string;
  onPress: () => void;
  border?: boolean;
  borderColor?: string;
  disable?: boolean;
  loading?: boolean;
  customStyle?: any;
}

const CustomButton = (props: CustomButtonProps) => {
  const themeState = useAppSelector((s) => s.theme);
  const {
    title,
    bgColor,
    textColor,
    onPress,
    border,
    borderColor,
    disable,
    loading,
    customStyle,
  } = props;

  return (
    <TouchableOpacity
      disabled={disable || loading}
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.container,
        {
          ...customStyle,
          backgroundColor: disable ? "#9f9f9f" : bgColor,
          borderWidth: border ? 1 : 0,
          borderColor: borderColor ?? themeState.themeColor.transparent,
        },
      ]}
    >
      <View style={styles.btnContent}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: textColor, fontSize: 16 * themeState.fontScaleFactor }]}>{title}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 148,
    height: 42,
  },
  btnContent: {
    flex: 1,
  },
  titleContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontFamily: theme.fonts.halyardRegular,
  },
});

export default CustomButton;
