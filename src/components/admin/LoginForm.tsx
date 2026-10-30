"use client";

import { useActionState } from "react";
import { login } from "@/app/admin/actions";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(login, {});
  return (
    <form action={action} className="panel mt-6 space-y-4 p-5">
      {state.error && <p className="rounded border border-bad/50 bg-bad/10 px-3 py-2 text-sm" role="alert">{state.error}</p>}
      <input type="hidden" name="next" value={next ?? ""} />
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium">Password</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" autoFocus className="w-full rounded border border-line bg-bg-2 px-3 py-2 text-sm focus:border-accent/60 focus:outline-none" />
      </div>
      <button type="submit" disabled={pending} className="w-full rounded bg-accent px-4 py-2 font-medium text-accent-ink hover:brightness-110 disabled:opacity-60">
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
