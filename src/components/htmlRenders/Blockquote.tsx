import React, { FC } from 'react';
import { View } from 'react-native';
import { TChildrenRenderer, TNode, TPhrasing } from 'react-native-render-html';
import { theme } from '../../constants/theme';
import { ObsRowContainer } from '../global';
import Icon from '../icon';
import { useAppSelector } from '../../hooks';

export const Blockquote: FC<{
  tnode: TPhrasing | TNode;
}> = ({ tnode }) => {
  const themeState = useAppSelector(state => state.theme);
  return (
    <ObsRowContainer override={{ paddingRight: 40 }}>
      <Icon
        name="quote"
        size={20 * themeState.fontScaleFactor}
        fill={theme.colors.brandBlue}
        color={theme.colors.brandBlue}
        disableFill={false}
        style={{ marginRight: 2 }}
      />
      <View>
        <TChildrenRenderer tchildren={tnode.children} />
      </View>
    </ObsRowContainer>
  );
};
