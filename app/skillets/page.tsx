'use client'

import { useEffect, useState } from "react";
import { Api } from "@/services/api-client";
import { Skillet } from "@prisma/client";
import { SkilletsTable } from "@/components/skillets-table";

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
        <div className='min-h-screen flex items-start justify-center bg-gray-200 p-4 pb-10'>
            <div className="p-4 text-center">

                {skillets?.length > 0 ? (
                    <SkilletsTable skillets={skillets} title='Skillets' />
                ) : (
                    <p className='pb-5'>Loading skillets...</p>
                )}

            </div>
        </div>
    )
}