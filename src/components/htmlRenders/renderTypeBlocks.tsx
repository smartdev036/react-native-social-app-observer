import React from 'react';
import { TNode } from 'react-native-render-html';
import ImageBlock from './typeBlocks/imageBlock';
import { YoutubeVideoBlock } from './typeBlocks/videoBlock';
import GalleryBlock from './typeBlocks/galleryBlock';
import QuoteBlock from './typeBlocks/quoteBlock';
import { AudioPlayerBlock } from './typeBlocks/audioPlayerBlock';
import {
  AudioBlockI,
  CollectionIndexBlock,
  GalleryBlockI,
  GoogleMapsBlock,
  HorizontalContentI,
  HtmlBlockI,
  InfoBoxBlock,
  NumberBoxBlock,
  ObsOEmbedI,
  OralStoryI,
  PostBlock,
  QuoteBlockI,
  TheCollectionBlock,
  VideoBlockI,
} from '../../models/articleFields';
import { imageURL } from '../../utils/image';
import { InfoBox } from './typeBlocks/infobox';
import { ObsOEmbed } from './obsOEmbed';
import { GoogleMap } from './typeBlocks/googleMap';
import { NumberBox } from './typeBlocks/numberbox';
import { TheCollection } from './typeBlocks/theCollection';
import { CollectionIndex } from './typeBlocks/collectionIndex';
import { HtmlBlock } from './typeBlocks/htmlBlock';
import { Text } from 'react-native';
import { HorizontalContent } from './typeBlocks/horizontalContent';
import { OralStory } from './typeBlocks/oralStory';

interface RenderPostBlockProps {
  postBlocks: PostBlock[];
  tnode: TNode;
}

const RenderTypeBlocks = (props: RenderPostBlockProps): JSX.Element => {
  const { postBlocks, tnode } = props;
  if (!postBlocks) {
    console.log('Não tem postblocks');
    return <Text></Text>;
  }
  return (
    <>
      {postBlocks
        .filter(postBlock => postBlock.id === tnode.attributes.id)
        .flatMap((postBlock, i) => {
          switch (postBlock.type) {
            case 'image':
              return postBlock.images?.map((image, index: number) => (
                <ImageBlock key={postBlock.id + '-' + index} caption={image.caption} credits={image.credits} image={imageURL(image.url, 800)} />
              ));
            case 'gallery':
              return <GalleryBlock key={postBlock.id + i} postBlock={postBlock as GalleryBlockI} />;
            case 'video':
              return <YoutubeVideoBlock key={postBlock.id + i} postBlock={postBlock as ObsOEmbedI | VideoBlockI} />;
            case 'mega_quote':
              return <QuoteBlock key={postBlock.id + i} postBlock={postBlock as QuoteBlockI} />;
            case 'audio_file':
              return <AudioPlayerBlock key={postBlock.id + i} postBlock={postBlock as AudioBlockI} />;
            case 'oEmbed':
              return <ObsOEmbed key={postBlock.id + i} postBlock={postBlock as ObsOEmbedI} />;
            case 'infobox':
              return <InfoBox key={postBlock.id + i} postBlock={postBlock as InfoBoxBlock} />;
            case 'numberbox':
              return <NumberBox key={postBlock.id + i} postBlock={postBlock as NumberBoxBlock} />;
            case 'google_map':
              return <GoogleMap key={postBlock.id + i} postBlock={postBlock as GoogleMapsBlock} />;
            case 'the_collection':
              return <TheCollection key={postBlock.id + i} postBlock={postBlock as TheCollectionBlock} />;
            case 'collection_index':
              return <CollectionIndex key={postBlock.id + i} postBlock={postBlock as CollectionIndexBlock} />;
            case 'embed_article_html':
              return <HtmlBlock key={postBlock.id + i} postBlock={postBlock as HtmlBlockI} />;
            case 'horizontal_content':
              return <HorizontalContent key={postBlock.id + i} postBlock={postBlock as HorizontalContentI} />;
            case 'oral_story':
              return <OralStory key={postBlock.id + i} postBlock={postBlock as OralStoryI} />;
            default:
              return <Text key={postBlock.id + i}>{postBlock.type}</Text>;
          }
        })}
    </>
  );
};

export default RenderTypeBlocks;
