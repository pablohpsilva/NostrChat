import {
  NDKEvent,
  NDKFilter,
  NDKKind,
  NDKPrivateKeySigner,
  NDKSubscriptionOptions,
  NDKUserProfile,
  NostrEvent,
} from "@nostr-dev-kit/ndk";
import { useState } from "react";
import { nip17 } from "nostr-tools";

import { Recipient, ReplyTo } from "@/types";
import { useNDKCurrentUser } from "@nostr-dev-kit/ndk-hooks";
import { getNDK } from "@/components/NDKHeadless";

export default function usePrivateDirectMessage() {
  const currentUser = useNDKCurrentUser();
  const [isLoading, setLoading] = useState(false);
  const [messagesByUser, setMessagesByUser] = useState<NDKEvent[]>([]);

  const sendEvent = (
    senderPrivateKey: Uint8Array,
    recipient: Recipient,
    message: string,
    conversationTitle?: string,
    replyTo?: ReplyTo
  ): NostrEvent => {
    return nip17.wrapEvent(
      senderPrivateKey,
      recipient,
      message,
      conversationTitle,
      replyTo
    );
  };

  const sendManyEvents = (
    senderPrivateKey: Uint8Array,
    recipients: Recipient[],
    message: string,
    conversationTitle?: string,
    replyTo?: ReplyTo
  ): NostrEvent[] => {
    return nip17.wrapManyEvents(
      senderPrivateKey,
      recipients,
      message,
      conversationTitle,
      replyTo
    );
  };

  const unwrapEvent = (wrap: NostrEvent, recipientPrivateKey: Uint8Array) => {
    // @ts-expect-error
    return nip17.unwrapEvent(wrap, recipientPrivateKey) as NDKEvent;
  };

  const unwrapManyEvents = (
    wrappedEvents: NostrEvent[],
    recipientPrivateKey: Uint8Array
  ) => {
    return nip17.unwrapManyEvents(
      // @ts-expect-error
      wrappedEvents,
      recipientPrivateKey
    ) as NDKEvent[];
  };

  const addMessageToConversation = (
    event: NDKEvent,
    partnerPubkey: string,
    privateKey: Uint8Array<ArrayBuffer>
  ) => {
    // if (!messagesByUser[partnerPubkey]) {
    //   messagesByUser[partnerPubkey] = [];
    // }
    // // Add message if it doesn't already exist
    // if (!messagesByUser[partnerPubkey].some((msg) => msg.id === event.id)) {
    //   messagesByUser[partnerPubkey] = [
    //     ...messagesByUser[partnerPubkey],
    //     event,
    //   ];
    //   // Sort messages by timestamp
    //   messagesByUser[partnerPubkey].sort(
    //     (a, b) => a.created_at! - b.created_at!
    //   );
    //   // Update state
    //   setDirectMessages({ ...messagesByUser });
    // }

    const unwrappedEvent = unwrapEvent(event, privateKey);
    setMessagesByUser((prev) => [...prev, unwrappedEvent]);
  };

  const getUserChats = async (
    options?: NDKSubscriptionOptions
  ): Promise<Record<string, NDKUserProfile>> => {
    if (!currentUser) {
      return {};
    }

    setLoading(true);

    const chatUsers: Record<string, NDKUserProfile> = {};
    // @ts-expect-error
    const privateKey = getNDK().getInstance().signer?._privateKey;

    try {
      // NIP-17 messages use kind 4 (encrypted direct messages)
      const filter: NDKFilter = {
        kinds: [NDKKind.PrivateDirectMessage],
        authors: [currentUser.pubkey],
        // "#p": [currentUser.pubkey],
      };

      // Use since/until if provided in options
      //   if (options?.since) filter.since = options.since;
      //   if (options?.until) filter.until = options.until;

      const events = Array.from(
        await getNDK().getInstance().fetchEvents(filter, options)
      );
      const unwrappedEvents = unwrapManyEvents(events, privateKey);

      for (const event of unwrappedEvents) {
        const recipientPubkey = event.tags.find((tag) => tag[0] === "p")?.[1];
        if (recipientPubkey && !chatUsers[recipientPubkey]) {
          const profile = await ndk
            .getUser({ pubkey: recipientPubkey })
            .fetchProfile();

          if (profile) {
            chatUsers[recipientPubkey] = profile;
          }
        }
      }

      return chatUsers;
    } catch (error) {
      console.error("Error fetching private messages:", error);
      return chatUsers;
    } finally {
      setLoading(false);
    }
  };

  const getConversationMessages = async (
    nsec: string,
    recipients: string[],
    options?: NDKSubscriptionOptions
  ) => {
    if (!currentUser || !recipients.length) {
      return [];
    }

    setLoading(true);
    // @ts-expect-error
    const privateKey = getNDK().getInstance().signer?._privateKey;

    try {
      // We need two filters to get the complete conversation:
      // 1. Messages sent BY current user TO recipients
      const outgoingFilter: NDKFilter = {
        kinds: [NDKKind.EncryptedDirectMessage],
        authors: [currentUser.pubkey],
        "#p": recipients,
      };

      // 2. Messages sent TO current user FROM recipients
      const incomingFilter: NDKFilter = {
        kinds: [NDKKind.EncryptedDirectMessage],
        authors: recipients,
        "#p": [currentUser.pubkey],
      };

      // Fetch both outgoing and incoming messages
      const outgoingEvents = await getNDK()
        .getInstance()
        .fetchEvents(outgoingFilter, options);
      const incomingEvents = await getNDK()
        .getInstance()
        .fetchEvents(incomingFilter, options);

      // Combine the two sets of events
      const allEvents = new Set([...outgoingEvents, ...incomingEvents]);

      const unwrappedEvents = unwrapManyEvents(
        Array.from(allEvents),
        privateKey
      );

      return Array.from(unwrappedEvents);
    } catch (error) {
      console.error("Error fetching conversation messages:", error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getConversationMessagesWebhook = async (
    recipients: string[],
    _options: NDKSubscriptionOptions = {}
  ) => {
    if (!currentUser || !recipients.length) {
      return [];
    }

    setLoading(true);
    setMessagesByUser([]);

    try {
      // @ts-expect-error
      const privateKey = getNDK().getInstance().signer?._privateKey;

      // We need two filters to get the complete conversation:
      // 1. Messages sent BY current user TO recipients
      const outgoingFilter: NDKFilter = {
        kinds: [NDKKind.EncryptedDirectMessage],
        authors: [currentUser.pubkey],
        "#p": recipients,
      };

      // 2. Messages sent TO current user FROM recipients
      const incomingFilter: NDKFilter = {
        kinds: [NDKKind.EncryptedDirectMessage],
        authors: recipients,
        "#p": [currentUser.pubkey],
      };

      const options: NDKSubscriptionOptions = {
        closeOnEose: false, // Keep the subscription open
        ..._options,
      };

      const outgoingSub = getNDK()
        .getInstance()
        .subscribe(outgoingFilter, options);
      const incomingSub = getNDK()
        .getInstance()
        .subscribe(incomingFilter, options);

      outgoingSub.on("event", (event: NDKEvent) => {
        // console.log("Outgoing message received:", event);
        // For outgoing messages, the p tag contains the recipient
        const recipientPubkey = event.tags.find((tag) => tag[0] === "p")?.[1];

        if (recipientPubkey) {
          addMessageToConversation(event, recipientPubkey, privateKey);
        }
      });

      incomingSub.on("event", (event: NDKEvent) => {
        // console.log("Incoming message received:", event);
        // For incoming messages, the author is the sender
        const senderPubkey = event.pubkey;

        if (senderPubkey) {
          addMessageToConversation(event, senderPubkey, privateKey);
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
    } catch (error) {
      console.error("Error fetching conversation messages:", error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    sendEvent,
    sendManyEvents,
    unwrapEvent,
    unwrapManyEvents,
    getUserChats,
    getConversationMessages,
    getConversationMessagesWebhook,
    isLoading,
    messagesByUser,
  };
}
