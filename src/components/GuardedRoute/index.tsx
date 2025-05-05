import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/consts/routes";
import { getNDK } from "../NDKHeadless";

interface GuardedRouteProps {
  children: ReactNode;
}

let interval: number;
let retry: number = 0;

const GuardedRoute = ({ children }: GuardedRouteProps) => {
  const navigate = useNavigate();
  const maxRetries = 3;
  const [isLoading, setIsLoading] = useState(false);

  const checkActiveUser = () => {
    const activeUser = getNDK().getInstance().activeUser;
    if (retry !== maxRetries) {
      retry++;
    }

    if (activeUser) {
      window.clearInterval(interval);
      setIsLoading(false);
      retry = 0;
      return;
    }

    if (retry >= maxRetries) {
      setIsLoading(false);
      window.clearInterval(interval);
      navigate(ROUTES.LOGIN);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    if (interval) {
      window.clearInterval(interval);
    }

    interval = window.setInterval(checkActiveUser, 1000);
    return () => {
      window.clearInterval(interval);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default GuardedRoute;
