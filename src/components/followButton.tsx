import React from "react";
import { TouchableOpacity, StyleSheet, Text } from "react-native";
import { theme } from "../constants/theme";
import { useAppSelector } from "../hooks";
import Loading from "./loading";

interface FollowButton {
  onPress: () => void;
  isSubscribed: boolean;
  color: string | undefined;
  txtColor: string;
}

const FollowButton = (props: FollowButton) => {
  const { onPress, txtColor, color, isSubscribed } = props;
  const themeState = useAppSelector((s) => s.theme);
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => {
        onPress();
      }}
      style={[
        styles.btnContainer,
        {
          marginTop: 0,
          backgroundColor: color,
          borderColor: isSubscribed ? themeState.themeColor.transparent : themeState.themeColor.color,
        },
      ]}
    >
      {isSubscribed === null && (
        <Loading color={themeState.themeColor.color} size={"small"} />
      )}
      {isSubscribed !== null && (
        <Text style={[styles.btnText, { color: txtColor }]}>
          {isSubscribed ? "A seguir" : "Seguir"}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btnContainer: {
    marginTop: 20,
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  btnText: {
    fontSize: 13,
    fontFamily: theme.fonts.halyardRegular,
  },
});

export default FollowButton;
