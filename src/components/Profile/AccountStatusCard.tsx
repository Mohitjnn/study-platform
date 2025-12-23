"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createPaymentIntent } from "@/actions/paymentActions";

interface AccountStatusCardProps {
  voiceMinutes?: number;
}

interface PlanOption {
  value: string;
  label: string;
  price: number;
  minutes: number;
  text: string;
}

export default function AccountStatusCard({ voiceMinutes = 0 }: AccountStatusCardProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [finalLoading, setFinalLoading] = useState(false);

  const planOptions: PlanOption[] = [
    {
      value: "mins_100",
      label: "100 Minutes Plan",
      price: 1199,
      minutes: 100,
      text: "Great for quick homework help and daily reading.",
    },
    {
      value: "mins_200",
      label: "200 Minutes Plan",
      price: 1999,
      minutes: 200,
      text: "Ideal for building strong study habits and routines.",
    },
    {
      value: "mins_300",
      label: "300 Minutes Plan",
      price: 2999,
      minutes: 300,
      text: "Best for ongoing support and deeper understanding.",
    },
  ];

  const [selectedPlan, setSelectedPlan] = useState<PlanOption | null>(
    planOptions[0]
  );

  function handlePlanSelect(plan: PlanOption) {
    setSelectedPlan(plan);
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
    <>
      <div className="bg-[#655DF1] rounded-lg p-6 flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm mb-1">Account Status</p>
          <h2 className="text-white text-xl font-bold">Active</h2>
          <p className="text-white/90 mt-2 text-xs">
            Minutes Available: <span className="font-semibold">{voiceMinutes}</span>
          </p>
        </div>
        <Button
          onClick={() => setShowDialog(true)}
          variant="secondary"
          className="bg-white/10 border-white/30 border backdrop-blur-sm text-[white] hover:bg-white/90"
        >
          Change Plan
        </Button>
      </div>

      {/* Change Plan Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl bg-[#090E6C] text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-center text-white">
              Choose Your Plan
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Available Plans */}
            <div>
              <h4 className="text-sm font-semibold mb-4">Available Plans</h4>
              <div className="space-y-2">
                {planOptions.map((plan) => (
                  <div
                    key={plan.value}
                    className={`rounded-xl p-2 cursor-pointer transition-all ${
                      selectedPlan?.value === plan.value
                        ? 'border-b-purple-400 bg-purple-600/80'
                        : ''
                    }`}
                    onClick={() => setSelectedPlan(plan)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h5 className="text-sm font-semibold text-white">
                          {plan.label}
                        </h5>
                        <p className="text-white/80 text-xs mt-1">
                          {plan.text}
                        </p>
                      </div>
                      <div className="text-right ml-6">
                        <p className="text-lg font-bold text-white">
                          ₹{plan.price}
                        </p>
                        <p className="text-white/80 text-sm">{plan.minutes} minutes</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Promo Code */}
            <div>
              <h4 className="text-lg font-semibold mb-3 text-center">
                Promo Code
              </h4>
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
            {selectedPlan && (
              <div>
                <h4 className="text-sm font-semibold mb-4">Review Total</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs border-b border-white/20 pb-2">
                    <span>PLAN</span>
                    <span>COST</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <div>
                      <p className="font-medium">{selectedPlan.label}</p>
                    </div>
                    <p className="font-bold">₹{selectedPlan.price}</p>
                  </div>
                  <div className="border-t border-white/20 pt-2 mt-4">
                    <div className="flex justify-between font-bold text-xs">
                      <span>Due Today:</span>
                      <span>₹{selectedPlan.price}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <p className="text-center text-xs opacity-80">
              Your default payment method will be billed immediately
            </p>
          </div>

          <DialogFooter className="mt-6">
            <div className="flex gap-4 w-full">
              <Button
                onClick={() => setShowDialog(false)}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmPayment}
                disabled={finalLoading || !selectedPlan}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold disabled:opacity-50"
              >
                {finalLoading ? "Processing..." : "Proceed to Pay"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}