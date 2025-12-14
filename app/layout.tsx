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
  // 1. Читаємо шлях, який нам передав Middleware
  const headersList = await headers();
  const pathname = headersList.get('x-current-path');

  // 2. 🔥 ВАЖЛИВО: Якщо ми вже на сторінці no-access або login,
  // просто рендеримо її і НЕ робимо перевірок БД
  if (pathname === '/no-access' || pathname === '/login') {
     return (
        <html lang="en">
          <body className={`antialiased`}>
             {children}
          </body>
        </html>
      );
  }

  // 3. Отримуємо сесію
  const session = await auth.api.getSession({ headers: headersList });

  // 4. Якщо немає сесії - показуємо чистий HTML (або редірект на логін, якщо Middleware пропустив)
  if (!session || !session.user?.email) {
    return (
      <html lang="en">
        <body className={`antialiased`}>
           {children}
        </body>
      </html>
    );
  }

  // 5. Перевірка Адміна
  const adminRecord = await prisma.admin.findUnique({
    where: {
      email: session.user.email,
    },
  });

  // 6. Якщо не адмін — редірект. 
  // Тепер циклу не буде, бо після редіректу спрацює пункт 2 (if pathname === '/no-access')
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