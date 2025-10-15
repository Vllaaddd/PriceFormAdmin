'use client'

import { useEffect, useState } from "react";
import { Api } from "@/services/api-client";
import { Skillet } from "@prisma/client";
import { SkilletsTable } from "@/components/skillets-table";
import { LoadingCard } from "@/components/loading-card";

export default function Home(){

    const [skillets, setSkillets] = useState<Skillet[]>([]);

    useEffect(() => {
        async function fetchData() {
            const skillets = await Api.skillets.getAll();
            setSkillets(skillets);
        }

        fetchData();
    }, []);

    return(
        <div className='min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 py-10 px-6'>
            <div className="p-4 text-center">

                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">
                        Skillets Overview
                    </h1>
                </div>

                {skillets?.length > 0 ? (
                    <SkilletsTable skillets={skillets} />
                ) : (
                    <LoadingCard text="Loading skillets..." />
                )}

            </div>
        </div>
    )
}