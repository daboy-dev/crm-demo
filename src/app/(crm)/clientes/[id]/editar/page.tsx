import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ResetOnHide } from "@/components/reset-on-hide";
import { Loading, PageHeader } from "@/components/page-header";
import { parseId } from "@/lib/ids";
import { updateClient } from "../../actions";
import { ClientForm } from "../../client-form";
import { getClient } from "../../queries";

export default function EditClientPage({
  params,
}: PageProps<"/clientes/[id]/editar">) {
  return (
    <Suspense fallback={<Loading />}>
      <EditClient params={params} />
    </Suspense>
  );
}

async function EditClient({
  params,
}: {
  params: PageProps<"/clientes/[id]/editar">["params"];
}) {
  const id = parseId((await params).id);
  const client = id ? await getClient(id) : null;
  if (!client) notFound();

  return (
    <>
      <PageHeader title={`Editar ${client.name}`} />
      <ResetOnHide>
        <ClientForm
          action={updateClient.bind(null, client.id)}
          cancelHref={`/clientes/${client.id}`}
          initial={{
            name: client.name,
            email: client.email,
            phone: client.phone ?? "",
            company: client.company ?? "",
          }}
        />
      </ResetOnHide>
    </>
  );
}
