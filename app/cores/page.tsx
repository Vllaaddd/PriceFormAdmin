'use client'

import { CoresTable } from "@/components/cores-table";
import { CreateInput } from "@/components/create-input";
import { CoresSkeleton } from "@/components/skeletons/cores-skeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Api } from "@/services/api-client";
import { Core } from "@prisma/client";
import { Plus, Search, Upload, Trash2, Cylinder } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import Swal from "sweetalert2";
import * as XLSX from 'xlsx';

interface ParsedCoreRow {
    article: string;
    length: number;
    width: number;
    thickness: number;
    type: string;
    price: number;
}

export default function CoresPage(){
  
    const [cores, setCores] = useState<Core[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    const [created, setCreated] = useState(0);
    const [totalRows, setTotalRows] = useState(0);

    const [form, setForm] = useState({
        article: "", length: '', width: '', thickness: '', type: '', price: '',
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadData = async () => {
        try {
            const coresData = await Api.cores.getAll();
            const sortedCores = coresData.sort((a, b) => {
                if (a.length === b.length) return a.thickness - b.thickness;
                return a.length - b.length;
            });
            setCores(sortedCores);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load cores");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const filteredCores = cores.filter(item => 
        item.article.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreate = async () => {
        if (!form.article || !form.length || !form.width || !form.thickness || !form.type || !form.price) {
            toast.error('Please fill all fields!'); return;
        }

        try {
            const newCore = await Api.cores.create(form);
            setCores(prev => [...prev, newCore].sort((a, b) => a.length - b.length));
            toast.success(`New core "${form.article}" created!`);
            setIsDialogOpen(false);
            setForm({ article: "", length: "", width: "", thickness: "", type: "", price: ""});
        } catch (error) {
            console.error(error);
            toast.error("Failed to create core");
        }
    };

    const handleDeleteCore = async (coreId: string) => {
        Swal.fire({
            title: `Delete this core?`,
            text: "This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#374151',
            confirmButtonText: "Yes, delete it",
        }).then( async (result) => {
            if (result.isConfirmed) {
                try {
                    await Api.cores.deleteCore(coreId);
                    setCores((prev) => prev.filter((c) => c.id !== Number(coreId)));
                    toast.success("Core deleted successfully");
                } catch (error) {
                    toast.error("Failed to delete core.");
                }
            }
        });
    };

    const handleDeleteAll = async () => {
        Swal.fire({
            title: 'Delete ALL cores?',
            text: "This will wipe the entire cores inventory. This cannot be undone!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#374151',
            confirmButtonText: 'Yes, delete everything'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await Api.cores.deleteAllCores(); 

                    setCores([]);
                    toast.success("All cores deleted successfully");
                } catch (error) {
                    console.error(error);
                    toast.error("Failed to delete all cores");
                }
            }
        });
    };

    const handleButtonClick = () => fileInputRef.current?.click();

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setCreated(0);
        setTotalRows(0);

        const reader = new FileReader();
        
        reader.onload = async (e) => {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const worksheet = workbook.Sheets['Cores'];
            
            if(!worksheet) {
                toast.error("Sheet cores not found!");
                setUploading(false);
                return;
            }

            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            const parsedRows: ParsedCoreRow[] = (jsonData as any[]).map((row) => ({
                article: row['Artikelnr']?.toString()?.trim() || row['Article']?.toString()?.trim() || '',
                length: parseFloat(row['Length']) || 0,
                width: parseFloat(row['Width']) || 0,
                thickness: parseFloat(row['Thickness']) || 0,
                type: row['Type']?.toString()?.trim() || '',
                price: parseFloat(row['Price']) || 0,
            })).filter(r => r.article && r.length > 0);

            setTotalRows(parsedRows.length);

            let createdCount = 0;
            let skippedCount = 0;

            for (const row of parsedRows) {
                try {
                    const coreData = {
                        article: row.article,
                        length: row.length.toString(),
                        width: row.width.toString(),
                        thickness: row.thickness.toString(),
                        type: row.type,
                        price: row.price.toString()
                    };

                    await Api.cores.create(coreData);
                    createdCount++;
                } catch (err) {
                    console.error(`Error uploading ${row.article}`, err);
                    skippedCount++;
                }
                setCreated(prev => prev + 1);
            }

            await loadData();
            
            setUploading(false);
            
            if (createdCount > 0) {
                toast.success(`Upload complete! Created: ${createdCount}`);
            } else {
                toast.info("No cores created.");
            }
            
            if(fileInputRef.current) fileInputRef.current.value = '';
        };

        reader.readAsBinaryString(file);
    };

    const progressPercentage = totalRows > 0 ? Math.round((created / totalRows) * 100) : 0;

    return(
        <div className='min-h-screen bg-gray-50/50 py-10 px-4 sm:px-6 lg:px-8'>
            <div className="max-w-7xl mx-auto">

                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                <Cylinder size={28} />
                            </div>
                            Cores
                        </h1>
                        <p className="text-gray-500 mt-1 ml-1">Manage core dimensions, types, and pricing.</p>
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
                                    <Plus className="w-4 h-4" /> New Core
                                </Button>
                            </DialogTrigger>

                            <DialogContent className="sm:max-w-lg rounded-2xl p-6">
                                <DialogHeader className="mb-4">
                                    <DialogTitle className="text-2xl font-bold">Create New Core</DialogTitle>
                                </DialogHeader>

                                <div className="grid grid-cols-2 gap-4 py-2">
                                    <div className="col-span-2">
                                        <CreateInput title="Article Name" placeholder="e.g. M40480" value={form.article} onChange={(e) => setForm((prev) => ({ ...prev, article: e.target.value }))} />
                                    </div>
                                    
                                    <CreateInput title="Length (mm)" placeholder="315" value={form.length} onChange={(e) => setForm((prev) => ({ ...prev, length: e.target.value }))} />
                                    <CreateInput title="Width (mm)" placeholder="30" value={form.width} onChange={(e) => setForm((prev) => ({ ...prev, width: e.target.value }))} />
                                    
                                    <CreateInput title="Thickness (mm)" placeholder="2" value={form.thickness} onChange={(e) => setForm((prev) => ({ ...prev, thickness: e.target.value }))} />
                                    <CreateInput title="Price (€)" placeholder="0.10" value={form.price} onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))} />
                                    
                                    <div className="col-span-2">
                                        <CreateInput title="Type" placeholder="Consumer / Catering" value={form.type} onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))} />
                                    </div>
                                </div>

                                <DialogFooter className="flex gap-3 mt-6">
                                    <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-lg h-11 px-6 cursor-pointer">
                                        Cancel
                                    </Button>
                                    <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-11 px-8 cursor-pointer" onClick={handleCreate}>
                                        Create Core
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <input type="file" accept=".xlsx, .xls" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                        <Button onClick={handleButtonClick} variant="secondary" className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl px-4 h-11 flex items-center gap-2 cursor-pointer shadow-sm">
                            <Upload className="w-4 h-4" /> Import Excel
                        </Button>

                        {cores.length > 0 && (
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

                {isLoading ? (
                    <CoresSkeleton />
                ) : uploading ? (
                    <div className="p-10 text-center bg-white rounded-2xl shadow border border-gray-100 max-w-lg mx-auto mt-20">
                        <div className="mb-6 text-blue-500 flex justify-center">
                            <Upload className="w-12 h-12 animate-bounce" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Uploading Cores...</h3>
                        
                        <p className="text-gray-500 font-medium mb-4">
                            Processed <span className="text-blue-600 font-bold">{created}</span> of <span className="text-gray-900 font-bold">{totalRows}</span> items
                        </p>

                        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden border border-gray-200">
                            <div 
                                className="bg-blue-500 h-full rounded-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-2 text-right">{progressPercentage}%</p>
                    </div>
                ) : filteredCores?.length > 0 ? (
                    <CoresTable cores={filteredCores as any} onDeleteCore={handleDeleteCore} />
                ) : (
                     <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
                        <div className="inline-flex p-4 bg-gray-50 rounded-full mb-4 text-gray-400">
                            <Cylinder size={40} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">
                            {searchTerm ? `No results for "${searchTerm}"` : "No cores found"}
                        </h3>
                        {searchTerm ? (
                            <Button variant="link" onClick={() => setSearchTerm("")} className="mt-2 text-blue-600 cursor-pointer">
                                Clear search
                            </Button>
                        ) : (
                            <p className="text-gray-500 mt-1">Get started by creating a new core.</p>
                        )}
                    </div>
                )}
            </div>
            <ToastContainer position="top-right" theme="colored" />
        </div>
    )
}