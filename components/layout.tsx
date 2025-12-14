'use client'

import { SidePanelClient } from "./side-panel-client";

export default function LayoutClient({ children, geistSans, geistMono, session }: any) {

    return (
        <html lang="en">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex`}>
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