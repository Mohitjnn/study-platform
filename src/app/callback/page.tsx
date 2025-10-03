"use client";

import React, { Suspense } from "react";
import PaymentCallbackContent from "./PaymentCallbackContent";

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full bg-gradient-to-br from-[#010532] to-[#DF9AEE] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/80">Validating payment...</p>
        </div>
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  );
}