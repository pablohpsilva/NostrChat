import { useEffect, useState } from "react";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import { useNDKCurrentUser } from "@nostr-dev-kit/ndk-hooks";
import { getKeys } from "@/libs/local-storage";
import { useSearchDirectMessages } from "./useSearchDirectMessages";

/**
 * Hook to search for content in the Nostr network
 *
 * @returns Function to search for content and related state
 */
export function useSearch() {
  const currentUser = useNDKCurrentUser();
  const [masterPrivateKeyHex, setMasterPrivateKeyHex] = useState<string | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [results, setResults] = useState<Record<string, NDKEvent[]>>({});
  const {
    directMessages,
    loading,
    error,
    loadDirectMessages,
    decryptedIdsRef,
    decryptSingleMessage,
  } = useSearchDirectMessages({ masterPrivateKeyHex });
  const messages = Object.values(directMessages).flat();

  /**
   * Search for content in the Nostr network
   *
   * @param query The search query string
   * @param options Optional search configuration
   * @returns The search results
   */
  const search = async (query: string): Promise<void> => {
    setSearchQuery(query);
  };

  useEffect(() => {
    if (currentUser?.pubkey) {
      getKeys().then(({ privateKey }) => {
        setMasterPrivateKeyHex(privateKey);
        loadDirectMessages();
      });
    }
  }, [currentUser?.pubkey]);

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
    if (searchQuery) {
      console.log("result directMessages", directMessages);
      const results = Object.keys(directMessages).filter((key) => {
        return directMessages[key].some((event) => {
          return event.content.includes(searchQuery);
        });
      });
      console.log("results", results);
      setResults(results);
    }
  }, [searchQuery, directMessages]);

  return {
    search,
    results,
    loading,
    error,
  };
}
