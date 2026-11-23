import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { logout } from "@/app/(auth)/login/actions";
import { NavLinks, NavLinksFallback } from "./nav-links";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
          <Link href="/clientes" className="text-lg font-semibold">
            crm-demo
          </Link>
          <nav
            className="order-last -mx-1 flex w-full gap-1 overflow-x-auto sm:order-none sm:w-auto"
            data-testid="main-nav"
          >
            <Suspense fallback={<NavLinksFallback />}>
              <NavLinks />
            </Suspense>
          </nav>
          <form action={logout} className="ml-auto">
            <button
              type="submit"
              className="text-sm text-slate-600 hover:text-slate-900"
              data-testid="logout-button"
            >
              Salir
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
