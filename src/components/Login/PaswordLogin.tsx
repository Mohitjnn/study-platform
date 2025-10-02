"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormData } from "@/schema/loginSchema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Loader2 } from "lucide-react";
import Link from "next/link";
import { login } from "@/actions/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function PasswordBasedLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onPasswordSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("password", data.password);
      const result = await login(formData);
      if (result.success) {
        router.push("/dashboard");
      } else {
        setErrorMsg(result.error || "Login failed");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      setErrorMsg(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-4">
      <div className="space-y-2">
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
          <p className="text-sm text-red-400">{errors.email.message}</p>
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
          <p className="text-sm text-red-400">{errors.password.message}</p>
        )}
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
            Signing In...
          </>
        ) : (
          "Sign In"
        )}
      </Button>
    </form>
  );
}