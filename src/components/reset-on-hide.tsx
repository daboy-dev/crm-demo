"use client";

import { Fragment, useLayoutEffect, useState, type ReactNode } from "react";

/**
 * Next.js keeps visited pages mounted but hidden (React <Activity>), so a
 * form would keep its typed values, errors and lines when the user comes
 * back. Wrapping it here remounts it fresh every time its page is hidden.
 * See node_modules/next/dist/docs/01-app/02-guides/preserving-ui-state.md.
 */
export function ResetOnHide({ children }: { children: ReactNode }) {
  const [generation, setGeneration] = useState(0);
  useLayoutEffect(() => () => setGeneration((g) => g + 1), []);
  return <Fragment key={generation}>{children}</Fragment>;
}
