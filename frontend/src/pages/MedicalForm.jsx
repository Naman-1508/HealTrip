import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function MedicalForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    symptoms: "",
    duration: "",
    medicalHistory: "",
  });

  // Handle input updates
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Form Data: ", formData);

    // Navigate to diagnosis result
    navigate("/diagnosis", { state: { formData } });
  };

  return (
    <div className="pt-28 px-6 pb-20 min-h-screen bg-gray-50 flex justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white shadow-lg rounded-xl p-8 border"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Medical Information Form
        </h1>

        <p className="text-gray-600 mb-6">
          Please provide your basic health details. This helps our AI provide
          more accurate diagnosis suggestions.
        </p>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Age */}
          <div>
            <label className="block mb-1 font-medium">Age</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block mb-1 font-medium">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg bg-white"
              required
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Symptoms */}
          <div>
            <label className="block mb-1 font-medium">
              Describe Your Symptoms
            </label>
            <textarea
              name="symptoms"
              value={formData.symptoms}
              onChange={handleChange}
              rows={4}
              placeholder="Fever, headache, chest pain, dizziness..."
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block mb-1 font-medium">Symptom Duration</label>
            <input
              type="text"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              placeholder="e.g., 2 days, 1 week"
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>

          {/* Medical History */}
          <div>
            <label className="block mb-1 font-medium">Medical History</label>
            <textarea
              name="medicalHistory"
              value={formData.medicalHistory}
              onChange={handleChange}
              rows={3}
              placeholder="Diabetes, asthma, allergies..."
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Get Diagnosis
          </button>
        </form>
      </motion.div>
    </div>
  );
}
