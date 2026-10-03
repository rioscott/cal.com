import { BookingPage } from "@/components/booking-page";

export default async function Page({ params }: { params: Promise<{ uid: string }> }) {
  const { uid } = await params;
  return <BookingPage uid={uid} />;
}
