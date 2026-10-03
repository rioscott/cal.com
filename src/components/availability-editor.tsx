"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft, ArrowUpRight, CalendarCheck, CalendarDays, ChevronRight,
  ChevronsUpDown, CircleHelp, Clock3, Copy, ExternalLink, Route, Grid3X3,
  Link2, Ticket, ChartNoAxesGantt, Pencil, Plus, Search, Settings,
  Trash2, Users, Zap, X, Signal, Wifi, BatteryFull,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Frame, FrameDescription, FrameHeader, FramePanel, FrameTitle } from "@/components/ui/frame";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverPopup, PopoverTrigger } from "@/components/ui/popover";
import { Drawer, DrawerClose, DrawerPopup, DrawerTrigger } from "@/components/ui/drawer";
import { ToastProvider, toastManager } from "@/components/ui/toast";
import { useMediaQuery } from "@/hooks/use-media-query";
import { copy } from "@/lib/copy";
import { ProfileAvatar } from "@/components/branding";
import {
  BOOKINGS_KEY, SCHEDULE_KEY, DAYS, type Booking, type DayName, type Schedule,
  bookingDay, formatBookingDate, formatTimeRange, getAffectedBookings,
  initialBookings, initialSchedule, readBookings, readSchedule, saveSchedule,
} from "@/lib/demo";

const menu = [
  { label: "Links", icon: Link2 }, { label: "Events", icon: Ticket },
  { label: "Bookings", icon: CalendarDays }, { label: "Availability", icon: Clock3 },
  { label: "Teams", icon: Users }, { label: "Apps", icon: Grid3X3, arrow: true },
  { label: "Routing", icon: Route }, { label: "Workflows", icon: Zap },
  { label: "Insights", icon: ChartNoAxesGantt, arrow: true },
];

const timeOptions = Array.from({ length: 49 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 ? "30" : "00";
  return `${String(hour).padStart(2, "0")}:${minute}`;
});

function bookingHref(booking: Booking) { return `/bookings/${booking.uid}`; }

function Sidebar() {
  return <aside className="sidebar">
    <div className="sidebar-top">
      <span className="logo">Cal.com</span>
      <Search size={17} strokeWidth={1.7} />
      <ProfileAvatar />
    </div>
    <nav className="nav-list" aria-label="Main navigation">
      {menu.map(({ label, icon: Icon, arrow }) => <div key={label} className={`nav-item ${label === "Availability" ? "active" : ""}`} aria-current={label === "Availability" ? "page" : undefined}>
        <Icon size={17} strokeWidth={1.7} /><span>{label}</span>{arrow && <ChevronRight className="nav-arrow" size={15} />}
      </div>)}
    </nav>
    <div className="sidebar-bottom">
      <div className="nav-item"><ExternalLink size={16} />View public page</div>
      <div className="nav-item"><Copy size={16} />Copy public page link</div>
      <div className="nav-item"><Settings size={16} />Settings</div>
      <small>© 2026 Cal.com, Inc. v.6.9.3-hotfix1-h</small>
    </div>
  </aside>;
}

function BookingDetail({ booking, stale, current }: { booking: Booking; stale: boolean; current?: Booking }) {
  const cancelled = current?.status === "cancelled";
  const displayed = stale && current && !cancelled ? current : booking;
  return <div className="booking-detail-content">
    <div className="detail-primary">
      <div className={`detail-eyebrow ${stale ? "muted" : ""}`}><CalendarCheck size={14} strokeWidth={2} />{stale ? "Booking changed" : "Confirmed booking"}</div>
      <div className="detail-info">
        <strong>{copy("detailTitle", booking)}</strong>
        <span>{stale && !cancelled ? "Now " : ""}{formatBookingDate(displayed)}</span>
        <small>Asia/Makassar (GMT+8){stale ? " · Checked just now" : ""}</small>
      </div>
    </div>
    <div className="detail-secondary">
      <div className="detail-message">
        <small>{stale ? "No longer affected" : "Outside your new hours"}</small>
        <span>{cancelled ? "This booking was cancelled." : stale ? copy("staleBody", booking) : "This booking stays scheduled when you change your availability."}</span>
      </div>
      <a className="view-booking" href={bookingHref(booking)} target="_blank" rel="noopener noreferrer">View booking <ExternalLink size={14} /></a>
    </div>
  </div>;
}

function BookingPin({ booking, current, stale, onHighlight, onRefresh }: {
  booking: Booking; current?: Booking; stale: boolean;
  onHighlight: (uid: string | null) => void; onRefresh: () => void;
}) {
  const mobile = useMediaQuery("(max-width: 639px)");
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressFocus = useRef(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const detailId = `booking-detail-${booking.uid}`;
  const clearTimer = () => { if (timer.current) clearTimeout(timer.current); };
  const show = () => { clearTimer(); onRefresh(); setOpen(true); onHighlight(booking.uid); };
  const scheduleClose = () => {
    clearTimer();
    if (!pinned) timer.current = setTimeout(() => { setOpen(false); onHighlight(null); }, 85);
  };
  const setOpenState = (value: boolean) => {
    setOpen(value);
    if (!value) { setPinned(false); onHighlight(null); suppressFocus.current = true; trigger.current?.focus(); }
  };
  useEffect(() => () => clearTimer(), []);
  const button = <button
    ref={trigger} type="button" className={`booking-pin ${stale ? "stale" : ""} ${open ? "open" : ""}`}
    aria-label={`${stale ? "Booking changed" : "Confirmed booking"}, ${formatBookingDate(booking, "pin")}`}
    aria-describedby={detailId} aria-expanded={open}
    onPointerEnter={mobile ? undefined : () => { clearTimer(); timer.current = setTimeout(show, 80); }}
    onPointerLeave={mobile ? undefined : scheduleClose}
    onFocus={(event) => {
      if (suppressFocus.current) { suppressFocus.current = false; return; }
      if (event.currentTarget.matches(":focus-visible")) { clearTimer(); timer.current = setTimeout(show, 80); }
    }}
    onBlur={() => { if (!open) onHighlight(null); }}
    onClick={() => { clearTimer(); onRefresh(); setPinned(true); setOpen(true); onHighlight(booking.uid); }}
    onKeyDown={(event) => {
      if (event.key === "Escape") { setOpenState(false); }
      if (event.key === "Enter" || event.key === " ") setTimeout(() => document.querySelector<HTMLAnchorElement>(`#${detailId} a`)?.focus(), 0);
    }}
  ><CalendarCheck size={12} strokeWidth={2.25} /><span>{formatBookingDate(booking, "pin")}</span></button>;
  if (mobile) return <Drawer open={open} onOpenChange={setOpenState}>
    <DrawerTrigger render={button} />
    <DrawerPopup showBar className="booking-drawer" aria-label="Booking details" id={detailId}>
      <BookingDetail booking={booking} stale={stale} current={current} />
      <DrawerClose className="drawer-close">Close</DrawerClose>
    </DrawerPopup>
  </Drawer>;
  return <Popover open={open} onOpenChange={setOpenState}>
    <PopoverTrigger render={button} />
    <PopoverPopup className="booking-popover" side="bottom" align="start" alignOffset={-16} sideOffset={3} id={detailId} aria-label="Booking details"
      onPointerEnter={clearTimer} onPointerLeave={scheduleClose} onKeyDown={(event) => { if (event.key === "Escape") setOpenState(false); }}>
      <BookingDetail booking={booking} stale={stale} current={current} />
    </PopoverPopup>
  </Popover>;
}

function ImpactPanel({ bookings, saved, highlighted, refreshedCount }: { bookings: Booking[]; saved: boolean; highlighted: string | null; refreshedCount: number }) {
  const count = bookings.length;
  if (!count) return null;
  return <section className="impact-panel" aria-label="Booking impact">
    <div className="impact-header">
      <span className="impact-icon"><CalendarCheck size={14} strokeWidth={2} /></span>
      <h2>{copy("panelTitle", { count })}</h2>
      <p>{saved ? "Your new hours are saved. These bookings are still scheduled." : copy("panelBody", { count })}</p>
      {refreshedCount > 0 && <p className="impact-refreshed">{copy("refreshed", { count: refreshedCount })}</p>}
    </div>
    <div className="impact-rows">
      {bookings.map((booking) => <a key={booking.uid} id={`impact-row-${booking.uid}`} href={bookingHref(booking)} target="_blank" rel="noopener noreferrer" className={`impact-row ${highlighted === booking.uid ? "highlighted" : ""}`} aria-label={copy("rowAria", booking)}>
        <span><strong>{booking.attendeeName}</strong><small>{formatBookingDate(booking, "row")}</small></span><ArrowUpRight size={16} />
      </a>)}
    </div>
    <p className="impact-hint">Open one to reschedule or cancel.</p>
  </section>;
}

function AvailabilityEditorInner() {
  const [saved, setSaved] = useState<Schedule>(initialSchedule);
  const [draft, setDraft] = useState<Schedule>(initialSchedule);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [stalePins, setStalePins] = useState<Record<string, Booking>>({});
  const [savedPanelIds, setSavedPanelIds] = useState<string[]>([]);
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const bookingsRef = useRef(bookings);
  const draftRef = useRef(draft);
  useEffect(() => {
    const reset = new URLSearchParams(window.location.search).has("reset");
    if (reset) {
      window.localStorage.removeItem(SCHEDULE_KEY);
      window.localStorage.removeItem(BOOKINGS_KEY);
      window.history.replaceState(null, "", "/");
    }
    const storedSchedule = reset ? initialSchedule : readSchedule();
    const storedBookings = reset ? initialBookings : readBookings();
    queueMicrotask(() => {
      setSaved(storedSchedule); setDraft(storedSchedule); setBookings(storedBookings);
      bookingsRef.current = storedBookings; draftRef.current = storedSchedule; setReady(true);
    });
  }, []);
  useEffect(() => { bookingsRef.current = bookings; }, [bookings]);
  useEffect(() => { draftRef.current = draft; }, [draft]);

  const refreshBookings = useCallback(() => {
    const next = readBookings();
    const previous = bookingsRef.current;
    if (JSON.stringify(previous) === JSON.stringify(next)) return;
    const previouslyAffected = getAffectedBookings(draftRef.current, previous);
    const nowAffectedIds = new Set(getAffectedBookings(draftRef.current, next).map((booking) => booking.uid));
    setStalePins((existing) => {
      const updated = { ...existing };
      for (const booking of previouslyAffected) {
        if (!nowAffectedIds.has(booking.uid)) updated[booking.uid] = booking;
      }
      return updated;
    });
    bookingsRef.current = next;
    setBookings(next);
  }, []);
  useEffect(() => {
    const onStorage = (event: StorageEvent) => { if (event.key === BOOKINGS_KEY) refreshBookings(); };
    const onFocus = () => refreshBookings();
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onFocus);
    return () => { window.removeEventListener("storage", onStorage); window.removeEventListener("focus", onFocus); };
  }, [refreshBookings]);

  const isDirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const affected = useMemo(() => getAffectedBookings(draft, bookings), [draft, bookings]);
  const savedAffected = useMemo(() => getAffectedBookings(saved, bookings), [saved, bookings]);
  const savedIds = new Set(savedAffected.map((booking) => booking.uid));
  const newlyAffected = affected.filter((booking) => !savedIds.has(booking.uid));
  const panelBookings = isDirty ? newlyAffected : savedPanelIds.length ? affected.filter((booking) => savedPanelIds.includes(booking.uid)) : [];
  const panelSaved = !isDirty && savedPanelIds.length > 0;

  function changeDay(day: DayName, value: Schedule[DayName]) {
    setDraft((current) => ({ ...current, [day]: value }));
    setSavedPanelIds([]);
  }
  function handleSave() {
    const freshBookings = readBookings();
    const currentAffected = getAffectedBookings(draft, freshBookings);
    const beforeIds = new Set(getAffectedBookings(saved, freshBookings).map((booking) => booking.uid));
    const newIds = currentAffected.filter((booking) => !beforeIds.has(booking.uid)).map((booking) => booking.uid);
    saveSchedule(draft); setSaved(draft); setBookings(freshBookings); setSavedPanelIds(newIds);
    toastManager.add({ title: copy("toastTitle", { scheduleName: "Working hours" }), description: newIds.length ? copy("toastSubtitle", { count: newIds.length }) : undefined, type: "success" });
  }

  return <div className="app-shell" data-ready={ready}>
    <Sidebar />
    <main className="editor-main">
      <div className="editor-content">
        <div className="mobile-status" aria-hidden="true"><span>9:41</span><span className="status-icons"><Signal size={15} fill="currentColor" /><Wifi size={16} /><BatteryFull size={23} /></span></div>
        <header className="editor-header">
          <div className="title-area"><ArrowLeft size={17} strokeWidth={1.7} /><h1>Working hours</h1><Pencil size={15} strokeWidth={1.7} /></div>
          <div className="header-actions"><span>Set as default</span><span className="decorative-switch" aria-hidden="true" /><span className="delete-icon"><Trash2 size={16} strokeWidth={1.5} /></span><Button className="save-button" disabled={!isDirty} onClick={handleSave}>Save</Button></div>
        </header>
        <div className="editor-grid">
          <div className="editor-left">
            <Frame className="weekly-card" role="region" aria-labelledby="weekly-title">
              <FrameHeader className="weekly-heading"><FrameTitle><h2 id="weekly-title">Weekly hours</h2></FrameTitle><FrameDescription><p>Set the times you are available each day</p></FrameDescription></FrameHeader>
              <FramePanel className="days-list">
                {DAYS.map((day) => {
                  const hours = draft[day];
                  const dayPins = affected.filter((booking) => bookingDay(booking) === day);
                  const oldPins = Object.values(stalePins).filter((booking) => bookingDay(booking) === day && !dayPins.some((pin) => pin.uid === booking.uid));
                  const allPins = [...dayPins, ...oldPins].sort((a, b) => a.startTime.localeCompare(b.startTime));
                  return <div className="day-row" data-available={Boolean(hours)} key={day}>
                    <Label className="day-label"><Switch className="day-switch" checked={Boolean(hours)} onCheckedChange={(checked) => changeDay(day, checked ? { start: "09:00", end: "17:00" } : null)} /><span>{day}</span></Label>
                    <div className="row-content">
                      <div className="range-and-pins">
                        <div className="range-slot">
                          {hours ? <div className="range-controls">
                            <select aria-label={`${day} start time`} value={hours.start} onChange={(event) => {
                              const start = event.target.value;
                              const end = start >= hours.end ? timeOptions[Math.min(timeOptions.indexOf(start) + 1, timeOptions.length - 1)] : hours.end;
                              changeDay(day, { start, end });
                            }}>{timeOptions.slice(0, -1).map((time) => <option key={time} value={time}>{formatTimeRange(time)}</option>)}</select>
                            <span className="range-dash">–</span>
                            <select aria-label={`${day} end time`} value={hours.end} onChange={(event) => changeDay(day, { ...hours, end: event.target.value })}>{timeOptions.filter((time) => time > hours.start).map((time) => <option key={time} value={time}>{formatTimeRange(time)}</option>)}</select>
                            <button type="button" className="remove-range" aria-label={`Make ${day} unavailable`} onClick={() => changeDay(day, null)}><X size={16} /></button>
                          </div> : <span className="unavailable">Unavailable</span>}
                        </div>
                        <div className="pin-lane">
                          {allPins.slice(0, 2).map((booking) => <BookingPin key={booking.uid} booking={booking} current={bookings.find((item) => item.uid === booking.uid)} stale={Boolean(stalePins[booking.uid])} onHighlight={setHighlighted} onRefresh={refreshBookings} />)}
                          {allPins.length > 2 && <button className="overflow-pin" type="button" aria-label={`${allPins.length - 2} more confirmed bookings on ${day}`} onClick={() => document.getElementById(`impact-row-${allPins[2].uid}`)?.focus()}>+{allPins.length - 2}</button>}
                        </div>
                      </div>
                      <div className="row-actions" aria-hidden="true"><span><Plus size={17} /></span><span><Copy size={16} /></span></div>
                    </div>
                  </div>;
                })}
              </FramePanel>
            </Frame>
            <section className="overrides-card"><div><h2>Date overrides <CircleHelp size={14} /></h2><p>Add dates when your availability changes from your daily hours.</p></div><span className="override-action"><Plus size={17} /> Add an override</span></section>
          </div>
          <aside className="right-rail"><div className="timezone"><span>Timezone</span><div>Asia/Makassar <ChevronsUpDown size={16} /></div></div><div className="rail-rule" />
            <ImpactPanel bookings={panelBookings} saved={panelSaved} highlighted={highlighted} refreshedCount={Object.keys(stalePins).length} />
            <section className="troubleshooter"><h2>Something doesn&apos;t look right?</h2><span>Launch troubleshooter</span></section>
          </aside>
        </div>
      </div>
    </main>
  </div>;
}

export function AvailabilityEditor() {
  return <ToastProvider position="bottom-center"><AvailabilityEditorInner /></ToastProvider>;
}
