import IntlMessageFormat from "intl-messageformat";

const messages = {
  panelTitle: "{count, plural, one {# confirmed booking} other {# confirmed bookings}} outside your new hours",
  panelBody: "{count, plural, one {It stays} other {They stay}} scheduled. Changing your hours only affects new bookings.",
  refreshed: "Updated just now · {count, plural, one {# rescheduled} other {# rescheduled}}",
  toastTitle: "{scheduleName} updated",
  toastSubtitle: "{count, plural, one {# confirmed booking is} other {# confirmed bookings are}} still scheduled.",
  rowAria: "View booking: {eventTitle} with {attendeeName}",
  detailTitle: "{eventTitle} with {attendeeName}",
  staleBody: "{attendeeName} rescheduled this booking, so your new hours don’t affect it.",
} as const;

export function copy(key: keyof typeof messages, values: Record<string, string | number>): string {
  return String(new IntlMessageFormat(messages[key], "en-US").format(values));
}
