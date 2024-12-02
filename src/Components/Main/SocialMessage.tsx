import React, {
  useState,
  useContext,
  useEffect,
} from "react";
import {
  Chat,
  Channel,
  ChannelList,
  Window,
  ChannelHeader,
  MessageList,
  MessageInput,
  Thread,
  Avatar,
} from 'stream-chat-react';
import { StreamChat } from 'stream-chat';
import 'stream-chat-react/dist/css/v2/index.css';
import { AuthContext } from "../AppContext/AppContext";
import Navbar from "../Navbar/Navbar";
import LeftSide from "../LeftSidebar/LeftSide";
import RightSide from "../RightSidebar/RightSide";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/firebase";
import ChatBubble from './ChatBubble';
interface Friend {
  id: string;
  name: string;
  image: string;
}

const SocialMessage = () => {
  const authContext = useContext(AuthContext);
  const [token, setToken] = useState<string | null>(null);
  const [client, setClient] = useState<any>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [activeChannel, setActiveChannel] = useState<any>(null);

  useEffect(() => {
    if (!authContext) return;

    const { user, userData } = authContext;
    const userId = user?.uid ? user.uid : userData?.uid;
    const apiKey = '5dtq65792mxr';

    const fetchToken = async () => {
      try {
        const response = await fetch(`http://localhost:3000/generate-token?userId=${userId}`);
        const data = await response.json();
        setToken(data.token);

        const client = StreamChat.getInstance(apiKey);
        // console.log('client:', client);
        await client.connectUser(
          {
            id: userData?.uid,
            name: userData?.name,
            image: userData?.image,
          },
          data.token
        );
        console.log('client:', client);
        setClient(client);
      } catch (error) {
        console.error('Error fetching token:', error);
      }
    };

    const fetchFriends = async () => {
      try {
        const q = query(collection(db, "users"), where("uid", "==", user?.uid));
        const docSnap = await getDocs(q);
        const data = docSnap.docs[0].data();
        data.friends.forEach((friend: any) => {
          createChannelWithFriend(friend);
        });
        setFriends(data.friends);
      } catch (error) {
        console.error('Error fetching friends:', error);
      }
    };

    fetchToken();
    fetchFriends();
  }, [authContext]);

  const createChannelWithFriend = async (friend: Friend) => {
    if (!client) return;

    try {
      // Ensure the friend exists in Stream Chat
      await client.upsertUser({
        id: friend.id,
        name: friend.name,
        image: friend.image,
      });

      const channel = client.channel('messaging', {
        members: [authContext.user?.uid, friend.id],
      });
      console.log('channel:', channel);
      await channel.watch();
      setActiveChannel(channel);
    } catch (error) {
      console.error('Error creating channel:', error);
    }
  };


  // useEffect(() => {
  //   friends.forEach((friend) => {
  //     createChannelWithFriend(friend);
  //   });
  // }, [friends]);

  // if (!client) return <div>Loading...</div>;

  const filters = { members: { $in: [authContext.user?.uid] }, type: 'messaging' };
  const options = { presence: true, state: true };
  const sort = { last_message_at: -1 };
  
  const closeChat = () => {
    setActiveChannel(null);
  };
  return (
    <>
      <div className="w-full">
        <div className="fixed top-0 z-10 w-full bg-white">
          <Navbar />
        </div>
        <div className="flex bg-gray-100">
          <div className="flex-auto w-[20%] fixed top-12">
            <LeftSide />
          </div>
          <div className="flex-auto w-[60%] absolute left-[20%] top-14 bg-gray-100 rounded-xl">
            <div className="w-[80%] mx-auto">
              <ul>
                {friends.map((friend) => (
                  <li key={friend.id} className="flex items-center justify-between p-2">
                    {/* <Avatar
                        size="sm"
                        variant="circular"
                        src={friend.image}
                        alt="avatar"
                      /> */}
                    <span>{friend.name}</span>
                    <button
                      onClick={() => createChannelWithFriend(friend)}
                      className="bg-blue-500 text-white px-2 py-1 rounded-lg"
                    >
                      Chat
                    </button>
                  </li>
                ))}
              </ul>
              {/* {client && (
              <Chat client={client}>
                <ChannelList sort={sort} filters={filters} options={options} />
                <Channel channel={activeChannel}>
                  <Window>
                    <ChannelHeader />
                    <MessageList />
                    <MessageInput />
                  </Window>
                  <Thread />
                </Channel>
              </Chat>
              )} */}
              {/* {client && <ChatBubble client={client} activeChannel={activeChannel} />} */}
            </div>
          </div>

          <div className="flex-auto w-[20%] fixed right-0 top-12">
            <RightSide dataFriendMsg={friends} />
          </div>
          {/* <div className="flex-auto w-[20%] fixed right-0 top-12">
            <div className="w-[80%] mx-auto">
              <div className="bg-white rounded-xl p-4">
                <h2 className="text-xl font-semibold">Friends</h2>
                <ul>
                  {friends.map((friend) => (
                    <li key={friend.id} className="flex items-center justify-between p-2">
                      <span>{friend.name}</span>
                      <button
                        onClick={() => createChannelWithFriend(friend)}
                        className="bg-blue-500 text-white px-2 py-1 rounded-lg"
                      >
                        Chat
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </>
  );
};

export default SocialMessage;
