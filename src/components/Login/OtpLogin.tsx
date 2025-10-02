"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Loader2, ArrowLeft } from "lucide-react";
import { sendOTP, verifyOTP } from "@/actions/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function OtpBasedLogin() {
  const [otpStep, setOtpStep] = useState<1 | 2>(1);
  const [otpEmail, setOtpEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [expiresIn, setExpiresIn] = useState<number | null>(null);

  const router = useRouter();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (otpStep === 2 && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [otpStep]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otpEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(otpEmail)) {
      setErrorMsg("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const result = await sendOTP(otpEmail);

      if (result.success) {
        toast(
          <>
            <div className="font-semibold">OTP Sent!</div>
            <div>Check your email for the verification code. Expires in {result.expiresInMinutes} minutes.</div>
          </>
        );
        setExpiresIn(result.expiresInMinutes ?? null);
        setOtpStep(2);
      } else {
        setErrorMsg(result.error || "Failed to send OTP");
      }
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otp];

    pastedData.split("").forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });

    setOtp(newOtp);

    const nextEmpty = newOtp.findIndex(val => !val);
    if (nextEmpty !== -1) {
      inputRefs.current[nextEmpty]?.focus();
    } else {
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setErrorMsg("Please enter the complete 6-digit code");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const result = await verifyOTP(otpEmail, otpCode);

      if (result.success) {
        toast(
          <>
            <div className="font-semibold">Success!</div>
            <div>You&apos;ve been logged in successfully.</div>
          </>
        );
        router.push("/dashboard");
      } else {
        setErrorMsg(result.error || "Invalid OTP");
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "Verification failed");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setOtpStep(1);
    setOtp(["", "", "", "", "", ""]);
    setErrorMsg(null);
  };

  return (
    <>
      {otpStep === 1 ? (
        <form onSubmit={handleSendOTP} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp-email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white h-4 w-4" />
              <Input
                id="otp-email"
                type="email"
                placeholder="Enter your email"
                className="pl-10 text-white placeholder:text-white/60 py-5 border-white/30"
                value={otpEmail}
                onChange={(e) => setOtpEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {errorMsg && (
            <p className="text-sm text-red-400 text-center">{errorMsg}</p>
          )}

          <Button
            type="submit"
            className="w-full bg-white/20 hover:bg-white/30 py-6 text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending OTP...
              </>
            ) : (
              "Send OTP"
            )}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} className="space-y-6">
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleBackToEmail}
              className="flex items-center gap-2 text-white/80 hover:text-white text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              {otpEmail}
            </button>
          </div>

          <div className="space-y-3">
            <Label className="text-center block">Verification Code</Label>
            <div className="flex gap-2 justify-center" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOTPChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-xl font-semibold text-white border-white/30 bg-white/5"
                  disabled={isLoading}
                />
              ))}
            </div>
            {expiresIn && (
              <p className="text-xs text-white/60 text-center">
                Code expires in {expiresIn} minutes
              </p>
            )}
          </div>

          {errorMsg && (
            <p className="text-sm text-red-400 text-center">{errorMsg}</p>
          )}

          <Button
            type="submit"
            className="w-full bg-white/20 hover:bg-white/30 py-6 text-white"
            disabled={isLoading || otp.some(d => !d)}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify & Sign In"
            )}
          </Button>
        </form>
      )}
    </>
  );
}