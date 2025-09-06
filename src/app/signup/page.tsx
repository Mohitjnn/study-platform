"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, SignupFormData } from '@/schema/signupSchema';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Phone, Lock, Loader2, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { signup } from '@/actions/auth';

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
    console.log("Form Data:", data);
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
        setErrorMsg(response.error || 'Signup failed.');
      }
    } catch (error: any) {
      setErrorMsg(error?.message || 'Signup failed.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background text-foreground dark flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg bg-card text-card-foreground">
          <CardContent className="text-center space-y-6 pt-6">
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-card-foreground mb-2">
                Account Created Successfully!
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Welcome to our platform. You can now sign in to your account.
              </CardDescription>
            </div>
            <Link href="/login">
              <Button className="w-full">
                Continue to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground dark">
      {/* Header */}
      <header className="text-center mb-16">
        <div className="flex justify-center mb-8"></div>
        <h1 className="text-4xl md:text-6xl font-bold mb-4 text-foreground">
          Create Your Account
        </h1>
        <p className="text-xl max-w-2xl mx-auto text-muted-foreground">
          Join our platform and start your learning journey
        </p>
      </header>
      <div className="flex items-center justify-center p-4">
        <div className="w-full max-w-xl">
          <Card className="shadow-lg bg-card text-card-foreground">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-card-foreground">
                Create Your Account
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Join our platform and start your learning journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className='flex gap-2 flex-1 w-full'>
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="full_name"
                        type="text"
                        placeholder="Enter your full name"
                        className="pl-10"
                        {...register('full_name')}
                      />
                    </div>
                    {errors.full_name && (
                      <p className="text-sm text-red-600">{errors.full_name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2 flex-1">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10"
                        {...register('email')}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      className="pl-10"
                      {...register('password')}
                    />
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      className="pl-10"
                      {...register('confirmPassword')}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
                  )}
                </div>
                
                {errorMsg && (
                  <p className="text-sm text-red-600 text-center">{errorMsg}</p>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link href="/login" className="text-purple-600 hover:text-purple-800 transition-colors">
                    Sign in
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}