import { NDKEvent } from "@nostr-dev-kit/ndk";
import ChatMessage from "./ChatMessage";
import { useEffect } from "react";
import { useNDKCurrentUser } from "@nostr-dev-kit/ndk-hooks";
import { useRef } from "react";

interface MessageListProps {
  messages: NDKEvent[];
}

const MessageList = ({ messages }: MessageListProps) => {
  const currentUser = useNDKCurrentUser();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="text-center text-gray-500">No messages yet</div>
      ) : (
        messages.map((message) => {
          const isFromMe = message.pubkey === currentUser?.pubkey;

          return (
            <ChatMessage
              key={message.id}
              isFromMe={isFromMe}
              content={message.content}
              timestamp={message.created_at!}
            />
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
