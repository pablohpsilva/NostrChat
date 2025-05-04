import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/consts/routes";
import { NDKUserProfile, useNDKCurrentUser } from "@nostr-dev-kit/ndk-hooks";

import { ChatHeader, MessageInput, MessageList } from "./components";
import { useEffect } from "react";
import useEncryptedMessage from "@/hooks/useEncryptedMessage";

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

        <MessageList messages={messages} />

        <MessageInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}
