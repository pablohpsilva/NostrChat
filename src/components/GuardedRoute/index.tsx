import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNDKCurrentUser } from "@nostr-dev-kit/ndk-hooks";
import { ROUTES } from "@/consts/routes";

interface GuardedRouteProps {
  children: ReactNode;
}

const GuardedRoute = ({ children }: GuardedRouteProps) => {
  const currentUser = useNDKCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate(ROUTES.LOGIN);
    }
  }, [currentUser, navigate]);

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default GuardedRoute;
