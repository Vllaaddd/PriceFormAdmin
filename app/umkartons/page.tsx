'use client'

import { CreateInput } from "@/components/create-input";
import { Label } from "@/components/label";
import { LoadingCard } from "@/components/loading-card";
import { UmkartonsTable } from "@/components/umkartons-table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Api } from "@/services/api-client";
import { PriceTier, Umkarton } from "@prisma/client";
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
    fsDimension?: number;
    displayCarton?: string;
    color?: number;
    deckel?: string;
    fsQty?: number;
    bedoManu?: string;
    height?: number;
    depth?: number;
    width?: number;
    basePrice?: number;
    prices?: RangeTier[];
}

export default function UmkartonsPage() {

    const [umkartons, setUmkartons] = useState<Umkarton[]>([]);
    const [priceTiers, setPriceTiers] = useState<PriceTier[]>([])
    const [rows, setRows] = useState<ParsedRow[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isPriceTierDialogOpen, setIsPriceTierDialogOpen] = useState(false);
    const [newUmkartonPrices, setNewUmkartonPrices] = useState<Record<string, string>>({})
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

            const umkartons = await Api.umkartons.getAll();
            const tiers = await Api.umkartons.getAllTiers()

            setUmkartons(umkartons);

            setPriceTiers(tiers.sort((a, b) => {
                return a.minQty - b.minQty
            }))
        }

        fetchData();
    }, []);

    const handleCreateUmkarton = async () => {
        if (!form.article || !form.width || !form.height || !form.depth || !form.knife || !form.density || !form.price) {
            toast.error('Please fill all fields!')
            return;
        }

        const missingCount = priceTiers.filter(
            (t) => !String(newUmkartonPrices[String(t.id)] ?? "").trim()
        );

        if (missingCount.length > 0) {
            toast.error("Please fill all price fields!");
            return;
        }

        const invalid = priceTiers
            .map((t) => ({
                id: t.id,
                label: `${t.minQty}-${t.maxQty}`,
                raw: String(newUmkartonPrices[String(t.id)]).replace(",", "."),
            }))
            .filter((x) => Number.isNaN(Number(x.raw)));

        if (invalid.length > 0) {
            toast.error("Price fields must be valid numbers!");
            return;
        }

        const formattedPrices = priceTiers.map((t) => ({
            min: t.minQty, 
            max: t.maxQty,
            price: Number(String(newUmkartonPrices[String(t.id)]).replace(",", ".")),
        }));

        try {
            const newUmkarton = await Api.umkartons.create({
                article: form.article,
                height: Number(form.height),
                width: Number(form.width),
                depth: Number(form.depth),
                knife: form.knife,
                density: Number(form.density),
                price: Number(form.price),
                prices: formattedPrices
            })

            if ((newUmkarton as any).skipped) {
                toast.warning(`Umkarton "${form.article}" already exists!`);
            } else {
                setUmkartons(prev => [newUmkarton, ...prev])
                toast.success(`New umkarton "${form.article}" created!`)
                
                setIsDialogOpen(false);
                setForm({ article: "", height: "", width: "", depth: "", price: "", knife: "", density: ""});
                setNewUmkartonPrices({})
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to create umkarton")
        }
    };

    const handleCreatePriceTier = async () => {
        if (!priceTierForm.minPrice || !priceTierForm.maxPrice) {
            toast.error('Please fill all fields!')
            return;
        }

        try {
            const newTier = await Api.umkartons.createPriceTier({ minQty: Number(priceTierForm.minPrice), maxQty: Number(priceTierForm.maxPrice) })
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
                    await Api.umkartons.deletePriceTier(tierId)
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
    
    const handleDeleteUmkarton = async (umkartonId: string) => {
        Swal.fire({
            title: `Do you want to delete umkarton?`,
            showCancelButton: true,
            confirmButtonText: "Delete",
            cancelButtonColor: 'red'
        }).then( async (result) => {
            if (result.isConfirmed) {
                try {
                    await Api.umkartons.deleteUmkarton(umkartonId)
                    setUmkartons((prev) => prev.filter((s) => s.id !== Number(umkartonId)));
                    toast.success("Umkarton deleted!");
                } catch (error) {
                    toast.error("Failed to delete umkarton.");
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
            const worksheet = workbook.Sheets['UK'];
            
            if(!worksheet) {
                toast.error("Sheet 'UK' not found!");
                setLoading(false);
                return;
            }

            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            const parsedRows: ParsedRow[] = (jsonData as any[]).map((row) => {
                const staticData = {
                    article: row['Artikelnr']?.toString()?.trim(),
                    height: parseFloat(row['Height']) || undefined,
                    depth: parseFloat(row['Depth']) || undefined,
                    width: parseFloat(row['Width']) || undefined,
                    basePrice: parseFloat(row['Actual EPF price']) || undefined,
                    fsDimension: parseFloat(row['FS dimension']) || undefined,
                    displayCarton: row['Display carton']?.toString()?.trim() || undefined,
                    color: !isNaN(parseFloat(row['Color'])) ? parseFloat(row['Color']) : undefined,
                    deckel: row['Tray&deckel']?.toString()?.trim() || undefined,
                    fsQty: parseInt(row['Qty of FS/box']) || undefined,
                    bedoManu: row['Bedo/Manual']?.toString()?.trim() || undefined,
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
                    const result = await Api.umkartons.create({
                        article: row.article,
                        height: row.height,
                        depth: row.depth,
                        width: row.width,
                        price: row.basePrice,
                        prices: row.prices,
                        fsDimension: row.fsDimension,
                        displayCarton: row.displayCarton?.toLocaleLowerCase(),
                        color: row.color,
                        deckel: row.deckel,
                        fsQty: row.fsQty,
                        bedoManu: row.bedoManu?.toLocaleLowerCase(),
                    });

                    if ((result as any).skipped) {
                        skippedCount++;
                    } else {
                        createdCount++;
                        
                        setUmkartons(prev => [result, ...prev]); 
                        setCreated(prev => prev + 1);
                    }

                } catch (err) {
                    console.error(`Error uploading ${row.article}`, err);
                    toast.error(`Failed to upload umkarton ${row.article}`);
                }
            }

            setLoading(false);
            
            if (createdCount > 0 || skippedCount > 0) {
                toast.success(`Upload complete! Created: ${createdCount}, Skipped: ${skippedCount}`);
            } else {
                toast.info("No new umkartons were added.");
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
                        Umkartons Overview
                    </h1>

                    <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8">
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild className="cursor-pointer">
                                <Button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl shadow-sm transition-all duration-200">
                                    <PlusCircle className="w-4 h-4" />
                                    New Umkarton
                                </Button>
                            </DialogTrigger>

                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Create New Umkarton</DialogTitle>
                                </DialogHeader>

                                <div className="flex flex-col gap-3 py-2 max-h-[60vh] overflow-y-auto px-1">
                                    <CreateInput
                                        title="Umkarton article"
                                        placeholder="e.g. M69065"
                                        value={form.article}
                                        onChange={(e) =>
                                            setForm((prev) => ({ ...prev, article: e.target.value }))
                                        }
                                    />

                                    <CreateInput
                                        title="Umkarton price"
                                        placeholder="e.g. 0.15"
                                        value={form.price}
                                        onChange={(e) =>
                                            setForm((prev) => ({ ...prev, price: e.target.value }))
                                        }
                                    />

                                    <CreateInput
                                        title="Umkarton height"
                                        placeholder="e.g. 39 or 45"
                                        value={form.height}
                                        onChange={(e) =>
                                            setForm((prev) => ({ ...prev, height: e.target.value }))
                                        }
                                    />

                                    <CreateInput
                                        title="Umkarton depth"
                                        placeholder="e.g. 39 or 45"
                                        value={form.depth}
                                        onChange={(e) =>
                                            setForm((prev) => ({ ...prev, depth: e.target.value }))
                                        }
                                    />

                                    <CreateInput
                                        title="Umkarton width"
                                        placeholder="e.g. 39 or 45"
                                        value={form.width}
                                        onChange={(e) =>
                                            setForm((prev) => ({ ...prev, width: e.target.value }))
                                        }
                                    />

                                    <CreateInput
                                        title="Umkarton fs dimension"
                                        placeholder="e.g. Paper knife / No knife"
                                        value={form.knife}
                                        onChange={(e) =>
                                            setForm((prev) => ({ ...prev, knife: e.target.value }))
                                        }
                                    />

                                    <CreateInput
                                        title="Umkarton display carton"
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
                                            value={newUmkartonPrices[tier.id]}
                                            onChange={(e) =>
                                                setNewUmkartonPrices((prev) => ({ ...prev, [tier.id]: e.target.value }))
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
                                        onClick={handleCreateUmkarton}
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
                                Load umkarton table
                            </Button>
                        </div>
                    </div>
                </div>        

                {loading === true ? (
                    <div>Loading... [{created} / {rows?.length}]</div>
                ) : umkartons?.length > 0 ? (
                    <UmkartonsTable umkartons={umkartons as any} tiers={priceTiers} onDeleteUmkarton={handleDeleteUmkarton} onDeleteTier={handleDeleteTier} />
                ) : (
                    <LoadingCard text="Loading umkartons..." />
                )}

            </div>
            <ToastContainer />
        </div>
    )
}