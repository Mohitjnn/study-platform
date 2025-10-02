import React from "react";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function ThankYouPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#010532] to-[#DF9AEE] text-white flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-md">
        {/* Glossy Card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
          <div className="text-center">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-400" />
              </div>
            </div>

            {/* Bot Image */}
            <div className="flex justify-center mb-6">
              <img 
                src="/images/Bot.png" 
                alt="Bot" 
                className="w-24 h-24 object-contain"
              />
            </div>

            {/* Thank You Message */}
            <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Thank You!
            </h1>
            
            <p className="text-lg text-white/80 mb-2">
              Your payment was successful
            </p>
            
            <p className="text-sm text-white/60 mb-8">
              We appreciate your trust in our platform. Your features are now active!
            </p>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link
                href="/dashboard"
                className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Additional Info
        <div className="text-center mt-6">
          <p className="text-sm text-white/50">
            Need help? Contact our{" "}
            <Link href="/support" className="text-blue-900 hover:text-blue-300 underline">
              support team
            </Link>
          </p>
        </div> */}
      </div>
    </div>
  );
}
