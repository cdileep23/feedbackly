import React from "react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import Home from "./Pages/Home";

import AdminDashboard from "./Pages/AdminDashboard";
import Auth from "./Pages/Auth";
import { Provider } from "react-redux";
import appStore from "./store/store";
import { Toaster } from "./components/ui/sonner";
import ProtectedRoute from "./components/custom/ProtectedRoute";
import AdminEachForm from "./Pages/AdminEachForm";
import FormForUser from "./Pages/FormForUser";


const App = () => {
  const appRouter = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/auth",
      element: <Auth />,
    },
    {
path:"/form/:formId",
element:<FormForUser/>

    },
    {
      path: "/admin",
      element: (
        <ProtectedRoute/>
       
      ),
      children: [
        {
          index: true, 
          element: <Navigate to="dashboard" replace />,
        },
        {
          path: "dashboard",
          element: <AdminDashboard />,
        },
        {
          path:'form/:formId',
          element:<AdminEachForm/>
        }
      ],
    },
  ]);

  return (
    <main>
      <Toaster/>
      <Provider store={appStore}>
        <RouterProvider router={appRouter} />
      </Provider>
    </main>
  );
};

export default App;
