import { getRelays, removeRelays, storeRelays } from "@/libs/local-storage";
import { RelayDict } from "@/types";
import { useEffect, useState } from "react";

export const DEFAULT_RELAYS: RelayDict = {
  "wss://relay1.nostrchat.io": { read: true, write: true },
  "wss://relay2.nostrchat.io": { read: true, write: true },
  "wss://relay.damus.io": { read: true, write: true },
  "wss://relay.snort.social": { read: true, write: false },
  "wss://nos.lol": { read: true, write: true },
  "wss://inbox.azzamo.net": { read: true, write: true },
};

export default function useRelays() {
  const [relays, setRelays] = useState<RelayDict>();

  const storeRelay = async (relay: RelayDict) => {
    setRelays((prev) => ({ ...prev, ...relay }));
    await storeRelays(relay);
  };

  const storeAndUpdateGlobalRelays = async (
    relay: RelayDict,
    forceReload = false
  ) => {
    storeRelay(relay);
    if (forceReload) {
      window.location.reload();
    }
  };

  const resetRelays = async () => {
    setRelays(DEFAULT_RELAYS);
    await removeRelays();
    await storeRelays(DEFAULT_RELAYS);
  };

  useEffect(() => {
    getRelays().then((_relays) => {
      if (_relays) {
        setRelays(_relays);
        return;
      }

      storeRelay(DEFAULT_RELAYS);
    });
  }, []);

  return { relays, storeRelay, resetRelays, storeAndUpdateGlobalRelays };
}
