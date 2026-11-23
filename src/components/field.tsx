import type { ComponentProps, ReactNode } from "react";

const control =
  "block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-xs focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600";

function Label({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | undefined;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
      {error && <span className="block text-sm text-red-700">{error}</span>}
    </label>
  );
}

type WithLabel = { label: string; error?: string | undefined };

/** Text input with label. `data-testid` defaults to `field-<name>`. */
export function Field({
  label,
  error,
  className = "",
  ...props
}: ComponentProps<"input"> & WithLabel) {
  return (
    <Label label={label} error={error}>
      <input
        data-testid={props.name ? `field-${props.name}` : undefined}
        aria-invalid={error ? true : undefined}
        className={`${control} ${className}`}
        {...props}
      />
    </Label>
  );
}

export function SelectField({
  label,
  error,
  className = "",
  children,
  ...props
}: ComponentProps<"select"> & WithLabel) {
  return (
    <Label label={label} error={error}>
      <select
        data-testid={props.name ? `field-${props.name}` : undefined}
        aria-invalid={error ? true : undefined}
        className={`${control} ${className}`}
        {...props}
      >
        {children}
      </select>
    </Label>
  );
}

export function TextareaField({
  label,
  error,
  className = "",
  ...props
}: ComponentProps<"textarea"> & WithLabel) {
  return (
    <Label label={label} error={error}>
      <textarea
        data-testid={props.name ? `field-${props.name}` : undefined}
        aria-invalid={error ? true : undefined}
        className={`${control} ${className}`}
        rows={3}
        {...props}
      />
    </Label>
  );
}
