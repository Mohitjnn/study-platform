"use client";

import { useEffect, useState } from "react";
import { paymentHistory, PaymentHistoryItem } from "@/actions/paymentActions";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from "@/components/ui/pagination";

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
        console.log("Payment history response:", res);
        setItems(res?.items || []);
        setHasMore(res?.items?.length === perPage);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [page, perPage]);

  return (
    <div className="w-full max-w-sm mx-auto py-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">Payment History</h2>
        <Select value={String(perPage)} onValueChange={v => setPerPage(Number(v))}>
          <SelectTrigger className="w-20">
            <SelectValue placeholder="Per page" />
          </SelectTrigger>
          <SelectContent>
            {PER_PAGE_OPTIONS.map(opt => (
              <SelectItem key={opt} value={String(opt)}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div
        className="bg-white/10 rounded-xl backdrop-blur-md overflow-y-auto max-h-[400px] px-2 py-2"
        style={{ minHeight: 200 }}
      >
        {items.length === 0 && !loading && (
          <div className="text-center text-muted-foreground py-8">No payment history found.</div>
        )}
        {items.map((item, idx) => (
          <div key={idx} className="mb-3 p-3 rounded-lg bg-white/5 flex flex-col gap-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{item.created_at}</span>
              <span className="font-semibold">{item.status}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Plan:</span>
              <span>{item.plan_code}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Minutes:</span>
              <span>{item.minutes_purchased}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Amount:</span>
              <span>{item.amount_paise / 100} {item.currency}</span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-center py-4 text-muted-foreground">Loading...</div>
        )}
      </div>
      <Pagination className="mt-4 flex justify-center">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setPage(p => Math.max(1, p - 1))}
            />
          </PaginationItem>
          <PaginationItem>
            <span className="px-3 py-1 rounded bg-white/10 text-xs">{page}</span>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              onClick={() => setPage(p => hasMore ? p + 1 : p)}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}