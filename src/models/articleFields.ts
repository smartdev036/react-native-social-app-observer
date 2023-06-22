import { Taxonomy } from './taxonomy';

export interface Links {
  webUri: string;
  uri: string;
}

export interface Topic extends Taxonomy {
  mainTopic: boolean;
  topLevelTopic: boolean;
}

// FIXME temos que unificar estes dois tipos de autor directamente em backend
export interface Credit {
  creditType: string;
  location: string;
  freeText: string;
  author: AuthorUser;
}

export interface AuthorUser {
  displayName: string;
  name: string;
  userName: string;
  userDescription: string;
  authorImg: AuthorImg;
  facebookUrl: any;
  twitterUrl: any;
  email: string;
  adamastorId: string;
  id: number;
  image: string;
  slug: string;
  title: string;
}

export interface AuthorImg {
  src: string;
  width: number;
  height: number;
  isAvatar: boolean;
  type: string;
  id: number;
  x: number;
  y: number;
  caption: string;
  link: string;
  credits: string;
  alt: string;
  meta: string;
  label: boolean;
  orientation: string;
}

export interface PostBlock {
  id: string;
  type: string;
}

export type PostType =
  | 'post'
  | 'obs_longform'
  | 'obs_tutor'
  | 'obs_episode'
  | 'obs_interactive'
  | 'obs_factcheck'
  | 'obs_newsletter'
  | 'obs_event'
  | 'obs_liveblog'
  | 'obs_opinion';
export interface OptionsI {
  name: string;
  value: string | boolean;
}

export interface GalleryBlockI extends PostBlock {
  images: imageI[];
  mainGallery: string;
}

export interface imageI {
  url: string;
  caption: string;
  width: string;
  height: string;
}

export interface VideoBlockI extends PostBlock {
  iframe: string;
}

export interface AudioBlockI extends PostBlock {
  audio: string;
  caption: string;
}

export interface InfoBoxBlock extends PostBlock {
  title: string;
  text: string;
}

export interface NumberBoxBlock extends PostBlock {
  title: string;
  credits: string;
  text: string;
}

export interface GoogleMapsBlock extends PostBlock {
  location: {
    lat: number;
    lng: number;
  };
  description: string;
  title: string;
}

export interface TheCollectionBlock extends PostBlock {
  type: string;
  title: string;
  description: string;
  cta_text: string;
  cta_url: string;
  image: string;
}

export interface CollectionIndexBlock extends PostBlock {
  title: string;
  posts: PostCIB[];
}

export interface HtmlBlockI extends PostBlock {
  html: string;
}

export interface HorizontalContentI extends PostBlock {
  title: string;
  subtitle: string;
  alignment: string;
  bg_color: string;
  image: string;
  text: string;
}

export interface OralStoryI extends PostBlock {
  block_label: string;
  image: string;
  quote_author: string;
  quote_author_details: string;
  quote: string;
}

export interface QuoteBlockI extends PostBlock {
  author: string;
  back_color: string;
  image_url: string;
  mega_quote_type: string;
  quote: string;
}

export interface ObsOEmbedI extends PostBlock {
  provider: string;
  html: string;
  url: string;
}

export interface PostCIB {
  id: number;
  permalink: string;
  date: Date;
  title: string;
  image: ImageI;
  collectionImage: ImageI;
  postType: string;
}

interface ImageI {
  type: string;
  id: number;
  src: string;
  width: number;
  height: number;
  x: number;
  y: number;
  caption: string;
  link: string;
  credits: string;
  alt: string;
  meta: string;
  label: boolean;
  orientation: string;
}

export interface Image {
  url: string;
  caption: string;
  credits?: string;
  width: number;
  height: number;
}

export interface MainGallery {
  caption: string;
  credit: string;
  uri: string;
  height: number;
  width: number;
}

export interface Program {
  id: number;
  title: string;
  slug: string;
  programType: string[];
}

export interface Video {
  youtubeId?: string;
  youtubeLink: string;
}

export interface Question {
  id: number;
  question: string;
  body: string;
  weburi: string;
}

export interface Tutor {
  data: Question[];
}
