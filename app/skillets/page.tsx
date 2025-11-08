'use client'

import { CreateInput } from "@/components/create-input";
import { Label } from "@/components/label";
import { LoadingCard } from "@/components/loading-card";
import { SkilletsTable } from "@/components/skillets-table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Api } from "@/services/api-client";
import { PriceTier, Skillet } from "@prisma/client";
import { PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import Swal from "sweetalert2";

export default function SkilletsPage() {

    const [skillets, setSkillets] = useState<Skillet[]>([]);
    const [priceTiers, setPriceTiers] = useState<PriceTier[]>([])
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isPriceTierDialogOpen, setIsPriceTierDialogOpen] = useState(false);
    const [newSkilletPrices, setNewSkilletPrices] = useState<Record<string, string>>({})

    const [form, setForm] = useState({
        article: '',
        format: '',
        knife: '',
        density: '',
    });

    const [priceTierForm, setPriceTierForm] = useState({
        minPrice: null,
        maxPrice: null,
    });
    
    useEffect(() => {
        async function fetchData() {

            const skillets = await Api.skillets.getAll();
            const tiers = await Api.skillets.getAllTiers()

            setSkillets(skillets.sort((a, b) => {
                if(a.format === b.format){
                    return a.density - b.density
                }
                return a.format - b.format
            }));

            setPriceTiers(tiers.sort((a, b) => {
                return a.minQty - b.minQty
            }))
        }

        fetchData();
    }, []);

    const handleCreateSkillet = async () => {
        if (!form.article || !form.format || !form.knife || !form.density) {
            toast.error('Please fill all fields!')
            return;
        }

        const missingCount = priceTiers.filter(
            (t) => !String(newSkilletPrices[String(t.id)] ?? "").trim()
        );

        if (missingCount.length > 0) {
            toast.error("Please fill all price fields!");
            return;
        }

        const invalid = priceTiers
            .map((t) => ({
                id: t.id,
                label: `${t.minQty}-${t.maxQty}`,
                raw: String(newSkilletPrices[String(t.id)]).replace(",", "."),
            }))
            .filter((x) => Number.isNaN(Number(x.raw)));

        if (invalid.length > 0) {
            toast.error("Price fields must be valid numbers!");
            return;
        }

        const tierPrices = priceTiers.map((t) => ({
            tierId: t.id,
            price: Number(String(newSkilletPrices[String(t.id)]).replace(",", ".")),
        }));

        try {
            const newSkillet = await Api.skillets.create({...form, prices: tierPrices})
            setSkillets(prev => [...prev, newSkillet])
            toast.success(`New skillet "${form.article}" created!`)
            setIsDialogOpen(false);
            setForm({ article: "", format: "", knife: "", density: ""});
            setNewSkilletPrices({})
        } catch (error) {
            console.error(error);
            toast.error("Failed to create skillet")
        }
    };

    const handleCreatePriceTier = async () => {
        if (!priceTierForm.minPrice || !priceTierForm.maxPrice) {
            toast.error('Please fill all fields!')
            return;
        }

        try {
            const newTier = await Api.skillets.createPriceTier({ minQty: Number(priceTierForm.minPrice), maxQty: Number(priceTierForm.maxPrice) })
            setPriceTiers((prev) => [...prev, newTier].sort((a, b) => {
                return a.minQty - b.minQty
            }))
            toast.success(`New price tier created!`)
            setIsPriceTierDialogOpen(false);
            setPriceTierForm({ minPrice: null, maxPrice: null});
        } catch (error) {
            console.error(error);
            toast.error("Failed to create price tier")
        }
    };

    const handleDeleteTier = async (tierId: string) => {

        Swal.fire({
            title: `Do you want to delete price tier?`,
            showCancelButton: true,
            confirmButtonText: "Delete",
            cancelButtonColor: 'red'
        }).then( async (result) => {
            if (result.isConfirmed) {
                try {
                    await Api.skillets.deletePriceTier(tierId)
                    setPriceTiers((prev) => prev.filter((t) => t.id !== Number(tierId)));
                    toast.success("Price tier deleted!");
                } catch (error) {
                    toast.error("Failed to delete price tier.");
                }
            } else if (result.isDenied) {
                Swal.fire("Changes are not saved", "", "info");
                return
            }
        });
    };
    
    const handleDeleteSkillet = async (skilletId: string) => {
        Swal.fire({
            title: `Do you want to delete skillet?`,
            showCancelButton: true,
            confirmButtonText: "Delete",
            cancelButtonColor: 'red'
        }).then( async (result) => {
            if (result.isConfirmed) {
                try {
                    await Api.skillets.deleteSkillet(skilletId)
                    setSkillets((prev) => prev.filter((s) => s.id !== Number(skilletId)));
                    toast.success("Skillet deleted!");
                } catch (error) {
                    toast.error("Failed to delete skillet.");
                }
            } else if (result.isDenied) {
                Swal.fire("Changes are not saved", "", "info");
                return
            }
        });
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
                                    placeholder="e.g. 39 or 45"
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

                                {priceTiers && priceTiers.map(tier => (
                                    <CreateInput
                                        title={<Label tier={tier} />}
                                        placeholder="e.g. 0.12"
                                        value={newSkilletPrices[tier.id]}
                                        onChange={(e) =>
                                            setNewSkilletPrices((prev) => ({ ...prev, [tier.id]: e.target.value }))
                                        }
                                    />
                                ))}
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
                                    onClick={handleCreateSkillet}
                                >
                                    Create
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isPriceTierDialogOpen} onOpenChange={setIsPriceTierDialogOpen}>
                        <DialogTrigger asChild className="cursor-pointer">
                            <Button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl shadow-sm transition-all duration-200">
                                <PlusCircle className="w-4 h-4" />
                                New Price Tier
                            </Button>
                        </DialogTrigger>

                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Create New Price Tier</DialogTitle>
                            </DialogHeader>

                            <div className="flex flex-col gap-3 py-2">
                                <CreateInput
                                    type="number"
                                    title="Minimum quantity"
                                    placeholder="e.g. 100001"
                                    value={priceTierForm.minPrice || ''}
                                    onChange={(e) =>
                                        setPriceTierForm((prev) => ({ ...prev, minPrice: e.target.value }))
                                    }
                                />

                                <CreateInput
                                    type="number"
                                    title="Maximum quantity"
                                    placeholder="e.g. 500000"
                                    value={priceTierForm.maxPrice || ''}
                                    onChange={(e) =>
                                        setPriceTierForm((prev) => ({ ...prev, maxPrice: e.target.value }))
                                    }
                                />
                            </div>

                            <DialogFooter className="flex justify-end gap-2 mt-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsPriceTierDialogOpen(false)}
                                    className="cursor-pointer"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
                                    onClick={handleCreatePriceTier}
                                >
                                    Create
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>                

                {skillets?.length > 0 ? (
                    <SkilletsTable skillets={skillets as any} tiers={priceTiers} onDeleteSkillet={handleDeleteSkillet} onDeleteTier={handleDeleteTier} />
                ) : (
                    <LoadingCard text="Loading skillets..." />
                )}

            </div>
            <ToastContainer />
        </div>
    )
}