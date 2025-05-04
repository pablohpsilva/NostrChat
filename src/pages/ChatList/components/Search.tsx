import { useState } from "react";

// import { useSearch } from "@/hooks/useSearch";
import { NDKUserProfile } from "@nostr-dev-kit/ndk";

import SearchStartChat from "./SearchStartChat";

// const formatPubkey = (pubkey: string) => {
//   return `${pubkey.substring(0, 8)}...${pubkey.substring(pubkey.length - 8)}`;
// };

/**
 * Format and highlight search terms in content
 */
export const formatHighlightedContent = (
  content: string,
  searchQuery: string,
  threshold: number = 45
) => {
  if (!content) {
    return <span></span>;
  }

  const searchIndex = content.toLowerCase().indexOf(searchQuery.toLowerCase());

  // If content is too long, create a trimmed version that includes the search term
  let formattedContent = content;
  if (content.length > threshold) {
    // If search term is found, center the trimmed content around it
    if (searchIndex >= 0) {
      const startPos = Math.max(0, searchIndex - 15);
      const endPos = Math.min(
        content.length,
        searchIndex + searchQuery.length + 15
      );
      formattedContent =
        (startPos > 0 ? "..." : "") +
        content.substring(startPos, endPos) +
        (endPos < content.length ? "..." : "");
    } else {
      // If search term not found, just take first 42 chars
      formattedContent = content.substring(0, 42) + "...";
    }
  }

  // Highlight the search term
  return (
    <span>
      {formattedContent
        .split(new RegExp(`(${searchQuery})`, "gi"))
        .map((part, i) =>
          part.toLowerCase() === searchQuery.toLowerCase() ? (
            <strong key={i} className="text-black">
              {part}
            </strong>
          ) : (
            part
          )
        )}
    </span>
  );
};

/**
 * Format a user identifier (npub or pubkey) for display
 */
export const formatUserIdentifier = (user: NDKUserProfile): string => {
  if (typeof user.npub === "string") {
    return `${user.npub.substring(0, 8)}...${user.npub.substring(
      user.npub.length - 4
    )}`;
  } else if (typeof user.pubkey === "string") {
    return `npub...${user.pubkey.substring(user.pubkey.length - 6)}`;
  }
  return "Unknown ID";
};

export default function Search() {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // const { search, decryptedDirectMessages, users } = useSearch();

  const handleInputClick = () => {
    setIsOverlayOpen(true);
  };

  const handleCloseOverlay = () => {
    setIsOverlayOpen(false);
    setSearchQuery("");
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    // // TODO: Implement nostr search logic here
    // console.log("Searching on nostr for:", query);
    // await search(query);
  };

  return (
    <>
      <div className="flex-1 mx-4 relative">
        <input
          type="text"
          placeholder="Search chats..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={handleInputClick}
          readOnly
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

      {isOverlayOpen && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col">
          <div className="p-4 border-b border-gray-200 flex items-center">
            <button onClick={handleCloseOverlay} className="mr-4 text-gray-500">
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
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </button>
            <input
              type="text"
              autoFocus
              placeholder="Search on nostr..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            {searchQuery &&
              searchQuery.startsWith("npub") &&
              searchQuery.length === 63 && (
                <SearchStartChat npub={searchQuery} />
              )}

            {/* {searchQuery && (
              <div className="text-xs text-black/40 w-full text-center">
                Total results: {decryptedDirectMessages.length + users.length}
              </div>
            )} */}

            {/* {decryptedDirectMessages && decryptedDirectMessages.length > 0 && (
              <>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Messages
                </h3>
                <div className="space-y-4 mt-4">
                  {decryptedDirectMessages.map((event) => (
                    <div
                      key={event.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="font-medium text-gray-800 mb-1">
                        {userProfiles[event.pubkey]?.displayName ||
                          "Unknown User"}
                      </div>
                      <div className="text-black/40">
                        {event.content
                          ? formatHighlightedContent(event.content, searchQuery)
                          : ""}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )} */}

            {/* {users.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Users
                </h3>
                <div className="space-y-3">
                  {users.map((user) => (
                    <div
                      key={user.pubkey}
                      className="flex items-start p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        <img
                          src={
                            user.picture ||
                            "https://placehold.co/40x40?text=NostrChat"
                          }
                          alt={user.displayName || user.name || "User"}
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://placehold.co/40x40?text=NostrChat";
                          }}
                        />
                      </div>
                      <div className="ml-3 flex-1 overflow-hidden">
                        <div className="flex flex-col">
                          {user.displayName || user.name || "Anonymous"
                            ? formatHighlightedContent(
                                user.displayName || user.name || "Anonymous",
                                searchQuery
                              )
                            : ""}
                          <span className="text-xs text-gray-500">
                            {formatUserIdentifier(user)}
                          </span>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {user.about
                              ? formatHighlightedContent(
                                  user.about,
                                  searchQuery
                                )
                              : ""}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )} */}

            {/* {decryptedDirectMessages?.length === 0 && users.length === 0 && (
              <div className="text-gray-500 text-center mt-8 break-words">
                {searchQuery
                  ? `No results found for "${searchQuery}"`
                  : "Type to search on nostr"}
              </div>
            )} */}
          </div>
        </div>
      )}
    </>
  );
}
