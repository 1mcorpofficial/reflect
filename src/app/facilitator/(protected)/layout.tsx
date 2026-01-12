import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";

export default async function FacilitatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value ?? null;
  const session = token ? verifySession(token) : null;

  if (!session || (session.role !== "facilitator" && session.role !== "admin")) {
    redirect("/facilitator/login");
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="page-shell flex max-w-6xl flex-col gap-6 pb-10 pt-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Fasilitatoriaus režimas
            </p>
            <h1 className="text-xl font-semibold">Reflectus</h1>
          </div>
          <nav className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <Link className="hover:text-foreground" href="/facilitator">
              Grupės
            </Link>
            <Link className="hover:text-foreground" href="/dashboard">
              Analytics
            </Link>
          </nav>
        </header>
        {children}
      </div>
    </div>
  );
}
