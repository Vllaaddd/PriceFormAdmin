'use client'

import { MaterialPropertiesTable } from "@/components/material-properties-table";
import { Api } from "@/services/api-client";
import { MaterialProperty } from "@prisma/client";
import { useEffect, useState } from "react";

export default function Home(){
  
  const [materialProperties, setMaterialProperties] = useState<MaterialProperty[]>([]);

  useEffect(() => {
    async function fetchData() {
        
      const allMaterialProperties = await Api.properties.getAll();

      setMaterialProperties(allMaterialProperties.sort((a, b) => {
        if (a.material === "Alu") return -1;
        if (b.material === "Alu") return 1;
        if (a.material === "PE") return -1;
        if (b.material === "PE") return 1;
        return 0;
      }));       
    }

    fetchData();
  }, []);


  return(
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 py-10 px-6">
      <div className="max-w-6xl mx-auto space-y-10 flex flex-col items-center">

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">
            Material Properties
          </h1>
        </div>

        {materialProperties?.length > 0 ? (
          <MaterialPropertiesTable materials={materialProperties as any} />
        ) : (
          <p className='pb-5'>Loading material properties...</p>
        )}
      </div>
    </div>
  )
}