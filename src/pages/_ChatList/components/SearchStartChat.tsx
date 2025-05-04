import { getNDK } from "@/components/NDKHeadless";
import { fillRoute, ROUTES } from "@/consts/routes";
import { NDKUserProfile } from "@nostr-dev-kit/ndk";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const ndk = getNDK().getInstance();

const formatPubkey = (pubkey: string) => {
  return `${pubkey.substring(0, 8)}...${pubkey.substring(pubkey.length - 8)}`;
};

export default function SearchStartChat({ npub }: { npub: string }) {
  const [userProfiles, setUserProfiles] = useState<NDKUserProfile>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const user = ndk.getUser({ npub });
      const userProfile = await user.fetchProfile();
      if (userProfile) {
        setUserProfiles(userProfile);
      }
    } catch (error) {
      setError(error as string);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [npub]);

  return (
    <>
      <div className="border border-gray-200 rounded-lg p-4 mb-4 flex flex-row items-center justify-between gap-4">
        <div className="flex flex-row gap-4">
          <div className="flex items-center justify-center">
            <img
              src={
                userProfiles?.picture ||
                "https://placehold.co/40x40?text=NostrChat"
              }
              alt={userProfiles?.displayName || userProfiles?.name || "User"}
              className="w-10 h-10 rounded-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://placehold.co/40x40?text=NostrChat";
              }}
            />
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-sm text-black/80 font-medium">
              Text this user:
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-black font-bold">
                {userProfiles?.displayName ||
                  userProfiles?.name ||
                  "UnknownUser"}
              </span>
              <div className="text-xs text-gray-500">{formatPubkey(npub)}</div>
            </div>
          </div>
        </div>
        <div>
          <Link to={fillRoute(ROUTES.CHAT_ID, { id: npub })}>
            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
              Chat
            </button>
          </Link>
        </div>
      </div>
      {isLoading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
    </>
  );
}
