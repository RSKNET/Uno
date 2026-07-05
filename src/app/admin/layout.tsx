import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Portal | UNO Skors",
  description: "Masuk ke portal admin UNO Skors untuk mengelola pemain, pengaturan sistem, dan laporan game.",
  manifest: "/manifest.json",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
