export interface LiveBlogLog {
  log: Log[];
}

export interface Log {
  id: number;
  type: string;
  entry: Entry;
}

export interface Entry {
  id: number;
  content: string;
  content_noembeds: string;
  post_id: string;
  title: string;
  highlight: boolean;
  author_id: number;
  adamastor_author_id: string;
  author_name: string;
  author_photo: string;
  timestamp: string;
  human_time: string;
}
