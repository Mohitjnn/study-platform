"use client"
import React from "react";
import Link from "next/link";
import { XCircle, Mail, Phone } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function PaymentFailPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#010532] to-[#DF9AEE] text-white flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        {/* Glossy Card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
          <div className="text-center">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center">
                <XCircle className="w-12 h-12 text-red-400" />
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

            {/* Sorry Message */}
            <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              Payment Failed
            </h1>
            
            <p className="text-lg text-white/80 mb-2">
              Sorry, your payment could not be processed
            </p>
            
            <p className="text-sm text-white/60 mb-8">
              Don&apos;t worry! Please get in touch with our team to resolve this issue and initiate a conflict resolution.
            </p>

            {/* Contact Information */}
            <div className="bg-white/5 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold mb-3 text-white/90">
                Contact Our Team
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-center gap-2">
                  <Mail className="w-4 h-4 text-blue-400" />
                  <span className="text-white/70">support@studyplatform.com</span>
                </div>
                
                <div className="flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4 text-green-400" />
                  <span className="text-white/70">+1 (555) 123-4567</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link
                href="/dashboard"
                className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center"
              >
                Return to Dashboard
              </Link>
              
              <Link
                href="/payment"
                className="w-full py-3 px-6 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg font-medium transition-all duration-300 flex items-center justify-center"
              >
                Try Payment Again
              </Link>
              
              <button
                onClick={() => window.open('mailto:support@studyplatform.com?subject=Payment Issue - Need Assistance', '_blank')}
                className="w-full py-3 px-6 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Email Support
              </button>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center mt-6">
          <p className="text-sm text-white/50">
            We&apos;re here to help! Our team typically responds within 24 hours.
          </p>
        </div>
      </div>
    </div>
  );
}
