import { Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import { NotificationProvider } from "@/components/providers/NotificationProvider";

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
    <html lang="en">
      <body className={`${poppins.variable} antialiased selection:bg-ruby selection:text-white font-poppins`}>
        <NotificationProvider>
          <Navbar />
          <main className="min-h-screen relative overflow-hidden">
            {children}
          </main>
        </NotificationProvider>
      </body>
    </html>
  );
}
