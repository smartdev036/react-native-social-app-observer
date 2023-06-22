import React from 'react';
import ImageBlock from './typeBlocks/imageBlock';
import { TNode } from 'react-native-render-html';

interface RenderImgBlockProps {
  tnode: TNode;
}

const RenderImgBlock = (props: RenderImgBlockProps): JSX.Element => {
  const { attributes } = props.tnode;
  let caption = attributes?.caption ? attributes?.caption : '';
  if (!caption && attributes?.alt) {
    caption = attributes.alt;
  }
  return <ImageBlock caption={caption} image={attributes.src} credits={attributes.credits}></ImageBlock>;
};

export default RenderImgBlock;
