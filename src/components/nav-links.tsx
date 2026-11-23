"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const NAV_ITEMS = [
  { href: "/clientes", label: "Clientes" },
  { href: "/presupuestos", label: "Presupuestos" },
  { href: "/facturas", label: "Facturas" },
] as const;

const linkClass = "rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap";

export function NavLinks() {
  const pathname = usePathname();
  return NAV_ITEMS.map((item) => {
    const active = pathname.startsWith(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        data-testid={`nav-${item.href.slice(1)}`}
        aria-current={active ? "page" : undefined}
        className={`${linkClass} ${active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-200"}`}
      >
        {item.label}
      </Link>
    );
  });
}

/** Rendered while the pathname is not known yet. */
export function NavLinksFallback() {
  return NAV_ITEMS.map((item) => (
    <Link
      key={item.href}
      href={item.href}
      className={`${linkClass} text-slate-700`}
    >
      {item.label}
    </Link>
  ));
}
