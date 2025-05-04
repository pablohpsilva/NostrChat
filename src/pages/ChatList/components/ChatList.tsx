import { NDKKind, NDKUserProfile } from "@nostr-dev-kit/ndk";
import { Link } from "react-router-dom";
import clsx from "clsx";

import Search from "./Search";
import { fillRoute, ROUTES } from "@/consts/routes";

interface ChatListProps {
  loading: boolean;
  error: string | null;
  nip04UserProfiles: Record<string, NDKUserProfile>;
  nip17UserProfiles: Record<string, NDKUserProfile>;
  onChatClick: (kind: `NIP${NDKKind}`, pubkey: string) => void;
  className?: string;
}

const ChatList = ({
  loading,
  error,
  nip04UserProfiles,
  nip17UserProfiles,
  onChatClick,
  className,
}: ChatListProps) => {
  const hasPrivateChats = Object.keys(nip17UserProfiles).length > 0;
  const hasPublicChats = Object.keys(nip04UserProfiles).length > 0;
  const hasConversations = hasPrivateChats || hasPublicChats;

  const formatPubkey = (pubkey: string) => {
    return `${pubkey.substring(0, 6)}...${pubkey.substring(pubkey.length - 4)}`;
  };

  return (
    <div className={clsx("flex-1 overflow-y-auto", className)}>
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

          <Search />
        </div>
      </div>

      {loading ? (
        <div className="p-4 text-center">Loading chats...</div>
      ) : error ? (
        <div className="p-4 text-center text-red-500">Error loading chats</div>
      ) : !hasConversations ? (
        <div className="p-4 text-center text-gray-500">
          No conversations yet
        </div>
      ) : (
        <>
          {hasPrivateChats && (
            <>
              {Object.values(nip17UserProfiles).map(
                ({ pubkey, displayName, picture, image, created_at }) => (
                  <Link
                    key={pubkey}
                    className="flex flex-row gap-4 p-4 items-center justify-between border-b border-gray-200 cursor-pointer hover:bg-gray-100"
                    to={fillRoute(ROUTES.CHAT_ID, {
                      nip: `NIP${NDKKind.PrivateDirectMessage}`,
                      pubkey: `${pubkey}`,
                    })}
                  >
                    <div className="flex flex-row gap-4 items-center">
                      <img
                        src={image || picture}
                        alt={displayName || formatPubkey(`${pubkey}`)}
                        className="w-10 h-10 rounded-full"
                      />

                      <div className="flex flex-col">
                        <p>{displayName || formatPubkey(`${pubkey}`)}</p>
                        {created_at && (
                          <p>
                            Created at:{" "}
                            {new Date(created_at * 1000).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-row justify-center items-center">
                      <div className="px-2 py-1 rounded-lg borber border-solid border-black border-[1px] text-xs">{`NIP${NDKKind.PrivateDirectMessage}`}</div>
                    </div>
                  </Link>
                )
              )}
            </>
          )}

          {hasPublicChats && (
            <>
              {Object.values(nip04UserProfiles).map(
                ({ pubkey, displayName, picture, image, created_at }) => (
                  <Link
                    key={pubkey}
                    className="flex flex-row p-4 gap-4 items-center justify-between border-b border-gray-200 cursor-pointer hover:bg-gray-100"
                    to={fillRoute(ROUTES.CHAT_ID, {
                      nip: `NIP${NDKKind.EncryptedDirectMessage}`,
                      pubkey: `${pubkey}`,
                    })}
                  >
                    <div className="flex flex-row gap-4 items-center">
                      <img
                        src={image || picture}
                        alt={displayName || formatPubkey(`${pubkey}`)}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex flex-col">
                        <p>{displayName || formatPubkey(`${pubkey}`)}</p>
                        {created_at && (
                          <p>
                            Created at:{" "}
                            {new Date(created_at * 1000).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-row justify-center items-center">
                      <div className="px-2 py-1 rounded-lg borber border-solid border-black border-[1px] text-xs">
                        {`NIP${NDKKind.EncryptedDirectMessage}`}
                      </div>
                    </div>
                  </Link>
                )
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ChatList;
