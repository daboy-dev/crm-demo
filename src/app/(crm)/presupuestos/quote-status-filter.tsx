"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function QuoteStatusFilter({ value }: { value: string }) {
  const router = useRouter();
  const [status, setStatus] = useState(value);
  const [, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    setStatus(next);
    startTransition(() => {
      router.replace(
        next
          ? `/presupuestos?status=${encodeURIComponent(next)}`
          : "/presupuestos",
      );
    });
  }

  return (
    <select
      data-testid="quote-status-filter-simulated"
      aria-label="Filtrar por estado"
      value={status}
      onChange={handleChange}
      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:w-48"
    >
      <option value="">Todos</option>
      <option value="draft">Borrador</option>
      <option value="sent">Enviado</option>
      <option value="accepted">Aceptado</option>
      <option value="rejected">Rechazado</option>
    </select>
  );
}
