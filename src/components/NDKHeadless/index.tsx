// Here we will initialize NDK and configure it to be available throughout the application
import NDK from "@nostr-dev-kit/ndk";
import NDKCacheAdapterDexie from "@nostr-dev-kit/ndk-cache-dexie";
import {
  NDKSessionLocalStorage,
  useNDKInit,
  useNDKSessionMonitor,
} from "@nostr-dev-kit/ndk-hooks";
import { useEffect } from "react";
import { APP_NAME } from "../../consts";

// Define explicit relays or use defaults
const explicitRelayUrls = [
  "wss://relay.primal.net",
  "wss://nos.lol",
  "wss://purplepag.es",
  "wss://relay.damus.io",
];

// Setup Dexie cache adapter (Client-side only)
let cacheAdapter: NDKCacheAdapterDexie | undefined;
if (typeof window !== "undefined") {
  cacheAdapter = new NDKCacheAdapterDexie({ dbName: APP_NAME });
}

// Use the browser's localStorage for session storage
const sessionStorage = new NDKSessionLocalStorage();

// Singleton pattern to ensure only one NDK instance is used throughout the app
export const getNDK = (() => {
  // This closure ensures we only have one reference to the NDK instance
  // Create the singleton NDK instance
  const ndk = new NDK({ explicitRelayUrls, cacheAdapter });
  let instance = ndk;

  // Connect to relays on initialization (client-side)
  if (typeof window !== "undefined") ndk.connect();

  // Return a function that always provides the same instance
  return () => {
    return instance;
  };
})();

const ndk = getNDK();

// Helper to get the current user from the NDK instance
export const getCurrentUser = async () => {
  if (!ndk.signer) return null;
  return await ndk.signer.user();
};

export default function NDKHeadless() {
  const initNDK = useNDKInit();

  useNDKSessionMonitor(sessionStorage, {
    profile: true, // automatically fetch profile information for the active user
    follows: true, // automatically fetch follows of the active user
  });

  useEffect(() => {
    if (ndk) {
      initNDK(ndk);
    }
  }, [initNDK]);

  return null;
}
