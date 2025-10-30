import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { IoArrowBack } from "react-icons/io5";
import { useWallet } from "@/hooks/useWallet";
import { toastError, toastSuccess } from "@/utils/toast";

interface WalletSignupProps {
  onBack?: () => void;
}

const WalletSignup: React.FC<WalletSignupProps> = ({ onBack }) => {
  const { connectWallet, loading, address, chainId, switchNetwork } =
    useWallet();
  const [email, setEmail] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [stage, setStage] = useState<"email" | "otp" | "success">("email");
  const [otpValues, setOtpValues] = useState<string[]>([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const canSubmitOtp = useMemo(
    () => otpValues.every((d) => d && d.length === 1),
    [otpValues]
  );

  const onGenerateOtp = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toastError("Please enter a valid email address");
      return;
    }
    setSubmitting(true);
    try {
      // Placeholder: integrate API to send OTP
      await new Promise((r) => setTimeout(r, 800));
      toastSuccess("OTP sent to your email");
      setStage("otp");
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } catch {
      toastError("Failed to send OTP. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangeDigit = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(0, 1);
    const next = [...otpValues];
    next[index] = digit;
    setOtpValues(next);
    if (digit && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" || e.key === "Delete") {
      if (!otpValues[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
      const next = [...otpValues];
      next[index] = "";
      setOtpValues(next);
    }
    if (e.key === "ArrowLeft" && index > 0)
      inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5)
      inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    const arr = pasted.split("");
    const next = ["", "", "", "", "", ""].map((_, i) => arr[i] || "");
    setOtpValues(next);
    const lastIndex = Math.min(pasted.length, 6) - 1;
    setTimeout(() => inputRefs.current[lastIndex]?.focus(), 0);
  };

  const verifyOtp = async () => {
    if (!canSubmitOtp) return;
    // Placeholder verification: accept 123456
    const code = otpValues.join("");
    await new Promise((r) => setTimeout(r, 500));
    if (code === "123456") {
      setStage("success");
    } else {
      toastError("Invalid code. Please try again.");
      setOtpValues(["", "", "", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    }
  };

  useEffect(() => {
    if (stage === "otp" && canSubmitOtp) {
      void verifyOtp();
    }
    // No additional dependencies, verifyOtp is stable for this case
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canSubmitOtp, stage]);
  return (
    <div className="h-screen w-full  bg-[url('/ModelBg.png')] bg-cover bg-no-repeat bg-center relative overflow-hidden">
      {/* Back Arrow */}
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-6 left-6 z-20 text-white hover:text-[#C9C9C9] transition-colors"
        >
          <IoArrowBack className="w-6 h-6" />
        </button>
      )}

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-8">
        {/* Finora Logo */}
        <div className="mb-8">
          <Image
            src="/Finora.png"
            alt="Finora Logo"
            width={80}
            height={80}
            className="object-contain"
          />
        </div>

        {!address ? (
          <>
            {/* Welcome Text */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-semibold text-white mb-4 font-Lato">
                Welcome to Finora Finance
              </h1>
              <p className="text-lg text-[#C9C9C9] leading-relaxed">
                Sign up with your wallet to get started
              </p>
            </div>

            {/* Wallet Connection Boxes */}
            <div className="grid grid-cols-2 gap-4 mb-8 w-full max-w-md">
              {/* MetaMask */}
              <div
                className="bg-[#1E1E1E] rounded-[18px] p-6 flex flex-col gap-2 justify-center items-start cursor-pointer hover:bg-[#2a2a2a] transition-colors disabled:opacity-50"
                onClick={() => connectWallet("MetaMask")}
              >
                <Image
                  src="/Metamask.png"
                  alt="MetaMask"
                  width={48}
                  height={48}
                  className=" mb-3"
                />
                <p className="text-white font-medium">MetaMask</p>
              </div>

              {/* Trust Wallet */}
              <div
                className="bg-[#1E1E1E] rounded-[18px] p-6 cursor-pointer hover:bg-[#2a2a2a] transition-colors disabled:opacity-50"
                onClick={() => connectWallet("Trust Wallet")}
              >
                <Image
                  src="/TrustWallet.png"
                  alt="Trust Wallet"
                  width={48}
                  height={48}
                  className=" mb-3"
                />
                <p className="text-white font-medium">Trust Wallet</p>
              </div>

              {/* WalletConnect */}
              <div
                className="bg-[#1E1E1E] rounded-[18px] p-6 cursor-pointer hover:bg-[#2a2a2a] transition-colors disabled:opacity-50"
                onClick={() => connectWallet("WalletConnect")}
              >
                <Image
                  src="/Walletconnect.png"
                  alt="WalletConnect"
                  width={48}
                  height={48}
                  className=" mb-3"
                />
                <p className="text-white font-medium">WalletConnect</p>
              </div>

              {/* Coinbase */}
              <div
                className="bg-[#1E1E1E] rounded-[18px] p-6 cursor-pointer hover:bg-[#2a2a2a] transition-colors disabled:opacity-50"
                onClick={() => connectWallet("Coinbase Wallet")}
              >
                <Image
                  src="/Coinbase.png"
                  alt="Coinbase"
                  width={48}
                  height={48}
                  className=" mb-3"
                />
                <p className="text-white font-medium">Coinbase</p>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="mb-4">
                <p className="text-[#C9C9C9] text-center">
                  Connecting wallet...
                </p>
              </div>
            )}

            {/* Log In Link */}
            <div>
              <p className="text-[#C9C9C9] text-base">
                Already have an account?{" "}
                <span className="text-[#444CE7] cursor-pointer hover:text-[#3a42d1] transition-colors">
                  Log In
                </span>
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Connected Wallet Flow */}
            {stage === "email" && (
              <div className="w-full flex justify-center items-center flex-col max-w-md">
                {chainId !== 8453 && (
                  <div className="mb-4 p-3 rounded-lg bg-[#2a2a2a] text-[#F2C94C] text-sm">
                    You are on the wrong network. Please switch to Base.
                  </div>
                )}

                <h2 className="text-white text-2xl font-semibold mb-1">
                  Enter your Email Address
                </h2>
                <p className="text-[#C9C9C9] text-base mb-10">
                  We’ll need to verify your email
                </p>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-[340px] rounded-2xl bg-[#151515] border border-[#474747] text-white placeholder:text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#444CE7]"
                />

                <div className="mt-4 flex gap-3">
                  {chainId !== 8453 ? (
                    <button
                      onClick={() => switchNetwork(8453)}
                      className="flex-1 w-[340px]  bg-[#444CE7] hover:bg-[#3a42d1] text-white rounded-2xl px-4 py-3 transition-colors disabled:opacity-60"
                      disabled={loading}
                    >
                      Switch to Base
                    </button>
                  ) : (
                    <button
                      onClick={onGenerateOtp}
                      className="flex-1 w-[340px] bg-[#1E1E1E] hover:bg-[#2a2a2a] text-white rounded-2xl px-4 py-3 transition-colors disabled:opacity-60"
                      disabled={submitting}
                    >
                      {submitting ? "Sending..." : "Generate OTP"}
                    </button>
                  )}
                </div>
              </div>
            )}

            {stage === "otp" && (
              <div className="w-full flex justify-center items-center flex-col max-w-md">
                <h2 className="text-white text-2xl font-semibold mb-1">
                  Verify Your Email
                </h2>
                <p className="text-[#C9C9C9] text-base mb-6 text-center">
                  We’ve sent a 6-digit code to your email <br />
                  <span className="text-white">{email}</span>{" "}
                  <button
                    className="text-[#444CE7] underline ml-1"
                    onClick={() => setStage("email")}
                  >
                    Change
                  </button>
                </p>

                <div className="flex gap-3 mb-6">
                  {otpValues.map((val, i) => (
                    <input
                      key={i}
                      ref={(el) => {
                        inputRefs.current[i] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={val}
                      onChange={(e) => {
                        handleChangeDigit(i, e.target.value);
                      }}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      onPaste={i === 0 ? handlePaste : undefined}
                      className="w-12 h-12 text-center rounded-2xl bg-[#151515] border border-[#474747] text-white focus:outline-none focus:ring-2 focus:ring-[#444CE7]"
                    />
                  ))}
                </div>

                <p className="text-[#C9C9C9] text-sm">
                  Didn’t receive code?{" "}
                  <button
                    className="text-[#444CE7] underline"
                    onClick={() => {
                      setOtpValues(["", "", "", "", "", ""]);
                      setTimeout(() => inputRefs.current[0]?.focus(), 50);
                      toastSuccess("Code resent");
                    }}
                  >
                    Resend Code
                  </button>
                </p>
              </div>
            )}

            {stage === "success" && (
              <div className="w-full flex justify-center items-center flex-col max-w-md text-center">
                <h2 className="text-white text-2xl font-semibold mb-3">
                  Registered Successfully
                </h2>
                <p className="text-[#C9C9C9] text-base mb-2">
                  You’ve successfully joined the Finora Early Access, and you’re
                  the <span className="text-white">65,892th</span>
                </p>
                <p className="text-[#C9C9C9] text-base">
                  Please check your email for instructions on how to continue
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WalletSignup;
