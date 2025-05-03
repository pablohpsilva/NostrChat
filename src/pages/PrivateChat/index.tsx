import { useState, useEffect } from "react";
import { NDKEvent, NDKUserProfile } from "@nostr-dev-kit/ndk";
import { useNDKCurrentUser } from "@nostr-dev-kit/ndk-hooks";
import { useNavigate } from "react-router-dom";

import { useDirectMessages } from "@/hooks/useDirectMessages";
import { getNDK } from "@/components/NDKHeadless";
import {
  ChatList,
  ChatHeader,
  MessageList,
  MessageInput,
  EmptyChat,
} from "./components";
import { ROUTES } from "@/consts/routes";
import { fillRoute } from "@/consts/routes";

const ndk = getNDK();

function PrivateChatPage() {
  const {
    directMessages,
    loading,
    error,
    decryptedIdsRef,
    sendDirectMessage,
    decryptedMessages,
    decryptSingleMessage,
  } = useDirectMessages();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<NDKEvent[]>([]);
  const [showChatList, setShowChatList] = useState(true);
  const currentUser = useNDKCurrentUser();
  const [userProfiles, setUserProfiles] = useState<
    Record<string, NDKUserProfile>
  >({});
  const navigate = useNavigate();

  console.log("directMessages", directMessages);

  // Get the list of chat partners from directMessages
  const chatPartners = Object.keys(directMessages);

  const handleSendMessage = async (newMessage: string) => {
    if (!selectedChat || !newMessage.trim() || !currentUser) return;

    await sendDirectMessage(selectedChat, newMessage);
  };

  const handleBackToList = () => {
    setShowChatList(true);
  };

  const handleChatClick = (pubkey: string) => {
    setSelectedChat(pubkey);
    setShowChatList(false);
    console.log(
      "fillRoute(ROUTES.CHAT_ID, { id: pubkey }))",
      fillRoute(ROUTES.CHAT_ID, { id: pubkey })
    );
    navigate(fillRoute(ROUTES.CHAT_ID, { id: pubkey }));
  };

  // Load messages when a chat is selected
  useEffect(() => {
    if (selectedChat) {
      // Get conversation directly from directMessages instead of using function
      const conversation = directMessages[selectedChat] || [];
      setMessages(conversation);
      // Hide chat list when a chat is selected (mobile view)
      setShowChatList(false);
    }
  }, [selectedChat, directMessages]);

  // Decrypt messages when they change
  useEffect(() => {
    // Only decrypt messages we haven't decrypted yet
    const messagesToDecrypt = messages.filter(
      (message) => !decryptedIdsRef.current.has(message.id)
    );

    // Process each message
    messagesToDecrypt.forEach((message) => {
      decryptSingleMessage(message);
    });
  }, [messages, decryptSingleMessage]);

  // Fetch user profiles for chat partners
  useEffect(() => {
    if (chatPartners.length > 0) {
      Promise.all(
        chatPartners.map(async (pubkey) => {
          const user = ndk.getUser({ pubkey });
          const profile = await user.fetchProfile();
          return { pubkey, profile };
        })
      ).then((results) => {
        const profilesMap = results.reduce((acc, { pubkey, profile }) => {
          if (profile) {
            return { ...acc, [pubkey]: profile };
          }
          return acc;
        }, {} as Record<string, NDKUserProfile>);
        setUserProfiles(profilesMap);
      });
    }
  }, [directMessages]);

  return (
    <div className="flex flex-col h-screen">
      {/* Chat list */}
      {showChatList && (
        <ChatList
          loading={loading}
          error={error}
          chatPartners={chatPartners}
          directMessages={directMessages}
          userProfiles={userProfiles}
          onChatClick={handleChatClick}
        />
      )}

      {/* Chat messages area */}
      {!showChatList && selectedChat && (
        <div className="flex flex-col h-full">
          <ChatHeader
            selectedChat={selectedChat}
            userProfiles={userProfiles}
            messages={messages}
            onBackClick={handleBackToList}
          />

          <MessageList
            messages={messages}
            decryptedMessages={decryptedMessages}
            currentUserPubkey={currentUser?.pubkey}
          />

          <MessageInput onSendMessage={handleSendMessage} />
        </div>
      )}

      {/* Default state - no chat selected */}
      {!showChatList && !selectedChat && (
        <EmptyChat onBackClick={handleBackToList} />
      )}
    </div>
  );
}

export default PrivateChatPage;
