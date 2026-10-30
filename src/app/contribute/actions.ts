"use server";

import { headers } from "next/headers";
import { getItem } from "@/lib/data";
import { parseRequestForm, type FieldErrors } from "@/lib/requests";
import { allowSubmission, createRequest } from "@/lib/requests-store";

export interface SubmitState {
  ok?: boolean;
  id?: string;
  message?: string;
  errors?: FieldErrors;
  /** echoed back so the form can restore what the user typed (React resets forms after an action) */
  values?: Record<string, string>;
}

const echo = (form: FormData) =>
  Object.fromEntries(["itemName", "field", "currentValue", "proposedValue", "details", "sourceUrl", "contact"].map((k) => [k, String(form.get(k) ?? "")]));

export async function submitRequest(_prev: SubmitState, form: FormData): Promise<SubmitState> {
  // Honeypot: real users never see or fill this field.
  if (typeof form.get("website") === "string" && form.get("website")) return { ok: true, id: "—" };

  const h = await headers();
  const client = h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "local";
  if (!allowSubmission(client)) {
    return { message: "You have sent several requests in a short time. Please wait a few minutes and try again.", values: echo(form) };
  }

  const { data, errors } = parseRequestForm(form, (id) => Boolean(getItem(id)));
  if (!data) return { errors, message: "Please fix the highlighted fields.", values: echo(form) };

  try {
    const saved = await createRequest(data);
    return { ok: true, id: saved.id };
  } catch (e) {
    console.error("Failed to save contribution request", e);
    return { message: "Your request could not be saved right now. Please try again later.", values: echo(form) };
  }
}
