'use client'

import { CreateInput } from "@/components/create-input";
import { DeckelsTable } from "@/components/deckels-table";
import { DeckelsSkeleton } from "@/components/skeletons/deckels-skeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Api } from "@/services/api-client";
import { Deckel } from "@prisma/client";
import { Plus, Search, Upload, Trash2, Archive } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import Swal from "sweetalert2";
import * as XLSX from 'xlsx';

interface ParsedRow {
    article: string;
    price?: number;
}

export default function DeckelsPage() {

    const [deckels, setDeckels] = useState<Deckel[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    const [created, setCreated] = useState(0);
    const [totalRows, setTotalRows] = useState(0);

    const [form, setForm] = useState({
        article: '',
        price: '',
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadData = async () => {
        try {
            const deckelsData = await Api.deckels.getAll();
            setDeckels(deckelsData);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load deckels");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const filteredDeckels = deckels.filter(item => 
        item.article.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreateDeckel = async () => {
        if (!form.article || !form.price) {
            toast.error('Please fill all fields!');
            return;
        }

        try {
            const newDeckel = await Api.deckels.create({
                article: form.article,
                price: Number(form.price),
            })

            if ((newDeckel as any).skipped) {
                toast.warning(`Deckel "${form.article}" already exists!`);
            } else {
                setDeckels(prev => [newDeckel, ...prev]);
                toast.success(`New deckel "${form.article}" created!`)
                setIsDialogOpen(false);
                setForm({ article: "", price: ""});
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to create deckel")
        }
    };

    const handleDeleteDeckel = async (deckelId: string) => {
        Swal.fire({
            title: `Delete this deckel?`,
            text: "This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#374151',
            confirmButtonText: "Yes, delete it",
        }).then( async (result) => {
            if (result.isConfirmed) {
                try {
                    await Api.deckels.deleteDeckel(deckelId)
                    setDeckels((prev) => prev.filter((c) => c.id !== Number(deckelId)));
                    toast.success("Deckel deleted!");
                } catch (error) {
                    toast.error("Failed to delete deckel.");
                }
            }
        });
    };

    const handleDeleteAll = async () => {
        Swal.fire({
            title: 'Delete ALL deckels?',
            text: "This will wipe the entire deckels inventory. This cannot be undone!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#374151',
            confirmButtonText: 'Yes, delete all'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await Api.deckels.deleteAllDeckels();

                    setDeckels([]);
                    toast.success("All deckels deleted successfully");
                } catch (error) {
                    console.error(error);
                    toast.error("Failed to delete all deckels");
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
            const worksheet = workbook.Sheets['Deckel'];
            
            if(!worksheet) {
                toast.error("Sheet 'Deckel' not found!");
                setUploading(false);
                return;
            }

            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            const parsedRows: ParsedRow[] = (jsonData as any[]).map((row) => ({
                article: row['Deckel']?.toString()?.trim(),
                price: parseFloat(row['Price']) || undefined,
            })).filter(row => row.article);

            setTotalRows(parsedRows.length);

            let createdCount = 0;
            let skippedCount = 0;

            for (const row of parsedRows) {
                try {
                    const result = await Api.deckels.create({
                        article: row.article,
                        price: row.price,
                    });

                    if ((result as any).skipped) {
                        skippedCount++;
                    } else {
                        createdCount++;
                    }
                } catch (err) {
                    console.error(`Error uploading ${row.article}`, err);
                    skippedCount++; 
                }
                
                setCreated(prev => prev + 1);
            }

            await loadData();

            setUploading(false);
            
            if (createdCount > 0 || skippedCount > 0) {
                toast.success(`Upload complete! Created: ${createdCount}, Skipped: ${skippedCount}`);
            } else {
                toast.info("No new deckels were added.");
            }
            
            if(fileInputRef.current) fileInputRef.current.value = '';
        };

        reader.readAsBinaryString(file);
    };

    const progressPercentage = totalRows > 0 ? Math.round((created / totalRows) * 100) : 0;
    
    return(
        <div className='min-h-screen bg-gray-50/50 py-10 px-4 sm:px-6 lg:px-8'>
            <div className="max-w-5xl mx-auto">

                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                <Archive size={28} />
                            </div>
                            Deckels
                        </h1>
                        <p className="text-gray-500 mt-1 ml-1">Manage deckel prices and articles.</p>
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
                                    <Plus className="w-4 h-4" /> New Deckel
                                </Button>
                            </DialogTrigger>

                            <DialogContent className="sm:max-w-md rounded-2xl p-6">
                                <DialogHeader className="mb-4">
                                    <DialogTitle className="text-2xl font-bold">Create New Deckel</DialogTitle>
                                </DialogHeader>

                                <div className="flex flex-col gap-4">
                                    <CreateInput title="Article Name" placeholder="e.g. M69065" value={form.article} onChange={(e) => setForm((prev) => ({ ...prev, article: e.target.value }))} />
                                    <CreateInput title="Price (€)" placeholder="0.15" value={form.price} onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))} />
                                </div>

                                <DialogFooter className="mt-6">
                                    <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="cursor-pointer">Cancel</Button>
                                    <Button onClick={handleCreateDeckel} className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">Create</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <input type="file" accept=".xlsx, .xls" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                        <Button onClick={handleButtonClick} variant="secondary" className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl px-4 h-11 flex items-center gap-2 cursor-pointer shadow-sm">
                            <Upload className="w-4 h-4" /> Import Excel
                        </Button>

                        {deckels.length > 0 && (
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
                    <DeckelsSkeleton />
                ) : uploading ? (
                    <div className="p-10 text-center bg-white rounded-2xl shadow border border-gray-100 max-w-lg mx-auto mt-20">
                        <div className="mb-6 text-blue-500 flex justify-center"><Upload className="w-12 h-12 animate-bounce" /></div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Uploading Deckels...</h3>
                        
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
                ) : filteredDeckels.length > 0 ? (
                    <DeckelsTable deckels={filteredDeckels as any} onDeleteDeckel={handleDeleteDeckel} />
                ) : (
                     <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
                        <div className="inline-flex p-4 bg-gray-50 rounded-full mb-4 text-gray-400">
                            <Archive size={40} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">
                            {searchTerm ? `No results for "${searchTerm}"` : "No deckels found"}
                        </h3>
                        {searchTerm ? (
                            <Button variant="link" onClick={() => setSearchTerm("")} className="mt-2 text-blue-600 cursor-pointer">
                                Clear search
                            </Button>
                        ) : (
                            <p className="text-gray-500 mt-1">Get started by creating a new deckel.</p>
                        )}
                    </div>
                )}

            </div>
            <ToastContainer position="top-right" theme="colored" />
        </div>
    )
}