import React, { useState } from 'react';
import { apiBase } from '../../api/endpoints';
import { Linking, Text, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { theme } from '../../constants/theme';
import { TNode } from 'react-native-render-html';
import ImageBlock from './typeBlocks/imageBlock';
import { NavigationProp, StackActions, useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../../hooks';

interface RenderCustomUrlProps {
  tnode: TNode;
}

const handleURL = async (u: string, isObs: boolean, navigation: NavigationProp<ReactNavigation.RootParamList>) => {
  if (isObs) {
    return apiBase
      .get(`/items/url/${u}`)
      .then(response => {
        const pushAction = StackActions.push('Article', response.data);
        navigation.dispatch(pushAction);
      })
      .catch((err: any) => {
        Linking.openURL(u);
        console.log('Error: Getting Article ID by URL', err);
      });
  } else {
    return Linking.openURL(u);
  }
};

const getText = (node: TNode) => {
  if (typeof node.data === 'string' || node.data instanceof String) {
    return node.data;
  }
  let str = '';
  for (const children of node.children) {
    const tmp = getText(children);
    str += tmp;
  }
  return str;
};

const CustomURL = (props: RenderCustomUrlProps): JSX.Element => {
  const themeState = useAppSelector(state => state.theme);
  const { tnode } = props;
  const [loading, setLoading] = useState<boolean>(false);
  const navigation = useNavigation();

  // Contains Observador URL
  const urlContainsObsRgx = /https?:\/\/\S*observador\.pt/gm;
  const url = tnode.attributes.href;
  const obsUrl = url?.match(urlContainsObsRgx);

  // if this URL contains an image forget about url and render image
  if (tnode.children.length) {
    const insideImages: JSX.Element[] = [];
    // lets find images inside o a links
    tnode.children.forEach((x, i) => {
      if (x.domNode?.name && x.domNode?.name == 'img') {
        const alt = x.attributes.alt ?? '';
        const src = x.attributes.src ?? '';
        if (src !== '') {
          insideImages.push(<ImageBlock key={i} caption={alt} image={src} credits={''} />);
        }
      }
    });
    if (insideImages.length) {
      return insideImages;
    }
  }
  // Strip tags
  const linkText = getText(tnode);

  const handlePress = () => {
    if (obsUrl && !loading) {
      setLoading(true);
      handleURL(url, true, navigation)
        .then(() => setLoading(false))
        .catch(() => setLoading(false));
    } else {
      handleURL(url, false, navigation).catch(() => setLoading(false));
    }
  };

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <Text style={[styles.linkText, { fontSize: themeState.fontStyles.html.fontSize, lineHeight: themeState.fontStyles.html.lineHeight }]}>{linkText}</Text>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  linkText: {
    color: theme.colors.brandBlue,
    fontFamily: theme.fonts.notoRegular,
  },
});

export default CustomURL;
