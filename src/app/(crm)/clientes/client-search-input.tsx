'use client';

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export function ClientSearchInput() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("q", term);
    } else {
      params.delete("q");
    }
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="w-full max-w-xs">
      <label htmlFor="client-search" className="sr-only">
        Buscar clientes
      </label>
      <input
        id="client-search"
        type="search"
        data-testid="client-search-input"
        placeholder="Buscar por nombre o email..."
        defaultValue={searchParams.get("q")?.toString() ?? ""}
        onChange={(e) => handleSearch(e.target.value)}
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
      />
    </div>
  );
}
