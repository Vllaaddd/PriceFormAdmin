'use client'

import { redirect, usePathname } from "next/navigation";
import { Admin } from "@prisma/client";
import { useEffect, useState } from "react";
import { Api } from "@/services/api-client";
import { SidePanelClient } from "./side-panel-client";

export default function Layout({ children, geistSans, geistMono, session }: { children: React.ReactNode, geistSans: any, geistMono: any, session: any }) {
    const pathname = usePathname()
    const [admins, setAdmins] = useState<Admin[]>([])
    
    useEffect(() => {
        const fetchAdmins = async () => {
            const admins = await Api.admins.getAll();
            setAdmins(admins);

            const isAdmin = admins.some((a) => a.email === session?.user.email);
            const isAuthPage = pathname.includes("/login") || pathname.includes("/no-access");
            
            if (!session && !isAuthPage) {
                redirect("/login");
            }
            
            if (session && !isAdmin && !isAuthPage) {
                redirect("/no-access");
            }
        }
        fetchAdmins()
    }, [])

    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased flex`}
            >
                <div className="fixed left-0 top-0 h-full z-50">
                    <SidePanelClient session={session} />
                </div>
        
                <main className="ml-0 lg:ml-72 flex-1 h-full overflow-y-auto bg-gray-50">
                    {children}
                </main>
            </body>
        </html>
    );
}