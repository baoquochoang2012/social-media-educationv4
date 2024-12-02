export const postActions = {
  SUBMIT_POST: "SUBMIT_POST",
  HANDLE_ERROR: "HANDLE_ERROR",
  ADD_LIKE: "ADD_LIKE",
  ADD_COMMENT: "ADD_COMMENT",
} as const;

interface Post {
  id: string;
  content: string;
  // add other post properties as needed
}

interface Like {
  id: string;
  postId: string;
  // add other like properties as needed
}

export interface Comment {
  id: string;
  postId: string;
  content: string;
  // add other comment properties as needed
}

export interface StateType {
  error: boolean;
  posts: Post[];
  likes: Like[];
  comments: Comment[];
}

interface SubmitPostAction {
  type: typeof postActions.SUBMIT_POST;
  posts: Post[];
}

interface AddLikeAction {
  type: typeof postActions.ADD_LIKE;
  likes: Like[];
}

interface AddCommentAction {
  type: typeof postActions.ADD_COMMENT;
  comments: Comment[];
}

interface HandleErrorAction {
  type: typeof postActions.HANDLE_ERROR;
}

export type ActionType =
  | SubmitPostAction
  | AddLikeAction
  | AddCommentAction
  | HandleErrorAction;

export const postsStates: StateType = {
  error: false,
  posts: [],
  likes: [],
  comments: [],
};

export const PostsReducer = (state: StateType, action: ActionType): StateType => {
  switch (action.type) {
    case postActions.SUBMIT_POST:
      return {
        ...state,
        error: false,
        posts: action.posts,
      };
    case postActions.ADD_LIKE:
      return {
        ...state,
        error: false,
        likes: action.likes,
      };
    case postActions.ADD_COMMENT:
      return {
        ...state,
        error: false,
        comments: action.comments,
      };
    case postActions.HANDLE_ERROR:
      return {
        ...state,
        error: true,
        posts: [],
      };
    default:
      return state;
  }
};
