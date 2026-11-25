import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value));

export const clientFields = [
  "name",
  "email",
  "nif",
  "phone",
  "company",
] as const;

export const clientSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Introduce un email válido.")),
  nif: optionalText,
  phone: optionalText,
  company: optionalText,
});

export type ClientInput = z.infer<typeof clientSchema>;
