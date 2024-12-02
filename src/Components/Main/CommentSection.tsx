import React, { useContext, useRef, useReducer, useEffect, FormEvent } from "react";
import { Avatar } from "@material-tailwind/react";
import avatar from "../../assets/images/avatar.jpg";
import { AuthContext } from "../AppContext/AppContext";
import {
  setDoc,
  collection,
  doc,
  serverTimestamp,
  orderBy,
  query,
  onSnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import {
  PostsReducer,
  postActions,
  postsStates,
  StateType,
  ActionType,
} from "../AppContext/PostReducer";
import Comment from "./Comment";

interface CommentSectionProps {
  postId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const comment = useRef<HTMLInputElement>(null);
  const authContext = useContext(AuthContext);
  if (!authContext) {
    return null; // or some loading/error state
  }
  const { user, userData } = authContext;
  const commentRef = doc(collection(db, "posts", postId, "comments"));
  const [state, dispatch] = useReducer<React.Reducer<StateType, ActionType>>(
    PostsReducer,
    postsStates
  );
  const { ADD_COMMENT, HANDLE_ERROR } = postActions;

  const addComment = async (e: FormEvent) => {
    e.preventDefault();
    if (comment.current && comment.current.value !== "") {
      try {
        await setDoc(commentRef, {
          id: commentRef.id,
          postId,
          content: comment.current.value,
          image: user?.photoURL,
          name:
            userData?.name?.charAt(0)?.toUpperCase() +
              userData?.name?.slice(1) || user?.displayName?.split(" ")[0],
          timestamp: serverTimestamp(),
          uid: user?.uid,
        });
        comment.current.value = "";
      } catch (err: any) {
        dispatch({ type: HANDLE_ERROR });
        alert(err.message);
        console.log(err.message);
      }
    }
  };

  useEffect(() => {
    const getComments = async () => {
      try {
        const collectionOfComments = collection(db, `posts/${postId}/comments`);
        const q = query(collectionOfComments, orderBy("timestamp", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const comments = snapshot.docs.map((doc) => {
            const data = doc.data() as DocumentData;
            return {
              id: data.id,
              postId: data.postId,
              content: data.content,
              image: data.image,
              name: data.name,
              timestamp: data.timestamp,
              uid: data.uid,
            };
          });
          dispatch({
            type: ADD_COMMENT,
            comments,
          });
        });
        return unsubscribe; // Return the unsubscribe function for cleanup
      } catch (err: any) {
        dispatch({ type: HANDLE_ERROR });
        alert(err.message);
        console.log(err.message);
      }
    };

    const unsubscribe = getComments(); // Call the function and capture the unsubscribe function

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe;
      }
    };
  }, [postId, ADD_COMMENT, HANDLE_ERROR]);

  console.log(state.comments);

  return (
    <div className="flex flex-col bg-white w-full py-2 rounded-b-3xl">
      <div className="flex items-center">
        <div className="mx-2">
          <Avatar
            size="sm"
            variant="circular"
            src={user?.photoURL || avatar}
          />
        </div>
        <div className="w-full pr-2">
          <form className="flex items-center w-full" onSubmit={addComment}>
            <input
              name="comment"
              type="text"
              placeholder="Write a comment..."
              className="w-full rounded-2xl outline-none border-0 p-2 bg-gray-100"
              ref={comment}
            />
            <button className="hidden" type="submit">
              Submit
            </button>
          </form>
        </div>
      </div>
      {state?.comments?.map((comment: any, index: any) => (
        <Comment
          key={index}
          image={comment?.image}
          name={comment?.name}
          comment={comment?.content}
          uid={comment?.uid}
        />
      ))}
    </div>
  );
};

export default CommentSection;
