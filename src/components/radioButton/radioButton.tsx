import React from "react";
import { PixelRatio, Pressable, StyleSheet, View } from "react-native";
import { RadioButtonProps } from "./types";
import { theme } from "../../constants/theme";
import { ObsText } from "../global";

export default function RadioButton({
  borderColor,
  color = theme.colors.brandBlue,
  containerStyle,
  disabled = false,
  id,
  label,
  layout = "row",
  onPress,
  selected = false,
  size = 24,
  borderSize = 2,
}: RadioButtonProps) {
  const borderWidth = PixelRatio.roundToNearestPixel(borderSize);
  const sizeHalf = PixelRatio.roundToNearestPixel(size * 0.5);
  const sizeFull = PixelRatio.roundToNearestPixel(size);

  let orientation: any = { flexDirection: "row" };

  if (layout === "column") {
    orientation = { alignItems: "center" };
  }

  function handlePress() {
    if (disabled) {
      return null;
    }
    if (onPress) {
      onPress(id);
    }
  }

  return (
    <View style={{ width: "100%" }}>
      <Pressable
        onPress={handlePress}
        style={[
          styles.container,
          orientation,
          { opacity: disabled ? 0.2 : 1, alignItems: "center" },
          containerStyle,
        ]}
      >
        {Boolean(label) && <ObsText title={label} />}
        <View style={{ flex: 1, alignItems: "flex-end" }}>
          <View
            style={[
              styles.border,
              {
                borderColor: borderColor || color,
                borderWidth,
                width: sizeFull,
                height: sizeFull,
                borderRadius: sizeHalf,
              },
            ]}
          >
            {selected && (
              <View
                style={{
                  backgroundColor: color,
                  width: sizeHalf,
                  height: sizeHalf,
                  borderRadius: sizeHalf,
                }}
              />
            )}
          </View>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 5,
  },
  border: {
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    fontSize: 14,
    fontFamily: theme.fonts.halyardRegular,
  },
});
