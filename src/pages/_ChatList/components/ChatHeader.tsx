import { ROUTES } from "@/consts/routes";
import { NDKUserProfile } from "@nostr-dev-kit/ndk";
import { Link } from "react-router-dom";

interface ChatHeaderProps {
  selectedChat: string;
  userProfiles: Record<string, NDKUserProfile>;
  messages: any[];
  onBackClick: () => void;
}

const ChatHeader = ({
  selectedChat,
  userProfiles,
  messages,
  onBackClick,
}: ChatHeaderProps) => {
  const formatPubkey = (pubkey: string) => {
    return `${pubkey.substring(0, 6)}...${pubkey.substring(pubkey.length - 4)}`;
  };

  return (
    <div className="p-4 border-b border-gray-200 flex items-center">
      <Link to={ROUTES.CHAT}>
        <button onClick={onBackClick} className="mr-3 text-gray-600">
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
      </Link>
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
  );
};

export default ChatHeader;
