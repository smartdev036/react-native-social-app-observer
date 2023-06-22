import {
  Credit,
  Links,
  MainGallery,
  PostBlock,
  Program,
  Topic,
  Video,
  Tutor, OptionsI, PostType,
} from "./articleFields";

export interface Post {
  id: number;
  title: string;
  pubDate: string;
  links: Links;
  type: PostType;
  topics: Topic[];
  credits: Credit[];
  main_video: boolean;
  state: string;
  image: string;
  branded_content: boolean;
  premium: boolean;
  comments_enabled: boolean;
  hasMainPhotoGallery: boolean;
  lead: string;
  fullTitle: string;
  body: string;
  postBlocks: PostBlock[];
  mainGallery: MainGallery[];
  // FIXME in some cases post has this shit
  headline: boolean;
  headline_image?: string;

  // EpisodeType specifics
  program: Program;
  video: Video;
  audioLink: string;
  audioOnly: boolean;
  // Liveblog specifics
  liveblog_active: boolean;
  // TutorType specifics
  hasScroll: boolean | any;
  chartBeatAuthors: string;
  tutor: Tutor;
  options: OptionsI[];
}
