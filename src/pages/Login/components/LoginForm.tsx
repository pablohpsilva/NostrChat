import React from "react";
import { LoginMode } from "../types";

interface LoginFormProps {
  setMode: (mode: LoginMode) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ setMode }) => {
  return (
    <div className="space-y-4">
      <button
        onClick={() => setMode(LoginMode.IMPORT)}
        className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Sign via Nostr Key
      </button>

      <button
        onClick={() => setMode(LoginMode.IMPORT_ADVANCED)}
        className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Sign via Seed Words
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

      <button
        onClick={() => setMode(LoginMode.CREATE_ADVANCED)}
        className="w-full px-4 py-2 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-xs"
      >
        or Create New Advanced Account
      </button>
    </div>
  );
};
