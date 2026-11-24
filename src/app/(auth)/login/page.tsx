import type { Metadata } from "next";
import { ResetOnHide } from "@/components/reset-on-hide";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Iniciar sesión · crm-demo" };

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="mb-1 text-xl font-semibold">crm-demo</h1>
        <p className="mb-6 text-sm text-slate-600">
          Inicia sesión con el usuario de demo para entrar al CRM.
        </p>
        <ResetOnHide>
          <LoginForm />
        </ResetOnHide>
      </div>
    </main>
  );
}
