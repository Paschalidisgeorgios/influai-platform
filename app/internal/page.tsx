import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminDebugConsole } from "@/app/components/admin/AdminDebugConsole";
import { getAdminUser, getServerSessionUser } from "@/app/lib/admin/guards";
import {
  getAdminActionRegistryRows,
  getAdminEngineRegistryRows,
  getAdminRecentCreditEvents,
  getAdminRecentGenerationJobs,
} from "@/app/lib/admin/queries";
import {
  getAdminModelInventoryRows,
  getAdminModelInventorySummary,
} from "@/app/lib/admin/model-inventory-view";

export const dynamic = "force-dynamic";

function AccessDenied() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="max-w-md space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
        <h1 className="text-2xl font-semibold text-white">Access denied</h1>
        <p className="text-sm text-white/60">
          This internal console is restricted to authorized launch operators.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black"
        >
          Back to studio
        </Link>
      </div>
    </main>
  );
}

export default async function InternalAdminPage() {
  const sessionUser = await getServerSessionUser();
  if (!sessionUser) {
    redirect("/auth?mode=login&next=/internal");
  }

  const adminUser = await getAdminUser();
  if (!adminUser?.email) {
    return <AccessDenied />;
  }

  const [engines, actions, jobs, creditEvents, inventory, inventorySummary] =
    await Promise.all([
    Promise.resolve(getAdminEngineRegistryRows()),
    Promise.resolve(getAdminActionRegistryRows()),
    getAdminRecentGenerationJobs(50),
    getAdminRecentCreditEvents(50),
    Promise.resolve(getAdminModelInventoryRows()),
    Promise.resolve(getAdminModelInventorySummary()),
  ]);

  return (
    <main className="p-6 md:p-8">
      <AdminDebugConsole
        adminEmail={adminUser.email}
        engines={engines}
        actions={actions}
        jobs={jobs}
        creditEvents={creditEvents}
        inventory={inventory}
        inventorySummary={inventorySummary}
      />
    </main>
  );
}
