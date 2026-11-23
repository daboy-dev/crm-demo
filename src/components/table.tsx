import type { ComponentProps } from "react";

/**
 * Minimal table. On narrow screens it scrolls horizontally; hide secondary
 * columns with `className="hidden sm:table-cell"` on both Th and Td.
 */
export function Table({ className = "", ...props }: ComponentProps<"table">) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table
        className={`min-w-full divide-y divide-slate-200 text-sm ${className}`}
        {...props}
      />
    </div>
  );
}

export function Th({ className = "", ...props }: ComponentProps<"th">) {
  return (
    <th
      scope="col"
      className={`bg-slate-50 px-3 py-2 text-left font-medium whitespace-nowrap text-slate-600 ${className}`}
      {...props}
    />
  );
}

export function Td({ className = "", ...props }: ComponentProps<"td">) {
  return <td className={`px-3 py-2 align-top ${className}`} {...props} />;
}

export function Tr({ className = "", ...props }: ComponentProps<"tr">) {
  return <tr className={`hover:bg-slate-50 ${className}`} {...props} />;
}

export function EmptyRow({
  colSpan,
  children,
}: {
  colSpan: number;
  children: React.ReactNode;
}) {
  return (
    <tr data-testid="empty-row">
      <td colSpan={colSpan} className="px-3 py-6 text-center text-slate-500">
        {children}
      </td>
    </tr>
  );
}
