'use server'

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { SidePanelClient } from "./side-panel-client";

export const SidePanel = async () => {

    const session = await auth.api.getSession({
        headers: await headers()
    });

    return <SidePanelClient session={session} />

}