import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { ButtonLink } from "@/components/button";
import { Loading, PageHeader } from "@/components/page-header";
import { EmptyRow, Table, Td, Th, Tr } from "@/components/table";
import { ClientSearch } from "./client-search";
import { ClientSort } from "./client-sort";
import { ClientTypeFilter } from "./client-type-filter";
import { listClients } from "./queries";

export const metadata: Metadata = { title: "Clientes · crm-demo" };

type SearchParams = Promise<{ search?: string; tipo?: string; orden?: string }>;

export default function ClientsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <>
      <PageHeader
        title="Clientes"
        actions={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <Suspense fallback={null}>
              <ClientSearch />
              <TypeFilter searchParams={searchParams} />
              <SortSelect searchParams={searchParams} />
            </Suspense>
            <ButtonLink href="/clientes/nuevo" data-testid="new-client-button">
              Nuevo cliente
            </ButtonLink>
          </div>
        }
      />
      <Suspense fallback={<Loading />}>
        <ClientsTable searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function TypeFilter({ searchParams }: { searchParams: SearchParams }) {
  const { tipo = "" } = await searchParams;
  return <ClientTypeFilter value={tipo} />;
}

async function SortSelect({ searchParams }: { searchParams: SearchParams }) {
  const { orden } = await searchParams;
  return <ClientSort value={orden === "recientes" ? "recientes" : "nombre"} />;
}

async function ClientsTable({ searchParams }: { searchParams: SearchParams }) {
  const { search = "", tipo = "", orden = "" } = await searchParams;
  await connection();
  const type = tipo === "individual" || tipo === "company" ? tipo : undefined;
  const allClients = await listClients(
    type,
    orden === "recientes" ? "recientes" : "nombre",
  );
  const query = search.trim().toLowerCase();

  const clients = allClients.filter(
    (client) =>
      client.name.toLowerCase().includes(query) ||
      client.email.toLowerCase().includes(query),
  );

  return (
    <Table data-testid="clients-table">
      <thead>
        <tr>
          <Th>Nombre</Th>
          <Th className="hidden sm:table-cell">Tipo</Th>
          <Th className="hidden sm:table-cell">NIF</Th>
          <Th className="hidden sm:table-cell">Empresa</Th>
          <Th className="hidden md:table-cell">Email</Th>
          <Th className="hidden md:table-cell">Teléfono</Th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {clients.length === 0 && (
          <EmptyRow colSpan={6}>No se encontraron clientes.</EmptyRow>
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
            <Td className="hidden sm:table-cell">
              {client.type === "company" ? "Empresa" : "Particular"}
            </Td>
            <Td className="hidden whitespace-nowrap sm:table-cell">
              {client.nif ?? "—"}
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
