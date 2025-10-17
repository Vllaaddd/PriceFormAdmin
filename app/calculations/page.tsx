'use server'

import CalculationsPage from "@/components/calculations-page";
import { auth } from "@/lib/auth";
import { Api } from "@/services/api-client";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Page() { 
  
  const session = await auth.api.getSession({
    headers: await headers()
  });

  const admins = await Api.admins.getAll();
  const isAdmin = admins.some(
    (admin: any) => admin.email === session?.user.email
  );

  if(!session || !isAdmin){
    redirect('/login');
  }else{
    return <CalculationsPage />
  }
}