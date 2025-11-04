"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, AlertCircle, Clock, Ban } from "lucide-react";

type PaymentStatus = "paid" | "partially_paid" | "created" | "cancelled" | "expired";

interface PaymentStatusConfig {
  icon: React.ReactNode;
  title: string;
  message: string;
  subMessage: string;
  iconBgColor: string;
  iconColor: string;
  showDashboardButton: boolean;
}

export default function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const paymentId = searchParams.get("razorpay_payment_id");
    const paymentLinkId = searchParams.get("razorpay_payment_link_id");
    const paymentStatus = searchParams.get("razorpay_payment_link_status");
    if (!paymentId || !paymentLinkId || !paymentStatus) {
      router.push("/");
      return;
    }
    setIsValidating(false);
  }, [searchParams, router]);

  const paymentStatus = searchParams.get("razorpay_payment_link_status")?.toLowerCase() as PaymentStatus;

  const statusConfig: Record<PaymentStatus, PaymentStatusConfig> = {
    paid: {
      icon: <CheckCircle className="w-12 h-12 text-green-400" />,
      title: "Payment Successful!",
      message: "Your payment was successful",
      subMessage: "We appreciate your trust in our platform. Your features are now active!",
      iconBgColor: "bg-green-500/20",
      iconColor: "text-green-400",
      showDashboardButton: true,
    },
    partially_paid: {
      icon: <AlertCircle className="w-12 h-12 text-yellow-400" />,
      title: "Partially Paid",
      message: "Your payment was partially received",
      subMessage: "Please complete the remaining payment to activate all features.",
      iconBgColor: "bg-yellow-500/20",
      iconColor: "text-yellow-400",
      showDashboardButton: true,
    },
    created: {
      icon: <Clock className="w-12 h-12 text-blue-400" />,
      title: "Payment Pending",
      message: "Your payment is being processed",
      subMessage: "Please wait while we confirm your payment. This may take a few moments.",
      iconBgColor: "bg-blue-500/20",
      iconColor: "text-blue-400",
      showDashboardButton: false,
    },
    cancelled: {
      icon: <Ban className="w-12 h-12 text-red-400" />,
      title: "Payment Cancelled",
      message: "Your payment was cancelled",
      subMessage: "The payment process was cancelled. Please try again if you wish to proceed.",
      iconBgColor: "bg-red-500/20",
      iconColor: "text-red-400",
      showDashboardButton: false,
    },
    expired: {
      icon: <XCircle className="w-12 h-12 text-orange-400" />,
      title: "Payment Link Expired",
      message: "Your payment link has expired",
      subMessage: "Please request a new payment link to complete your purchase.",
      iconBgColor: "bg-orange-500/20",
      iconColor: "text-orange-400",
      showDashboardButton: false,
    },
  };

  const config = statusConfig[paymentStatus] || statusConfig.cancelled;

  if (isValidating) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-[#010532] to-[#DF9AEE] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/80">Validating payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#010532] to-[#DF9AEE] text-white flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-md">
        <div className=" mt-12 h-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className={`w-20 h-20 ${config.iconBgColor} rounded-full flex items-center justify-center`}>
                {config.icon}
              </div>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {config.title}
            </h1>
            <p className="text-lg text-white/80 mb-2">
              {config.message}
            </p>
            <p className="text-xs text-white/60 mb-8">
              {config.subMessage}
            </p>
            <div className="bg-white/5 rounded-lg p-4 mb-6 text-left">
              <p className="text-xs text-white/50 mb-2">Payment Details:</p>
              <p className="text-sm text-white/70 break-all">
                ID: {searchParams.get("razorpay_payment_id")}
              </p>
            </div>
            <div className="space-y-3">
              {config.showDashboardButton ? (
                <Link
                  href="/dashboard"
                  className="block w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg text-center"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <Link
                  href="/"
                  className="block w-full py-3 px-6 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-all duration-300 border border-white/20 text-center"
                >
                  Return Home
                </Link>
              )}
            </div>
          </div>
        </div>
        <div className="text-center mt-6">
          <p className="text-sm text-white/50">
            Need help? Contact our{" "}
            <Link href="/support" className="text-blue-300 hover:text-blue-200 underline">
              support team
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
