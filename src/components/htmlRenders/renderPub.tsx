import React from 'react';
import AdsBanner from '../adsBanner';
import { TNode } from 'react-native-render-html';

interface RenderPubProps {
  tnode: TNode;
}

export const RenderPub = (props: RenderPubProps): JSX.Element => {
  const { attributes } = props.tnode;

  return (
    <AdsBanner
      unitId={'/14628225/app_artigo'}
      size={'MEDIUM_RECTANGLE'}
      requestOptions={{
        customTargeting: { position: attributes['data-position'] },
      }}
    />
  );
};

export default RenderPub;
