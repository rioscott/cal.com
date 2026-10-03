"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import EditState from "./variants/edit";
import DetailState from "./variants/detail";
import SavedState from "./variants/saved";
import NoImpactState from "./variants/no-impact";
import StaleState from "./variants/stale";
import { ReschedulePage } from "@/components/reschedule-page";

function RescheduleState() { return <ReschedulePage uid="maya-chen" preview />; }

const variants = [
  { name: "Edit", component: EditState },
  { name: "Pin detail", component: DetailState },
  { name: "Saved", component: SavedState },
  { name: "No impact", component: NoImpactState },
  { name: "Stale", component: StaleState },
  { name: "Reschedule", component: RescheduleState },
] as const;

export function StatePicker({ initialIndex }: { initialIndex: number }) {
  const [current, setCurrent] = useState(initialIndex);
  const [replay, setReplay] = useState(0);
  const [ready, setReady] = useState(false);
  const [highlight, setHighlight] = useState({ left: 0, width: 0 });
  const items = useRef<Array<HTMLButtonElement | null>>([]);
  const mobile = useMediaQuery("(max-width: 639px)");

  const setActive = useCallback((index: number) => {
    if (index < 0 || index >= variants.length) return;
    setCurrent(index);
    setReplay((value) => value + 1);
    const url = new URL(window.location.href);
    url.searchParams.set("v", String(index + 1));
    window.history.replaceState(null, "", url);
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)));
    return () => cancelAnimationFrame(frame);
  }, []);

  useLayoutEffect(() => {
    const measure = () => {
      const item = items.current[current];
      if (item) setHighlight({ left: item.offsetLeft, width: item.offsetWidth });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [current]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) || target.isContentEditable) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const num = Number.parseInt(event.key, 10);
      if (num >= 1 && num <= variants.length) setActive(num - 1);
      else if (event.key === "ArrowRight") setActive((current + 1) % variants.length);
      else if (event.key === "ArrowLeft") setActive((current - 1 + variants.length) % variants.length);
      else if (event.key === "r" || event.key === "R") setReplay((value) => value + 1);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [current, setActive]);

  const Variant = variants[current].component;
  return <>
    <div id="stage" key={`${current}-${replay}`}><Variant /></div>
    <nav className="proto-picker" aria-label="Prototype variants" data-ready={ready ? "" : undefined} data-position={current === 2 || current === 5 || mobile ? "top" : undefined}>
      <span className="proto-picker-highlight" aria-hidden="true" style={{ width: highlight.width, transform: `translateX(${highlight.left}px)` }} />
      {variants.map((variant, index) => <button key={variant.name} ref={(element) => { items.current[index] = element; }} className="proto-picker-item" data-active={current === index ? "" : undefined} aria-current={current === index ? "true" : undefined} onClick={() => setActive(index)}>{variant.name}</button>)}
      <span className="proto-picker-divider" aria-hidden="true" />
      <button className="proto-picker-item proto-picker-replay" aria-label="Replay animation (R)" onClick={() => setReplay((value) => value + 1)}>↻</button>
    </nav>
  </>;
}
