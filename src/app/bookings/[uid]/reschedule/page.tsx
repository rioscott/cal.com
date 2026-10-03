import { ReschedulePage } from "@/components/reschedule-page";

export default async function Page({ params }: { params: Promise<{ uid: string }> }) {
  const { uid } = await params;
  return <ReschedulePage uid={uid} />;
}
