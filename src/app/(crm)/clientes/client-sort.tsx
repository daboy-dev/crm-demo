"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

export function ClientSort({ value }: { value: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orden, setOrden] = useState(value);
  const [, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    setOrden(next);
    const params = new URLSearchParams(searchParams.toString());
    params.set("orden", next);
    const qs = params.toString();
    startTransition(() => {
      router.replace(`/clientes?${qs}`);
    });
  }

  return (
    <select
      data-testid="client-sort-select"
      aria-label="Ordenar clientes"
      value={orden}
      onChange={handleChange}
      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:w-64"
    >
      <option value="nombre">Nombre (A-Z)</option>
      <option value="recientes">Fecha de alta (más recientes primero)</option>
    </select>
  );
}
