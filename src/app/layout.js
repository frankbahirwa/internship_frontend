import { Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import { NotificationProvider } from "@/components/providers/NotificationProvider";
import { I18nProvider } from "@/components/providers/I18nProvider";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata = {
  title: "LifeLine | Premium Blood Donation Platform",
  description: "Connecting heroes with health emergencies. High-performance matching system for blood donation.",
};

export default function RootLayout({ children }) {
  return (
    <html>
      <body className={`${poppins.variable} antialiased selection:bg-ruby selection:text-white font-poppins`}>
        <I18nProvider>
          <NotificationProvider>
            <Navbar />
            <main className="min-h-screen relative overflow-hidden">
              {children}
            </main>
          </NotificationProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
