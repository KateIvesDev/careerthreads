import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Career Thread",
  description: "A trusted, evolving record of your professional growth.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" data-scroll-behavior="smooth">
      <body className="min-h-full">{children}<footer className="trust-footer"><p><strong>Fictional demo data.</strong> Live AI operations send only the selected reflection or approved Career Record context to the configured model. Nothing enters the record without your approval.</p></footer></body>
    </html>
  );
}
