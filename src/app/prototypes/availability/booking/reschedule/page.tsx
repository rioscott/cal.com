import { ReschedulePage } from "@/components/reschedule-page";

export default async function Page({ searchParams }: { searchParams: Promise<{ uid?: string }> }) {
  const { uid } = await searchParams;
  return <ReschedulePage uid={uid ?? "maya-chen"} preview />;
}
