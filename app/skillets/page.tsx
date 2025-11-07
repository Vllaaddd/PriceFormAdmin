'use client'

import { CreateInput } from "@/components/create-input";
import { LoadingCard } from "@/components/loading-card";
import { SkilletsTable } from "@/components/skillets-table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Api } from "@/services/api-client";
import { Skillet } from "@prisma/client";
import { PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";

export default function SkilletsPage() {

    const [skillets, setSkillets] = useState<Skillet[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isPriceRangeDialogOpen, setIsPriceRangeDialogOpen] = useState(false);

    const [form, setForm] = useState({
        article: '',
        format: '',
        knife: '',
        density: '',
        smallPrice: '',
        mediumPrice: '',
        largePrice: '',
    });

    const [priceRangeForm, setPriceRangeForm] = useState({
        minPrice: 0,
        maxPrice: 0,
    });
    
    useEffect(() => {
        async function fetchData() {
            const skillets = await Api.skillets.getAll();
            setSkillets(skillets.sort((a, b) => {
                if(a.format === b.format){
                    return a.density - b.density
                }
                return a.format - b.format
            }));
        }

        fetchData();
    }, []);

    const handleCreate = async () => {
        if (!form.article || !form.format || !form.knife || !form.density || !form.smallPrice || !form.mediumPrice || !form.largePrice) {
            toast.error('Please fill all fields!')
            return;
        }

        try {
            const newSkillet = await Api.skillets.create(form)
            setSkillets(prev => [...prev, newSkillet])
            toast.success(`New skillet "${form.article}" created!`)
            setIsDialogOpen(false);
            setForm({ article: "", format: "", knife: "", density: "", smallPrice: "", mediumPrice: "", largePrice: "" });
        } catch (error) {
            console.error(error);
            toast.error("Failed to create skillet")
        }
    };

    const handleCreatePriceRange = async () => {
        if (!priceRangeForm.minPrice || !priceRangeForm.maxPrice) {
            toast.error('Please fill all fields!')
            return;
        }

        try {
            // const newSkillet = await Api.skillets.create(priceRangeForm)
            // setSkillets(prev => [...prev, newSkillet])
            toast.success(`New price range created!`)
            setIsPriceRangeDialogOpen(false);
            setPriceRangeForm({ minPrice: 0, maxPrice: 0});
        } catch (error) {
            console.error(error);
            toast.error("Failed to create price range")
        }
    };
    
    return(
        <div className='min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 py-10 px-6'>
            <div className="p-4 text-center">

                <div className="flex items-center justify-center gap-10 mb-8">

                    <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">
                        Skillets Overview
                    </h1>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild className="cursor-pointer">
                            <Button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl shadow-sm transition-all duration-200">
                                <PlusCircle className="w-4 h-4" />
                                New Skillet
                            </Button>
                        </DialogTrigger>

                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Create New Skillet</DialogTitle>
                            </DialogHeader>

                            <div className="flex flex-col gap-3 py-2">
                                <CreateInput
                                    title="Skillet article"
                                    placeholder="e.g. M69065"
                                    value={form.article}
                                    onChange={(e) =>
                                        setForm((prev) => ({ ...prev, article: e.target.value }))
                                    }
                                />

                                <CreateInput
                                    title="Skillet format"
                                    placeholder="e.g. 39 (mm) or 45 (mm)"
                                    value={form.format}
                                    onChange={(e) =>
                                        setForm((prev) => ({ ...prev, format: e.target.value }))
                                    }
                                />

                                <CreateInput
                                    title="Skillet knife"
                                    placeholder="e.g. Paper knife / No knife"
                                    value={form.knife}
                                    onChange={(e) =>
                                        setForm((prev) => ({ ...prev, knife: e.target.value }))
                                    }
                                />

                                <CreateInput
                                    title="Skillet density"
                                    placeholder="e.g. 350"
                                    value={form.density}
                                    onChange={(e) =>
                                        setForm((prev) => ({ ...prev, density: e.target.value }))
                                    }
                                />

                                <CreateInput
                                    title="30k-200k"
                                    placeholder="e.g. 0.12"
                                    value={form.smallPrice}
                                    onChange={(e) =>
                                        setForm((prev) => ({ ...prev, smallPrice: e.target.value }))
                                    }
                                />

                                <CreateInput
                                    title="200k-500k"
                                    placeholder="e.g. 0.10"
                                    value={form.mediumPrice}
                                    onChange={(e) =>
                                        setForm((prev) => ({ ...prev, mediumPrice: e.target.value }))
                                    }
                                />

                                <CreateInput
                                    title="500k-1m"
                                    placeholder="e.g. 0.08"
                                    value={form.largePrice}
                                    onChange={(e) =>
                                        setForm((prev) => ({ ...prev, largePrice: e.target.value }))
                                    }
                                />
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

                    <Dialog open={isPriceRangeDialogOpen} onOpenChange={setIsPriceRangeDialogOpen}>
                        <DialogTrigger asChild className="cursor-pointer">
                            <Button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl shadow-sm transition-all duration-200">
                                <PlusCircle className="w-4 h-4" />
                                New Price Range
                            </Button>
                        </DialogTrigger>

                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Create New Price Range</DialogTitle>
                            </DialogHeader>

                            <div className="flex flex-col gap-3 py-2">
                                <CreateInput
                                    title="Minimum quantity"
                                    placeholder="e.g. 100000"
                                    value={form.article}
                                    onChange={(e) =>
                                        setForm((prev) => ({ ...prev, article: e.target.value }))
                                    }
                                />

                                <CreateInput
                                    title="Maximum quantity"
                                    placeholder="e.g. 500000"
                                    value={form.format}
                                    onChange={(e) =>
                                        setForm((prev) => ({ ...prev, format: e.target.value }))
                                    }
                                />
                            </div>

                            <DialogFooter className="flex justify-end gap-2 mt-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsPriceRangeDialogOpen(false)}
                                    className="cursor-pointer"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
                                    onClick={handleCreatePriceRange}
                                >
                                    Create
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>                

                {skillets?.length > 0 ? (
                    <SkilletsTable skillets={skillets as any} />
                ) : (
                    <LoadingCard text="Loading skillets..." />
                )}

            </div>
            <ToastContainer />
        </div>
    )
}