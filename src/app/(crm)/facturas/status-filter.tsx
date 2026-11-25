"use client";

import { usePathname, useRouter } from "next/navigation";

export function StatusFilter({ current }: { current: string }) {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <div className="mb-4 flex items-center gap-2 text-sm">
      <label htmlFor="invoice-status" className="text-slate-600">
        Estado
      </label>
      <select
        id="invoice-status"
        name="status"
        data-testid="field-status"
        key={current}
        defaultValue={current}
        onChange={(event) => {
          const value = event.target.value;
          router.push(value ? `${pathname}?status=${value}` : pathname);
        }}
        className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
      >
        <option value="">Todas</option>
        <option value="pending">Pendientes</option>
        <option value="paid">Pagadas</option>
      </select>
    </div>
  );
}
