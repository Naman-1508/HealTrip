import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Stethoscope, AlertCircle, Hospital, ArrowLeft } from "lucide-react";

export default function DiagnosisResult() {
  const navigate = useNavigate();
  const location = useLocation();

  const { formData } = location.state || {};

  // If user directly opens /diagnosis without data
  if (!formData) {
    return (
      <div className="pt-28 px-6 text-center">
        <h2 className="text-2xl font-semibold text-red-600">
          No diagnosis data found.
        </h2>
        <button
          onClick={() => navigate("/medical-form")}
          className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg"
        >
          Go Back to Form
        </button>
      </div>
    );
  }

  // ---- MOCK AI DIAGNOSIS (Replace with backend API later) ---- //
  const mockDiagnosis = {
    possibleConditions: [
      { name: "Viral Fever", probability: "72%" },
      { name: "Dehydration", probability: "55%" },
      { name: "Migraine", probability: "33%" },
    ],
    severity: "Moderate",
    advice: [
      "Stay hydrated and rest well.",
      "Monitor your temperature every 4 hours.",
      "Avoid heavy physical activity.",
      "Visit a doctor if symptoms worsen.",
    ],
  };

  return (
    <div className="pt-28 px-6 pb-20 min-h-screen bg-gray-50 flex justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl bg-white shadow-lg rounded-xl p-8 border"
      >
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Stethoscope size={32} className="text-green-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            AI Diagnosis Result
          </h1>
        </div>

        {/* Patient Info Summary */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold mb-2">Patient Summary</h2>
          <p>
            <strong>Age:</strong> {formData.age}
          </p>
          <p>
            <strong>Gender:</strong> {formData.gender}
          </p>
          <p>
            <strong>Duration:</strong> {formData.duration}
          </p>
          <p>
            <strong>Symptoms:</strong> {formData.symptoms}
          </p>
          <p>
            <strong>Medical History:</strong>{" "}
            {formData.medicalHistory || "None"}
          </p>
        </div>

        {/* Severity Indicator */}
        <div className="flex items-center gap-3 bg-yellow-50 p-4 border border-yellow-200 rounded-lg mb-8">
          <AlertCircle size={28} className="text-yellow-600" />
          <p className="text-lg font-semibold">
            Severity Level:{" "}
            <span className="text-yellow-700">{mockDiagnosis.severity}</span>
          </p>
        </div>

        {/* Possible Conditions */}
        <h2 className="text-2xl font-semibold mb-4">Possible Conditions</h2>
        <ul className="space-y-3 mb-8">
          {mockDiagnosis.possibleConditions.map((cond, index) => (
            <li
              key={index}
              className="flex justify-between bg-gray-50 p-3 rounded-md border"
            >
              <span className="font-medium">{cond.name}</span>
              <span className="text-gray-600">
                {cond.probability} probability
              </span>
            </li>
          ))}
        </ul>

        {/* AI Advice */}
        <h2 className="text-2xl font-semibold mb-4">Recommended Advice</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-8">
          {mockDiagnosis.advice.map((line, idx) => (
            <li key={idx}>{line}</li>
          ))}
        </ul>

        {/* CTA Buttons */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={() => navigate("/hospitals")}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <Hospital size={20} />
            Find Nearby Hospitals
          </button>

          <button
            onClick={() => navigate("/yoga")}
            className="px-6 py-3 border border-gray-700 rounded-lg hover:bg-gray-100 transition"
          >
            Join Wellness Programs
          </button>
        </div>
      </motion.div>
    </div>
  );
}
