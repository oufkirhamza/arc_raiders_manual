"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { SESSION_COOKIE, SESSION_TTL_S, checkPassword, createSessionToken, verifySessionToken } from "@/lib/admin-auth";
import { REQUEST_STATUSES, type RequestStatus } from "@/lib/requests";
import { allowSubmission, deleteRequest, updateRequest } from "@/lib/requests-store";

/** Defence in depth: middleware guards /admin pages, but every action re-checks the session. */
async function requireAdmin() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!(await verifySessionToken(token))) redirect("/admin/login");
}

export async function login(_prev: { error?: string }, form: FormData): Promise<{ error?: string }> {
  const h = await headers();
  const client = h.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (!allowSubmission(`login:${client}`, 8, 15 * 60 * 1000)) return { error: "Too many attempts. Try again in 15 minutes." };

  const password = form.get("password");
  if (typeof password !== "string" || !(await checkPassword(password))) return { error: "Incorrect password." };

  (await cookies()).set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production" && !process.env.ADMIN_ALLOW_HTTP,
    path: "/",
    maxAge: SESSION_TTL_S,
  });
  const next = form.get("next");
  redirect(typeof next === "string" && next.startsWith("/admin") ? next : "/admin");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}

export async function saveRequest(form: FormData) {
  await requireAdmin();
  const id = String(form.get("id") ?? "");
  const status = form.get("status");
  const notes = form.get("adminNotes");
  await updateRequest(id, {
    status: typeof status === "string" && status in REQUEST_STATUSES ? (status as RequestStatus) : undefined,
    adminNotes: typeof notes === "string" ? notes : undefined,
  });
  revalidatePath("/admin");
  redirect(`/admin/requests/${encodeURIComponent(id)}?saved=1`);
}

export async function setStatus(form: FormData) {
  await requireAdmin();
  const id = String(form.get("id") ?? "");
  const status = String(form.get("status") ?? "");
  if (status in REQUEST_STATUSES) await updateRequest(id, { status: status as RequestStatus });
  revalidatePath("/admin");
}

export async function removeRequest(form: FormData) {
  await requireAdmin();
  if (form.get("confirm") !== "yes") redirect(`/admin/requests/${encodeURIComponent(String(form.get("id")))}?confirm=1`);
  await deleteRequest(String(form.get("id") ?? ""));
  revalidatePath("/admin");
  redirect("/admin?deleted=1");
}
