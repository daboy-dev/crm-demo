import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { ButtonLink } from "@/components/button";
import { Loading, PageHeader } from "@/components/page-header";
import { EmptyRow, Table, Td, Th, Tr } from "@/components/table";
import { listClients } from "./queries";

export const metadata: Metadata = { title: "Clientes · crm-demo" };

export default function ClientsPage() {
  return (
    <>
      <PageHeader
        title="Clientes"
        actions={
          <ButtonLink href="/clientes/nuevo" data-testid="new-client-button">
            Nuevo cliente
          </ButtonLink>
        }
      />
      <Suspense fallback={<Loading />}>
        <ClientsTable />
      </Suspense>
    </>
  );
}

async function ClientsTable() {
  // Read the database at request time, never at build time.
  await connection();
  const clients = await listClients();
  return (
    <Table data-testid="clients-table">
      <thead>
        <tr>
          <Th>Nombre</Th>
          <Th className="hidden sm:table-cell">Empresa</Th>
          <Th className="hidden md:table-cell">Email</Th>
          <Th className="hidden md:table-cell">Teléfono</Th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {clients.length === 0 && (
          <EmptyRow colSpan={4}>Todavía no hay clientes.</EmptyRow>
        )}
        {clients.map((client) => (
          <Tr key={client.id} data-testid="client-row" data-id={client.id}>
            <Td>
              <Link
                href={`/clientes/${client.id}`}
                className="font-medium text-blue-700 hover:underline"
              >
                {client.name}
              </Link>
              <div className="text-xs text-slate-500 sm:hidden">
                {client.company ?? client.email}
              </div>
            </Td>
            <Td className="hidden sm:table-cell">{client.company ?? "—"}</Td>
            <Td className="hidden md:table-cell">{client.email}</Td>
            <Td className="hidden whitespace-nowrap md:table-cell">
              {client.phone ?? "—"}
            </Td>
          </Tr>
        ))}
      </tbody>
    </Table>
  );
}
