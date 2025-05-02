import { SecureStoragePlugin } from "capacitor-secure-storage-plugin";
import { DEFAULT_RELAYS, PLATFORM } from "../../consts";
import { Keys, KeysV2, RelayDict } from "../../types";
import { NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";

const isCapacitor = PLATFORM === "ios" || PLATFORM === "android";
const LOCAL_STORAGE_KEYS = "keys";

const getItem = async (key: string): Promise<any | null> => {
  let valueRaw: null | string;

  if (isCapacitor) {
    try {
      valueRaw = await SecureStoragePlugin.get({ key }).then((a) => a.value);
    } catch (e) {
      valueRaw = null;
    }
  } else if (PLATFORM === "web") {
    valueRaw = localStorage.getItem(key);
  } else {
    throw new Error("Not implemented");
  }

  if (valueRaw !== null) {
    try {
      return JSON.parse(valueRaw);
    } catch (e) {}
  }

  return null;
};

const setItem = async (key: string, value: any): Promise<void> => {
  if (isCapacitor) {
    await SecureStoragePlugin.set({ key, value: JSON.stringify(value) });
  } else if (PLATFORM === "web") {
    localStorage.setItem(key, JSON.stringify(value));
  } else {
    throw new Error("Not implemented");
  }
};

const removeItem = async (key: string): Promise<void> => {
  if (isCapacitor) {
    await SecureStoragePlugin.remove({ key });
  } else if (PLATFORM === "web") {
    localStorage.removeItem(key);
  } else {
    throw new Error("Not implemented");
  }
};

export const getRelays = (): Promise<RelayDict> =>
  getItem("relays").then((r) => r || DEFAULT_RELAYS);
export const getRelaysNullable = (): Promise<RelayDict | null> =>
  getItem("relays");
export const storeRelays = async (relays: RelayDict) =>
  setItem("relays", relays);
export const removeRelays = async (): Promise<void> => removeItem("relays");

/**
 *
 * Keys methods
 *
 */
export const getKeys = async (): Promise<KeysV2> => getItem(LOCAL_STORAGE_KEYS);
export const removeKeys = async (): Promise<void> =>
  removeItem(LOCAL_STORAGE_KEYS);
export const storeKeys = async (value: KeysV2) => {
  const signer = new NDKPrivateKeySigner(value.privateSigner);
  const privateSigner = signer.toPayload();
  const payload = JSON.stringify({ ...value, privateSigner });

  if (isCapacitor) {
    await SecureStoragePlugin.set({
      key: LOCAL_STORAGE_KEYS,
      value: payload,
    });
    return payload;
  }

  if (PLATFORM === "web") {
    localStorage.setItem(LOCAL_STORAGE_KEYS, payload);
    return payload;
  }

  throw new Error("Not implemented");
};

// Skipping using capacitor secure plugin for storing editor history and putting function here to have a clear structure for local storage.
export const getEditorValue = (key: string) => localStorage.getItem(key);
export const storeEditorValue = (key: string, value: string) =>
  localStorage.setItem(key, value);
export const removeEditorValue = (key: string) => localStorage.removeItem(key);
