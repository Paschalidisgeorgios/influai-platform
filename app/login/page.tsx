import { redirect } from "next/navigation";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  qs.set("mode", "login");

  if (typeof params.reason === "string") qs.set("reason", params.reason);
  if (typeof params.package === "string") qs.set("package", params.package);
  if (typeof params.error === "string") qs.set("error", params.error);

  redirect(`/auth?${qs.toString()}`);
}
