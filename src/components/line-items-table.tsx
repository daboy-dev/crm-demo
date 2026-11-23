import { formatEur } from "@/lib/money";
import { documentTotals, lineTotals, type LineInput } from "@/lib/totals";
import { Table, Td, Th, Tr } from "./table";

type Line = LineInput & { id: number; description: string };

/** Lines of a quote or invoice with base, IVA and total. */
export function LineItemsTable({ items }: { items: Line[] }) {
  const totals = documentTotals(items);
  return (
    <div className="space-y-3">
      <Table data-testid="items-table">
        <thead>
          <tr>
            <Th>Descripción</Th>
            <Th className="text-right">Cant.</Th>
            <Th className="hidden text-right sm:table-cell">Precio</Th>
            <Th className="hidden text-right sm:table-cell">IVA</Th>
            <Th className="text-right">Importe</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((item) => (
            <Tr key={item.id} data-testid="item-row" data-id={item.id}>
              <Td>{item.description}</Td>
              <Td className="text-right">{item.quantity}</Td>
              <Td className="hidden text-right whitespace-nowrap sm:table-cell">
                {formatEur(item.unitPrice)}
              </Td>
              <Td className="hidden text-right sm:table-cell">
                {item.taxRate} %
              </Td>
              <Td className="text-right whitespace-nowrap">
                {formatEur(lineTotals(item).subtotal)}
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>
      <dl className="ml-auto max-w-xs space-y-1 text-sm" data-testid="totals">
        <div className="flex justify-between">
          <dt>Base imponible</dt>
          <dd data-testid="total-subtotal">{formatEur(totals.subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>IVA</dt>
          <dd data-testid="total-tax">{formatEur(totals.tax)}</dd>
        </div>
        <div className="flex justify-between text-base font-semibold">
          <dt>Total</dt>
          <dd data-testid="total-total">{formatEur(totals.total)}</dd>
        </div>
      </dl>
    </div>
  );
}
