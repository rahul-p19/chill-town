import type { Metadata } from "next";
import { Pixelify_Sans } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Appbar } from "../../components/Appbar";
import { ClientProviders } from "../components/ClientProvider";

const pixelifySans = Pixelify_Sans({
  variable: "--font-pixelify",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ChillTown",
  description: "Welcome to ChillTown, your Personalized Entertainment Universe",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased ${pixelifySans.variable}`}
      >
        <ClerkProvider>
          <ClientProviders>
            <Appbar />
            {children}
          </ClientProviders>
        </ClerkProvider>
      </body>
    </html>
  );
}
