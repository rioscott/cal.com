import { PreviewBookingPage } from "./preview-booking";

export const metadata = { title: "Demo booking · Cal.com" };

export default async function BookingPreview({ searchParams }: { searchParams: Promise<{ uid?: string; moved?: string; start?: string; end?: string }> }) {
  const params = await searchParams;
  return <PreviewBookingPage uid={params.uid ?? "maya-chen"} moved={params.moved === "1"} start={params.start} end={params.end} />;
}
