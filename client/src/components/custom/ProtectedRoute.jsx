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
    } 
  };

  useEffect(() => {
    if (!user) {
      fetchUser();
    } 
  }, [user]);

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
