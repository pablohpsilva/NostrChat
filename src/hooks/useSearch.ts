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
  const [results, setResults] = useState<NDKEvent[]>([]);
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
    if (searchQuery && currentUser?.pubkey) {
      // Process all direct messages across all conversations
      const processAllMessages = async () => {
        const allResults: NDKEvent[] = [];

        for (const key of Object.keys(directMessages)) {
          const messages = directMessages[key];

          // Decrypt all messages in this conversation
          const decryptedEvents = await Promise.all(
            messages.map(async (message) => {
              const result = await decryptSingleMessage(message);
              return result;
            })
          );

          // Filter messages that match the search query
          const matchingEvents = decryptedEvents.filter((event) => {
            return (
              event.content &&
              event.content.toLowerCase().includes(searchQuery.toLowerCase())
            );
          });

          allResults.push(...matchingEvents);
        }

        // Update results state after all processing is complete
        setResults(allResults);
      };

      // Execute the async function
      processAllMessages();
    }
  }, [searchQuery, directMessages]);

  return {
    search,
    results,
    loading,
    error,
  };
}
