import { NDKUserProfile } from "@nostr-dev-kit/ndk";
import { Link } from "react-router-dom";

import { ROUTES } from "@/consts/routes";

interface ChatHeaderProps {
  userProfile: NDKUserProfile;
  onBackClick: () => void;
}

const ChatHeader = ({ userProfile, onBackClick }: ChatHeaderProps) => {
  const formatPubkey = (pubkey: string) => {
    return `${pubkey.substring(0, 6)}...${pubkey.substring(pubkey.length - 4)}`;
  };

  return (
    <div className="p-4 border-b border-gray-200 flex items-center">
      <Link className="flex items-center" to={ROUTES.CHAT}>
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
          {userProfile?.displayName ||
            userProfile?.name ||
            formatPubkey(`${userProfile?.npub ?? userProfile?.pubkey}`)}
        </h2>
      </div>
    </div>
  );
};

export default ChatHeader;
