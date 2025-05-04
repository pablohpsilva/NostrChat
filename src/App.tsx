import { RouterProvider, createBrowserRouter } from "react-router-dom";

import Layout from "./pages/Home/Layout";
import Home from "./pages/Home";
import ChatListPage from "./pages/ChatList";
import PrivateChatPage from "./pages/PrivateChat";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import NDKHeadless from "./components/NDKHeadless";

import { Outlet } from "react-router-dom";
import GuardedRoute from "./components/GuardedRoute";
import PrivateEncryptedChatRoutePage from "./pages/PrivateEncryptedChatRoutePage";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <NDKHeadless />
        <Outlet />
      </>
    ),
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: (
          <Layout>
            <Home />
          </Layout>
        ),
      },
      {
        path: "chat",
        element: (
          <GuardedRoute>
            <ChatListPage />
          </GuardedRoute>
        ),
      },
      {
        path: "chat/:nip/:pubkey",
        element: (
          <GuardedRoute>
            <PrivateEncryptedChatRoutePage />
          </GuardedRoute>
        ),
      },
      {
        path: "login",
        element: <Login />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
