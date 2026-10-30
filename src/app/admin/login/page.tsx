import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/LoginForm";
import { adminConfigured } from "@/lib/admin-auth";

export const metadata: Metadata = { title: "Editor sign-in", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <div className="mx-auto max-w-sm py-12">
      <p className="eyebrow mb-2">Back office</p>
      <h1 className="font-display text-4xl font-bold uppercase tracking-wide">Editor sign-in</h1>
      {adminConfigured() ? (
        <LoginForm next={next} />
      ) : (
        <div className="panel mt-6 p-4 text-sm text-ink-2" role="alert">
          The back office is disabled because <code>ADMIN_PASSWORD</code> and <code>ADMIN_SESSION_SECRET</code> (32+ characters) are not set.
          Add them to <code>.env.local</code> and restart the server.
        </div>
      )}
    </div>
  );
}
