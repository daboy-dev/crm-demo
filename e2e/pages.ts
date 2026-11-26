/**
 * Pages captured by `screenshots.spec.ts` on every preview, at 1280 px
 * (desktop project) and 390 px (mobile-390 project). The files are named
 * `<name>-<width>.jpg`. To capture a new page, add one line.
 *
 * - `path`: a page reached directly.
 * - `fromList` + `rowTestId`: a detail page, opened from the first row of a
 *   list so it does not depend on database ids.
 */
export type CapturedPage =
  | { name: string; path: string }
  | { name: string; fromList: string; rowTestId: string };

export const pages: CapturedPage[] = [
  { name: "resumen", path: "/resumen" },
  { name: "clientes", path: "/clientes" },
  { name: "presupuestos", path: "/presupuestos" },
  { name: "facturas", path: "/facturas" },
  { name: "contacto", path: "/contacto" },
  { name: "cliente-detalle", fromList: "/clientes", rowTestId: "client-row" },
  {
    name: "presupuesto-detalle",
    fromList: "/presupuestos",
    rowTestId: "quote-row",
  },
];
