"use server";
import { fetchFromAPI, postDataToAPI } from "@/lib/api/client";

interface PaymentIntentResponse {
  payment_url: string;
  payment_link_id: string;
}

export interface PaymentHistoryItem {
    id: string;
    plan_code: string;
    minutes_purchased: number;
    amount_paise: number;
    currency: string;
    status: string;
    created_at: string;
}

interface PaymentHistoryResponse {
    items: PaymentHistoryItem[];
    page: number;
    per_page: number;
    next_page: number | null;
}

export async function createPaymentIntent({ tokens }: { tokens: string }) {
  const data = {
    plan_code: tokens,
  };
  try {
    const response = await postDataToAPI<PaymentIntentResponse>("/payments/create", data, {
      requiresAuth: true,
    });
    return response;
  } catch (error) {
    console.error("Error creating payment intent:", error);
    throw error;
  }
}

export async function paymentHistory({page,per_page}: {page: number, per_page: number}) {
try {
    const response = await fetchFromAPI<PaymentHistoryResponse>(`/payments/history?page=${page}&per_page=${per_page}`,{requiresAuth: true});
    return response;
} catch (error) {
        console.error("Error fetching payment history:", error);
    throw error;
}
}