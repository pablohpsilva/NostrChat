import React, { useEffect, useState } from "react";
import { generateSeedWords, privateKeyFromSeedWords } from "nostr-tools/nip06";
import { NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";

import { KeysV2 } from "@/types";

interface CreateAdvancedAccountFormProps {
  onCreateAccount: (keys: KeysV2) => Promise<void>;
  onClickBack: () => void;
}

export const CreateAdvancedAccountForm: React.FC<
  CreateAdvancedAccountFormProps
> = ({ onCreateAccount, onClickBack }) => {
  const [passphrase, setPassphrase] = useState("");
  const [seedWords, setSeedWords] = useState<string[]>([]);
  const [keys, setKeys] = useState<KeysV2 | null>({
    npub: "" as `npub${string}`,
    nsec: "" as `nsec${string}`,
    privateSigner: "",
    privateKey: "",
    publicKey: "",
  });

  const handleCreateAccount = async () => {
    const seedWords = generateSeedWords();
    setSeedWords(seedWords.split(" "));
    // const account = accountFromSeedWords(seedWords, passphrase);
    // const extendedKeys = extendedKeysFromSeedWords(seedWords, passphrase);
    // const _account = accountFromExtendedKey(extendedKeys.privateExtendedKey);
    const privateKey = privateKeyFromSeedWords(seedWords, passphrase);
    const signer = new NDKPrivateKeySigner(privateKey);

    setKeys({
      npub: signer.npub as `npub${string}`,
      nsec: signer.nsec as `nsec${string}`,
      privateSigner: signer.privateKey,
      privateKey: signer.privateKey,
      publicKey: signer.pubkey,
    });
  };

  const onClickContinue = () => {
    if (keys && window.confirm("Are you sure you saved your keys?")) {
      onCreateAccount(keys);
      return;
    }
  };

  const handleOnPassphraseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassphrase(value);
    if (value.length >= 8) {
      handleCreateAccount();
    }
  };

  useEffect(() => {
    return () => {
      setKeys(null);
      setPassphrase("");
      setSeedWords([]);
    };
  }, []);

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Be sure to save your <b>seed words</b> and your <b>passphrase</b>{" "}
        securely!
      </p>

      <label className="block text-sm font-medium text-gray-700 mb-2 animate-pulse">
        Your Keys, <span className="font-bold">Your Responsibility</span>
      </label>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-black/50">Passphrase</label>
        <input
          type="text"
          placeholder="Enter your passphrase"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={handleOnPassphraseChange}
        />
        <label className="text-xs text-center block">
          {passphrase.length === 0 && "Minimum 8 characters"}
          {passphrase.length > 0 &&
            passphrase.length < 8 &&
            `${8 - passphrase.length} characters missing`}
        </label>
      </div>

      {seedWords.length > 0 && (
        <>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-medium text-black/50">
              Seed words
            </label>
            <button
              onClick={() => {
                navigator.clipboard.writeText(seedWords.join(" "));
                alert("Copied to clipboard");
              }}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Copy to clipboard
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {seedWords.map((word, index) => (
              <div
                key={`${word}-${index}`}
                className="p-2 bg-white border border-gray-300 rounded text-xs font-mono overflow-x-auto"
              >
                {word}
              </div>
            ))}
          </div>

          {keys && (
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold text-gray-600">
                    Public Key (npub)
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(keys.npub);
                      alert("Copied to clipboard");
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Copy
                  </button>
                </div>
                <div className="p-2 bg-white border border-gray-300 rounded text-xs font-mono overflow-x-auto">
                  {keys.npub}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold text-gray-600">
                    Private Key (nsec)
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(keys.nsec);
                      alert("Copied to clipboard");
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Copy
                  </button>
                </div>
                <div className="p-2 bg-white border border-gray-300 rounded text-xs font-mono overflow-x-auto">
                  {keys.nsec}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-center mt-1">
            <button
              onClick={handleCreateAccount}
              disabled={passphrase.length < 8}
              className="text-xs border border-blue-600 px-4 py-2 rounded-md text-blue-600"
            >
              Generate seed words again
            </button>
          </div>
        </>
      )}

      {seedWords.length === 0 && (
        <button
          onClick={handleCreateAccount}
          disabled={passphrase.length < 8}
          className="w-full px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
        >
          Generate seed words
        </button>
      )}

      {seedWords.length !== 0 && (
        <button
          onClick={onClickContinue}
          className="w-full px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
        >
          Continue
        </button>
      )}

      <hr className="mt-4 mb-8 border-black/10" />

      <button
        onClick={onClickBack}
        className="w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Back
      </button>
    </div>
  );
};
