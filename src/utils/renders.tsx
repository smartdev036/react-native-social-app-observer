import RenderTypeBlocks from '../components/htmlRenders/renderTypeBlocks';
import React from 'react';
import { TNode } from 'react-native-render-html';
import RenderPub from '../components/htmlRenders/renderPub';
import CustomURL from '../components/htmlRenders/customURL';
import RenderImgBlock from '../components/htmlRenders/renderImgBlock';
import ObsLink from '../components/htmlRenders/obsLink';
import { PostBlock } from '../models/articleFields';
import { AudioPlayerTag } from '../components/htmlRenders/typeBlocks/audioPlayerBlock';
import { ObsVideo } from '../components/htmlRenders/typeBlocks/videoBlock';
import { Blockquote } from '../components/htmlRenders/Blockquote';

interface CustomTagRendererRecord {
  [tagName: string]: React.FC<{ tnode: TNode }>;
}

export const htmlRenderers = (postBlocks: PostBlock[]): CustomTagRendererRecord => {
  return {
    img: ({ tnode }: { tnode: TNode }) => <RenderImgBlock tnode={tnode} />,
    obsaudio: ({ tnode }: { tnode: TNode }) => <AudioPlayerTag tnode={tnode} />,
    obsvideo: ({ tnode }: { tnode: TNode }) => <ObsVideo tnode={tnode} />,
    imgblock: ({ tnode }: { tnode: TNode }) => <RenderImgBlock tnode={tnode} />,
    a: ({ tnode }: { tnode: TNode }) => <CustomURL tnode={tnode} />,
    pub: ({ tnode }: { tnode: TNode }) => <RenderPub tnode={tnode} />,
    obslink: ({ tnode }: { tnode: TNode }) => <ObsLink tnode={tnode} />,
    postblock: ({ tnode }: { tnode: TNode }) => <RenderTypeBlocks tnode={tnode} postBlocks={postBlocks} />,
    blockquote: ({ tnode }: { tnode: TNode }) => <Blockquote tnode={tnode} />,
  };
};
