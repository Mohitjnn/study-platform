"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import PasswordBasedLogin from "@/components/Login/PaswordLogin";
import OtpBasedLogin from "@/components/Login/OtpLogin";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import AnimatedLottie from "@/components/AnimatedLottie";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";

type LoginMethod = "password" | "otp";

export default function LoginPage() {
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("password");
  const router = useRouter();

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-violet-900 to-violet-950 px-5 flex justify-center items-center py-8">
      <BackgroundRippleEffect />
      <div className="w-full max-w-md relative z-20">
        <AnimatedLottie />

        <Card className="bg-white/10 border border-white/20 backdrop-blur-md text-white z-20">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-light">Sign In</CardTitle>
            {/* Login method tabs */}
            <div className="flex gap-2 mt-4 bg-white/5 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setLoginMethod("password")}
                className={`flex-1 py-2 px-4 rounded-md text-sm transition-all ${
                  loginMethod === "password"
                    ? "bg-white/20 text-white"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Password
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod("otp")}
                className={`flex-1 py-2 px-4 rounded-md text-sm transition-all ${
                  loginMethod === "otp"
                    ? "bg-white/20 text-white"
                    : "text-white/60 hover:text-white"
                }`}
              >
                OTP
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {loginMethod === "password" ? (
              <PasswordBasedLogin />
            ) : (
              <OtpBasedLogin />
            )}
            <div className="text-center pt-2">
              <p className="text-sm text-white/60">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="text-white underline">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
