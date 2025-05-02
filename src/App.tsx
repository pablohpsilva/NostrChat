import { RouterProvider, createBrowserRouter } from "react-router-dom";

import Layout from "./pages/Home/Layout";
import Home from "./pages/Home";
import ChatPage from "./pages/Chat";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import NDKHeadless from "./components/NDKHeadless";

import { Outlet } from "react-router-dom";
import GuardedRoute from "./components/GuardedRoute";

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
            <ChatPage />
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
