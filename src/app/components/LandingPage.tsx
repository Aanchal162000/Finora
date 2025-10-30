import React from "react";
import Image from "next/image";
import { RxEnter } from "react-icons/rx";
import { LandingPageProps } from "../interfaces";

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className=" h-screen  overflow-hidden max-h-screen w-full relative bg-black">
      {/* Circular gradient at top left */}
      <div
        className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-30"
        style={{
          background: "radial-gradient(circle, #444CE7 0%, transparent 70%)",
        }}
      ></div>

      {/* Top 70% section - transparent so background image shows through */}
      <div className="relative z-10 h-[70%] w-full flex flex-col">
        {/* Header with logo and social icons */}
        <div className="flex justify-between items-center px-24 py-4 ">
          {/* Logo on the left */}
          <div className="flex items-center">
            <Image
              src="/Logo.png"
              alt="Logo"
              width={120}
              height={40}
              className="object-contain"
            />
          </div>

          {/* Social icons on the right */}
          <div className="flex items-center space-x-4">
            <Image
              src="/Twitter.png"
              alt="Twitter"
              width={24}
              height={24}
              className="object-contain cursor-pointer hover:opacity-80 transition-opacity"
            />
            <Image
              src="/Telegram.png"
              alt="Telegram"
              width={24}
              height={24}
              className="object-contain cursor-pointer hover:opacity-80 transition-opacity"
            />
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex  ">
          <div className="flex relative w-full h-full pt-10">
            {/* Left side - Text content */}
            <div className="relative flex flex-col pl-24  flex-1  h-full justify-center items-start">
              {/* Circular gradient at bottom right of text content */}
              <div
                className="absolute z-10 -bottom-40 -right-40 w-96 h-96 rounded-full opacity-30"
                style={{
                  background:
                    "radial-gradient(circle, #444CE7 0%, transparent 70%)",
                }}
              ></div>
              <h1 className="text-5xl font-semibold text-white mb-6 font-Lato">
                Your on-chain AI agent
                <br /> for maximum DeFi yield
              </h1>
              <p className="text-sm text-[#C9C9C9] leading-relaxed text-left">
                Finora is your AI-powered partner, working around the clock to
                find the best
                <br /> opportunities and grow your DeFi earnings automatically.
              </p>
              <button
                onClick={onGetStarted}
                className="mt-6 bg-[#444CE7] text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-[#3a42d1] transition-colors"
              >
                Get Started
                <RxEnter className="w-4 h-4" />
              </button>
            </div>

            {/* Right side - GraphImage above Home.png */}
            <div className=" z-20 flex relative w-[50%] h-full justify-center bg-[url('/Home.png')] bg-cover bg-no-repeat bg-center transform translate-y-8">
              {/* GraphImage positioned above the Home.png background */}
              <div className="absolute top-[11%] left-[50%] bg-[url('/GraphImage.png')] bg-cover bg-no-repeat bg-center transform -translate-x-1/2 z-30 w-[105%] h-[24%]"></div>
              {/* Circular gradient at center bottom right */}
              <div
                className="absolute -bottom-120 right-16 w-160 h-160 rounded-full opacity-60"
                style={{
                  background:
                    "radial-gradient(circle, #444CE7 0%, transparent 70%)",
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom 30% section - black background overlay */}
      <div className="relative z-20 h-[30%] w-full bg-black ">
        {/* Fading top border */}
        <div
          className="absolute top-0 left-0 w-full h-px"
          style={{
            background:
              "linear-gradient(to right, transparent 0%, rgba(205,208,255,0.1) 20%, rgba(205,208,255,0.3) 50%, rgba(205,208,255,0.1) 80%, transparent 100%)",
          }}
        ></div>

        {/* Center gradient */}
        <div
          className="absolute top-[132%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-160 h-96 rounded-full opacity-40"
          style={{
            background: "radial-gradient(circle, #444CE7 0%, transparent 70%)",
          }}
        ></div>

        {/* Three pointers in row */}
        <div className="flex justify-center items-center h-full px-24 ">
          <div className="flex flex-row items-center justify-between  relative w-full ">
            {/* Pointer 1 */}
            <div className="text-center flex flex-row  justify-center items-center">
              <div className=" flex items-center justify-center text-[#8098F9] font-bold text-3xl mx-4 mb-4">
                1
              </div>
              <p className="text-[#EAECF0] text-lg leading-relaxed text-left">
                Finora is your AI partner, tirelessly
                <br /> seeking the best opportunities to
                <br /> boost your DeFi earnings.
              </p>
            </div>

            {/* Pointer 2 */}
            <div className="text-center flex flex-row  justify-center items-center">
              <div className=" flex items-center justify-center text-[#8098F9] font-bold text-3xl mx-4 mb-4">
                2
              </div>
              <p className="text-[#EAECF0] text-lg leading-relaxed text-left">
                Easily manage deposits, withdrawals,
                <br /> and yield in one place. Non-custodial
                <br /> by design - your vault, your assets.
              </p>
            </div>

            {/* Pointer 3 */}
            <div className="text-center flex flex-row  justify-center items-center">
              <div className=" flex items-center justify-center text-[#8098F9] font-bold text-3xl mx-4 mb-4">
                3
              </div>
              <p className="text-[#EAECF0] text-lg leading-relaxed text-left">
                Select a strategy, deposit,
                <br /> and let Finora optimize
                <br /> your yield potential.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <p className="text-[#C9C9C9] text-xs">
            All Rights Reserved SurfLiquid 2025 | Terms of use
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
