"use client";

import { TabsContent } from "@/components/ui/tabs";
import { createPaymentIntent } from "@/actions/paymentActions";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

function PaymentForm() {
  const [selectedMinutes, setSelectedMinutes] = useState("mins_100");
  const [loading, setLoading] = useState(false);

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
    <div className="w-full max-w-sm mx-auto flex flex-col gap-6 items-center py-8">
      <h2 className="text-xl font-semibold text-center mb-2">Buy Study Minutes</h2>
      <Select value={selectedMinutes} onValueChange={setSelectedMinutes}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select minutes" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="mins_100">100 Minutes</SelectItem>
          <SelectItem value="mins_200">200 Minutes</SelectItem>
          <SelectItem value="mins_300">300 Minutes</SelectItem>
        </SelectContent>
      </Select>
      <Button
        className="w-full mt-4"
        onClick={handlePayment}
        disabled={loading}
      >
        {loading ? "Redirecting..." : "Proceed to Payment"}
      </Button>
    </div>
  );
}

export default PaymentForm;