import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yayasan Munazarah - Rekap Kehadiran Kajian Orang Tua",
  description: "Aplikasi Rekap Kehadiran & Perhitungan Poin Kajian Orang Tua Siswa - Yayasan Munazarah",
  icons: {
    icon: "/yayasan.png",
    shortcut: "/yayasan.png",
    apple: "/yayasan.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
