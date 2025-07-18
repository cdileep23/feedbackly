import { UserLoggedIn } from "@/store/userSlice";
import { BASE_URL } from "@/utils/url";
import axios from "axios";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { Loader2 } from "lucide-react";


const ProtectedRoute = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((store) => store.user);
  const isAuthRoute = location.pathname.startsWith("/auth");

  const [loading, setLoading] = useState(true); 

  const fetchUser = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/admin/profile`, {
        withCredentials: true, 
      });

      if (res.data?.success) {
        dispatch(UserLoggedIn(res.data.user));
        if (isAuthRoute) navigate("/admin/dashboard");
      }
    } catch (error) {
      if (!isAuthRoute) navigate("/auth");
      console.log(error)
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [user]);
if (loading) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
       
      </div>
    </div>
  );
}
  return (
    <div>
      <Header />
      <div className="min-h-[90vh] max-w-7xl mx-6 py-8 lg:mx-auto">
        <Outlet />
      </div>

      <Footer />
    </div>
  );
};

export default ProtectedRoute;
