import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { login, isLoggingIn } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!formData.password) return toast.error("Password is required");
    try {
      await login(formData);
      navigate("/");
    } catch (error) {
      // Error is already handled by the login function
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center relative overflow-hidden bg-base-100">
      {/* Animated Background Shapes */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-purple-400 rounded-full opacity-30 animate-float-slow"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-pink-400 rounded-full opacity-20 animate-float-fast"></div>
        <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-blue-400 rounded-full opacity-20 animate-pulse-slow"></div>
        <div className="absolute bottom-10 left-1/4 w-20 h-20 bg-indigo-300 rounded-full opacity-20 animate-float-medium"></div>
        <div className="absolute top-24 right-1/4 w-16 h-16 bg-yellow-300 opacity-20 animate-rotate-slow rounded-sm"></div>
        <div
          className="absolute top-1/3 right-10 w-0 h-0 opacity-20"
          style={{
            borderLeft: '20px solid transparent',
            borderRight: '20px solid transparent',
            borderBottom: '35px solid #34d399',
            animation: 'float-medium 6s ease-in-out infinite',
          }}
        ></div>
        <div
          className="absolute bottom-16 left-8 w-48 h-48 bg-rose-300 opacity-30 animate-blob-move"
          style={{
            clipPath:
              'polygon(43% 0%, 66% 14%, 86% 39%, 74% 65%, 48% 89%, 25% 87%, 4% 66%, 7% 35%, 22% 14%)',
          }}
        ></div>
        <div className="absolute top-1/4 left-1/2 w-40 h-24 bg-cyan-300 rounded-full opacity-20 animate-float-slow"></div>
      </div>

      {/* Main Form Container */}
      <div className="z-10 flex-1 flex items-center justify-center p-6">
        <div className="w-full lg:w-[70vw] max-w-3xl bg-base-100/90 dark:bg-base-200/90 rounded-3xl shadow-2xl p-10 space-y-10 border border-base-300 text-base-content transition-all duration-300 flex flex-col items-center justify-center">
          {/* LOGO */}
          <div className="flex flex-col items-center gap-3 group mt-2">
            <img src="/chat%20logo.png" alt="Infinity Logo" className="w-14 h-14 object-contain mb-2" />
            <h1 className="text-3xl font-extrabold tracking-tight text-center">Welcome Back</h1>
            <p className="text-base-content/70 text-base text-center">Sign in to your Infinity account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-7 w-full flex flex-col items-center justify-center">
            {/* Email */}
            <div className="form-control w-full">
              <label className="label"><span className="label-text font-medium">Email</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="size-5 text-base-content/40" />
                </div>
                <input
                  type="email"
                  className="input input-bordered w-full pl-10"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-control w-full">
              <label className="label"><span className="label-text font-medium">Password</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="size-5 text-base-content/40" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="input input-bordered w-full pl-10"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="size-5 text-base-content/40" />
                  ) : (
                    <Eye className="size-5 text-base-content/40" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button type="submit" className="btn btn-primary w-full" disabled={isLoggingIn}>
              {isLoggingIn ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Loading...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Redirect to signup */}
          <div className="text-center pt-2">
            <p className="text-base-content/60">
              Don't have an account?{" "}
              <Link to="/signup" className="link link-primary font-semibold">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
