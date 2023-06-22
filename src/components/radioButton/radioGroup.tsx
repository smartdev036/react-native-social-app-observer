import React from "react";
import { StyleSheet, View } from "react-native";

import RadioButton from "./radioButton";
import { RadioGroupProps } from "./types";

export default function RadioGroup({
  containerStyle,
  layout = "column",
  onPress,
  radioButtons,
}: RadioGroupProps) {
  function handlePress(id: number) {
    for (const button of radioButtons) {
      if (button.selected && button.id === id) {
        return;
      }
      button.selected = button.id === id;
    }
    if (onPress) {
      onPress(id);
    }
  }

  return (
    <View style={[styles.container, { flexDirection: layout }, containerStyle]}>
      {radioButtons.map((button) => (
        <RadioButton
          {...button}
          key={button.id}
          onPress={(id: number) => {
            handlePress(id);
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
});
