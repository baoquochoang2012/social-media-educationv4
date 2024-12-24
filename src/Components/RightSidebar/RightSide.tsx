import React, { useState, ChangeEvent, useContext, useEffect } from "react";
import { Avatar } from "@material-tailwind/react";
import avatar from "../../assets/images/avatar.jpg";
import remove from "../../assets/images/delete.png";
import {
  collection,
  query,
  where,
  getDocs,
  arrayRemove,
  updateDoc,
  DocumentData,
  doc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { AuthContext } from "../AppContext/AppContext";
import Swal from "sweetalert2";
import { StreamChat } from 'stream-chat';
import ChatBubble from "../Main/ChatBubble"; // Import ChatBubble component

interface Friend {
  id: string;
  name: string;
  image: string;
}

interface RightSideProps {
  dataFriend?: DocumentData[];
  dataFriendMsg?: DocumentData[];
}

const RightSide: React.FC<RightSideProps> = () => {
  const [input, setInput] = useState<string>("");
  const authContext = useContext(AuthContext);
  const [listFriend, setListFriend] = useState<DocumentData[]>([]);
  const [activeChannel, setActiveChannel] = useState<any>(null);
  const [client, setClient] = useState<any>(null);

  if (!authContext) {
    return null;
  }

  const { user, userData } = authContext;
    const apiKey = '5dtq65792mxr';
    const userId = user?.uid ? user.uid : userData?.uid;

  useEffect(() => {
    const fetchToken = async () => {
      try {
        if (client) {
          // Disconnect the existing client
          await client.disconnectUser();
        }
        const response = await fetch(`http://localhost:3000/generate-token?userId=${userId}`);
        const data = await response.json();
  
        const chatClient = StreamChat.getInstance(apiKey);
        
        await chatClient.connectUser(
          {
            id: userData?.uid,
            name: userData?.name,
            image: userData?.image,
            role: 'admin',
          },
          data.token
        );
        console.log('chat',chatClient);
        setClient(chatClient); // Set the client only after successful connection
      } catch (error) {
        console.error('Error fetching token or connecting user:', error);
      }
    };
  
    fetchToken();
  
    return () => {
      // Disconnect the client when the component unmounts or reconnects
      // if (client) {
      //   client.disconnectUser();
      // }
    };
  }, [authContext]); // Re-run only if authContext changes
  
  // const createChannelWithFriend = async (friend: Friend) => {
  //   if (!client || !client.userID) {
  //     console.error("Client is not connected. Unable to create channel.");
  //     return;
  //   }
  
  //   try {
  //     await client.upsertUser({
  //       id: friend.id,
  //       name: friend.name,
  //       image: friend.image,
  //       role: 'admin'
  //     });
  
  //     const channel = client.channel('messaging', {
  //       members: [authContext.user?.uid, friend.id],
  //     });
  //     await channel.watch();
  //     setActiveChannel(channel);
  //   } catch (error) {
  //     console.error("Error creating channel:", error);
  //   }
  // };
  const createChannelWithFriend = async (friend: Friend) => {
    if (!client || !client.userID) {
      console.error("Client is not connected. Unable to create channel.");
      return;
    }
  
    try {
      // Only upsert if the user is an admin
      if (client.user?.role === 'admin') {
        await client.upsertUser({
          id: friend.id,
          name: friend.name,
          image: friend.image,
          role: 'user', // or whatever role you wish to assign
        });
      }
  
      const channel = client.channel('messaging', {
        members: [authContext.user?.uid, friend.id],
      });
      await channel.watch();
      setActiveChannel(channel);
    } catch (error) {
      console.error("Error creating channel:", error);
    }
  };
  
  const searchFriends = (data: Friend[]) => {
    return data.filter((item) =>
      item.name?.toLowerCase().includes(input.toLowerCase())
    );
  };

  const handleFriendClick = async (friend: Friend) => {
    await createChannelWithFriend(friend);
  };

  const removeFriend = async (id: string, name: string, image: string) => {
    const q = query(collection(db, "users"), where("uid", "==", user?.uid));
    const getDoc = await getDocs(q);
    const userDocumentId = getDoc.docs[0].id;

    await updateDoc(doc(db, "users", userDocumentId), {
      friends: arrayRemove({ id, name, image }),
    });
    Swal.fire({
      icon: "success",
      title: "Xoá bạn bè thành công!",
      showConfirmButton: false,
      timer: 1500,
      toast: true,
      position: "top-end",
    });
  };

  useEffect(() => {
    const fetchFriends = async () => {
      if (user?.uid) {
        const q = query(collection(db, "users"), where("uid", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const friendsData = querySnapshot.docs.map((doc) => doc.data());
        if (friendsData.length > 0) {
          // Filter friends where access is 1
          const filteredFriends = friendsData[0].friends.filter((friend: { access: number; }) => friend.access === 1);
          setListFriend(filteredFriends);  // Set the filtered friends to state
        }
      }
    };

    fetchFriends();
  }, [user]);

  const friendsToDisplay = listFriend;
  
  console.log('access',friendsToDisplay);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  return (
    <div className="flex flex-col h-screen bg-white shadow-lg border-2 rounded-l-xl">
      <div className="mx-2 mt-10">
        <p className="font-roboto font-medium text-sm text-gray-700">Friends:</p>
        <input
          className="border-0 outline-none mt-4"
          name="input"
          value={input}
          type="text"
          placeholder="Search friends"
          onChange={handleInputChange}
        />
        {friendsToDisplay && friendsToDisplay.length > 0 ? (
          searchFriends(friendsToDisplay).map((friend: Friend) => (
            <div
              className="flex items-center justify-between hover:bg-gray-100 duration-300 ease-in-out cursor-pointer"
              key={friend.id}
              onClick={() => handleFriendClick(friend)}
            >
              <div className="flex items-center my-2">
                <Avatar
                  size="sm"
                  variant="circular"
                  src={friend.image || avatar}
                  alt="avatar"
                />
                <p className="ml-4 font-roboto font-medium text-sm text-gray-700">
                  {friend.name}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="mt-10 font-roboto font-medium text-sm text-gray-700">
            Add friends to check their profile
          </p>
        )}
      </div>

      {activeChannel && client && (
        <ChatBubble client={client} activeChannel={activeChannel} onClose={() => setActiveChannel(null)} />
      )}
    </div>
  );
};

export default RightSide;
