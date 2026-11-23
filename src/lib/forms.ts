import type { z } from "zod";

/** State returned by form server actions and read with useActionState. */
export type FormState = {
  /** Field name → error message (in Spanish). `_form` for general errors. */
  errors: Record<string, string>;
  /** Submitted values, so the form can show them again after an error. */
  values: Record<string, string>;
};

export const emptyFormState: FormState = { errors: {}, values: {} };

/** Flattens Zod issues into one message per field (the first one). */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form";
    errors[key] ??= issue.message;
  }
  return errors;
}

/** Reads string fields from FormData. */
export function formValues(
  formData: FormData,
  names: readonly string[],
): Record<string, string> {
  return Object.fromEntries(
    names.map((name) => [name, String(formData.get(name) ?? "")]),
  );
}
