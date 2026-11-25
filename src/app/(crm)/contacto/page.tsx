import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = { title: "Contacto · crm-demo" };

export default function ContactPage() {
  return (
    <>
      <PageHeader title="Contacto" />
      <div
        data-testid="contact-info"
        className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs max-w-xl"
      >
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Información de contacto
        </h2>
        <dl className="grid grid-cols-1 gap-y-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500 font-medium">Email</dt>
            <dd className="mt-1 text-slate-900 font-semibold">
              <a
                href="mailto:contacto@crm-demo.local"
                className="text-blue-700 hover:underline"
              >
                contacto@crm-demo.local
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-slate-500 font-medium">Teléfono</dt>
            <dd className="mt-1 text-slate-900 font-semibold">
              <a href="tel:+34910000000" className="text-blue-700 hover:underline">
                +34 910 000 000
              </a>
            </dd>
          </div>
        </dl>
      </div>
    </>
  );
}
