import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import AuthImagePattern from "../components/AuthImagePattern";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const VerifyEmailPage = () => {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOTP, resendOTP } = useAuthStore();

  useEffect(() => {
    // Get email from location state or localStorage
    const storedEmail = localStorage.getItem("verificationEmail");
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      // If no email found, redirect to signup
      toast.error("Please sign up first");
      navigate("/signup");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate OTP format
    if (!/^\d{6}$/.test(otp)) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setIsVerifying(true);
    try {
      await verifyOTP({ email, otp: otp.trim() });
      localStorage.removeItem("verificationEmail");
      toast.success("Email verified successfully!");
      navigate("/");
    } catch (error) {
      const errorMessage = error.response?.data?.message;
      if (errorMessage === "OTP not found or expired") {
        toast.error("Your OTP has expired. Please request a new one.");
      } else if (errorMessage === "Invalid OTP") {
        toast.error("Invalid OTP. Please check and try again.");
      } else {
        toast.error(errorMessage || "Verification failed. Please try again.");
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    try {
      await resendOTP({ email });
      toast.success("OTP resent successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend OTP");
    } finally {
      setIsResending(false);
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
          {/* Logo */}
          <div className="flex flex-col items-center gap-3 group mt-2">
            <img src="/chat%20logo.png" alt="Infinity Logo" className="w-14 h-14 object-contain mb-2" />
            <h1 className="text-3xl font-extrabold tracking-tight text-center">Verify Your Email</h1>
            <p className="text-base-content/70 text-base text-center">
              Enter the OTP sent to {email}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-7 w-full flex flex-col items-center justify-center">
            <div className="w-full">
              <label htmlFor="otp" className="block text-sm font-medium text-base-content">
                OTP Code
              </label>
              <div className="mt-1">
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="input input-bordered w-full"
                  placeholder="Enter 6-digit OTP"
                />
              </div>
            </div>

            <div className="w-full">
              <button
                type="submit"
                disabled={isVerifying}
                className="btn btn-primary w-full"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Email"
                )}
              </button>
            </div>

            <div className="text-center w-full">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={isResending}
                className="text-sm text-primary hover:text-primary/80"
              >
                {isResending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                    Resending...
                  </>
                ) : (
                  "Didn't receive the code? Resend"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;