"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function InvoiceStatusFilter({ value }: { value: string }) {
  const router = useRouter();
  const [status, setStatus] = useState(value);
  const [, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    setStatus(next);
    startTransition(() => {
      router.replace(
        next ? `/facturas?estado=${encodeURIComponent(next)}` : "/facturas",
      );
    });
  }

  return (
    <select
      data-testid="invoice-status-filter"
      aria-label="Filtrar por estado"
      value={status}
      onChange={handleChange}
      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:w-48"
    >
      <option value="">Todas</option>
      <option value="pending">Pendientes</option>
      <option value="paid">Pagadas</option>
    </select>
  );
}
