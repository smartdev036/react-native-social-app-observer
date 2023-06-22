import React from "react";
import {Alert} from "react-native";
import {CommonActions, useNavigation} from '@react-navigation/native';

export function AlertError(title: string, message: string, cancelable: boolean ) {
  const navigation = useNavigation();
  Alert.alert(
    title,
    message,
    [
      {
        text: 'Ok',
        onPress: () => navigation.dispatch(CommonActions.goBack()),
        style: 'default',
      },
    ],
    {
      cancelable: cancelable,
      onDismiss: () =>
        navigation.dispatch(CommonActions.goBack()),
    },
  )
};
