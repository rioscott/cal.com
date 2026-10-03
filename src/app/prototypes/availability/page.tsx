import { StatePicker } from "./state-picker";
import "./picker.css";

export const metadata = { title: "Availability states · Cal.com" };

export default async function AvailabilityStates({ searchParams }: { searchParams: Promise<{ v?: string }> }) {
  const params = await searchParams;
  const index = Number(params.v);
  return <StatePicker initialIndex={Number.isInteger(index) && index >= 1 && index <= 6 ? index - 1 : 0} />;
}
