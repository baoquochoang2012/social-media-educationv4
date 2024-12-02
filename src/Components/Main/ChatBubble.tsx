// ChatBubble.tsx
import React, { useState, useEffect } from 'react';
import { Chat, Channel, Window, ChannelHeader, MessageList, MessageInput, Thread } from 'stream-chat-react';
import 'stream-chat-react/dist/css/v2/index.css';
import '../../assets/css/ChatBubble.css';

const ChatBubble = ({ client, activeChannel, onClose }: { client: any; activeChannel: any; onClose: () => void }) => {
  const [isOpen, setIsOpen] = useState(true);

  // Close the chat when 'Escape' is pressed
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!activeChannel || !isOpen) return null;

  return (
    <div className="chat-bubble open">
      {/* Close button */}
      {/* <button className="close-button" onClick={onClose}>X</button>
       */}
                       <button
                  className="absolute top-2 right-2 text-white text-2xl bg-black/50 rounded-full w-10 h-10 flex items-center justify-center z-10"
                  onClick={onClose}
                >
                  &times;
                </button>
      <Chat client={client}>
        <Channel channel={activeChannel}>
          <Window>
            <ChannelHeader />
            <MessageList />
            <MessageInput />
          </Window>
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
};

export default ChatBubble;
