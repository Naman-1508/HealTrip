import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, CreditCard, QrCode, Smartphone, ShieldCheck, ArrowLeft } from "lucide-react";
import BackgroundSwitcher from "../components/BackgroundSwitcher";
import { useAuth } from "@clerk/clerk-react";
import axios from 'axios';
import toast from "react-hot-toast";

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { packageData } = location.state || {};
  const [method, setMethod] = useState("upi");
  const [paid, setPaid] = useState(false);
  
  // Get total amount from package data or use default
  const totalAmount = packageData?.packageDetails?.totalAmount || 999;

  const handlePayment = async () => {
    try {
      if (!packageData) { 
        // Allow mock view without data
        setPaid(true); 
        return; 
      }
      
      const token = await getToken();
      await axios.post('http://localhost:5000/api/payment/book-package', 
        { 
          packageData,
          paymentMethod: method 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setPaid(true);
      toast.success("Booking Confirmed!");
    } catch (err) {
      console.error("Booking Error", err);
      toast.error("Failed to confirm booking");
    }
  };

  if (paid) {
    return (
      <div className="relative min-h-screen bg-zinc-950 text-white flex items-center justify-center px-6">
        <div className="absolute inset-0 z-0">
          <BackgroundSwitcher />
        </div>
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative z-10 bg-zinc-900/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-10 max-w-lg text-center"
        >
          <CheckCircle className="w-20 h-20 text-emerald-500 mx-auto" />
          <h1 className="text-3xl font-bold mt-5">Payment Successful!</h1>
          <p className="text-zinc-400 mt-3">
            Your booking has been confirmed.  
            You will receive an email with the details shortly.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-6 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-semibold transition"
          >
            Go to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-zinc-950 text-white">
      <div className="absolute inset-0 z-0">
        <BackgroundSwitcher />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Package
        </button>
        
        <h1 className="text-4xl font-bold">Complete Your Payment</h1>
        <p className="text-zinc-400 mt-2">
          Select your payment method and finish booking securely.
        </p>
        
        {/* Package Summary */}
        {packageData && (
          <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mt-6">
            <h3 className="text-xl font-semibold mb-4">Package Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-400">Hospital:</span>
                <span className="font-medium">{packageData.hospital.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Hotel:</span>
                <span className="font-medium">{packageData.hotel.name} ({packageData.packageDetails.duration} nights)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Flight:</span>
                <span className="font-medium">{packageData.flight.airline} ({packageData.packageDetails.travelers} travelers × 2)</span>
              </div>
              <div className="border-t border-white/10 pt-3 mt-3">
                <div className="flex justify-between text-zinc-400">
                  <span>Hospital Cost:</span>
                  <span>₹{packageData.breakdown.hospitalCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Hotel Cost:</span>
                  <span>₹{packageData.breakdown.hotelCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Flight Cost:</span>
                  <span>₹{packageData.breakdown.flightCost.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex justify-between font-bold text-xl border-t border-white/10 pt-3 mt-3">
                <span>Total Amount:</span>
                <span className="text-emerald-400">₹{totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">

          {/* LEFT → PAYMENT METHODS */}
          <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">Payment Method</h2>

            <div className="space-y-3">
              {/* UPI */}
              <div
                onClick={() => setMethod("upi")}
                className={`p-4 rounded-xl border cursor-pointer flex items-center gap-4 transition ${
                  method === "upi" ? "border-emerald-500 bg-emerald-500/10" : "border-white/10 hover:border-white/20"
                }`}
              >
                <Smartphone className="w-6 h-6 text-emerald-400" />
                <span className="text-lg font-medium">UPI (Instant)</span>
              </div>

              {/* CARD */}
              <div
                onClick={() => setMethod("card")}
                className={`p-4 rounded-xl border cursor-pointer flex items-center gap-4 transition ${
                  method === "card" ? "border-emerald-500 bg-emerald-500/10" : "border-white/10 hover:border-white/20"
                }`}
              >
                <CreditCard className="w-6 h-6 text-emerald-400" />
                <span className="text-lg font-medium">Debit / Credit Card</span>
              </div>

              {/* QR */}
              <div
                onClick={() => setMethod("qr")}
                className={`p-4 rounded-xl border cursor-pointer flex items-center gap-4 transition ${
                  method === "qr" ? "border-emerald-500 bg-emerald-500/10" : "border-white/10 hover:border-white/20"
                }`}
              >
                <QrCode className="w-6 h-6 text-emerald-400" />
                <span className="text-lg font-medium">Scan & Pay (QR)</span>
              </div>
            </div>
          </div>

          {/* CENTER → PAYMENT INPUT FORM */}
          <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold mb-6">Payment Details</h2>

            {/* UPI PAYMENT UI */}
            {method === "upi" && (
              <div>
                <p className="text-zinc-400 mb-2">Enter UPI ID:</p>
                <input
                  type="text"
                  placeholder="example@upi"
                  className="w-full px-4 py-3 bg-zinc-800 border border-white/10 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition"
                />
                <button
                  onClick={handlePayment}
                  className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white w-full py-3 rounded-lg font-semibold transition"
                >
                  Pay ₹{totalAmount.toLocaleString()}
                </button>
              </div>
            )}

            {/* CARD PAYMENT UI */}
            {method === "card" && (
              <div className="space-y-5">
                <div>
                  <p className="text-zinc-400 mb-2">Card Number</p>
                  <input
                    type="text"
                    maxLength={16}
                    placeholder="1234 5678 9123 0000"
                    className="w-full px-4 py-3 bg-zinc-800 border border-white/10 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div className="flex gap-4">
                  <div className="w-1/2">
                    <p className="text-zinc-400 mb-2">Expiry</p>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full px-4 py-3 bg-zinc-800 border border-white/10 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>

                  <div className="w-1/2">
                    <p className="text-zinc-400 mb-2">CVV</p>
                    <input
                      type="password"
                      maxLength={3}
                      placeholder="***"
                      className="w-full px-4 py-3 bg-zinc-800 border border-white/10 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white w-full py-3 rounded-lg font-semibold transition"
                >
                  Pay ₹{totalAmount.toLocaleString()}
                </button>
              </div>
            )}

            {/* QR PAYMENT UI */}
            {method === "qr" && (
              <div className="text-center">
                <p className="text-zinc-400 mb-3">Scan to Pay</p>
                <div className="bg-white p-4 rounded-xl inline-block">
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=UPI_PAYMENT"
                    alt="QR Code"
                    className="rounded-lg"
                  />
                </div>

                <button
                  onClick={handlePayment}
                  className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white w-full py-3 rounded-lg font-semibold transition"
                >
                  I've Paid
                </button>
              </div>
            )}
          </div>
        </div>

        {/* SECURITY FOOTER */}
        <div className="flex items-center gap-3 mt-10 justify-center text-zinc-400">
          <ShieldCheck className="text-emerald-500" />
          100% Secure Payments • Encrypted & Verified
        </div>
      </div>
    </div>
  );
}
