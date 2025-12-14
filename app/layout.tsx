import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LayoutClient from "@/components/layout";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/prisma/prisma-client";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Admin dashboard",
  description: "Admin dashboard",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const pathname = headersList.get('x-current-path');

  if (pathname === '/no-access' || pathname === '/login') {
     return (
        <html lang="en">
          <body className={`antialiased`}>
             {children}
          </body>
        </html>
      );
  }

  const session = await auth.api.getSession({ headers: headersList });

  if (!session || !session.user?.email) {
    return (
      <html lang="en">
        <body className={`antialiased`}>
           {children}
        </body>
      </html>
    );
  }

  const adminRecord = await prisma.admin.findUnique({
    where: {
      email: session.user.email,
    },
  });

  if (!adminRecord) {
     redirect("/no-access");
  }

  return (
    <LayoutClient 
      geistSans={geistSans} 
      geistMono={geistMono} 
      session={session}
    >
      {children}
    </LayoutClient>
  );
}