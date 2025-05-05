import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Outlet } from "react-router-dom";

import NDKHeadless from "./components/NDKHeadless";
import GuardedRoute from "./components/GuardedRoute";

// Lazy load components
const Layout = lazy(() => import("./pages/Home/Layout"));
const Home = lazy(() => import("./pages/Home"));
const ChatListPage = lazy(() => import("./pages/ChatList"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Login = lazy(() => import("./pages/Login"));
const PrivateEncryptedChatRoutePage = lazy(
  () => import("./pages/PrivateEncryptedChatRoutePage")
);

// Loading component
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">Loading...</div>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <NDKHeadless />
        <Suspense fallback={<LoadingFallback />}>
          <Outlet />
        </Suspense>
      </>
    ),
    errorElement: (
      <Suspense fallback={<LoadingFallback />}>
        <NotFound />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Layout>
              <Home />
            </Layout>
          </Suspense>
        ),
      },
      {
        path: "chat",
        element: (
          <GuardedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <ChatListPage />
            </Suspense>
          </GuardedRoute>
        ),
      },
      {
        path: "chat/:nip/:pubkey",
        element: (
          <GuardedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <PrivateEncryptedChatRoutePage />
            </Suspense>
          </GuardedRoute>
        ),
      },
      {
        path: "login",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Login />
          </Suspense>
        ),
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
