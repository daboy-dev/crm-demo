"use client";

import { useActionState } from "react";
import { Button } from "@/components/button";
import { Field } from "@/components/field";
import { login, type LoginState } from "./actions";

const initialState: LoginState = { error: null };

export function LoginForm() {
  const [state, action, pending] = useActionState(login, initialState);

  return (
    <form action={action} className="space-y-4" data-testid="login-form">
      <Field label="Usuario" name="user" autoComplete="username" required />
      <Field
        label="Contraseña"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />
      {state.error && (
        <p
          role="alert"
          className="text-sm text-red-700"
          data-testid="login-error"
        >
          {state.error}
        </p>
      )}
      <Button
        type="submit"
        disabled={pending}
        className="w-full"
        data-testid="login-submit"
      >
        {pending ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
