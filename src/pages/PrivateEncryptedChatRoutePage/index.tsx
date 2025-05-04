import { useParams } from "react-router-dom";

import PrivateChat from "@/pages/PrivateChat";
import EncryptedChat from "@/pages/EncryptedChat";
import { NDKKind, NDKUserProfile } from "@nostr-dev-kit/ndk";
import { useEffect, useState } from "react";
import { getNDK } from "@/components/NDKHeadless";

export default function PrivateEncryptedChatRoutePage() {
  const { nip, pubkey } = useParams<{ nip: `NIP${NDKKind}`; pubkey: string }>();
  const isNipEncrypted =
    nip?.toUpperCase() === `NIP${NDKKind.EncryptedDirectMessage}`;
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<NDKUserProfile | null>(null);

  const getUserProfile = async () => {
    try {
      if (!pubkey) {
        throw new Error("No pubkey or npub provided");
      }

      setIsLoading(true);
      const filter = pubkey.startsWith("npub") ? { npub: pubkey } : { pubkey };
      const user = getNDK().getInstance().getUser(filter);
      const _userProfile = await user.fetchProfile();
      const { npub, pubkey: _pubkey } = user;

      setUserProfile(
        _userProfile
          ? { ..._userProfile, ...{ npub, pubkey: _pubkey } }
          : { npub, pubkey: _pubkey }
      );
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getUserProfile();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!userProfile) {
    return <div>User profile not found</div>;
  }

  if (isNipEncrypted) {
    return <EncryptedChat userProfile={userProfile} />;
  }

  return <PrivateChat userProfile={userProfile} />;
}
