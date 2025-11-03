"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, SignupFormData } from "@/schema/signupSchema";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone, Lock, Loader2, CheckCircle } from "lucide-react";
import Link from "next/link";
import { signup } from "@/actions/auth";
import AnimatedLottie from "@/components/AnimatedLottie";

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await signup({
        full_name: data.full_name,
        email: data.email,
        password: data.password,
      });
      if (response && response.id) {
        setIsSuccess(true);
      } else {
        setErrorMsg(response.error || "Signup failed.");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Signup failed.";
      setErrorMsg(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="h-full w-full bg-gradient-to-br from-[#010532] to-[#DF9AEE] px-5 flex justify-center items-center">
        <Card className="bg-white/10 border border-white/20 backdrop-blur-md text-white z-20">
          <CardContent className="text-center space-y-6 pt-6">
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <div>
              <CardTitle className="text-3xl font-medium mb-2 text-white">
                Account Created Successfully!
              </CardTitle>
              <CardDescription className="text-lg text-white/70">
                Welcome to our platform. You can now sign in to your account.
              </CardDescription>
            </div>
            <Link href="/login">
              <button className="w-full bg-white/20 py-3 rounded-lg flex items-center justify-center gap-3 text-white border border-white/70">
                Continue to Login
              </button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <main className="h-full w-full bg-gradient-to-br from-[#010532] to-[#DF9AEE] px-5 flex justify-center items-center">
      <div className="w-full max-w-md relative">
        <AnimatedLottie />

        <Card className="bg-white/10 border border-white/20 backdrop-blur-md text-white z-20">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-light">Sign Up</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white h-4 w-4" />
                  <Input
                    id="full_name"
                    type="text"
                    placeholder="Enter your full name"
                    className="pl-10 text-white placeholder:text-white/60 py-5 border-white/30"
                    {...register("full_name")}
                  />
                </div>
                {errors.full_name && (
                  <p className="text-sm text-red-600">
                    {errors.full_name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2 flex-1">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10 text-white placeholder:text-white/60 py-5 border-white/30"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white h-4 w-4" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    className="pl-10 text-white placeholder:text-white/60 py-5 border-white/30"
                    {...register("password")}
                  />
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white h-4 w-4" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    className="pl-10 text-white placeholder:text-white/60 py-5 border-white/30"
                    {...register("confirmPassword")}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {errorMsg && (
                <p className="text-sm text-red-600 text-center">{errorMsg}</p>
              )}

              <button
                type="submit"
                className="w-full bg-white/20 py-3 rounded-lg flex items-center justify-center gap-3"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-white/60">
                Already have an account?{" "}
                <Link href="/login" className="text-white underline">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
