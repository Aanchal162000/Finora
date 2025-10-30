"use client";

import { useState } from "react";
import LandingPage from "./components/LandingPage";
import WalletSignup from "./components/WalletSignup";
import WalletInfo from "./components/WalletInfo";
import { useWallet } from "@/hooks/useWallet";

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<
    "landing" | "wallet-signup" | "dashboard"
  >("landing");

  const { isConnected } = useWallet();

  const handleGetStarted = () => {
    setCurrentScreen("wallet-signup");
  };

  const handleBackToHome = () => {
    setCurrentScreen("landing");
  };

  const handleGoToDashboard = () => {
    setCurrentScreen("dashboard");
  };

  // If wallet is connected, show dashboard
  if (isConnected && currentScreen !== "wallet-signup") {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <button
              onClick={handleBackToHome}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Back to Home
            </button>
          </div>
          <WalletInfo />
        </div>
      </div>
    );
  }

  if (currentScreen === "wallet-signup") {
    return <WalletSignup onBack={handleBackToHome} />;
  }

  return <LandingPage onGetStarted={handleGetStarted} />;
}
