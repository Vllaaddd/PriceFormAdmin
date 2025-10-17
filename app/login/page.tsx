'use server'

import LoginPage from "@/components/login-page";
import { auth } from "@/lib/auth";
import { Api } from "@/services/api-client";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Page() {
  
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    return <LoginPage />;
  }

  const admins = await Api.admins.getAll();
  const isAdmin = admins.some(
    (admin: any) => admin.email === session?.user.email
  );

  if (!isAdmin) {
    return <LoginPage />
  }

  redirect('/');
}
