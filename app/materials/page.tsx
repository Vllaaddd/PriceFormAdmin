'use client'

import { MaterialPropertiesTable } from "@/components/material-properties-table";
import { Api } from "@/services/api-client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PlusCircle } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import { LoadingCard } from "@/components/loading-card";

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [form, setForm] = useState({
    period: "",
    startDate: "",
    endDate: "",
  });

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

  const handleCreate = async () => {
    if (!form.period || !form.startDate || !form.endDate) {
      toast.error('Please fill all fields!')
      return;
    }

    try {
      await Api.periods.create(form)
      toast.success(`New period "${form.period}" created!`)
      setIsDialogOpen(false);
      setForm({ period: "", startDate: "", endDate: "" });
    } catch (error) {
      console.error(error);
      toast.error("Failed to create period")
    }
  };

  return(
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 py-10 px-6">
      <div className="max-w-6xl mx-auto space-y-10 flex flex-col items-center">

        <div className="flex items-center gap-10 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">
            Material Properties
          </h1>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild className="cursor-pointer">
              <Button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl shadow-sm transition-all duration-200">
                <PlusCircle className="w-4 h-4" />
                New Period
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Period</DialogTitle>
              </DialogHeader>

                <div className="flex flex-col gap-3 py-2">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      Period Name
                    </label>
                    <Input
                      placeholder="e.g. Q3 2026"
                      value={form.period}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, period: e.target.value }))
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      Start Date
                    </label>
                    <Input
                      type="date"
                      value={form.startDate}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, startDate: e.target.value }))
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      End Date
                    </label>
                    <Input
                      type="date"
                      value={form.endDate}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, endDate: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <DialogFooter className="flex justify-end gap-2 mt-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
                    onClick={handleCreate}
                  >
                    Create
                  </Button>
                </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {periods?.length > 0 ? (
          <>
            {periods.map((period, i) => 
              <MaterialPropertiesTable materials={period.materials} title={period.period} periodId={period.id} onDelete={() => setPeriods(prev => prev.filter(p => p.id !== period.id))} key={i} />
            )}
          </>
        ) : (
          <LoadingCard text="Loading materials..." />
        )}
      </div>
      
      <ToastContainer />
    </div>
  )
}