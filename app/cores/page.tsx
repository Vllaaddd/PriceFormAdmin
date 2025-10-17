'use server'

import CoresPage from "@/components/cores-page";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Page() { 
  
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if(!session) {
    redirect('/login');
  }else{
    return <CoresPage />
  }
}
