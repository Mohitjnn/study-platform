"use client";

import { useEffect, useState } from "react";
import { paymentHistory, PaymentHistoryItem } from "@/actions/paymentActions";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";

const PER_PAGE_OPTIONS = [10, 20, 50];

export default function PaymentHistorySection() {
  const [items, setItems] = useState<PaymentHistoryItem[]>([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
  }, [perPage]);

  useEffect(() => {
    async function fetchHistory() {
      setLoading(true);
      try {
        const res = await paymentHistory({ page, per_page: perPage });
        setItems(res?.items || []);
        setHasMore(res?.items?.length === perPage);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [page, perPage]);

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Payment History
      </h2>

      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-600">Showing {items.length} transactions</p>
        <Select
          value={String(perPage)}
          onValueChange={(v) => setPerPage(Number(v))}
        >
          <SelectTrigger className="w-24 bg-white border-gray-300 text-black">
            <SelectValue placeholder="Per page" />
          </SelectTrigger>
          <SelectContent>
            {PER_PAGE_OPTIONS.map((opt) => (
              <SelectItem key={opt} value={String(opt)}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3 w-full" style={{ minHeight: 200 }}>
        {items.length === 0 && !loading && (
          <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg">
            No payment history found.
          </div>
        )}
        {items.map((item, idx) => (
          <div
            key={idx}
            className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold text-gray-900">
                  {item.plan_code.replace(/_/g, " ").toUpperCase()}
                </p>
                <p className="text-sm text-gray-600">
                  {new Date(item.created_at).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  item.status === "SUCCESS"
                    ? "bg-green-100 text-green-800"
                    : item.status === "PENDING"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {item.status}
              </span>
            </div>
            <div className="flex justify-between text-sm text-gray-700">
              <span>Minutes: {item.minutes_purchased}</span>
              <span className="font-semibold text-gray-900">
                {item.currency === "INR"
                  ? `₹${item.amount_paise / 100}`
                  : `${item.amount_paise / 100} ${item.currency}`}
              </span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-center py-8 text-gray-500">
            Loading...
          </div>
        )}
      </div>

      {items.length > 0 && (
        <Pagination className="mt-6 flex justify-center">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className={page === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            <PaginationItem>
              <span className="px-4 py-2 rounded bg-gray-100 text-gray-900 font-medium">
                Page {page}
              </span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                onClick={() => setPage((p) => (hasMore ? p + 1 : p))}
                className={!hasMore ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}