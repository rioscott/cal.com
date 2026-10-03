import type { Metadata } from "next";
import { CalSansUI } from "@calcom/cal-sans-ui/ui";
import "@fontsource/cal-sans/400.css";
import "./globals.css";
import "./prototype.css";

export const metadata: Metadata = {
  title: "Working hours · Cal.com",
  description: "Availability and confirmed bookings prototype",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={CalSansUI.variable}>
      <body className="relative dark">
        <div className="relative isolate min-h-screen">{children}</div>
      </body>
    </html>
  );
}
