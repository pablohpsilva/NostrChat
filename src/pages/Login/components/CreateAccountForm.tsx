import React, { useState } from "react";
import { NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";

import { KeysV2 } from "@/types";

interface CreateAccountFormProps {
  onCreateAccount: (keys: KeysV2) => Promise<void>;
  onClickBack: () => void;
}

export const CreateAccountForm: React.FC<CreateAccountFormProps> = ({
  onCreateAccount,
  onClickBack,
}) => {
  const [keys, setKeys] = useState<KeysV2 | null>({
    npub: "" as `npub${string}`,
    nsec: "" as `nsec${string}`,
    privateSigner: "",
    privateKey: "",
    publicKey: "",
  });
  const hasGeneratedKeys = keys?.npub && keys?.nsec;

  const handleOnClickGenerateKeys = async () => {
    const signer = NDKPrivateKeySigner.generate();
    const privateKey = signer.privateKey; // Get the hex private key
    const publicKey = signer.pubkey; // Get the hex public key
    const nsec = signer.nsec as `nsec${string}`; // Get the private key in nsec format
    const npub = signer.npub as `npub${string}`; // Get the public key in npub format
    const privateSigner = signer.privateKey;
    const keys = {
      privateKey,
      publicKey,
      nsec,
      npub,
      privateSigner,
    };

    setKeys(keys);
  };

  const handleOnClickContinue = async () => {
    if (keys && window.confirm("Are you sure you saved your keys?")) {
      onCreateAccount(keys);
      return;
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        We'll generate a new Nostr key for you.
      </p>
      <p className="text-sm text-gray-600 font-bold">
        Be sure to save your private key securely!
      </p>

      {hasGeneratedKeys && (
        <>
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-2 animate-pulse">
              Your Keys, <span className="font-bold">Your Responsibility</span>
            </label>
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
          </div>
          <p className="text-xs text-red-600 font-bold mb-4">
            WARNING: Never share your private key with anyone! Save it somewhere
            secure.
          </p>

          <p className="text-xs text-red-600 font-bold">
            WARNING: If you lose/forget/give away your private key the following
            can happen:
            <ul className="list-disc list-inside">
              <li>Lose your account</li>
              <li>Bad actors gain access to your account</li>
              <li>Your privacy and anonymity are compromised</li>
              <li>You can be watched by bad actors without your knowledge</li>
              <li>
                You can potentially lose your funds (depends on the wallet you
                use)
              </li>
            </ul>
          </p>
        </>
      )}

      {hasGeneratedKeys ? (
        <button
          onClick={handleOnClickContinue}
          disabled={!keys}
          className="w-full px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
        >
          Continue
        </button>
      ) : (
        <button
          onClick={handleOnClickGenerateKeys}
          // disabled={loading}
          className="w-full px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
        >
          Create Account
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
