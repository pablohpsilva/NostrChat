import { useState, useEffect } from "react";
import { useNDKCurrentUser } from "@nostr-dev-kit/ndk-hooks";
import {
  NDKFilter,
  NDKEvent,
  NDKUser,
  NDKKind,
  NDKSubscriptionOptions,
} from "@nostr-dev-kit/ndk";
import { getNDK } from "../components/NDKHeadless";
import { nip04 } from "nostr-tools";
import { getKeys } from "@/libs/local-storage";
const ndk = getNDK();
/**
 * Hook to fetch and manage direct messages for the current user
 *
 * @returns Object containing direct messages state and helper functions
 */
export function useDirectMessages() {
  const currentUser = useNDKCurrentUser();
  const [masterPrivateKeyHex, setMasterPrivateKeyHex] = useState<string | null>(
    null
  );

  const [directMessages, setDirectMessages] = useState<
    Record<string, NDKEvent[]>
  >({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Load all direct messages for the current user
   */
  const loadDirectMessages = async () => {
    if (!currentUser?.pubkey) return;

    try {
      setLoading(true);

      // Filter for encrypted DMs (kind 4) sent from the current user
      const outgoingFilter: NDKFilter = {
        kinds: [NDKKind.EncryptedDirectMessage],
        authors: [currentUser.pubkey],
      };

      // Filter for encrypted DMs (kind 4) sent to the current user
      const incomingFilter: NDKFilter = {
        kinds: [NDKKind.EncryptedDirectMessage],
        "#p": [currentUser.pubkey],
      };

      // console.log("DM Filters:", { outgoingFilter, incomingFilter });

      const options: NDKSubscriptionOptions = {
        closeOnEose: false, // Keep the subscription open
      };

      // Create a map to organize messages by conversation partner
      const messagesByUser: Record<string, NDKEvent[]> = {};

      // Function to add a message to the conversation map
      const addMessageToConversation = (
        event: NDKEvent,
        partnerPubkey: string
      ) => {
        if (!messagesByUser[partnerPubkey]) {
          messagesByUser[partnerPubkey] = [];
        }

        // Add message if it doesn't already exist
        if (!messagesByUser[partnerPubkey].some((msg) => msg.id === event.id)) {
          messagesByUser[partnerPubkey] = [
            ...messagesByUser[partnerPubkey],
            event,
          ];

          // Sort messages by timestamp
          messagesByUser[partnerPubkey].sort(
            (a, b) => a.created_at! - b.created_at!
          );

          // Update state
          setDirectMessages({ ...messagesByUser });
        }
      };

      // Subscribe to outgoing messages (from the current user)
      const outgoingSub = ndk.subscribe(outgoingFilter, options);

      outgoingSub.on("event", (event: NDKEvent) => {
        // console.log("Outgoing message received:", event);
        // For outgoing messages, the p tag contains the recipient
        const recipientPubkey = event.tags.find((tag) => tag[0] === "p")?.[1];

        if (recipientPubkey) {
          addMessageToConversation(event, recipientPubkey);
        }
      });

      // Subscribe to incoming messages (to the current user)
      const incomingSub = ndk.subscribe(incomingFilter, options);

      incomingSub.on("event", (event: NDKEvent) => {
        // console.log("Incoming message received:", event);
        // For incoming messages, the author is the sender
        const senderPubkey = event.pubkey;

        if (senderPubkey) {
          addMessageToConversation(event, senderPubkey);
        }
      });

      // Handle EOSE (End of Stored Events)
      outgoingSub.on("eose", () => {
        console.log("Outgoing messages EOSE received");
        setLoading(false);
      });

      incomingSub.on("eose", () => {
        console.log("Incoming messages EOSE received");
        setLoading(false);
      });

      return () => {
        // Clean up subscriptions when the hook unmounts
        outgoingSub.stop();
        incomingSub.stop();
      };
    } catch (err) {
      console.error("Error loading direct messages:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to load direct messages")
      );
      setLoading(false);
    }
  };

  /**
   * Send a direct message to a user
   *
   * @param recipient The recipient's NDKUser object or pubkey string
   * @param content The message content to send
   * @returns The sent NDKEvent or null if sending failed
   */
  const sendDirectMessage = async (
    recipient: NDKUser | string,
    content: string
  ): Promise<NDKEvent | null> => {
    if (!currentUser?.pubkey) return null;

    try {
      const recipientUser =
        typeof recipient === "string"
          ? ndk.getUser({ pubkey: recipient })
          : recipient;

      // Create a new DM event
      const event = new NDKEvent(ndk);
      event.kind = NDKKind.EncryptedDirectMessage;
      // event.content = content;
      event.content = nip04.encrypt(
        masterPrivateKeyHex,
        recipientUser.pubkey,
        content
      );
      event.tags = [["p", recipientUser.pubkey]];

      console.log("event", event);

      // Encrypt and sign the event
      // await event.encrypt(recipientUser);

      // Publish the event
      await event.publish();

      return event;
    } catch (err) {
      console.error("Error sending direct message:", err);
      return null;
    }
  };

  /**
   * Decrypt the content of a direct message
   *
   * @param event The encrypted event to decrypt
   * @returns The decrypted content or null if decryption fails
   */
  const decryptMessage = async (event: NDKEvent): Promise<string | null> => {
    if (!currentUser?.pubkey) return null;

    try {
      // For messages sent by the current user
      if (event.pubkey === currentUser.pubkey) {
        const recipientPubkey = event.tags.find((tag) => tag[0] === "p")?.[1];
        if (recipientPubkey) {
          const recipient = ndk.getUser({ pubkey: recipientPubkey });

          // return await event.decrypt(recipient);
          return nip04.decrypt(
            masterPrivateKeyHex,
            recipient.pubkey,
            event.content
          );
        }
      }
      // For messages received by the current user
      else {
        const sender = ndk.getUser({ pubkey: event.pubkey });
        // return await event.decrypt(sender);
        return nip04.decrypt(masterPrivateKeyHex, sender.pubkey, event.content);
      }

      return null;
    } catch (err) {
      console.error("Error decrypting message:", err);
      return null;
    }
  };

  /**
   * Get all messages for a conversation with a specific user
   *
   * @param pubkey The public key of the user to get messages for
   * @returns Array of NDKEvent objects for the conversation
   */
  const getConversation = (pubkey: string): NDKEvent[] => {
    return directMessages[pubkey] || [];
  };

  // Load direct messages when the current user changes
  useEffect(() => {
    if (currentUser?.pubkey) {
      getKeys().then(({ privateKey }) => {
        setMasterPrivateKeyHex(privateKey);
        loadDirectMessages();
      });
      // const cleanup = loadDirectMessages();
      // loadDirectMessages();
      return () => {
        // if (cleanup) cleanup();
      };
    }
  }, [currentUser?.pubkey]);

  return {
    directMessages,
    loading,
    error,
    sendDirectMessage,
    decryptMessage,
    getConversation,
    loadDirectMessages,
  };
}
