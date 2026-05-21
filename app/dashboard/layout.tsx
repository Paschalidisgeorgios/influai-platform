import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div>

      <Link
        href="/dashboard/characters"
        className="flex items-center justify-between rounded-2xl px-4 py-4 transition hover:bg-white/5"
      >

        Characters

      </Link>

      {children}

    </div>
  );
}