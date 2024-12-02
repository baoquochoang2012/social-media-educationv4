import React from "react";
import { Avatar } from "@material-tailwind/react";
import avatar from "../../assets/images/avatar.jpg";
import { Link } from "react-router-dom";

interface CommentProps {
  name: string;
  comment: string;
  image?: string;
  uid: string;
}

const Comment: React.FC<CommentProps> = ({ name, comment, image, uid }) => {
  return (
    <div className="flex items-center mt-2 w-full">
      <div className="mx-2">
        <Avatar size="sm" alt="avatar" variant="circular" src={image || avatar} />
      </div>
      <div className="flex flex-col items-start bg-gray-100 rounded-2xl p-1 max-w-[600px]">
        <p className="font-roboto text-black text-sm no-underline tracking-normal leading-none p-1 font-medium">
          <Link to={`/profile/${uid}`}>{name}</Link>
          {/* {name} */}
        </p>
        <p className="font-roboto text-black text-sm no-underline tracking-normal leading-none p-1 font-medium">
          {comment}
        </p>
      </div>
    </div>
  );
};

export default Comment;
