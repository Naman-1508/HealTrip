import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, CreditCard, QrCode, Smartphone, ShieldCheck } from "lucide-react";

export default function Payment() {
  const [method, setMethod] = useState("upi");
  const [paid, setPaid] = useState(false);

  const handlePayment = () => {
    setTimeout(() => {
      setPaid(true);
    }, 1500);
  };

  if (paid) {
    return (
      <div className="pt-28 px-6 pb-20 flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white shadow-xl rounded-xl p-10 max-w-lg text-center border"
        >
          <CheckCircle className="w-20 h-20 text-green-600 mx-auto" />
          <h1 className="text-3xl font-bold mt-5">Payment Successful!</h1>
          <p className="text-gray-600 mt-3">
            Your booking has been confirmed.  
            You will receive an email with the details shortly.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-28 px-6 pb-20 min-h-screen bg-gray-50">
      <h1 className="text-4xl font-bold">Complete Your Payment</h1>
      <p className="text-gray-600 mt-2">
        Select your payment method and finish booking securely.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-12">

        {/* LEFT → PAYMENT METHODS */}
        <div className="bg-white border rounded-xl shadow-md p-8">
          <h2 className="text-xl font-semibold mb-4">Choose Payment Method</h2>

          <div className="space-y-4">
            {/* UPI */}
            <div
              onClick={() => setMethod("upi")}
              className={`p-4 rounded-lg border cursor-pointer flex items-center gap-4 ${
                method === "upi" ? "border-green-600 bg-green-50" : ""
              }`}
            >
              <Smartphone className="w-6 h-6 text-green-600" />
              <span className="text-lg font-medium">UPI (Instant)</span>
            </div>

            {/* CARD */}
            <div
              onClick={() => setMethod("card")}
              className={`p-4 rounded-lg border cursor-pointer flex items-center gap-4 ${
                method === "card" ? "border-green-600 bg-green-50" : ""
              }`}
            >
              <CreditCard className="w-6 h-6 text-green-600" />
              <span className="text-lg font-medium">Debit / Credit Card</span>
            </div>

            {/* QR */}
            <div
              onClick={() => setMethod("qr")}
              className={`p-4 rounded-lg border cursor-pointer flex items-center gap-4 ${
                method === "qr" ? "border-green-600 bg-green-50" : ""
              }`}
            >
              <QrCode className="w-6 h-6 text-green-600" />
              <span className="text-lg font-medium">Scan & Pay (QR Code)</span>
            </div>
          </div>
        </div>

        {/* CENTER → PAYMENT INPUT FORM */}
        <div className="bg-white border rounded-xl shadow-md p-8 lg:col-span-2">
          <h2 className="text-xl font-semibold mb-6">Payment Details</h2>

          {/* UPI PAYMENT UI */}
          {method === "upi" && (
            <div>
              <p className="text-gray-600 mb-2">Enter UPI ID:</p>
              <input
                type="text"
                placeholder="example@upi"
                className="w-full px-4 py-3 border rounded-lg"
              />
              <button
                onClick={handlePayment}
                className="mt-6 bg-green-600 text-white w-full py-3 rounded-lg hover:bg-green-700 transition"
              >
                Pay ₹999
              </button>
            </div>
          )}

          {/* CARD PAYMENT UI */}
          {method === "card" && (
            <div className="space-y-5">
              <div>
                <p className="text-gray-600 mb-2">Card Number</p>
                <input
                  type="text"
                  maxLength={16}
                  placeholder="1234 5678 9123 0000"
                  className="w-full px-4 py-3 border rounded-lg"
                />
              </div>

              <div className="flex gap-4">
                <div className="w-1/2">
                  <p className="text-gray-600 mb-2">Expiry</p>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full px-4 py-3 border rounded-lg"
                  />
                </div>

                <div className="w-1/2">
                  <p className="text-gray-600 mb-2">CVV</p>
                  <input
                    type="password"
                    maxLength={3}
                    placeholder="***"
                    className="w-full px-4 py-3 border rounded-lg"
                  />
                </div>
              </div>

              <button
                onClick={handlePayment}
                className="mt-6 bg-green-600 text-white w-full py-3 rounded-lg hover:bg-green-700 transition"
              >
                Pay ₹999
              </button>
            </div>
          )}

          {/* QR PAYMENT UI */}
          {method === "qr" && (
            <div className="text-center">
              <p className="text-gray-600 mb-3">Scan to Pay</p>
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=UPI_PAYMENT"
                alt="QR Code"
                className="mx-auto border rounded-lg"
              />

              <button
                onClick={handlePayment}
                className="mt-6 bg-green-600 text-white w-full py-3 rounded-lg hover:bg-green-700 transition"
              >
                I've Paid
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SECURITY FOOTER */}
      <div className="flex items-center gap-3 mt-10 justify-center text-gray-600">
        <ShieldCheck className="text-green-600" />
        100% Secure Payments • Encrypted & Verified
      </div>
    </div>
  );
}
