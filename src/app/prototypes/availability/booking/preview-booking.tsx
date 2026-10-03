"use client";

import Link from "next/link";
import { ArrowLeft, CalendarDays, Check, ExternalLink } from "lucide-react";
import { formatBookingDate, initialBookings } from "@/lib/demo";

export function PreviewBookingPage({ uid, moved, start, end }: { uid: string; moved: boolean; start?: string; end?: string }) {
  const bookings = initialBookings.map((item) => moved && item.uid === uid
    ? { ...item, startTime: start ?? "2026-09-28T10:00:00+08:00", endTime: end ?? "2026-09-28T10:30:00+08:00" }
    : item);
  const booking = bookings.find((item) => item.uid === uid);
  if (!booking) return <main className="booking-page"><Link className="booking-back" href="/prototypes/availability">‹ Back to availability</Link><p>Booking not found.</p></main>;
  const time = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Makassar", hour: "numeric", minute: "2-digit", hour12: true }).format(new Date(booking.startTime));
  const endTime = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Makassar", hour: "numeric", minute: "2-digit", hour12: true }).format(new Date(booking.endTime));
  return <main className="booking-page">
    <Link href="/prototypes/availability?v=5" className="booking-back"><ArrowLeft size={14} /> Back to availability</Link>
    <div className="booking-confirmation">
      <div className="confirmation-head"><span className="confirmation-check"><Check size={24} /></span><h1>This meeting is scheduled</h1><p>We sent an email with a calendar invitation with the details to everyone.</p></div>
      <div className="confirmation-data">
        <div className="confirmation-row"><span>What</span><strong>{booking.eventTitle} between Rio Scott and {booking.attendeeName}</strong></div>
        <div className="confirmation-row"><span>When</span><strong>{formatBookingDate(booking, "full")}<br />{time} – {endTime} (Central Indonesia Time)</strong></div>
        <div className="confirmation-row"><span>Who</span><strong>Rio Scott <em>Host</em><small>rio@example.com</small><br />{booking.attendeeName}<small>{booking.attendeeName.toLowerCase().replace(" ", ".")}@example.com</small></strong></div>
        <div className="confirmation-row"><span>Where</span><strong>Cal Video <ExternalLink size={14} /></strong></div>
        <div className="calendar-options"><span>Add to calendar</span><span className="calendar-icon">G</span><span className="calendar-icon">▣</span><span className="calendar-icon"><CalendarDays size={16} /></span></div>
      </div>
      <div className="change-booking">Need to make a change? <Link href={`/prototypes/availability/booking/reschedule?uid=${uid}`}>Reschedule</Link> or <span>Cancel</span></div>
    </div>
    <p className="report-booking"><CalendarDays size={12} /> Report booking</p>
  </main>;
}
