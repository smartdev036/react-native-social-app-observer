import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { theme } from "../constants/theme";
import { renderIcon } from "../utils/renderIcon";

interface SocialButtonProps {
  title: string;
  icon: any;
  iconColor?: string;
  bgColor: string;
  textColor: string;
  onPress: () => void;
  border?: boolean;
  borderColor?: string;
  disableFill: boolean;
}

const SocialButton = (props: SocialButtonProps) => {
  const {
    title,
    icon,
    iconColor,
    bgColor,
    textColor,
    onPress,
    border,
    borderColor,
    disableFill,
  } = props;
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.container,
        {
          backgroundColor: bgColor,
          borderWidth: border ? 1 : 0,
          borderColor: border ? borderColor : undefined,
        },
      ]}
    >
      <View style={styles.btnContent}>
        <View style={styles.iconContainer}>
          {renderIcon(icon, 21, disableFill, iconColor)}
        </View>
        <View style={styles.titleContainer}>
          <Text
            style={[
              styles.title,
              {
                color: textColor,
              },
            ]}
          >
            {title}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 205,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    marginBottom: 20,
  },
  btnContent: {
    flex: 1,
    flexDirection: "row",
  },
  iconContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: {
    flex: 4,
    justifyContent: "center",
  },
  title: {
    fontSize: 14,
    fontFamily: theme.fonts.halyardRegular,
  },
});

export default SocialButton;
