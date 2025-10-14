'use client'

import { MaterialPropertiesTable } from "@/components/material-properties-table";
import { Api } from "@/services/api-client";
import { useEffect, useState } from "react";

type Material = {
  id: number;
  material: string;
  density?: string;
  costPerKg: string;
};

type Period = {
  id: number;
  period: string;
  startDate: string;
  endDate: string;
  materials: Material[];
}

export default function Home(){

  const [periods, setPeriods] = useState<Period[]>([]);

  useEffect(() => {
    async function fetchData() {
        
      const apiPeriods = await Api.periods.getAll();

      const mappedPeriods: Period[] = apiPeriods.map((p: any) => ({
        id: p.id,
        period: p.period,
        startDate: typeof p.startDate === "string" ? p.startDate : p.startDate?.toISOString?.() ?? "",
        endDate: typeof p.endDate === "string" ? p.endDate : p.endDate?.toISOString?.() ?? "",
        materials: p.materials ?? [],
      }));

      setPeriods(mappedPeriods.sort(
        (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      ));
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

        {periods?.length > 0 && periods.map((period, i) => 
          <MaterialPropertiesTable materials={period.materials} title={period.period} key={i} />
        )}
      </div>
    </div>
  )
}