'use client'

import { CoresTable } from "@/components/cores-table";
import { Api } from "@/services/api-client";
import { Core } from "@prisma/client";
import { useEffect, useState } from "react";

export default function Home(){
  
  const [cores, setCores] = useState<Core[]>([]);

  useEffect(() => {
    async function fetchData() {
        
      const cores = await Api.cores.getAll();
      
      const sortedCores = cores.sort((a, b) => {
        if (a.length === b.length) {
          return a.thickness - b.thickness;
        }
        return a.length - b.length;
      });

      setCores(sortedCores)     

    }

    fetchData();
  }, []);


  return(
    <div className='min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 py-10 px-6'>
      <div className="p-4 text-center flex flex-col items-center">

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">
            Cores Overview
          </h1>
        </div>

        {cores?.length > 0 ? (
          <CoresTable cores={cores as any} />
        ) : (
          <p className='pb-5'>Loading cores...</p>
        )}
      </div>
    </div>
  )
}