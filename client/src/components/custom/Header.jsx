import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { Button } from "../ui/button";
import axios from "axios";
import { BASE_URL } from "@/utils/url";
import { toast } from "sonner";
import { UserLoggedIn, userLoggedOut } from "@/store/userSlice";

const Header = () => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
const verifyAuth = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/admin/profile`, {
      withCredentials: true,
    });
console.log(res)
    if (res.data?.success) {
      dispatch(UserLoggedIn(res.data.user));
    }
  } catch (error) {
    console.log("Auth verification failed", error);
  } finally {
    setLoading(false);
  }
};
  useEffect(() => {
    

    if (!user) {
      verifyAuth();
    } else {
      setLoading(false);
    }
  }, [dispatch, user]);


  useEffect(()=>{
verifyAuth()
  },[])


  const handleLogout = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/admin/logout`, {
        withCredentials: true,
      });

      if (res.data?.success) {
        toast.success(res.data?.message);
        dispatch(userLoggedOut());
      }
    } catch (error) {
      console.log(error);
      toast.error("Logout failed");
    }
  };

 

  return (
    <header className="sticky top-0 z-50 px-6 py-2 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center max-w-7xl mx-auto justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <span className="inline-block font-bold text-xl">Feedbackly</span>
        </Link>

        <nav className="flex items-center space-x-4">
          {user ? (
            <>
              <Link to="/admin/dashboard">
                <Button variant="ghost">My Forms</Button>
              </Link>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button>Sign Up</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
