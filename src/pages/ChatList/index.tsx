import { useEffect, useState } from "react";
import useEncryptedMessage from "@/hooks/useEncryptedMessage";
import { NDKUserProfile } from "@nostr-dev-kit/ndk";
import usePrivateDirectMessage from "@/hooks/usePrivateDirectMessage";

import ChatList from "./components/ChatList";

function ChatListPage() {
  const { getUserChats: getEncryptedUserChats, isLoading: isEncryptedLoading } =
    useEncryptedMessage();
  const { getUserChats: getPrivateUserChats, isLoading: isPrivateLoading } =
    usePrivateDirectMessage();
  const [userChats, setUserChats] = useState<{
    encryptedUserChats: Record<string, NDKUserProfile>;
    privateUserChats: Record<string, NDKUserProfile>;
  }>({
    encryptedUserChats: {},
    privateUserChats: {},
  });
  const isLoading = isEncryptedLoading || isPrivateLoading;

  const getUserChats = async () => {
    const encryptedUserChats = await getEncryptedUserChats();
    const privateUserChats = await getPrivateUserChats();

    console.log("{encryptedUserChats, privateUserChats}", {
      encryptedUserChats,
      privateUserChats,
    });

    setUserChats({ encryptedUserChats, privateUserChats });
  };

  useEffect(() => {
    getUserChats();
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <ChatList
        loading={isLoading}
        error={null}
        nip04UserProfiles={userChats.encryptedUserChats}
        nip17UserProfiles={userChats.privateUserChats}
        onChatClick={() => {}}
      />
    </div>
  );
}

export default ChatListPage;
