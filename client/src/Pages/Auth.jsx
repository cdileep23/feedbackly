import { toast } from "sonner";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { Loader } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "@/utils/url";
import { UserLoggedIn } from "@/store/userSlice";


const Auth = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [currentStage, setCurrentStage] = useState("signup");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleInputChange = (e, name) => {
    setData((data) => ({
      ...data,
      [name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = `${BASE_URL}/admin/${
      currentStage === "signup" ? "sign-up" : "login"
    }`;
    try {
      setLoading(true);
      const payload =
        currentStage === "signup"
          ? data
          : { email: data.email, password: data.password };
      const res = await axios.post(url, payload, { withCredentials: true });
console.log(res)
      if (res.data?.success) {
        toast.success(res.data.message);

        if(currentStage==='login'){
    dispatch(UserLoggedIn(res.data.user));
    navigate("/admin/dashboard");
        }else{
            setCurrentStage('login')
        }
    
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data?.message || "An error occurred");
    } finally {
      setLoading(false);
      if (currentStage === "login") {
        setData({
          ...data,
          password: "",
        });
      }
    }
  };

  const user = useSelector((store) => store.user);
  useEffect(() => {
    if (user) {
      navigate("/admin/dashboard");
    }
  }, [user]);

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left side - Branding */}
      <div className="hidden lg:block bg-gradient-to-br from-primary to-purple-400 relative overflow-hidden">
        <div className="flex flex-col h-full px-10 py-10">
          <h1 className="text-4xl mb-4 text-white font-bold">Feedbackly</h1>

          <div className="max-w-lg mt-20">
            <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
              Collect valuable feedback
              <br />
              without the hassle
            </h1>
            <p className="text-xl text-white/80">
              Create forms in minutes. Get responses instantly.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="col-span-1 flex flex-col justify-center items-center p-8 bg-background min-h-screen">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h4 className="text-3xl text-primary mb-1">Welcome to</h4>
            <h1 className="font-bold text-4xl text-primary">Feedbackly</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {currentStage === "signup" && (
              <div>
                <input
                  onChange={(e) => handleInputChange(e, "name")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  type="text"
                  value={data.name}
                  placeholder="Full Name"
                  required
                />
              </div>
            )}

            <div>
              <input
                onChange={(e) => handleInputChange(e, "email")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                type="email"
                value={data.email}
                placeholder="Email Address"
                required
              />
            </div>

            <div>
              <input
                onChange={(e) => handleInputChange(e, "password")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                type="password"
                value={data.password}
                placeholder="Password"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
            >
              <div className="flex items-center justify-center gap-2">
                {loading && <Loader className="w-5 h-5 animate-spin" />}
                {currentStage === "login" ? "Login" : "Sign Up"}
              </div>
            </button>

            <div className="text-center text-muted-foreground text-sm">or</div>

            <div className="text-center text-sm text-muted-foreground">
              {currentStage === "login"
                ? "Don't have an account?"
                : "Already have an account?"}{" "}
              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  setCurrentStage(currentStage === "login" ? "signup" : "login")
                }
                className="text-primary hover:text-primary/80 font-medium"
              >
                {currentStage === "login" ? "Sign Up" : "Login"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
