"use client";

import { TabsContent } from "@/components/ui/tabs";
import { createPaymentIntent } from "@/actions/paymentActions";
import { useState } from "react";
import { Button } from "@/components/ui/button";

function PaymentForm() {
  const [loading, setLoading] = useState<string | null>(null);

  const minuteOptions = [
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
    setLoading(selectedMinutes);
    try {
      const res = await createPaymentIntent({ tokens: selectedMinutes });
      if (res?.payment_url) {
        window.location.href = res.payment_url;
      }
    } finally {
      setLoading(null);
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
              disabled={loading === opt.value}
            >
              {loading === opt.value ? "Redirecting..." : "Proceed to Payment"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PaymentForm;
