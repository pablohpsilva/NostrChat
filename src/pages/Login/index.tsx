import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNDKSessionLogin } from "@nostr-dev-kit/ndk-hooks";
import { NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";

import { APP_NAME } from "@/consts";
import { saveSigner } from "@/libs/signer-persistence";
import { ROUTES } from "@/consts/routes";
import { LoginMode } from "./types";
import { LoginForm } from "./components/LoginForm";
import { CreateAccountForm } from "./components/CreateAccountForm";
import { ImportKeyForm } from "./components/ImportKeyForm";
import { CreateAdvancedAccountForm } from "./components/CreateAdvancedAccountForm";
import { KeysV2 } from "@/types";
import { ImportKeyAdvancedForm } from "./components/ImportKeyAdvancedForm";
import { getKeys } from "@/libs/local-storage";

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<LoginMode>(LoginMode.LOGIN);
  const login = useNDKSessionLogin();

  const handleLogin = async (keys: KeysV2) => {
    console.log("handleLogin", keys);
    const signer = new NDKPrivateKeySigner(keys.nsec);

    await saveSigner(keys);

    await login(signer);
    // Redirect to the app after successful login
    navigate(ROUTES.CHAT);
  };

  const handleCreateAccount = async (keys: KeysV2) => {
    await saveSigner(keys);

    const signer = new NDKPrivateKeySigner(keys.nsec);
    await login(signer);

    // Redirect to the app after successful login
    navigate(ROUTES.CHAT);
  };

  const handleOnClickBack = () => {
    setMode(LoginMode.LOGIN);
  };

  const renderFormBasedOnMode = () => {
    switch (mode) {
      case LoginMode.LOGIN:
        return <LoginForm setMode={setMode} />;
      case LoginMode.CREATE:
        return (
          <CreateAccountForm
            onCreateAccount={handleCreateAccount}
            onClickBack={handleOnClickBack}
          />
        );
      case LoginMode.CREATE_ADVANCED:
        return (
          <CreateAdvancedAccountForm
            onCreateAccount={handleCreateAccount}
            onClickBack={handleOnClickBack}
          />
        );
      case LoginMode.IMPORT:
        return (
          <ImportKeyForm
            handleLogin={handleLogin}
            onClickBack={handleOnClickBack}
          />
        );
      case LoginMode.IMPORT_ADVANCED:
        return (
          <ImportKeyAdvancedForm
            handleLogin={handleLogin}
            onClickBack={handleOnClickBack}
          />
        );
      default:
        return <LoginForm setMode={setMode} />;
    }
  };

  useEffect(() => {
    (async () => {
      const keys = await getKeys();
      if (keys) {
        const signer = new NDKPrivateKeySigner(keys.nsec);
        await login(signer);
        // Redirect to the app after successful login
        navigate(ROUTES.CHAT);
      }
    })();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] p-4">
      <div className="flex flex-col w-full max-w-md p-8 bg-white rounded-lg shadow-md gap-4">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">{APP_NAME}</h1>
          <p className="mt-2 text-sm text-gray-600">
            {mode === LoginMode.LOGIN &&
              "Sign in with your Nostr key or create one"}
            {mode === LoginMode.CREATE && "Create a new Nostr account"}
            {mode === LoginMode.CREATE_ADVANCED &&
              "Create a new Nostr account with advanced options"}
            {mode === LoginMode.IMPORT && "Import your existing Nostr key"}
          </p>
        </div>

        <div className="space-y-6">{renderFormBasedOnMode()}</div>
      </div>
    </div>
  );
}
