import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/consts/routes";
import { useNDKCurrentUser } from "@nostr-dev-kit/ndk-hooks";

import { ChatHeader, MessageInput, MessageList } from "./components";
import usePrivateDirectMessage from "@/hooks/usePrivateDirectMessage";
import { useEffect } from "react";
import { getKeys } from "@/libs/local-storage";

export default function PrivateChatPage() {
  const currentUser = useNDKCurrentUser();
  const navigate = useNavigate();
  const {
    sendDirectMessage,
    getUserChats,
    getConversationMessagesWebhook,
    messagesByUser,
  } = usePrivateDirectMessage();

  const handleSendMessage = async (newMessage: string) => {
    // if (!selectedChat || !newMessage.trim() || !currentUser) return;
    // await sendDirectMessage(selectedChat, newMessage);
  };

  const handleBackToList = () => {
    navigate(ROUTES.CHAT);
  };

  // useEffect(() => {
  //   if (currentUser) {
  //     getConversationMessagesWebhook(currentUser.pubkey);
  //   }
  // }, [currentUser]);

  useEffect(() => {
    (async () => {
      const { nsec } = await getKeys();
      console.log(await getUserChats(nsec!));
    })();
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-col h-full">
        {/* <ChatHeader
          selectedChat={selectedChat}
          userProfiles={userProfiles}
          messages={messages}
          onBackClick={handleBackToList}
        />

        <MessageList
          messages={messages}
          decryptedMessages={decryptedMessages}
          currentUserPubkey={currentUser?.pubkey}
        /> */}

        <MessageInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}
