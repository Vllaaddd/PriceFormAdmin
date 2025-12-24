'use client'

import { CreateInput } from "@/components/create-input";
import { Label } from "@/components/label";
import { LoadingCard } from "@/components/loading-card";
import { SkilletsTable } from "@/components/skillets-table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Api } from "@/services/api-client";
import { PriceTier, Skillet } from "@prisma/client";
import { PlusCircle, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import Swal from "sweetalert2";
import * as XLSX from 'xlsx';

interface RangeTier {
    min: number;
    max: number;
    price: number;
}

interface ParsedRow {
    article: string;
    knife: string;
    density?: number;
    height?: number;
    depth?: number;
    width?: number;
    basePrice?: number;
    prices?: RangeTier[];
}

export default function SkilletsPage() {

    const [skillets, setSkillets] = useState<Skillet[]>([]);
    const [priceTiers, setPriceTiers] = useState<PriceTier[]>([])
    const [rows, setRows] = useState<ParsedRow[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isPriceTierDialogOpen, setIsPriceTierDialogOpen] = useState(false);
    const [newSkilletPrices, setNewSkilletPrices] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(false);
    const [created, setCreated] = useState(0);

    const [form, setForm] = useState({
        article: '',
        height: '',
        depth: '',
        width: '',
        price: '',
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

            setSkillets(skillets);

            setPriceTiers(tiers.sort((a, b) => {
                return a.minQty - b.minQty
            }))
        }

        fetchData();
    }, []);

    const handleCreateSkillet = async () => {
        if (!form.article || !form.width || !form.height || !form.depth || !form.knife || !form.density || !form.price) {
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

        const formattedPrices = priceTiers.map((t) => ({
            min: t.minQty, 
            max: t.maxQty,
            price: Number(String(newSkilletPrices[String(t.id)]).replace(",", ".")),
        }));

        try {
            const newSkillet = await Api.skillets.create({
                article: form.article,
                height: Number(form.height),
                width: Number(form.width),
                depth: Number(form.depth),
                knife: form.knife,
                density: Number(form.density),
                price: Number(form.price),
                prices: formattedPrices
            })

            if ((newSkillet as any).skipped) {
                toast.warning(`Skillet "${form.article}" already exists!`);
            } else {
                setSkillets(prev => [newSkillet, ...prev])
                toast.success(`New skillet "${form.article}" created!`)
                
                setIsDialogOpen(false);
                setForm({ article: "", height: "", width: "", depth: "", price: "", knife: "", density: ""});
                setNewSkilletPrices({})
            }
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

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setLoading(true);

        const reader = new FileReader();
        
        reader.onload = async (e) => {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const worksheet = workbook.Sheets['FS'];
            
            if(!worksheet) {
                toast.error("Sheet 'FS' not found!");
                setLoading(false);
                return;
            }

            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            const parsedRows: ParsedRow[] = (jsonData as any[]).map((row) => {
                const staticData = {
                    article: row['Artikelnr']?.toString()?.trim() || '',
                    height: parseFloat(row['Height']) || undefined,
                    knife: row['Säge']?.toString()?.trim() || '',
                    density: parseFloat(row['Grammatur']) || undefined,
                    depth: parseFloat(row['Depth']) || undefined,
                    width: parseFloat(row['Width']) || undefined,
                    basePrice: parseFloat(row['Actual EPF price']) || undefined,
                };

                const tiers: RangeTier[] = [];
                Object.keys(row).forEach((key) => {
                    if (/^\d+\s*-\s*\d+$/.test(key)) {
                        const [minStr, maxStr] = key.split('-');
                        const min = parseFloat(minStr);
                        const max = parseFloat(maxStr);
                        const price = parseFloat(row[key]);
                        if (!isNaN(min) && !isNaN(max) && !isNaN(price)) {
                            tiers.push({ min, max, price });
                        }
                    }
                });
                tiers.sort((a, b) => a.min - b.min);

                return { ...staticData, prices: tiers };
            });

            setRows(parsedRows);

            let createdCount = 0;
            let skippedCount = 0;

            for (const row of parsedRows) {
                if (!row.article) continue;

                try {
                    const result = await Api.skillets.create({
                        article: row.article,
                        height: row.height,
                        depth: row.depth,
                        width: row.width,
                        knife: row.knife,
                        density: row.density,
                        price: row.basePrice,
                        prices: row.prices
                    });

                    if ((result as any).skipped) {
                        skippedCount++;
                    } else {
                        createdCount++;
                        
                        setSkillets(prev => [result, ...prev]); 
                        setCreated(prev => prev + 1);
                    }

                } catch (err) {
                    console.error(`Error uploading ${row.article}`, err);
                    toast.error(`Failed to upload skillet ${row.article}`);
                }
            }

            setLoading(false);
            
            if (createdCount > 0 || skippedCount > 0) {
                toast.success(`Upload complete! Created: ${createdCount}, Skipped: ${skippedCount}`);
            } else {
                toast.info("No new skillets were added.");
            }
            
            if(fileInputRef.current) fileInputRef.current.value = '';
        };

        reader.readAsBinaryString(file);
    };
    
    return(
        <div className='min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 py-10 px-6'>
            <div className="p-4 text-center">

                <div className="flex flex-col items-center justify-center gap-4 mb-8">

                    <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">
                        Skillets Overview
                    </h1>

                    <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8">
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

                                <div className="flex flex-col gap-3 py-2 max-h-[60vh] overflow-y-auto px-1">
                                    <CreateInput
                                        title="Skillet article"
                                        placeholder="e.g. M69065"
                                        value={form.article}
                                        onChange={(e) =>
                                            setForm((prev) => ({ ...prev, article: e.target.value }))
                                        }
                                    />

                                    <CreateInput
                                        title="Skillet price"
                                        placeholder="e.g. 0.15"
                                        value={form.price}
                                        onChange={(e) =>
                                            setForm((prev) => ({ ...prev, price: e.target.value }))
                                        }
                                    />

                                    <CreateInput
                                        title="Skillet height"
                                        placeholder="e.g. 39 or 45"
                                        value={form.height}
                                        onChange={(e) =>
                                            setForm((prev) => ({ ...prev, height: e.target.value }))
                                        }
                                    />

                                    <CreateInput
                                        title="Skillet depth"
                                        placeholder="e.g. 39 or 45"
                                        value={form.depth}
                                        onChange={(e) =>
                                            setForm((prev) => ({ ...prev, depth: e.target.value }))
                                        }
                                    />

                                    <CreateInput
                                        title="Skillet width"
                                        placeholder="e.g. 39 or 45"
                                        value={form.width}
                                        onChange={(e) =>
                                            setForm((prev) => ({ ...prev, width: e.target.value }))
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
                                            key={tier.id}
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

                        <div>
                            <input 
                                type="file" 
                                accept=".xlsx, .xls" 
                                ref={fileInputRef} 
                                onChange={handleFileChange} 
                                className="hidden" 
                                style={{ display: 'none' }} 
                            />
                            <Button 
                                onClick={handleButtonClick}
                                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl shadow-sm transition-all duration-200 cursor-pointer"
                            >
                                <Upload className="w-4 h-4" />
                                Load skillet table
                            </Button>
                        </div>
                    </div>
                </div>        

                {loading === true ? (
                    <div>Loading... [{created} / {rows?.length}]</div>
                ) : skillets?.length > 0 ? (
                    <SkilletsTable skillets={skillets as any} tiers={priceTiers} onDeleteSkillet={handleDeleteSkillet} onDeleteTier={handleDeleteTier} />
                ) : (
                    <LoadingCard text="Loading skillets..." />
                )}

            </div>
            <ToastContainer />
        </div>
    )
}