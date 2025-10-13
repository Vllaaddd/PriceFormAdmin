'use client'

import Link from "next/link";
import { FC } from "react";
import { Title } from "./title";
import { usePathname } from "next/navigation";

export const SidePanel: FC = () => {
    const pathname = usePathname();

    return (
        <div className="w-72 bg-[#121212] text-white min-h-screen p-6 shadow-lg flex flex-col items-center border-r border-gray-800">
            <h1 className="pb-10 text-2xl font-semibold text-center tracking-wide text-gray-100">
                Admin Dashboard
            </h1>

            <div className="flex flex-col gap-3 w-full">
                <Link href={'/'}>
                    <Title active={pathname === '/'} title="Home" />
                </Link>

                <Link href={'/lines'}>
                    <Title active={pathname === '/lines'} title="Lines" />
                </Link>

                <Link href={'/materials'}>
                    <Title active={pathname === '/materials'} title="Materials" />
                </Link>

                <Link href={'/skillet'}>
                    <Title active={pathname === '/skillet'} title="Skillet" />
                </Link>

                <Link href={'/calculations'}>
                    <Title active={pathname === '/calculations'} title="Calculations" />
                </Link>
            </div>
        </div>
    );
};
