'use client'

import { CreateInput } from "@/components/create-input";
import { UmkartonsTable } from "@/components/umkartons-table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Api } from "@/services/api-client";
import {  Umkarton } from "@prisma/client";
import { Package, Plus, Search, Trash2, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import Swal from "sweetalert2";
import * as XLSX from 'xlsx';
import { UmkartonsSkeleton } from "@/components/skeletons/umkartons-skeleton";

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
    const [created, setCreated] = useState(0);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [rows, setRows] = useState<ParsedRow[]>([]);

    const [searchTerm, setSearchTerm] = useState("");

    const [form, setForm] = useState({
        article: '', fsDimension: '', displayCarton: '', color: '', deckel: '', fsQty: '', height: '', width: '', depth: '', bedoManu: '', basePrice: '',
    });

    const loadData = async () => {
            try {

                const umkartons = await Api.umkartons.getAll();
                setUmkartons(umkartons);

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

    const filteredUmkartons = umkartons.filter(item => 
        item.article.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreateUmkarton = async () => {
        if (!form.article || !form.width || !form.height || !form.depth || !form.basePrice) {
            toast.error('Please fill all required fields!'); return;
        }

        try {
            const newUmkarton = await Api.umkartons.create({
                article: form.article,
                fsDimension: Number(form.fsDimension),
                displayCarton: form.displayCarton.toLocaleLowerCase(),
                color: Number(form.color),
                deckel: form.deckel,
                fsQty: Number(form.fsQty),
                height: Number(form.height),
                width: Number(form.width),
                depth: Number(form.depth),
                bedoManu: form.bedoManu.toLocaleLowerCase(),
                basePrice: Number(form.basePrice),
            })
            setUmkartons(prev => [newUmkarton, ...prev]);
            toast.success(`New umkarton "${form.article}" created!`);
            setIsDialogOpen(false);
            setForm({ article: '', fsDimension: '', displayCarton: '',color: '', deckel: '', fsQty: '', height: '', width: '', depth: '', bedoManu: '', basePrice: '',});
        } catch (error) {
            toast.error("Failed to create umkarton");
        }
    };

    const handleDeleteUmkarton = async (id: string) => {
        Swal.fire({
            title: `Delete this umkarton?`,
            text: "This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#374151',
            confirmButtonText: "Yes, delete it",
        }).then( async (result) => {
            if (result.isConfirmed) {
                try {
                    await Api.umkartons.deleteUmkarton(id);
                    setUmkartons(p => p.filter(s => s.id !== Number(id)));
                    toast.success("Umkarton deleted"); 
                } catch (error) {
                    toast.error("Failed to delete umkarton.");
                }
            }
        });
    };

    const handleDeleteAll = async () => {
        Swal.fire({
            title: 'Are you sure?',
            text: "This will delete ALL umkartons. This cannot be undone!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#374151',
            confirmButtonText: 'Yes, delete all'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await Api.umkartons.deleteAllUmkartons();
                    
                    setUmkartons([]);
                    toast.success("All umkartons deleted successfully");
                } catch (error) {
                    console.error(error);
                    toast.error("Failed to delete all umkartons");
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
            const worksheet = workbook.Sheets['UK'];
            
            if(!worksheet) {
                toast.error("Sheet 'UK' not found!");
                setLoading(false);
                return;
            }

            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            const parsedRows: ParsedRow[] = (jsonData as any[]).map((row) => {
                const data = {
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

                return data;
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
                    }

                } catch (err) {
                    console.error(`Error uploading ${row.article}`, err);
                    toast.error(`Failed to upload umkarton ${row.article}`);
                }

                setCreated(prev => prev + 1);
            }

            await loadData();
            
            if (createdCount > 0 || skippedCount > 0) {
                toast.success(`Upload complete! Created: ${createdCount}, Skipped: ${skippedCount}`);
            } else {
                toast.info("No new umkartons were added.");
            }
            
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
                                <Package size={28} />
                            </div>
                            Umkartons
                        </h1>
                        <p className="text-gray-500 mt-1 ml-1">Manage umkartons, dimensions, and price tiers.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Search by Article..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 h-11 w-64 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
                            />
                        </div>

                        <div className="h-8 w-px bg-gray-300 mx-2 hidden xl:block"></div>

                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md rounded-xl px-4 h-11 transition-all flex items-center gap-2 cursor-pointer">
                                    <Plus className="w-4 h-4" /> New Umkarton
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader><DialogTitle>Create New Umkarton</DialogTitle></DialogHeader>
                                <div className="grid grid-cols-2 gap-4 py-4">
                                    <div className="col-span-2"><CreateInput title="Article" placeholder="M69065" value={form.article} onChange={(e) => setForm((p) => ({ ...p, article: e.target.value }))} /></div>
                                    
                                    <CreateInput title="FS quantity" placeholder="24" value={form.fsQty} onChange={(e) => setForm((p) => ({ ...p, fsQty: e.target.value }))} />
                                    <CreateInput title="FS dimension" placeholder="45" value={form.fsDimension} onChange={(e) => setForm((p) => ({ ...p, fsDimension: e.target.value }))} />
                                    <CreateInput title="Display carton" placeholder="ja" value={form.displayCarton} onChange={(e) => setForm((p) => ({ ...p, displayCarton: e.target.value }))} />
                                    <CreateInput title="Color" placeholder="0" value={form.color} onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))} />
                                    <CreateInput title="Bedo/manu" placeholder="ja" value={form.bedoManu} onChange={(e) => setForm((p) => ({ ...p, bedoManu: e.target.value }))} />
                                    <CreateInput title="Deckel" placeholder="M80251" value={form.deckel} onChange={(e) => setForm((p) => ({ ...p, deckel: e.target.value }))} />

                                    <div className="col-span-2 grid grid-cols-3 gap-4">
                                        <CreateInput title="Height" placeholder="39" value={form.height} onChange={(e) => setForm((p) => ({ ...p, height: e.target.value }))} />
                                        <CreateInput title="Width" placeholder="39" value={form.width} onChange={(e) => setForm((p) => ({ ...p, width: e.target.value }))} />
                                        <CreateInput title="Depth" placeholder="39" value={form.depth} onChange={(e) => setForm((p) => ({ ...p, depth: e.target.value }))} />
                                    </div>

                                    <div className="col-span-2 h-px bg-gray-100 my-2" />
                                    <div className="col-span-2">
                                        <h4 className="text-sm font-medium mb-2 text-gray-700">Price</h4>
                                        <CreateInput title="" placeholder="0.15" value={form.basePrice} onChange={(e) => setForm((p) => ({ ...p, basePrice: e.target.value }))} />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="cursor-pointer">Cancel</Button>
                                    <Button onClick={handleCreateUmkarton} className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">Create</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <input type="file" accept=".xlsx, .xls" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                        <Button onClick={handleButtonClick} variant="secondary" className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl px-4 h-11 flex items-center gap-2 cursor-pointer shadow-sm">
                            <Upload className="w-4 h-4" /> Import Excel
                        </Button>

                        {umkartons.length > 0 && (
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
                    <UmkartonsSkeleton />
                ) : uploading ? (
                     <div className="p-10 text-center bg-white rounded-2xl shadow border border-gray-100 max-w-lg mx-auto mt-20">
                        <div className="mb-6 text-blue-500 flex justify-center"><Upload className="w-12 h-12 animate-bounce" /></div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Uploading Umkartons...</h3>
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
                ) : filteredUmkartons.length > 0 ? (
                    <UmkartonsTable 
                        umkartons={filteredUmkartons as any}
                        onDeleteUmkarton={handleDeleteUmkarton}
                    />
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
                        <div className="inline-flex p-4 bg-gray-50 rounded-full mb-4 text-gray-400"><Package size={40} /></div>
                        <h3 className="text-lg font-medium text-gray-900">
                            {searchTerm ? `No results for "${searchTerm}"` : "No umkartons found"}
                        </h3>
                        {searchTerm && (
                            <Button variant="link" onClick={() => setSearchTerm("")} className="mt-2 text-blue-600 cursor-pointer">
                                Clear search
                            </Button>
                        )}
                    </div>
                )}

            </div>
            <ToastContainer position="top-right" theme="colored" />
        </div>
    )
}