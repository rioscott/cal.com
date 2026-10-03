# Availability × confirmed bookings prototype

A standalone Next.js prototype of the [Paper flow](https://app.paper.design/file/01M36B8RGXWERPRNW4PYM6QKHJ/p-2-0). It uses coss ui components, local demo bookings, and a fixed September 23, 2026 demo clock.

## Run

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Turn Thursday off to see two affected bookings. Save, then turn Friday off to see the no-impact edit. Open a pin or panel row to view a booking in a new tab and reschedule Maya Chen to see the stale pin state when you return.

Open [http://localhost:3000/?reset=1](http://localhost:3000/?reset=1) to restore the starting scenario. The saved schedule and bookings are stored in local storage; the just-saved panel is scoped to the current editor visit.

## State picker

Open [http://localhost:3000/prototypes/availability](http://localhost:3000/prototypes/availability) to compare the edit, pin detail, saved, later no-impact, and stale-booking states directly. Use the floating picker, number keys 1–5, or left/right arrows; press R to replay the current state. The stale state from Paper frame 07 is also available at [http://localhost:3000/prototypes/availability?v=5](http://localhost:3000/prototypes/availability?v=5). The picker uses isolated demo state and does not change the saved schedule in the main app.

## Checks

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```
