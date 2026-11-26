"use client";

import { useActionState } from "react";
import { Button, ButtonLink } from "@/components/button";
import { Field, SelectField, TextareaField } from "@/components/field";
import { emptyFormState, type FormState } from "@/lib/forms";

type Action = (prev: FormState, formData: FormData) => Promise<FormState>;

export function ClientForm({
  action,
  initial,
  cancelHref,
}: {
  action: Action;
  initial?: Record<string, string>;
  cancelHref: string;
}) {
  const [state, formAction, pending] = useActionState(action, emptyFormState);
  const value = (name: string) => state.values[name] ?? initial?.[name] ?? "";

  return (
    <form
      action={formAction}
      className="max-w-xl space-y-4 rounded-lg border border-slate-200 bg-white p-4"
      data-testid="client-form"
    >
      <Field
        label="Nombre"
        name="name"
        defaultValue={value("name")}
        error={state.errors.name}
        required
      />
      <Field
        label="Email"
        name="email"
        type="email"
        defaultValue={value("email")}
        error={state.errors.email}
        required
      />
      <SelectField
        label="Tipo"
        name="type"
        defaultValue={value("type") || "individual"}
        error={state.errors.type}
      >
        <option value="individual">Particular</option>
        <option value="company">Empresa</option>
      </SelectField>
      <Field
        label="NIF"
        name="nif"
        defaultValue={value("nif")}
        error={state.errors.nif}
      />
      <Field
        label="Teléfono"
        name="phone"
        type="tel"
        defaultValue={value("phone")}
        error={state.errors.phone}
      />
      <Field
        label="Empresa"
        name="company"
        defaultValue={value("company")}
        error={state.errors.company}
      />
      <TextareaField
        label="Notas internas"
        name="notes"
        defaultValue={value("notes")}
        error={state.errors.notes}
      />
      <div className="flex gap-2">
        <Button type="submit" disabled={pending} data-testid="save-button">
          {pending ? "Guardando…" : "Guardar"}
        </Button>
        <ButtonLink href={cancelHref} variant="secondary">
          Cancelar
        </ButtonLink>
      </div>
    </form>
  );
}
