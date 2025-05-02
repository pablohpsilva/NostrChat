import { ndkSignerFromPayload } from "@nostr-dev-kit/ndk";

import { KeysV2 } from "../../types";
import { getKeys, storeKeys } from "../local-storage";
import { getNDK } from "../../components/NDKHeadless";

export const saveSigner = async (value: KeysV2) => {
  return await storeKeys(value);
};

export const getSigner = async () => {
  const values = await getKeys();
  const ndk = getNDK();

  if (!values) {
    return null;
  }

  const storedPayload = values.privateSigner;

  const restoredSigner = await ndkSignerFromPayload(storedPayload, ndk);

  if (!restoredSigner) {
    return null;
  }

  // Successfully restored - use the signer
  ndk.signer = restoredSigner;
  console.log("Signer restored successfully!");
  const signer = await restoredSigner.user();
  console.log("Restored user pubkey:", signer.pubkey);

  return signer;
};
