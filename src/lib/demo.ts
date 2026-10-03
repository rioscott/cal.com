export const TIME_ZONE = "Asia/Makassar";
export const DEMO_NOW = new Date("2026-09-23T12:00:00+08:00");
export const SCHEDULE_KEY = "cal-prototype-schedule-v1";
export const BOOKINGS_KEY = "cal-prototype-bookings-v1";

export type DayName =
  | "Sunday" | "Monday" | "Tuesday" | "Wednesday"
  | "Thursday" | "Friday" | "Saturday";

export const DAYS: DayName[] = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

export type TimeRange = { start: string; end: string };
export type Schedule = Record<DayName, TimeRange | null>;
export type Booking = {
  uid: string;
  eventTitle: string;
  attendeeName: string;
  startTime: string;
  endTime: string;
  status: "confirmed" | "cancelled" | "pending";
  scheduleId: "working-hours" | "other";
};

export const initialSchedule: Schedule = {
  Sunday: null,
  Monday: { start: "09:00", end: "17:00" },
  Tuesday: { start: "09:00", end: "17:00" },
  Wednesday: { start: "09:00", end: "17:00" },
  Thursday: { start: "09:00", end: "17:00" },
  Friday: { start: "09:00", end: "17:00" },
  Saturday: null,
};

export const initialBookings: Booking[] = [
  {
    uid: "maya-chen",
    eventTitle: "30 min meeting",
    attendeeName: "Maya Chen",
    startTime: "2026-09-24T10:30:00+08:00",
    endTime: "2026-09-24T11:00:00+08:00",
    status: "confirmed",
    scheduleId: "working-hours",
  },
  {
    uid: "daniel-okafor",
    eventTitle: "30 min meeting",
    attendeeName: "Daniel Okafor",
    startTime: "2026-10-01T14:00:00+08:00",
    endTime: "2026-10-01T14:30:00+08:00",
    status: "confirmed",
    scheduleId: "working-hours",
  },
];

export function readSchedule(): Schedule {
  if (typeof window === "undefined") return initialSchedule;
  try {
    const stored = window.localStorage.getItem(SCHEDULE_KEY);
    return stored ? { ...initialSchedule, ...JSON.parse(stored) } : initialSchedule;
  } catch { return initialSchedule; }
}

export function readBookings(): Booking[] {
  if (typeof window === "undefined") return initialBookings;
  try {
    const stored = window.localStorage.getItem(BOOKINGS_KEY);
    return stored ? JSON.parse(stored) : initialBookings;
  } catch { return initialBookings; }
}

export function saveSchedule(schedule: Schedule) {
  window.localStorage.setItem(SCHEDULE_KEY, JSON.stringify(schedule));
}

export function saveBookings(bookings: Booking[]) {
  window.localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
}

function zonedParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    weekday: "long", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  return {
    weekday: value("weekday") as DayName,
    date: `${value("year")}-${value("month")}-${value("day")}`,
    minutes: Number(value("hour")) * 60 + Number(value("minute")),
  };
}

function timeMinutes(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

export function getAffectedBookings(schedule: Schedule, bookings: Booking[]): Booking[] {
  return bookings.filter((booking) => {
    if (booking.status !== "confirmed" || booking.scheduleId !== "working-hours") return false;
    const start = new Date(booking.startTime);
    const end = new Date(booking.endTime);
    if (start <= DEMO_NOW || end <= start) return false;
    const localStart = zonedParts(start);
    const localEnd = zonedParts(end);
    const hours = schedule[localStart.weekday];
    if (!hours || localStart.date !== localEnd.date) return true;
    return localStart.minutes < timeMinutes(hours.start) || localEnd.minutes > timeMinutes(hours.end);
  }).sort((a, b) => a.startTime.localeCompare(b.startTime));
}

export function bookingDay(booking: Booking): DayName {
  return zonedParts(new Date(booking.startTime)).weekday;
}

export function formatBookingDate(booking: Booking, format: "pin" | "row" | "detail" | "full" = "detail") {
  const date = new Date(booking.startTime);
  const start = new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, hour: "numeric", minute: "2-digit", hour12: true }).format(date).replace(" AM", "am").replace(" PM", "pm");
  const end = new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, hour: "numeric", minute: "2-digit", hour12: true }).format(new Date(booking.endTime)).replace(" AM", "am").replace(" PM", "pm");
  const shortDate = new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, month: "short", day: "numeric" }).format(date);
  const weekday = new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, weekday: "short" }).format(date);
  if (format === "pin") return shortDate;
  if (format === "row") return `${weekday}, ${shortDate} · ${start}`;
  if (format === "full") return new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(date);
  return `${weekday}, ${shortDate} · ${start} – ${end}`;
}

export function formatTimeRange(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  if (hour === 24) return "12:00am";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${String(minute).padStart(2, "0")}${hour < 12 ? "am" : "pm"}`;
}
