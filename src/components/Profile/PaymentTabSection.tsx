"use client";

import { TabsContent } from "@/components/ui/tabs";
import { createPaymentIntent } from "@/actions/paymentActions";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

function PaymentForm() {
  const [selectedMinutes, setSelectedMinutes] = useState("mins_100");
  const [loading, setLoading] = useState(false);

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

  const selectedOption = minuteOptions.find(
    (opt) => opt.value === selectedMinutes
  );

  async function handlePayment() {
    setLoading(true);
    try {
      const res = await createPaymentIntent({ tokens: selectedMinutes });
      if (res?.payment_url) {
        window.location.href = res.payment_url;
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col gap-6">
      <h1 className="mt-7">Buy Study Minutes</h1>

      <Select value={selectedMinutes} onValueChange={setSelectedMinutes}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select minutes" />
        </SelectTrigger>
        <SelectContent>
          {minuteOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label} &mdash; ₹{opt.price}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Show price and dummy text as bullet points */}
      {selectedOption && (
        <>
          <div className="font-semibold text-lg mb-1 text-white text-left">
            ₹{selectedOption.price} for {selectedOption.label}
          </div>
          <ul className="list-disc pl-6 text-white/80 text-sm mb-2">
            {Array.isArray(selectedOption.text)
              ? selectedOption.text.map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))
              : <li>{selectedOption.text}</li>
            }
          </ul>
        </>
      )}

      <Button
        className="w-full mt-4"
        onClick={handlePayment}
        disabled={loading}
      >
        {loading ? "Redirecting..." : `Proceed to Payment`}
      </Button>
    </div>
  );
}

export default PaymentForm;
