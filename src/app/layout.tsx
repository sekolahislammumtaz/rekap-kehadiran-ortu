import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rekap Kehadiran Kajian Orang Tua",
  description: "Aplikasi Rekap Kehadiran & Perhitungan Poin Kajian Orang Tua Siswa",
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
