import React, { useState } from "react";
import { privateKeyFromSeedWords } from "nostr-tools/nip06";
import { NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";

import { KeysV2 } from "@/types";

interface ImportKeyAdvancedFormProps {
  handleLogin: (keys: KeysV2) => Promise<void>;
  onClickBack: () => void;
}

export const ImportKeyAdvancedForm: React.FC<ImportKeyAdvancedFormProps> = ({
  handleLogin,
  onClickBack,
}) => {
  const [passphrase, setPassphrase] = useState("");
  const [seedWords, setSeedWords] = useState<string[]>([]);

  const seedWordsIsSet = seedWords.length >= 4;

  const handleOnChangeSeedWords = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.includes(" ")) {
      setSeedWords(value.split(" "));
      return;
    }

    setSeedWords([]);
  };

  const handleOnChangePassphrase = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassphrase(e.target.value);
  };

  const handleOnClickLogin = () => {
    if (seedWords.length === 0) {
      return;
    }

    const privateKey = passphrase
      ? privateKeyFromSeedWords(seedWords.join(" "), passphrase)
      : privateKeyFromSeedWords(seedWords.join(" "));
    const signer = new NDKPrivateKeySigner(privateKey);

    handleLogin({
      npub: signer.npub as `npub${string}`,
      nsec: signer.nsec as `nsec${string}`,
      privateSigner: signer.privateKey,
      privateKey: signer.privateKey,
      publicKey: signer.pubkey,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="seedWords"
          className="block text-sm font-medium text-gray-700"
        >
          Seed words
        </label>
        <input
          type="password"
          id="nsec"
          className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Seed words separated by spaces..."
          onChange={handleOnChangeSeedWords}
        />
      </div>

      <div>
        <label
          htmlFor="nsec"
          className="block text-sm font-medium text-gray-700"
        >
          Passphrase (if you have one)
        </label>
        <input
          type="password"
          id="nsec"
          className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Passphrase..."
          onChange={handleOnChangePassphrase}
        />
      </div>

      <button
        onClick={handleOnClickLogin}
        disabled={!seedWordsIsSet}
        className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {/* {loading ? "Logging in..." : "Login"} */}
        Login
      </button>
      <button
        onClick={onClickBack}
        className="w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Back
      </button>
    </div>
  );
};
