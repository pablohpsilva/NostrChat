import { useNavigate } from "react-router-dom";
import { NDKUserProfile, useNDKCurrentUser } from "@nostr-dev-kit/ndk-hooks";
import { useEffect } from "react";

import { ChatHeader, EmptyChat, MessageInput, MessageList } from "./components";
import { ROUTES } from "@/consts/routes";
import usePrivateDirectMessage from "@/hooks/usePrivateDirectMessage";

export default function PrivateChatPage({
  userProfile,
}: {
  userProfile: NDKUserProfile;
}) {
  const currentUser = useNDKCurrentUser();
  const navigate = useNavigate();
  const {
    isLoading,
    getConversationMessagesWebhook,
    messagesByUser,
    sendDirectMessage,
  } = usePrivateDirectMessage();

  const handleSendMessage = async (newMessage: string) => {
    if (!newMessage.trim() || !currentUser || !userProfile.pubkey) {
      return;
    }

    await sendDirectMessage({ publicKey: `${userProfile.pubkey}` }, newMessage);
  };

  const handleBackToList = () => {
    navigate(ROUTES.CHAT);
  };

  useEffect(() => {
    getConversationMessagesWebhook([`${userProfile.pubkey}`]);
  }, [userProfile]);

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-col h-full">
        <ChatHeader userProfile={userProfile!} onBackClick={handleBackToList} />

        {messagesByUser.length ? (
          <MessageList messages={messagesByUser} />
        ) : (
          <EmptyChat onBackClick={handleBackToList} />
        )}

        <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
}
