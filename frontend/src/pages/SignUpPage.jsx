import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
  Phone,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    number: "",
    password: "",
  });

  const { signup, isSigningUp } = useAuthStore();
  const navigate = useNavigate();

  const validateForm = () => {
    if (!formData.fullName.trim()) return toast.error("Full name is required");
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format");
    if (!formData.number.trim()) return toast.error("Phone number is required");
    if (!/^\d{10}$/.test(formData.number)) return toast.error("Phone number must be exactly 10 digits");
    if (!formData.password) return toast.error("Password is required");
    if (formData.password.length < 6) return toast.error("Password must be at least 6 characters");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = validateForm();
    if (success === true) {
      try {
        await signup(formData);
        navigate("/verify-email");
      } catch (error) {
        console.error("Signup failed:", error);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-base-100 items-center justify-center relative overflow-hidden">
      {/* Animated Background Shapes */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Floating Circles */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-purple-400 rounded-full opacity-30 animate-float-slow"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-pink-400 rounded-full opacity-20 animate-float-fast"></div>
        <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-blue-400 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-10 left-1/4 w-20 h-20 bg-indigo-300 rounded-full opacity-20 animate-float-medium"></div>

        {/* Rotating Square */}
        <div className="absolute top-24 right-1/4 w-16 h-16 bg-yellow-300 opacity-20 animate-rotate-slow rounded-sm"></div>

        {/* Triangle */}
        <div
          className="absolute top-1/3 right-10 w-0 h-0 opacity-20"
          style={{
            borderLeft: '20px solid transparent',
            borderRight: '20px solid transparent',
            borderBottom: '35px solid #34d399',
            animation: 'float-medium 6s ease-in-out infinite',
          }}
        ></div>

        {/* Blob */}
        <div
          className="absolute bottom-16 left-8 w-48 h-48 bg-rose-300 opacity-30 animate-blob-move"
          style={{
            clipPath:
              'polygon(43% 0%, 66% 14%, 86% 39%, 74% 65%, 48% 89%, 25% 87%, 4% 66%, 7% 35%, 22% 14%)',
          }}
        ></div>

        {/* Ellipse */}
        <div className="absolute top-1/4 left-1/2 w-40 h-24 bg-cyan-300 rounded-full opacity-20 animate-float-slow"></div>
      </div>

      {/* Main Form Container */}
      <div className="z-10 flex-1 flex items-center justify-center p-6">
        <div className="w-full lg:w-[70vw] max-w-3xl bg-base-100/90 dark:bg-base-200/90 rounded-3xl shadow-2xl p-10 space-y-10 border border-base-300 text-base-content transition-all duration-300 flex flex-col items-center justify-center">
          {/* LOGO */}
          <div className="flex flex-col items-center gap-3 group mt-2">
            <img src="/chat%20logo.png" alt="Infinity Logo" className="w-14 h-14 object-contain mb-2" />
            <h1 className="text-3xl font-extrabold tracking-tight text-center">Welcome to Infinity</h1>
            <p className="text-base-content/70 text-base text-center">Create your free account and start connecting instantly</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-7 w-full flex flex-col items-center justify-center">
            {/* Full Name */}
            <div className="form-control w-full">
              <label className="label"><span className="label-text font-medium">Full Name</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="size-5 text-base-content/40" />
                </div>
                <input
                  type="text"
                  className="input input-bordered w-full pl-10"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
            </div>

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

            {/* Phone Number */}
            <div className="form-control w-full">
              <label className="label"><span className="label-text font-medium">Phone Number</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="size-5 text-base-content/40" />
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={10}
                  className="input input-bordered w-full pl-10"
                  placeholder="1234567890"
                  value={formData.number}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      number: e.target.value.replace(/\D/g, ""),
                    })
                  }
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
            <button type="submit" className="btn btn-primary w-full" disabled={isSigningUp}>
              {isSigningUp ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Loading...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Redirect to login */}
          <div className="text-center pt-2">
            <p className="text-base-content/60">
              Already have an account?{" "}
              <Link to="/login" className="link link-primary font-semibold">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
