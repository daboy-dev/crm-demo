"use client";

import { useActionState, useState } from "react";
import { Button, ButtonLink } from "@/components/button";
import { Field, SelectField, TextareaField } from "@/components/field";
import { emptyFormState, type FormState } from "@/lib/forms";
import { formatEur, parseEurToCents } from "@/lib/money";
import { documentTotals } from "@/lib/totals";
import { TAX_RATES } from "./validation";

type Action = (prev: FormState, formData: FormData) => Promise<FormState>;

type Line = {
  key: number;
  description: string;
  quantity: string;
  unitPrice: string;
  taxRate: string;
};

let nextKey = 1;
const newLine = (): Line => ({
  key: nextKey++,
  description: "",
  quantity: "1",
  unitPrice: "",
  taxRate: "21",
});

export function QuoteForm({
  action,
  clients,
  defaultClientId,
  defaultIssuedAt,
}: {
  action: Action;
  clients: { id: number; name: string; company: string | null }[];
  defaultClientId?: string;
  defaultIssuedAt: string;
}) {
  const [state, formAction, pending] = useActionState(action, emptyFormState);
  const [lines, setLines] = useState<Line[]>(() => [newLine()]);

  const update = (key: number, patch: Partial<Line>) =>
    setLines((current) =>
      current.map((line) => (line.key === key ? { ...line, ...patch } : line)),
    );

  const totals = documentTotals(
    lines.map((line) => ({
      quantity: Math.max(0, Math.trunc(Number(line.quantity)) || 0),
      unitPrice: parseEurToCents(line.unitPrice) ?? 0,
      taxRate: Number(line.taxRate),
    })),
  );

  const errors = state.errors;
  const lineError = (i: number, field: string) => errors[`items.${i}.${field}`];

  return (
    <form action={formAction} className="space-y-6" data-testid="quote-form">
      <div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-2">
        <SelectField
          label="Cliente"
          name="clientId"
          defaultValue={state.values.clientId ?? defaultClientId ?? ""}
          error={errors.clientId}
          required
        >
          <option value="">Elige un cliente…</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.company
                ? `${client.name} (${client.company})`
                : client.name}
            </option>
          ))}
        </SelectField>
        <Field
          label="Fecha"
          name="issuedAt"
          type="date"
          defaultValue={state.values.issuedAt ?? defaultIssuedAt}
          error={errors.issuedAt}
          required
        />
        <div className="sm:col-span-2">
          <TextareaField
            label="Notas"
            name="notes"
            defaultValue={state.values.notes ?? ""}
            error={errors.notes}
          />
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Líneas</h2>
        {errors.items && (
          <p className="text-sm text-red-700" role="alert">
            {errors.items}
          </p>
        )}
        <ol className="space-y-3" data-testid="quote-items">
          {lines.map((line, i) => (
            <li
              key={line.key}
              className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_6rem_8rem_6rem_auto] sm:items-start"
              data-testid="quote-item-row"
            >
              <div className="col-span-2 sm:col-span-1">
                <Field
                  label="Descripción"
                  name="description"
                  value={line.description}
                  onChange={(e) =>
                    update(line.key, { description: e.target.value })
                  }
                  error={lineError(i, "description")}
                  data-testid={`item-${i}-description`}
                  required
                />
              </div>
              <Field
                label="Cantidad"
                name="quantity"
                type="number"
                min={1}
                step={1}
                inputMode="numeric"
                value={line.quantity}
                onChange={(e) => update(line.key, { quantity: e.target.value })}
                error={lineError(i, "quantity")}
                data-testid={`item-${i}-quantity`}
                required
              />
              <Field
                label="Precio (€)"
                name="unitPrice"
                inputMode="decimal"
                placeholder="0,00"
                value={line.unitPrice}
                onChange={(e) =>
                  update(line.key, { unitPrice: e.target.value })
                }
                error={lineError(i, "unitPrice")}
                data-testid={`item-${i}-unitPrice`}
                required
              />
              <SelectField
                label="IVA"
                name="taxRate"
                value={line.taxRate}
                onChange={(e) => update(line.key, { taxRate: e.target.value })}
                error={lineError(i, "taxRate")}
                data-testid={`item-${i}-taxRate`}
              >
                {TAX_RATES.map((rate) => (
                  <option key={rate} value={rate}>
                    {rate} %
                  </option>
                ))}
              </SelectField>
              <div className="flex items-end sm:pt-6">
                <Button
                  variant="secondary"
                  onClick={() =>
                    setLines((current) =>
                      current.filter((l) => l.key !== line.key),
                    )
                  }
                  disabled={lines.length === 1}
                  aria-label={`Quitar línea ${i + 1}`}
                  data-testid={`item-${i}-remove`}
                >
                  Quitar
                </Button>
              </div>
            </li>
          ))}
        </ol>
        <Button
          variant="secondary"
          onClick={() => setLines((current) => [...current, newLine()])}
          data-testid="add-item-button"
        >
          Añadir línea
        </Button>
      </section>

      <dl
        className="ml-auto max-w-xs space-y-1 text-sm"
        data-testid="quote-form-totals"
      >
        <div className="flex justify-between">
          <dt>Base imponible</dt>
          <dd>{formatEur(totals.subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>IVA</dt>
          <dd>{formatEur(totals.tax)}</dd>
        </div>
        <div className="flex justify-between text-base font-semibold">
          <dt>Total</dt>
          <dd>{formatEur(totals.total)}</dd>
        </div>
      </dl>

      <div className="flex gap-2">
        <Button type="submit" disabled={pending} data-testid="save-button">
          {pending ? "Guardando…" : "Guardar presupuesto"}
        </Button>
        <ButtonLink href="/presupuestos" variant="secondary">
          Cancelar
        </ButtonLink>
      </div>
    </form>
  );
}
