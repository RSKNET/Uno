import type { Metadata } from "next";

export const metadata: Metadata = {
  manifest: "/manifest.json",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
