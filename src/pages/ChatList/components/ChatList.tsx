import { NDKUserProfile } from "@nostr-dev-kit/ndk";
import Search from "./Search";

interface ChatListProps {
  loading: boolean;
  error: string | null;
  chatPartners: string[];
  directMessages: Record<string, any[]>;
  userProfiles: Record<string, NDKUserProfile>;
  onChatClick: (pubkey: string) => void;
}

const ChatList = ({
  loading,
  error,
  chatPartners,
  directMessages,
  userProfiles,
  onChatClick,
}: ChatListProps) => {
  const formatPubkey = (pubkey: string) => {
    return `${pubkey.substring(0, 6)}...${pubkey.substring(pubkey.length - 4)}`;
  };

  return (
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

          <Search userProfiles={userProfiles} />
        </div>
      </div>

      {loading ? (
        <div className="p-4 text-center">Loading chats...</div>
      ) : error ? (
        <div className="p-4 text-center text-red-500">Error loading chats</div>
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
              onClick={() => onChatClick(pubkey)}
            >
              <div className="font-medium">
                {userProfiles?.[pubkey]?.displayName || formatPubkey(pubkey)}
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
  );
};

export default ChatList;
