"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  getAuthSecret,
  safeEqual,
} from "@/lib/auth";

export type LoginState = { error: string | null; user: string };

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const secret = getAuthSecret();
  const user = String(formData.get("user") ?? "");
  const password = String(formData.get("password") ?? "");
  const expectedUser = process.env.DEMO_USER ?? "";
  const expectedPassword = process.env.DEMO_PASSWORD ?? "";

  // Evaluate both checks so timing does not reveal which one failed.
  const [userOk, passwordOk] = await Promise.all([
    safeEqual(user, expectedUser, secret),
    safeEqual(password, expectedPassword, secret),
  ]);
  if (!expectedUser || !expectedPassword || !userOk || !passwordOk) {
    return { error: "Usuario o contraseña incorrectos.", user };
  }

  (await cookies()).set(
    SESSION_COOKIE,
    await createSessionToken(user, secret),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    },
  );
  redirect("/clientes");
}

export async function logout(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}
