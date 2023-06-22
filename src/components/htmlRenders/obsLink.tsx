import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { TNode } from 'react-native-render-html';
import { imageURL } from '../../utils/image';
import { theme } from '../../constants/theme';
import { apiBase } from '../../api/endpoints';
import { Dialog } from 'react-native-elements';
import { NavigationProp, StackActions, useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../../hooks';

interface RenderObsLinkProps {
  tnode: TNode;
}

const navigateToUrl = async (id: number | string, navigation: NavigationProp<ReactNavigation.RootParamList>): Promise<any> => {
  return apiBase
    .get(`/items/post/${id}`, {})
    .then(response => {
      const pushAction = StackActions.push('Article', response.data);
      navigation.dispatch(pushAction);
    })
    .catch((err: any) => {
      if (!err.message) console.log('articles: Error Getting Item by ID', err);
    });
};

export const ObsLink = (props: RenderObsLinkProps): JSX.Element => {
  const themeState = useAppSelector(state => state.theme);
  const { tnode } = props;
  const { attributes } = tnode;
  const navigation = useNavigation();
  const [loading, setLoading] = useState<boolean>(false);
  const image = imageURL(attributes.image ?? '', 70);

  return (
    <Pressable
      style={styles.wrapper}
      onPress={async () => {
        if (!loading) {
          setLoading(true);
          navigateToUrl(attributes.id, navigation)
            .then(() => {
              setLoading(false);
            })
            .catch(() => {
              setLoading(false);
            });
        }
      }}
    >
      <Dialog
        isVisible={loading}
        overlayStyle={{
          width: '100%',
          height: '100%',
          padding: 0,
          justifyContent: 'center',
        }}
      >
        <Dialog.Loading loadingProps={{ color: theme.colors.brandGrey }} />
      </Dialog>
      <View style={styles.textContainer}>
        <Text
          style={[
            styles.title,
            {
              fontSize: themeState.fontStyles.obsLinkTitle.fontSize,
              fontFamily: themeState.fontStyles.obsLinkTitle.fontFamily,
              lineHeight: themeState.fontStyles.obsLinkTitle.lineHeight,
            },
          ]}
        >
          {attributes.title}
        </Text>
        <Text
          style={[
            styles.date,
            {
              fontSize: themeState.fontStyles.obsLinkDate.fontSize,
            },
          ]}
        >
          {attributes.date} - por {attributes.author}
        </Text>
      </View>
      <Image source={{ uri: image }} style={styles.photo} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    borderColor: theme.colors.lightGrey,
    borderWidth: 1,
    padding: 10,
    backgroundColor: theme.colors.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    flexDirection: 'column',
    marginRight: 10,
  },
  title: {
    marginBottom: 5,
  },
  date: {
    color: theme.colors.brandBlack,
  },
  photo: {
    height: 70,
    width: 70,
  },
});
export default ObsLink;
