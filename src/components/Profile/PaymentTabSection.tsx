"use client";

import { TabsContent } from "@/components/ui/tabs";
import { createPaymentIntent } from "@/actions/paymentActions";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { X, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

interface minuteOptions {
  value: string;
  label: string;
  price: number;
  text: string[];
}

function PaymentForm() {
  const [loading, setLoading] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<minuteOptions | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [finalLoading, setFinalLoading] = useState(false);

  const minuteOptions: minuteOptions[] = [
    {
      value: "mins_100",
      label: "100 Minutes",
      price: 1199,
      text: [
        "Great for quick homework help and daily reading.",
        "Encourages curiosity and learning new things.",
        "Perfect for children who need a little extra support after school.",
      ],
    },
    {
      value: "mins_200",
      label: "200 Minutes",
      price: 1999,
      text: [
        "Ideal for building strong study habits and routines.",
        "Supports regular learning and positive progress.",
        "Helps children feel confident in their schoolwork.",
      ],
    },
    {
      value: "mins_300",
      label: "300 Minutes",
      price: 2999,
      text: [
        "Best for ongoing support and deeper understanding.",
        "Encourages children to explore and ask questions.",
        "Great for kids who love to learn and grow every day.",
      ],
    },
  ];

  async function handlePayment(selectedMinutes: string) {
    const option = minuteOptions.find(opt => opt.value === selectedMinutes) ?? null;
    setSelectedPlan(option);
    setShowDialog(true);
  }

  async function confirmPayment() {
    if (!selectedPlan) return;
    
    setFinalLoading(true);
    try {
      const res = await createPaymentIntent({ tokens: selectedPlan.value });
      if (res?.payment_url) {
        window.location.href = res.payment_url;
      }
    } finally {
      setFinalLoading(false);
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
      <h1 className="mt-7 text-center text-xl font-medium">
        Buy Study Minutes
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        {minuteOptions.map((opt) => (
          <div
            key={opt.value}
            className="border rounded-lg p-6 flex flex-col gap-4"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white">{opt.label}</h2>
              <p className="text-3xl font-semibold text-white mt-2">
                ₹{opt.price}
              </p>
            </div>

            <ul className="list-disc pl-6 text-white/80 text-sm flex-grow">
              {opt.text.map((point, idx) => (
                <li key={idx}>{point}</li>
              ))}
            </ul>

            <Button
              className="w-full mt-auto"
              onClick={() => handlePayment(opt.value)}
            >
              Proceed to Payment
            </Button>
          </div>
        ))}
      </div>

      {/* Payment Confirmation Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl bg-gradient-to-br from-blue-900 to-purple-900 border-white/20 text-white">
          <DialogHeader className="relative">
            <DialogTitle className="text-2xl font-bold text-center text-white">
              Current Plan
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Current Plan Status */}
            {/* <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">Account Status</p>
                  <h3 className="text-3xl font-bold">Paid</h3>
                  <div className="flex gap-4 mt-2 text-sm">
                    <span>Plan: Annual</span>
                    <span>Type: Family</span>
                  </div>
                </div>
                <CheckCircle className="h-12 w-12 text-green-400" />
              </div>
            </div> */}

            {/* Available Plan */}
            <div>
              <h4 className="text-xl font-semibold mb-4">Available Plan</h4>
              {selectedPlan && (
                <div className="border border-white/20 rounded-xl p-4 bg-white/5">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm opacity-80">PLAN</p>
                      <h5 className="text-lg font-semibold">{selectedPlan.label}</h5>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">₹{selectedPlan.price}</p>
                      <p className="text-sm opacity-80">/ Month</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Promo Code */}
            <div>
              <h4 className="text-lg font-semibold mb-3 text-center">Promo Code</h4>
              <div className="flex gap-2">
                <Input
                  placeholder="Promo Code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                />
                <Button variant="secondary" className="px-6">
                  Apply
                </Button>
              </div>
            </div>

            {/* Review Total */}
            <div>
              <h4 className="text-xl font-semibold mb-4">Review Total</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm border-b border-white/20 pb-2">
                  <span>PLAN</span>
                  <span>COST</span>
                </div>
                {selectedPlan && (
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">Synthesis Tutor</p>
                    </div>
                    <p className="font-bold">₹{selectedPlan.price}</p>
                  </div>
                )}
                <div className="border-t border-white/20 pt-2 mt-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Due Today:</span>
                    <span>₹{selectedPlan?.price}</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-center text-sm opacity-80">
              Your default payment method will be billed immediately
            </p>
          </div>

          <DialogFooter>
            <Button
              onClick={confirmPayment}
              disabled={finalLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg"
            >
              {finalLoading ? "Processing..." : "Continue"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PaymentForm;
