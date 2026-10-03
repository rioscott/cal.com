"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from "motion/react";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Clock3, Globe2, Video } from "lucide-react";
import { ProfilePhoto } from "@/components/branding";
import { initialBookings, readBookings, saveBookings, type Booking } from "@/lib/demo";

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const SLOTS = Array.from({ length: 16 }, (_, index) => {
  const hour = 9 + Math.floor(index / 2);
  const minute = index % 2 ? 30 : 0;
  return { hour, minute, label: `${hour > 12 ? hour - 12 : hour}:${minute ? "30" : "00"}${hour >= 12 ? "pm" : "am"}` };
});
const DAY_CELLS = Array.from({ length: 35 }, (_, index) => {
  const date = new Date(Date.UTC(2026, 8, 6 + index));
  return { day: date.getUTCDate(), month: date.getUTCMonth(), iso: date.toISOString().slice(0, 10), weekday: date.getUTCDay() };
});

function dateLabel(iso: string) {
  const date = new Date(`${iso}T12:00:00Z`);
  const weekday = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", weekday: "short" }).format(date);
  const day = date.getUTCDate();
  const suffix = day % 100 >= 11 && day % 100 <= 13 ? "th" : ({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[day % 10] ?? "th";
  return `${weekday}${day}${suffix}`;
}

function fullDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", { timeZone: "UTC", weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(new Date(`${iso}T12:00:00Z`));
}

function RescheduleStepContent({ children }: { children: ReactNode }) {
  const isPresent = useIsPresent();
  return <div className="reschedule-step-content" inert={!isPresent} aria-hidden={!isPresent}>{children}</div>;
}

export function ReschedulePage({ uid, preview = false }: { uid: string; preview?: boolean }) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const nameInputRef = useRef<HTMLInputElement>(null);
  const selectedTimeButtonRef = useRef<HTMLButtonElement>(null);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [selectedDate, setSelectedDate] = useState("2026-09-24");
  const [selectedTime, setSelectedTime] = useState<{ hour: number; minute: number; label: string } | null>(null);
  const [step, setStep] = useState<"calendar" | "details">("calendar");
  const [hourMode, setHourMode] = useState<12 | 24>(12);
  const [name, setName] = useState(() => initialBookings.find((item) => item.uid === uid)?.attendeeName ?? "");
  const [email, setEmail] = useState(() => `${initialBookings.find((item) => item.uid === uid)?.attendeeName.toLowerCase().replace(" ", ".") ?? "guest"}@example.com`);
  useEffect(() => {
    if (!selectedTime) return;
    if (step === "details") nameInputRef.current?.focus();
    else selectedTimeButtonRef.current?.focus();
  }, [selectedTime, step]);
  useEffect(() => { if (!preview) queueMicrotask(() => {
    const stored = readBookings();
    setBookings(stored);
    const currentDate = stored.find((item) => item.uid === uid)?.startTime.slice(0, 10);
    if (currentDate && DAY_CELLS.some((cell) => cell.iso === currentDate)) setSelectedDate(currentDate);
  }); }, [preview, uid]);
  const booking = bookings.find((item) => item.uid === uid);
  const backHref = preview ? `/prototypes/availability/booking?uid=${encodeURIComponent(uid)}` : `/bookings/${encodeURIComponent(uid)}`;
  if (!booking) return <main className="reschedule-page"><Link href={backHref}>Back to booking</Link><p>Booking not found.</p></main>;

  function confirm() {
    if (!selectedTime || !name.trim() || !email.trim()) return;
    const minutes = selectedTime.hour * 60 + selectedTime.minute + 30;
    const endHour = Math.floor(minutes / 60);
    const endMinute = minutes % 60;
    const pad = (value: number) => String(value).padStart(2, "0");
    const startTime = `${selectedDate}T${pad(selectedTime.hour)}:${pad(selectedTime.minute)}:00+08:00`;
    const endTime = `${selectedDate}T${pad(endHour)}:${pad(endMinute)}:00+08:00`;
    if (preview) {
      const channel = new BroadcastChannel("cal-prototype-state-preview");
      channel.postMessage({ type: "rescheduled", uid, startTime, endTime });
      channel.close();
      router.push(`/prototypes/availability/booking?uid=${encodeURIComponent(uid)}&moved=1&start=${encodeURIComponent(startTime)}&end=${encodeURIComponent(endTime)}`);
    } else {
      saveBookings(bookings.map((item) => item.uid === uid ? { ...item, startTime, endTime } : item));
      router.push(backHref);
    }
  }

  const fade = { duration: reduceMotion ? 0 : 0.18, ease: "easeOut" as const };

  return <main className="reschedule-page">
    <div className="reschedule-top"><Link href={backHref} className="reschedule-back"><ChevronLeft size={16} /> Back to booking</Link><div><button type="button">Need help?</button><span className="reschedule-view-switch"><CalendarDays size={16} /><span>▦</span><span>▥</span></span></div></div>
    <div className={`reschedule-card ${step === "details" ? "details-step" : ""}`}>
      <aside className="reschedule-event"><span className="reschedule-avatar" aria-hidden="true"><ProfilePhoto /></span><p>Rio Scott</p><h1>{booking.eventTitle}</h1>{step === "details" && selectedTime && <div className="event-fact"><CalendarDays size={16} /><span>{fullDate(selectedDate)}<br />{selectedTime.label} – {SLOTS.find((slot) => slot.hour * 60 + slot.minute === selectedTime.hour * 60 + selectedTime.minute + 30)?.label ?? "10:30am"}</span></div>}<div className="event-fact"><Clock3 size={16} /> 30m</div><div className="event-fact"><Video size={16} /> Cal Video</div><div className="event-fact"><Globe2 size={16} /> Asia/Makassar <ChevronDown size={15} /></div></aside>
      <div className="reschedule-content">
        <AnimatePresence initial={false} mode="popLayout">
          {step === "calendar" ? <motion.div key="calendar" className="reschedule-calendar-panel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={fade}>
            <RescheduleStepContent>
              <section className="reschedule-calendar" aria-label="Choose a new date"><header><h2>September 2026</h2><div><button type="button" aria-label="Previous month" disabled><ChevronLeft size={17} /></button><button type="button" aria-label="Next month" disabled><ChevronRight size={17} /></button></div></header><div className="calendar-weekdays">{WEEKDAYS.map((day) => <span key={day}>{day}</span>)}</div><div className="reschedule-days">{DAY_CELLS.map((cell) => { const enabled = cell.iso >= "2026-09-24" && cell.weekday > 0 && cell.weekday < 6; return <button type="button" key={cell.iso} disabled={!enabled} className={`${selectedDate === cell.iso ? "selected" : ""} ${enabled ? "available" : ""}`} onClick={() => { setSelectedDate(cell.iso); setSelectedTime(null); }} aria-label={fullDate(cell.iso)} aria-pressed={selectedDate === cell.iso}>{cell.month === 9 && cell.day === 1 && <small>OCT</small>}{cell.day}{cell.iso === "2026-09-23" && <i aria-hidden="true" />}</button>; })}</div></section>
              <section className="reschedule-times" aria-label={`Available times for ${fullDate(selectedDate)}`}><header><h2>{dateLabel(selectedDate)}</h2><div className="hour-mode"><button type="button" className={hourMode === 12 ? "active" : ""} onClick={() => setHourMode(12)}>12h</button><button type="button" className={hourMode === 24 ? "active" : ""} onClick={() => setHourMode(24)}>24h</button></div></header><div className="time-list">{SLOTS.map((slot) => <button type="button" key={slot.label} ref={selectedTime?.label === slot.label ? selectedTimeButtonRef : undefined} onClick={() => { setSelectedTime(slot); setStep("details"); }}><span aria-hidden="true" />{hourMode === 12 ? slot.label : `${String(slot.hour).padStart(2, "0")}:${String(slot.minute).padStart(2, "0")}`}</button>)}</div></section>
            </RescheduleStepContent>
          </motion.div> : <motion.div key="details" className="reschedule-details-panel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={fade}>
            <RescheduleStepContent>
              <section className="reschedule-details"><form onSubmit={(event) => { event.preventDefault(); confirm(); }}><label>Your name*<input ref={nameInputRef} required value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" /></label><label>Email address *<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" /></label><label>Additional notes<textarea placeholder="Please share anything that will help prepare for our meeting." /></label><button type="button" className="add-guests">♙ Add guests</button><p>By proceeding, you agree to Cal.com&apos;s Terms and Privacy Policy.</p><div className="reschedule-form-actions"><button type="button" onClick={() => setStep("calendar")}>Back</button><button type="submit">Confirm</button></div></form></section>
            </RescheduleStepContent>
          </motion.div>}
        </AnimatePresence>
      </div>
    </div><div className="reschedule-brand">Cal.com</div>
  </main>;
}
