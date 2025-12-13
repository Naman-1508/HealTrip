import { motion } from "framer-motion";
import { User, Mail, LogOut, Edit3, Save } from "lucide-react";
import { useState } from "react";
import { useUser, useClerk } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Profile() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState({
    age: user?.unsafeMetadata?.age || "",
    gender: user?.unsafeMetadata?.gender || "Male",
    medicalHistory: user?.unsafeMetadata?.medicalHistory || "None",
    allergies: user?.unsafeMetadata?.allergies || "",
    travelPreferences: user?.unsafeMetadata?.travelPreferences || "",
  });

  const handleInput = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      await user.update({
        unsafeMetadata: profile,
      });
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update profile");
      console.error(error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/login");
  };

  if (!isLoaded) {
    return (
      <div className="pt-28 px-8 pb-20 min-h-screen bg-zinc-950 flex justify-center items-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="pt-28 px-8 pb-20 min-h-screen bg-zinc-950 flex justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl bg-zinc-900 rounded-xl shadow-lg border border-white/10 p-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user.firstName?.[0]}
              {user.lastName?.[0]}
            </div>

            <div>
              <h1 className="text-3xl font-bold text-white">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-zinc-400">
                Manage your personal and medical information
              </p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>

        {/* Edit Button */}
        <button
          onClick={() => {
            if (isEditing) {
              handleSave();
            } else {
              setIsEditing(true);
            }
          }}
          className="flex items-center gap-2 px-5 py-2 mb-6 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          {isEditing ? <Save size={18} /> : <Edit3 size={18} />}
          {isEditing ? "Save Changes" : "Edit Profile"}
        </button>

        {/* Profile Form */}
        <div className="space-y-6">
          {/* NAME (Read-only from Clerk) */}
          <div>
            <label className="font-medium text-white">Full Name</label>
            <input
              type="text"
              disabled
              value={`${user.firstName} ${user.lastName}`}
              className="w-full px-4 py-2 border border-zinc-700 bg-zinc-800 text-white rounded-lg mt-1"
            />
            <p className="text-xs text-zinc-500 mt-1">
              Name is managed by your account settings
            </p>
          </div>

          {/* EMAIL (Read-only from Clerk) */}
          <div>
            <label className="font-medium text-white">Email</label>
            <div className="flex items-center gap-2 mt-1">
              <Mail className="text-zinc-500" size={18} />
              <input
                type="email"
                disabled
                value={user.primaryEmailAddress?.emailAddress}
                className="w-full px-4 py-2 border border-zinc-700 bg-zinc-800 text-white rounded-lg"
              />
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Email is managed by your account settings
            </p>
          </div>

          {/* AGE */}
          <div>
            <label className="font-medium text-white">Age</label>
            <input
              type="number"
              name="age"
              disabled={!isEditing}
              value={profile.age}
              onChange={handleInput}
              className="w-full px-4 py-2 border border-zinc-700 rounded-lg mt-1 bg-zinc-800 text-white disabled:bg-zinc-900"
              placeholder="Enter your age"
            />
          </div>

          {/* GENDER */}
          <div>
            <label className="font-medium text-white">Gender</label>
            <select
              name="gender"
              disabled={!isEditing}
              value={profile.gender}
              onChange={handleInput}
              className="w-full px-4 py-2 border border-zinc-700 rounded-lg mt-1 bg-zinc-800 text-white disabled:bg-zinc-900"
            >
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>

          {/* MEDICAL HISTORY */}
          <div>
            <label className="font-medium text-white flex items-center gap-2">
              Medical History
            </label>
            <textarea
              name="medicalHistory"
              disabled={!isEditing}
              value={profile.medicalHistory}
              onChange={handleInput}
              rows={3}
              className="w-full px-4 py-2 border border-zinc-700 rounded-lg mt-1 bg-zinc-800 text-white disabled:bg-zinc-900"
              placeholder="Any past medical conditions, surgeries, etc."
            />
          </div>

          {/* ALLERGIES */}
          <div>
            <label className="font-medium text-white">Allergies</label>
            <textarea
              name="allergies"
              disabled={!isEditing}
              value={profile.allergies}
              onChange={handleInput}
              rows={2}
              className="w-full px-4 py-2 border border-zinc-700 rounded-lg mt-1 bg-zinc-800 text-white disabled:bg-zinc-900"
              placeholder="List any allergies (food, medicine, etc.)"
            />
          </div>

          {/* TRAVEL PREFERENCES */}
          <div>
            <label className="font-medium text-white">Travel Preferences</label>
            <textarea
              name="travelPreferences"
              disabled={!isEditing}
              value={profile.travelPreferences}
              onChange={handleInput}
              rows={2}
              className="w-full px-4 py-2 border border-zinc-700 rounded-lg mt-1 bg-zinc-800 text-white disabled:bg-zinc-900"
              placeholder="Your travel preferences and requirements"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
