import { useState, useEffect, useRef } from "react";
import { useSignUp, useUser } from "@clerk/clerk-react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import SpotlightCard from "../components/SpotlightCard";
import BackgroundSwitcher from "../components/BackgroundSwitcher";
import Button from "../components/Button";
import toast from "react-hot-toast";

export default function VerifyEmail() {
  const { signUp, setActive } = useSignUp();
  const { isSignedIn, isLoaded } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef([]);

  const email = location.state?.email || "";

  // Redirect if already signed in
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      navigate("/");
    }
  }, [isLoaded, isSignedIn, navigate]);

  // Redirect if no email provided
  useEffect(() => {
    if (!email && isLoaded) {
      toast.error("No email found. Please sign up again.");
      navigate("/signup");
    }
  }, [email, isLoaded, navigate]);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newCode = [...code];
    newCode[index] = value.slice(-1); // Only take last character
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newCode = [...code];
    pastedData.split("").forEach((char, i) => {
      if (i < 6) newCode[i] = char;
    });
    setCode(newCode);

    // Focus last filled input or next empty
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleVerify = async (e) => {
    e.preventDefault();

    const otpCode = code.join("");
    if (otpCode.length !== 6) {
      toast.error("Please enter the complete 6-digit code");
      return;
    }

    setLoading(true);

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: otpCode,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        toast.success("Email verified! Welcome to HealTrip!");
        navigate("/");
      } else {
        toast.error("Verification incomplete. Please try again.");
      }
    } catch (err) {
      console.error("Verification error:", err);
      toast.error(err.errors?.[0]?.message || "Invalid or expired code");
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      toast.success("New code sent to your email!");
      setResendCooldown(60);
    } catch (err) {
      console.error("Resend error:", err);
      toast.error("Failed to resend code. Please try again.");
    }
  };

  return (
    <div className="relative min-h-screen bg-zinc-950 flex justify-center items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <BackgroundSwitcher />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md p-1"
      >
        <SpotlightCard className="p-8 backdrop-blur-md bg-black/40 border border-white/10 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📧</span>
            </div>
            <h1 className="text-4xl font-heading font-bold text-white mb-2 tracking-tight">
              Verify Your Email
            </h1>
            <p className="text-zinc-400 text-sm">
              We sent a 6-digit code to
            </p>
            <p className="text-white font-medium mt-1">{email}</p>
          </div>

          <form onSubmit={handleVerify} className="space-y-6">
            {/* OTP Input */}
            <div className="flex justify-center gap-2" onPaste={handlePaste}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 bg-zinc-900/50 border border-zinc-700 rounded-lg text-white text-center text-2xl font-bold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  disabled={loading}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            {/* Verify Button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full py-4 bg-white text-black hover:bg-zinc-200"
              disabled={loading || code.join("").length !== 6}
            >
              {loading ? "Verifying..." : "Verify Email"}
            </Button>

            {/* Resend Code */}
            <div className="text-center">
              <p className="text-zinc-500 text-sm mb-2">Didn't receive the code?</p>
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0}
                className={`text-sm font-medium transition-colors ${
                  resendCooldown > 0
                    ? "text-zinc-600 cursor-not-allowed"
                    : "text-blue-500 hover:text-blue-400"
                }`}
              >
                {resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : "Resend Code"}
              </button>
            </div>
          </form>

          {/* Back to Signup */}
          <div className="mt-8 text-center">
            <button
              onClick={() => navigate("/signup")}
              className="text-xs text-zinc-500 hover:text-white transition-colors"
            >
              ← Back to Sign Up
            </button>
          </div>
        </SpotlightCard>
      </motion.div>
    </div>
  );
}
