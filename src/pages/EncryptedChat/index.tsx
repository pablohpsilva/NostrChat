import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/consts/routes";
import { NDKUserProfile, useNDKCurrentUser } from "@nostr-dev-kit/ndk-hooks";

import MessageList from "./components/MessageList";
import MessageInput from "./components/MessageInput";
import ChatHeader from "./components/ChatHeader";
import useEncryptedMessage from "@/hooks/useEncryptedMessage";
import EmptyChat from "../PrivateChat/components/EmptyChat";

export default function EncryptedChatPage({
  userProfile,
}: {
  userProfile: NDKUserProfile;
}) {
  const navigate = useNavigate();
  const currentUser = useNDKCurrentUser();
  const { messages, getConversationMessagesWebhook, sendDirectMessage } =
    useEncryptedMessage();

  const handleSendMessage = async (newMessage: string) => {
    if (!newMessage.trim() || !currentUser) {
      return;
    }

    await sendDirectMessage(`${userProfile.pubkey}`, newMessage);
  };

  const handleBackToList = () => {
    navigate(ROUTES.CHAT);
  };

  useEffect(() => {
    getConversationMessagesWebhook(`${userProfile.pubkey}`);
  }, [userProfile]);

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-col h-full">
        <ChatHeader userProfile={userProfile} onBackClick={handleBackToList} />

        {messages.length ? (
          <MessageList messages={messages} />
        ) : (
          <EmptyChat onBackClick={handleBackToList} />
        )}

        <MessageInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}
