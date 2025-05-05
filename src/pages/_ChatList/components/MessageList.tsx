import { NDKEvent } from "@nostr-dev-kit/ndk";
import ChatMessage from "./ChatMessage";

interface MessageListProps {
  messages: NDKEvent[];
  decryptedMessages: Record<string, string>;
  currentUserPubkey: string | undefined;
}

const MessageList = ({
  messages,
  decryptedMessages,
  currentUserPubkey,
}: MessageListProps) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="text-center text-gray-500">No messages yet</div>
      ) : (
        messages.map((message) => {
          const isFromMe = message.pubkey === currentUserPubkey;
          const content = decryptedMessages[message.id] || "Decrypting...";

          return (
            <ChatMessage
              key={message.id}
              isFromMe={isFromMe}
              content={content}
              timestamp={message.created_at!}
            />
          );
        })
      )}
    </div>
  );
};

export default MessageList;
