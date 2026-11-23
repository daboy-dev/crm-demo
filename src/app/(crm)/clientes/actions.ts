"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/db/client";
import { uniqueViolation } from "@/db/errors";
import { clients } from "@/db/schema";
import { fieldErrors, formValues, type FormState } from "@/lib/forms";
import { clientFields, clientSchema } from "./validation";

const DUPLICATE_EMAIL = "Ya existe un cliente con ese email.";

export async function createClient(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = formValues(formData, clientFields);
  const parsed = clientSchema.safeParse(values);
  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error), values };
  }

  let id: number;
  try {
    const [row] = await getDb()
      .insert(clients)
      .values(parsed.data)
      .returning({ id: clients.id });
    if (!row) throw new Error("Insert returned no row");
    id = row.id;
  } catch (error) {
    if (uniqueViolation(error) === "clients_email_unique") {
      return { errors: { email: DUPLICATE_EMAIL }, values };
    }
    throw error;
  }

  revalidatePath("/clientes");
  redirect(`/clientes/${id}`);
}

export async function updateClient(
  id: number,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = formValues(formData, clientFields);
  const parsed = clientSchema.safeParse(values);
  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error), values };
  }

  try {
    await getDb().update(clients).set(parsed.data).where(eq(clients.id, id));
  } catch (error) {
    if (uniqueViolation(error) === "clients_email_unique") {
      return { errors: { email: DUPLICATE_EMAIL }, values };
    }
    throw error;
  }

  revalidatePath("/clientes");
  revalidatePath(`/clientes/${id}`);
  redirect(`/clientes/${id}`);
}
