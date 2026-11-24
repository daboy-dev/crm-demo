import type { Metadata } from "next";
import { ResetOnHide } from "@/components/reset-on-hide";
import { PageHeader } from "@/components/page-header";
import { createClient } from "../actions";
import { ClientForm } from "../client-form";

export const metadata: Metadata = { title: "Nuevo cliente · crm-demo" };

export default function NewClientPage() {
  return (
    <>
      <PageHeader title="Nuevo cliente" />
      <ResetOnHide>
        <ClientForm action={createClient} cancelHref="/clientes" />
      </ResetOnHide>
    </>
  );
}
