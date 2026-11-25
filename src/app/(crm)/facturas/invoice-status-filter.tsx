"client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

export function InvoiceStatusFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState(searchParams.get("estado") ?? "");
  const [, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    setStatus(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("estado", value);
    } else {
      params.delete("estado");
    }
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `/facturas?${qs}` : "/facturas");
    });
  }

  return (
    <select
      data-testid="invoice-status-filter"
      aria-label="Filtrar por estado"
      value={status}
      onChange={handleChange}
      className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <option value="">Todas</option>
      <option value="pending">Pendientes</option>
      <option value="paid">Pagadas</option>
    </select>
  );
}
