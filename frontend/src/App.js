import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useState } from "react";

import Landing from "./pages/Landing";
import Hospitals from "./pages/Hospitals";
import YogaWellness from "./pages/YogaWellness";
import MedicalForm from "./pages/MedicalForm";
import DiagnosisResult from "./pages/DiagnosisResult";
import Dashboard from "./pages/Dashboard";
import TravelPlanner from "./pages/TravelPlanner";
import PackageDetails from "./pages/PackageDetails";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyEmail from "./pages/VerifyEmail";
import Profile from "./pages/Profile";
import EmergencySOS from "./pages/EmergencySOS";
import DiagnosisUpload from "./components/DiagnosisUpload";
import Payment from "./pages/Payment";
import SSOCallback from "./pages/SSOCallback";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HealChat from "./pages/HealChat";
import SmoothScroll from "./components/SmoothScroll";
import CustomCursor from "./components/CustomCursor";
import LoadingAnimation from "./components/LoadingAnimation";
import ChatWidget from "./components/ChatWidget";
import ChaosToggle from "./components/ChaosToggle";
import { ChaosProvider } from "./contexts/ChaosContext";

function Layout() {
  const location = useLocation();

  // Hide Navbar + Footer ONLY on landing page IF DESIRED, but current design has a nice navbar everywhere
  // Let's keep navbar everywhere for consistency in the new design
  // Or if the original logic was to hide it on landing (which is odd for a landing page usually?), let's respect user original intent IF RELEVANT.
  // Original code:   const hideNav = location.pathname === "/"; 
  // Wait, usually Landing pages HAVE navbars. The original code hid it? That's weird. 
  // Let's SHOW it on Landing for the premium feel (sticky nav).
  // I will conditionally hide it only if it's a specific "splash" screen, but here Landing is the home.
  // I will Show it everywhere for now to match "Landon Norris" style which usually has a persistent nav.

  const hideNav = false;
  const [isLoading, setIsLoading] = useState(true);

  return (
    <SmoothScroll>
      <LoadingAnimation onComplete={() => setIsLoading(false)} />
      <CustomCursor />
      <ChaosToggle />
      <ChatWidget />
      <div className="noise-overlay" />

      {!hideNav && location.pathname !== '/package' && location.pathname !== '/package/' && <Navbar />}

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/hospitals" element={<Hospitals />} />
        <Route path="/yoga" element={<YogaWellness />} />
        <Route path="/medical-form" element={<MedicalForm />} />
        <Route path="/diagnosis-result" element={<DiagnosisResult />} />
        <Route path="/diagnosis-upload" element={<DiagnosisUpload />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/travel" element={<TravelPlanner />} />
        <Route path="/package" element={<PackageDetails />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/emergency" element={<EmergencySOS />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/chat" element={<HealChat />} />
        <Route path="/sso-callback" element={<SSOCallback />} />
      </Routes>

      {!hideNav && <Footer />}
    </SmoothScroll>
  );
}

export default function App() {
  return (
    <ChaosProvider>
      <Router>
        <Layout />
      </Router>
    </ChaosProvider>
  );
}
