import { useState } from "react";
import { NDKUser, NDKFilter, NDKKind } from "@nostr-dev-kit/ndk";
import { nip19 } from "nostr-tools";

import { getNDK } from "@/components/NDKHeadless";

interface SearchUserOptions {
  limit?: number;
}

interface SearchUserResult {
  loading: boolean;
  error: Error | null;
  users: NDKUser[];
  search: (query: string, options?: SearchUserOptions) => Promise<void>;
}

/**
 * Hook to search for users on Nostr by displayName, npub, or other public identifiers
 *
 * @returns Functions and state for searching users
 */
export function useSearchUser(): SearchUserResult {
  const [users, setUsers] = useState<NDKUser[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const ndk = getNDK();

  /**
   * Search for users on Nostr by displayName, npub, or other public identifiers
   *
   * @param query The search query string (displayName, npub, etc.)
   * @param options Optional search configuration
   */
  const search = async (
    query: string,
    options: SearchUserOptions = { limit: 20 }
  ): Promise<void> => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let pubkey: string | undefined;

      // Check if the query is a valid npub
      if (query.startsWith("npub")) {
        try {
          const decoded = nip19.decode(query);
          if (decoded.type === "npub") {
            pubkey = decoded.data as string;
          }
        } catch (e) {
          // Not a valid npub, will continue with text search
        }
      }

      let filters: NDKFilter[] = [];

      // If we have a pubkey from an npub, search directly for that user
      if (pubkey) {
        filters.push({
          kinds: [NDKKind.Metadata],
          authors: [pubkey],
          limit: 1,
        });
      } else {
        // Otherwise search by display name or other metadata
        filters.push({
          kinds: [NDKKind.Metadata],
          limit: options.limit,
        });
      }

      const events = await ndk.fetchEvents(filters);

      const foundUsers: NDKUser[] = [];

      for (const event of events) {
        try {
          const user = new NDKUser({ pubkey: event.pubkey });
          user.ndk = ndk;

          // Try to parse the content which contains user metadata
          const content = JSON.parse(event.content);

          // If searching by name/display name and not by npub
          if (!pubkey) {
            const searchLower = query.toLowerCase();
            const nameLower = (content.name || "").toLowerCase();
            const displayNameLower = (content.display_name || "").toLowerCase();
            const aboutLower = (content.about || "").toLowerCase();

            // Only add user if their name/display_name/about matches the search query
            if (
              nameLower.includes(searchLower) ||
              displayNameLower.includes(searchLower) ||
              aboutLower.includes(searchLower)
            ) {
              // Cache profile data so we have immediate access to it
              user.profile = content;
              foundUsers.push(user);
            }
          } else {
            // For npub search, we've already filtered by author, just add the user
            user.profile = content;
            foundUsers.push(user);
          }
        } catch (e) {
          // Skip events with invalid content
          console.error("Error processing user search result:", e);
        }
      }

      setUsers(foundUsers);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  return {
    users,
    loading,
    error,
    search,
  };
}
