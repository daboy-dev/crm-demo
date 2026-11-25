import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { ButtonLink } from "@/components/button";
import { Loading, PageHeader } from "@/components/page-header";
import { EmptyRow, Table, Td, Th, Tr } from "@/components/table";
import { listClients } from "./queries";

export const metadata: Metadata = { title: "Clientes · crm-demo" };

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const params = await searchParams;
  const search = params.search ?? "";

  return (
    <>
      <PageHeader
        title="Clientes"
        actions={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <ClientSearch initialSearch={search} />
            <ButtonLink href="/clientes/nuevo" data-testid="new-client-button">
              Nuevo cliente
            </ButtonLink>
          </div>
        }
      />
      <Suspense fallback={<Loading />}>
        <ClientsTable search={search} />
      </Suspense>
    </>
  );
}

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "";

function ClientSearch({ initialSearch }: { initialSearch: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialSearch);
  const [_, startTransition] = useTransition();

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      const params = new URLSearchParams(searchParams.toString());
      if (search.trim()) {
        params.set("search", search.trim());
      } else {
        params.delete("search");
      }
      startTransition(() => {
        router.push(`/clientes?${params.toString()}`);
      });
    }
  }

  return (
    <input
      type="text"
      data-testid="client-search-input"
      placeholder="Buscar por nombre o email"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      onKeyDown={handleKeyDown}
      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:w-64"
    />
  );
}

async function ClientsTable({ search }: { search: string }) {
  await connection();
  const allClients = await listClients();
  const query = search.toLowerCase();

  const clients = allClients.filter(
    (client) =>
      client.name.toLowerCase().includes(query) ||
      client.email.toLowerCase().includes(query)
  );

  return (
    <Table data-testid="clients-table">
      <thead>
        <tr>
          <Th>Nombre</Th>
          <Th className="hidden sm:table-cell">NIF</Th>
          <Th className="hidden sm:table-cell">Empresa</Th>
          <Th className="hidden md:table-cell">Email</Th>
          <Th className="hidden md:table-cell">Teléfono</Th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {clients.length === 0 && (
          <EmptyRow colSpan={5}>No se encontraron clientes.</EmptyRow>
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

export const simulatedTypeError: number = "pr-check debe devolver este error";
