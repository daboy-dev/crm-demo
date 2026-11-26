"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

export function ClientTypeFilter({ value }: { value: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [type, setType] = useState(value);
  const [, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    setType(next);
    const params = new URLSearchParams(searchParams.toString());
    if (next) {
      params.set("tipo", next);
    } else {
      params.delete("tipo");
    }
    const qs = params.toString();
    startTransition(() => {
      router.replace(qs ? `/clientes?${qs}` : "/clientes");
    });
  }

  return (
    <select
      data-testid="client-type-filter"
      aria-label="Filtrar por tipo"
      value={type}
      onChange={handleChange}
      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:w-40"
    >
      <option value="">Todos</option>
      <option value="individual">Particular</option>
      <option value="company">Empresa</option>
    </select>
  );
}
