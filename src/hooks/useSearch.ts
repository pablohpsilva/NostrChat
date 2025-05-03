import { useEffect, useState } from "react";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import { useNDKCurrentUser } from "@nostr-dev-kit/ndk-hooks";

import { getKeys } from "@/libs/local-storage";
import { useEncryptedDirectMessage } from "./useEncryptedDirectMessage";
import { useSearchUser } from "./useSearchUser";

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
  const [decryptedDirectMessages, setDecryptedDirectMessages] = useState<
    NDKEvent[]
  >([]);
  const {
    directMessages,
    loading: directMessagesLoading,
    error: directMessagesError,
    loadDirectMessages,
    decryptedIdsRef,
    decryptedMessages,
    decryptSingleMessage,
  } = useEncryptedDirectMessage({ masterPrivateKeyHex });
  const messages = Object.values(directMessages).flat();
  const {
    search: searchUser,
    users,
    loading: userLoading,
    error: userError,
    clear: clearUser,
  } = useSearchUser();

  /**
   * Search for content in the Nostr network
   *
   * @param query The search query string
   * @param options Optional search configuration
   * @returns The search results
   */
  const search = async (query: string): Promise<void> => {
    if (!query.length) {
      setSearchQuery("");
      setDecryptedDirectMessages([]);
      clearUser();
      return;
    }
    setSearchQuery(query);
    searchUser(query);
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
          await Promise.all(
            messages.map(async (message) => await decryptSingleMessage(message))
          );
          // Filter messages that match the search query
          const matchingEvents = messages
            .reduce(
              (acc, curr) =>
                acc.concat({ ...curr, content: decryptedMessages[curr.id] }),
              [] as NDKEvent[]
            )
            .filter((event) => {
              const decrypted = decryptedMessages[event.id];
              return (
                // event.content &&
                // event.content.toLowerCase().includes(searchQuery.toLowerCase())
                decrypted &&
                event.content.toLowerCase().includes(searchQuery.toLowerCase())
              );
            });

          allResults.push(...matchingEvents);
        }

        // Update results state after all processing is complete
        setDecryptedDirectMessages(allResults);
      };

      // Execute the async function
      processAllMessages();
    }
  }, [searchQuery, directMessages]);

  return {
    search,
    decryptedDirectMessages,
    directMessagesLoading,
    directMessagesError,
    users,
    userLoading,
    userError,
    error: directMessagesError || userError,
    loading: directMessagesLoading || userLoading,
  };
}
