import { useEffect, useState } from "react";

import { useSearch } from "@/hooks/useSearch";

export default function Search() {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { search } = useSearch();

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
    await search(query);
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
            {searchQuery ? (
              <div className="text-gray-600">
                Search results will appear here...
              </div>
            ) : (
              <div className="text-gray-400 text-center mt-10">
                Type to search on nostr
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
