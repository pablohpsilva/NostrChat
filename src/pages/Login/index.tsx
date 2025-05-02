import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNDKSessionLogin } from "@nostr-dev-kit/ndk-hooks";
import { NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";

import { APP_NAME } from "../../consts";
import { getSigner, saveSigner } from "../../libs/signer-persistence";
import { ROUTES } from "../../consts/routes";

enum LoginMode {
  LOGIN = "login",
  CREATE = "create",
  IMPORT = "import",
}

const keysInitialState = {
  privateKey: "",
  publicKey: "",
  nsec: "",
  npub: "",
};

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<LoginMode>(LoginMode.LOGIN);
  const [nsec, setNsec] = useState<string>("");
  const [keys, setKeys] = useState<typeof keysInitialState>(keysInitialState);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const login = useNDKSessionLogin();
  const hasGeneratedKeys = keys.npub && keys.nsec;

  const handleLogin = async () => {
    const signer = new NDKPrivateKeySigner(nsec);

    await saveSigner({
      publicKey: signer.pubkey,
      npub: signer.userSync.npub as `npub${string}`,
      privateSigner: nsec,
      nsec: nsec as `nsec${string}`,
      privateKey: signer.privateKey,
    });

    await login(signer);
    // Redirect to the app after successful login
    navigate(ROUTES.CHAT);
  };

  const handleCreateAccount = async () => {
    const signer = NDKPrivateKeySigner.generate();
    const privateKey = signer.privateKey!; // Get the hex private key
    const publicKey = signer.pubkey; // Get the hex public key
    const nsec = signer.nsec; // Get the private key in nsec format
    const npub = signer.userSync.npub; // Get the public key in npub format
    setKeys({
      privateKey,
      publicKey,
      nsec,
      npub,
    });

    console.log("privateKey", privateKey);
    console.log("publicKey", publicKey);
    console.log("nsec", nsec);
    console.log("npub", npub);
  };

  const handleOnClickBack = () => {
    setMode(LoginMode.LOGIN);
    setKeys(keysInitialState);
  };

  // useEffect(() => {
  //   if (!currentUser) {
  //     console.log("you are not logged in");
  //   } else {
  //     console.log(
  //       "you are now logged in with user with pubkey",
  //       currentUser.pubkey
  //     );
  //   }
  // }, [currentUser]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">{APP_NAME}</h1>
          <p className="mt-2 text-sm text-gray-600">
            {mode === LoginMode.LOGIN &&
              "Sign in with your Nostr key or create one"}
            {mode === LoginMode.CREATE && "Create a new Nostr account"}
            {mode === LoginMode.IMPORT && "Import your existing Nostr key"}
          </p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-800 bg-red-100 rounded-md">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {mode === LoginMode.LOGIN && (
            <div className="space-y-4">
              <button
                onClick={() => setMode(LoginMode.IMPORT)}
                className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Sign in with Nostr Key
              </button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 text-gray-500 bg-white">Or</span>
                </div>
              </div>
              <button
                onClick={() => setMode(LoginMode.CREATE)}
                className="w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Create New Account
              </button>
            </div>
          )}

          {mode === LoginMode.CREATE && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                We'll generate a new Nostr key for you.
              </p>
              <p className="text-sm text-gray-600 font-bold">
                Be sure to save your private key securely!
              </p>

              {hasGeneratedKeys && (
                <div className="p-4 bg-gray-100 rounded-md">
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Keys,{" "}
                      <span className="font-bold">Your Responsibility</span>
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
                          <div className="p-2 bg-white border border-gray-300 rounded text-xs font-mono break-all">
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
                          <div className="p-2 bg-white border border-gray-300 rounded text-xs font-mono break-all">
                            {keys.nsec}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-red-600 font-bold mb-4">
                    WARNING: Never share your private key with anyone! Save it
                    somewhere secure.
                  </p>

                  <p className="text-xs text-red-600 font-bold">
                    WARNING: If you lose/forget/give away your private key the
                    following can happen:
                    <ul className="list-disc list-inside">
                      <li>Lose your account</li>
                      <li>Bad actors gain access to your account</li>
                      <li>Your privacy and anonymity are compromised</li>
                      <li>
                        You can be watched by bad actors without your knowledge
                      </li>
                      <li>
                        You can potentially lose your funds (depends on the
                        wallet you use)
                      </li>
                    </ul>
                  </p>
                </div>
              )}

              {hasGeneratedKeys ? (
                <button
                  onClick={handleCreateAccount}
                  disabled
                  className="w-full px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  Generate!
                </button>
              ) : (
                <button
                  onClick={handleCreateAccount}
                  disabled={loading}
                  className="w-full px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create Account"}
                </button>
              )}
              <button
                onClick={handleOnClickBack}
                className="w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Back
              </button>
            </div>
          )}

          {mode === LoginMode.IMPORT && (
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
                  onChange={(e) => setNsec(e.target.value)}
                  className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="nsec1..."
                />
              </div>
              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
              <button
                onClick={() => setMode(LoginMode.LOGIN)}
                className="w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Back
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
