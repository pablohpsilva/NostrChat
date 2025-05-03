import { useState } from "react";
import {
  NDKUser,
  NDKFilter,
  NDKKind,
  NDKUserProfile,
} from "@nostr-dev-kit/ndk";
import { nip19 } from "nostr-tools";

import { getNDK } from "@/components/NDKHeadless";

interface SearchUserOptions {
  limit?: number;
}

interface SearchUserResult {
  loading: boolean;
  error: Error | null;
  users: NDKUserProfile[];
  search: (query: string, options?: SearchUserOptions) => Promise<void>;
  clear: () => void;
}

const ndk = getNDK();
/**
 * Hook to search for users on Nostr by displayName, npub, or other public identifiers
 *
 * @returns Functions and state for searching users
 */
export function useSearchUser(): SearchUserResult {
  const [users, setUsers] = useState<NDKUserProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

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
      const profiles = await Promise.all(
        Array.from(events).map(async (event) => {
          const user = ndk.getUser({ pubkey: event.pubkey });
          const profile = await user.fetchProfile();
          return profile;
        })
      );

      const searchLower = query.toLowerCase();
      const foundUsers = profiles.filter(Boolean).filter((profile) => {
        const nameLower = (profile?.name || "").toLowerCase();
        const displayNameLower = (profile?.displayName || "").toLowerCase();
        const aboutLower = (profile?.about || "").toLowerCase();

        return (
          nameLower.includes(searchLower) ||
          displayNameLower.includes(searchLower) ||
          aboutLower.includes(searchLower)
        );
      }) as NDKUserProfile[];

      setUsers(foundUsers);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setUsers([]);
  };

  return {
    users,
    loading,
    error,
    clear,
    search,
  };
}
