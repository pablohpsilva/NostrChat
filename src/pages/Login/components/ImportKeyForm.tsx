import { KeysV2 } from "@/types";
import { NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import React, { useState } from "react";

interface ImportKeyFormProps {
  handleLogin: (keys: KeysV2) => Promise<void>;
  onClickBack: () => void;
}

export const ImportKeyForm: React.FC<ImportKeyFormProps> = ({
  handleLogin,
  onClickBack,
}) => {
  const [nsec, setNsec] = useState("");

  const handleOnChangeNsec = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNsec(e.target.value);
  };

  const handleOnClickLogin = () => {
    if (nsec) {
      const signer = new NDKPrivateKeySigner(nsec);

      handleLogin({
        npub: signer.npub as `npub${string}`,
        nsec: signer.nsec as `nsec${string}`,
        privateSigner: signer.privateKey,
        privateKey: signer.privateKey,
        publicKey: signer.pubkey,
      });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="nsec"
          className="block text-sm font-medium text-gray-700"
        >
          Your nsec private key
        </label>
        <input
          type="password"
          id="nsec"
          value={nsec}
          onChange={handleOnChangeNsec}
          className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="nsec1..."
        />
      </div>
      <button
        onClick={handleOnClickLogin}
        disabled={!nsec}
        className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
      >
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
