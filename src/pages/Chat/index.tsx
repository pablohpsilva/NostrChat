import { useState, useEffect, useCallback, useRef } from "react";
import { useDirectMessages } from "@/hooks/useDirectMessages";
import { NDKEvent, NDKUserProfile } from "@nostr-dev-kit/ndk";
import { useNDKCurrentUser } from "@nostr-dev-kit/ndk-hooks";
import { getNDK } from "@/components/NDKHeadless";
const ndk = getNDK();

function ChatPage() {
  const { directMessages, loading, error, sendDirectMessage, decryptMessage } =
    useDirectMessages();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<NDKEvent[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [decryptedMessages, setDecryptedMessages] = useState<
    Record<string, string>
  >({});
  const [showChatList, setShowChatList] = useState(true);
  const currentUser = useNDKCurrentUser();
  const [userProfiles, setUserProfiles] = useState<
    Record<string, NDKUserProfile>
  >({});
  // Use ref to track what we've already decrypted to avoid re-decrypting
  const decryptedIdsRef = useRef<Set<string>>(new Set());

  // Get the list of chat partners from directMessages
  const chatPartners = Object.keys(directMessages);
  // const chatPartnerList = chatPartners.reduce((acc, partner) => {
  //   return {
  //     ...acc,
  //     [partner]: {
  //       // name: getUserName(partner),
  //       lastMessage:
  //         directMessages[partner]?.[directMessages[partner].length - 1]
  //           .created_at,
  //     },
  //   };
  // }, {});

  // Memoized function to decrypt a single message
  const decryptSingleMessage = useCallback(
    async (message: NDKEvent): Promise<void> => {
      // Skip if already decrypted
      if (decryptedIdsRef.current.has(message.id)) return;

      try {
        const content = await decryptMessage(message);

        // Update state with new decrypted message without causing re-render of all
        setDecryptedMessages((prev) => {
          if (content) {
            return { ...prev, [message.id]: content };
          } else {
            return { ...prev, [message.id]: "Unable to decrypt message" };
          }
        });

        // Mark as decrypted
        decryptedIdsRef.current.add(message.id);
      } catch (error) {
        console.error("Error decrypting message:", error);
        setDecryptedMessages((prev) => ({
          ...prev,
          [message.id]: "Error decrypting message",
        }));
        // Still mark as attempted so we don't retry indefinitely
        decryptedIdsRef.current.add(message.id);
      }
    },
    [decryptMessage]
  );

  const handleSendMessage = async () => {
    if (!selectedChat || !newMessage.trim() || !currentUser) return;

    await sendDirectMessage(selectedChat, newMessage);
    setNewMessage("");
  };

  const formatPubkey = (pubkey: string) => {
    return `${pubkey.substring(0, 6)}...${pubkey.substring(pubkey.length - 4)}`;
  };

  // Function to get user display name
  const getUserName = async (pubkey: string) => {
    const user = ndk.getUser({ pubkey });
    const profile = await user.fetchProfile();
    // return user.profile?.name || formatPubkey(pubkey);
    // return profile?.name || formatPubkey(pubkey);
    return profile;
  };

  const handleBackToList = () => {
    setShowChatList(true);
  };

  const handleChatClick = (pubkey: string) => {
    setSelectedChat(pubkey);
    setShowChatList(false);
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

  useEffect(() => {
    if (chatPartners.length > 0) {
      Promise.all(
        chatPartners.map(async (pubkey) => {
          // const profile = await ndk.getUser({ pubkey }).fetchProfile();
          // setUserProfiles((prev) => ({ ...prev, [pubkey]: profile }));
          return { pubkey, profile: await getUserName(pubkey) };
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
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <button className="text-gray-600 focus:outline-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h7"
                  />
                </svg>
              </button>
              <div className="flex-1 mx-4 relative">
                <input
                  type="text"
                  placeholder="Search chats..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-4 text-center">Loading chats...</div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">
              Error loading chats
            </div>
          ) : chatPartners.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No conversations yet
            </div>
          ) : (
            <ul>
              {chatPartners.map((pubkey) => (
                <li
                  key={pubkey}
                  className="p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleChatClick(pubkey)}
                >
                  <div className="font-medium">
                    {userProfiles?.[pubkey]?.displayName ||
                      formatPubkey(pubkey)}
                  </div>
                  <div className="text-sm text-gray-500">
                    Last message:{" "}
                    {new Date(
                      directMessages[pubkey][directMessages[pubkey].length - 1]
                        .created_at * 1000
                    ).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Chat messages area */}
      {!showChatList && selectedChat && (
        <div className="flex flex-col h-full">
          {/* Chat header with back button */}
          <div className="p-4 border-b border-gray-200 flex items-center">
            <button onClick={handleBackToList} className="mr-3 text-gray-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div>
              <h2 className="text-xl font-semibold">
                {userProfiles[selectedChat]?.displayName ||
                  formatPubkey(selectedChat)}
              </h2>
              <div className="text-xs text-gray-400">
                {messages.length > 0 && (
                  <>
                    Last message:{" "}
                    {new Date(
                      messages[messages.length - 1].created_at! * 1000
                    ).toLocaleString()}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500">No messages yet</div>
            ) : (
              messages.map((message) => {
                const isFromMe = message.pubkey === currentUser?.pubkey;
                const content =
                  decryptedMessages[message.id] || "Decrypting...";

                return (
                  <div
                    key={message.id}
                    className={`p-3 rounded-lg max-w-xs ${
                      isFromMe
                        ? "ml-auto bg-blue-500 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    {content}
                    <div className="text-xs mt-1 opacity-70">
                      {new Date(
                        message.created_at! * 1000
                      ).toLocaleTimeString()}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Message input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex">
              <input
                type="text"
                className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSendMessage();
                  }
                }}
              />
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600"
                onClick={handleSendMessage}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Default state - no chat selected */}
      {!showChatList && !selectedChat && (
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200 flex items-center">
            <button onClick={handleBackToList} className="mr-3 text-gray-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <h2 className="text-xl font-semibold">Chat</h2>
          </div>
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a conversation to start chatting
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatPage;
