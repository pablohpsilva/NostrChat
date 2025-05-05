import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/consts/routes";
import { getNDK } from "../NDKHeadless";

interface GuardedRouteProps {
  children: ReactNode;
}

let interval: number;

const GuardedRoute = ({ children }: GuardedRouteProps) => {
  const navigate = useNavigate();
  const maxRetries = 3;
  const [retry, setRetry] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    interval = window.setInterval(() => {
      const activeUser = getNDK().getInstance().activeUser;
      if (retry !== maxRetries) {
        setRetry((prev) => prev + 1);
      }

      if (activeUser) {
        window.clearInterval(interval);
        setIsLoading(false);
      }

      if (retry === maxRetries) {
        setIsLoading(false);
        window.clearInterval(interval);
        navigate(ROUTES.LOGIN);
      }
    }, 1000);

    return () => {
      setIsLoading(false);
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
