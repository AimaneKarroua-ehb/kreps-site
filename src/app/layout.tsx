import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KR’eps – Crousty Street",
  description: "Street food croustillante, sauces maison.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="bg-black text-white antialiased">
        {children}
      </body>
    </html>
  );
}