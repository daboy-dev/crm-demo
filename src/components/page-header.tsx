import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold" data-testid="page-title">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-slate-600">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

/** Label/value list for detail pages. */
export function DetailList({
  items,
}: {
  items: { label: string; value: ReactNode; testId?: string }[];
}) {
  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-3 rounded-lg border border-slate-200 bg-white p-4 text-sm sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label}>
          <dt className="text-slate-500">{item.label}</dt>
          <dd className="font-medium break-words" data-testid={item.testId}>
            {item.value ?? "—"}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function Loading() {
  return (
    <p className="py-6 text-sm text-slate-500" data-testid="loading">
      Cargando…
    </p>
  );
}
