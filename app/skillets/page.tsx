'use client'

import { CreateInput } from "@/components/create-input";
import { Label } from "@/components/label";
import { SkilletsSkeleton } from "@/components/skeletons/skillet-skeleton";
import { SkilletsTable } from "@/components/skillets-table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Api } from "@/services/api-client";
import { PriceTier, Skillet } from "@prisma/client";
import { BoxSelect, Layers, Plus, Search, Trash2, Upload } from "lucide-react";
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
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    
    const [newSkilletPrices, setNewSkilletPrices] = useState<Record<string, string>>({})
    const [created, setCreated] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");

    const [form, setForm] = useState({
        article: '', height: '', depth: '', width: '', price: '', knife: '', density: '',
    });

    const [priceTierForm, setPriceTierForm] = useState({
        minPrice: null, maxPrice: null,
    });

    const loadData = async () => {
        try {
            const skillets = await Api.skillets.getAll();
            const tiers = await Api.skillets.getAllTiers();

            setSkillets(skillets);
            setPriceTiers(tiers.sort((a, b) => a.minQty - b.minQty));
        } catch (error) {
            console.error(error);
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    }
    
    useEffect(() => {
        loadData();
    }, []);

    const filteredSkillets = skillets.filter(item => 
        item.article.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
            toast.error('Please fill all fields!'); return;
        }
        try {
            const newTier = await Api.skillets.createPriceTier({ minQty: Number(priceTierForm.minPrice), maxQty: Number(priceTierForm.maxPrice) });
            setPriceTiers((prev) => [...prev, newTier].sort((a, b) => a.minQty - b.minQty));
            toast.success(`New price tier created!`);
            setIsPriceTierDialogOpen(false);
            setPriceTierForm({ minPrice: null, maxPrice: null});
        } catch (error) {
            toast.error("Failed to create price tier");
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

    const handleDeleteAll = async () => {
        Swal.fire({
            title: 'Are you sure?',
            text: "This will delete ALL skillets. This action cannot be undone!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#374151',
            confirmButtonText: 'Yes, delete all'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await Api.skillets.deleteAllSkillets(); 
                    
                    setSkillets([]);
                    toast.success("All skillets deleted successfully");
                } catch (error) {
                    console.error(error);
                    toast.error("Failed to delete all skillets");
                }
            }
        });
    };

    const fileInputRef = useRef<HTMLInputElement>(null);
    const handleButtonClick = () => fileInputRef.current?.click();

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setCreated(0);
        setRows([]);

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
                    depth: parseFloat(row['Depth']) || undefined,
                    width: parseFloat(row['Width']) || undefined,
                    knife: row['Knife']?.toString()?.trim() || '',
                    density: parseFloat(row['Density']) || undefined,
                    basePrice: parseFloat(row['Base price']) || undefined,
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
                        knife: row.knife === 'ja' ? 'With knife' : 'Without knife',
                        density: row.density,
                        price: row.basePrice,
                        prices: row.prices
                    });

                    if ((result as any).skipped) {
                        skippedCount++;
                    } else {
                        createdCount++;
                        setSkillets(prev => [result, ...prev]);
                    }

                } catch (err) {
                    console.error(`Error uploading ${row.article}`, err);
                    toast.error(`Failed to upload skillet ${row.article}`);
                }

                setCreated(prev => prev + 1);
            }
            
            if (createdCount > 0 || skippedCount > 0) {
                toast.success(`Upload complete! Created: ${createdCount}, Skipped: ${skippedCount}`);
            } else {
                toast.info("No new skillets were added.");
            }
            
            await loadData();
            setUploading(false);
            if(fileInputRef.current) fileInputRef.current.value = '';
        };
        reader.readAsBinaryString(file);
    };

    const progressPercentage = rows.length > 0 ? Math.round((created / rows.length) * 100) : 0;
    
    return(
        <div className='min-h-screen bg-gray-50/50 py-10 px-4 sm:px-6 lg:px-8'>
            <div className="w-[95%] mx-auto">

                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                <BoxSelect size={28} />
                            </div>
                            Skillets Management
                        </h1>
                        <p className="text-gray-500 mt-1 ml-1">Manage skillet dimensions, properties, and dynamic price tiers.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">

                        <div className="relative order-last xl:order-first w-full xl:w-auto mt-2 xl:mt-0">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Search article..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 h-11 w-full xl:w-64 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
                            />
                        </div>

                    <div className="hidden xl:block h-8 w-px bg-gray-300 mx-1"></div>

                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md rounded-xl px-4 h-11 transition-all flex items-center gap-2 cursor-pointer">
                                    <Plus className="w-4 h-4" /> New Skillet
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Create New Skillet</DialogTitle>
                                </DialogHeader>
                                <div className="grid grid-cols-2 gap-4 py-4">
                                    <div className="col-span-2"><CreateInput title="Article" placeholder="M69065" value={form.article} onChange={(e) => setForm((p) => ({ ...p, article: e.target.value }))} /></div>
                                    <CreateInput title="Knife Type" placeholder="Paper / No knife" value={form.knife} onChange={(e) => setForm((p) => ({ ...p, knife: e.target.value }))} />
                                    <CreateInput title="Density" placeholder="350" value={form.density} onChange={(e) => setForm((p) => ({ ...p, density: e.target.value }))} />
                                    
                                    <div className="col-span-2 grid grid-cols-3 gap-4">
                                         <CreateInput title="Height" placeholder="39" value={form.height} onChange={(e) => setForm((p) => ({ ...p, height: e.target.value }))} />
                                         <CreateInput title="Width" placeholder="39" value={form.width} onChange={(e) => setForm((p) => ({ ...p, width: e.target.value }))} />
                                         <CreateInput title="Depth" placeholder="39" value={form.depth} onChange={(e) => setForm((p) => ({ ...p, depth: e.target.value }))} />
                                    </div>

                                    <div className="col-span-2 h-px bg-gray-100 my-2" />
                                    
                                    <div className="col-span-2">
                                        <h4 className="text-sm font-medium mb-2 text-gray-700">Base Price</h4>
                                        <CreateInput title="" placeholder="0.15" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} />
                                    </div>

                                    <div className="col-span-2">
                                        <h4 className="text-sm font-medium mb-2 text-gray-700">Tier Prices</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {priceTiers.map(tier => (
                                                <CreateInput 
                                                    key={tier.id} 
                                                    title={<Label tier={tier} />} 
                                                    placeholder="0.12" 
                                                    value={newSkilletPrices[tier.id]} 
                                                    onChange={(e) => setNewSkilletPrices((p) => ({ ...p, [tier.id]: e.target.value }))} 
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="cursor-pointer">Cancel</Button>
                                    <Button onClick={handleCreateSkillet} className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">Create</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <Dialog open={isPriceTierDialogOpen} onOpenChange={setIsPriceTierDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 rounded-xl px-4 h-11 flex items-center gap-2 cursor-pointer">
                                    <Layers className="w-4 h-4" /> Add Tier
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader><DialogTitle>Add Price Tier</DialogTitle></DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <CreateInput type="number" title="Min Qty" placeholder="1000" value={priceTierForm.minPrice || ''} onChange={(e) => setPriceTierForm(p => ({...p, minPrice: e.target.value}))} />
                                    <CreateInput type="number" title="Max Qty" placeholder="5000" value={priceTierForm.maxPrice || ''} onChange={(e) => setPriceTierForm(p => ({...p, maxPrice: e.target.value}))} />
                                </div>
                                <DialogFooter>
                                     <Button variant="outline" onClick={() => setIsPriceTierDialogOpen(false)} className="cursor-pointer">Cancel</Button>
                                     <Button onClick={handleCreatePriceTier} className="bg-blue-600 text-white cursor-pointer">Add Tier</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <input type="file" accept=".xlsx, .xls" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                        <Button onClick={handleButtonClick} variant="secondary" className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl px-4 h-11 flex items-center gap-2 cursor-pointer shadow-sm">
                            <Upload className="w-4 h-4" /> Import Excel
                        </Button>

                        {skillets.length > 0 && (
                            <Button 
                                onClick={handleDeleteAll} 
                                variant="destructive" 
                                className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 rounded-xl px-3 h-11 flex items-center gap-2 cursor-pointer transition-colors"
                                title="Delete all items"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </div>        

                {loading ? (
                    <SkilletsSkeleton />
                ) : uploading ? (
                    <div className="p-10 text-center bg-white rounded-2xl shadow border border-gray-100 max-w-lg mx-auto mt-20">
                        <div className="mb-6 text-blue-500 flex justify-center">
                            <Upload className="w-12 h-12 animate-bounce" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Uploading Skillets...</h3>
                        
                        <p className="text-gray-500 font-medium mb-4">
                            Processed <span className="text-blue-600 font-bold">{created}</span> of <span className="text-gray-900 font-bold">{rows.length}</span> items
                        </p>

                        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden border border-gray-200">
                            <div 
                                className="bg-blue-500 h-full rounded-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-2 text-right">{progressPercentage}%</p>
                    </div>
                ) : filteredSkillets?.length > 0 ? (
                    <SkilletsTable skillets={filteredSkillets as any} tiers={priceTiers} onDeleteSkillet={handleDeleteSkillet} onDeleteTier={handleDeleteTier} />
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
                        <div className="inline-flex p-4 bg-gray-50 rounded-full mb-4 text-gray-400"><BoxSelect size={40} /></div>
                        <h3 className="text-lg font-medium text-gray-900">No skillets found</h3>
                    </div>
                )}

            </div>
            <ToastContainer position="top-right" theme="colored" />
        </div>
    )
}