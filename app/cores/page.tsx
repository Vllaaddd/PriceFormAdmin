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
    <div className='min-h-screen flex items-start justify-center bg-gray-100 p-4 pb-10'>
      <div className="p-4 text-center">
        {cores?.length > 0 ? (
          <CoresTable cores={cores as any} title='Cores' />
        ) : (
          <p className='pb-5'>Loading cores...</p>
        )}
      </div>
    </div>
  )
}