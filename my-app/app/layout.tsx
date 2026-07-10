import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import Script from "next/script";          // ← add this
import "./Components/RootComponents/styles/globals.css";
import "./Components/RootComponents/styles/welcome.css";
import "./Components/RootComponents/styles/preferences.css";
import "./Components/RootComponents/styles/auth.css";
import OfflineIndicator from "./Components/StatusComponents/OfflineIndicator";
import ServiceWorkerRegistrar from "./Components/StatusComponents/ServiceWorkerRegistrar";


const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ReadLite — Read anywhere. Instantly.",
  description: "A high-precision news aggregator tailored to your curiosity.",
  icons: {
    icon: "/icons/icon-192.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#080d18",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={manrope.variable} suppressHydrationWarning>
      <body>
        {/* Sets data-theme before hydration/paint to avoid a dark->light
            flash for users who've chosen light mode. Keep the storage key
            ("readLite_theme") in sync with lib/theme.ts — this is a
            necessary duplication since inline scripts can't import modules. */}
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){try{var t=localStorage.getItem('readLite_theme');document.documentElement.setAttribute('data-theme', t==='light'?'light':'dark');}catch(e){}})();`}
        </Script>
        {children}
        <Script src="https://accounts.google.com/gsi/client" strategy="beforeInteractive" />
          <OfflineIndicator />
          <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}