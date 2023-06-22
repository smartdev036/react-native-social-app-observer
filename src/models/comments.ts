export interface Comments {
  index: number;
  item: {
    replies: [
      {
        created_by: {
          name: string;
        };
      }
    ];
    upvotes: number;
    text: string;
    deleted: boolean;
    id: string;
    user_score: number;
    created_at: string;
    created_by: {
      id: string;
      name: string;
      picture: string;
    };
  };
  user: any;
  onSelectReport: () => void;
  onSelectDelete: () => void;
  expandText: () => void;
  textNumberLines: any;
  vote: () => void;
  voteLoading: any;
  reply: any;
  replyTo: () => void;
}
