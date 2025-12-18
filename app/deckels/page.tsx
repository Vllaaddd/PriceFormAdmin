'use client'

import { CreateInput } from "@/components/create-input";
import { LoadingCard } from "@/components/loading-card";
import { DeckelsTable } from "@/components/deckels-table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Api } from "@/services/api-client";
import { PriceTier, Deckel } from "@prisma/client";
import { PlusCircle, Upload } from "lucide-react";
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
    const [rows, setRows] = useState<ParsedRow[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [created, setCreated] = useState(0);

    const [form, setForm] = useState({
        article: '',
        price: '',
    });

    const handleDeleteDeckel = async (deckelId: string) => {
        
        Swal.fire({
            title: `Do you want to delete deckel?`,
            showCancelButton: true,
            confirmButtonText: "Delete",
            cancelButtonColor: 'red'
        }).then( async (result) => {
            if (result.isConfirmed) {
                try {
                    await Api.deckels.deleteDeckel(deckelId)
                    setDeckels((prev) => prev.filter((c) => c.id !== Number(deckelId)));
                    toast.success("Deckel deleted!");
                } catch (error) {
                    toast.error("Failed to delete deckel.");
                }
            } else if (result.isDenied) {
                Swal.fire("Changes are not saved", "", "info");
                return
            }
        });
    };
    
    useEffect(() => {
        async function fetchData() {

            const deckels = await Api.deckels.getAll();

            setDeckels(deckels);
        }

        fetchData();
    }, []);

    const handleCreateDeckel = async () => {
        if (!form.article || !form.price) {
            toast.error('Please fill all fields!')
            console.log('Please fill all fields!');
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
                setDeckels(prev => [newDeckel, ...prev])
                toast.success(`New deckel "${form.article}" created!`)
                
                setIsDialogOpen(false);
                setForm({ article: "", price: ""});
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to create deckel")
        }
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
            const worksheet = workbook.Sheets['Deckel'];
            
            if(!worksheet) {
                toast.error("Sheet 'Deckel' not found!");
                setLoading(false);
                return;
            }

            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            const parsedRows: ParsedRow[] = (jsonData as any[]).map((row) => ({
                article: row['Deckel']?.toString()?.trim(),
                price: parseFloat(row['Price']) || undefined,
            }));

            setRows(parsedRows);

            let createdCount = 0;
            let skippedCount = 0;

            for (const row of parsedRows) {
                if (!row.article) continue;

                try {
                    const result = await Api.deckels.create({
                        article: row.article,
                        price: row.price,
                    });

                    if ((result as any).skipped) {
                        skippedCount++;
                    } else {
                        createdCount++;
                        
                        setDeckels(prev => [result, ...prev]); 
                        setCreated(prev => prev + 1);
                    }

                } catch (err) {
                    console.error(`Error uploading ${row.article}`, err);
                    toast.error(`Failed to upload deckel ${row.article}`);
                }
            }

            setLoading(false);
            
            if (createdCount > 0 || skippedCount > 0) {
                toast.success(`Upload complete! Created: ${createdCount}, Skipped: ${skippedCount}`);
            } else {
                toast.info("No new deckels were added.");
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
                        Deckels Overview
                    </h1>

                    <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8">
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild className="cursor-pointer">
                                <Button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl shadow-sm transition-all duration-200">
                                    <PlusCircle className="w-4 h-4" />
                                    New Deckel
                                </Button>
                            </DialogTrigger>

                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Create New Deckel</DialogTitle>
                                </DialogHeader>

                                <div className="flex flex-col gap-3 py-2 max-h-[60vh] overflow-y-auto px-1">
                                    <CreateInput
                                        title="Deckel article"
                                        placeholder="e.g. M69065"
                                        value={form.article}
                                        onChange={(e) =>
                                            setForm((prev) => ({ ...prev, article: e.target.value }))
                                        }
                                    />

                                    <CreateInput
                                        title="Deckel price"
                                        placeholder="e.g. 0.15"
                                        value={form.price}
                                        onChange={(e) =>
                                            setForm((prev) => ({ ...prev, price: e.target.value }))
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
                                        onClick={handleCreateDeckel}
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
                                Load deckel table
                            </Button>
                        </div>
                    </div>
                </div>        

                {loading === true ? (
                    <div>Loading... [{created} / {rows?.length}]</div>
                ) : deckels?.length > 0 ? (
                    <DeckelsTable deckels={deckels as any} onDeleteDeckel={handleDeleteDeckel} />
                ) : (
                    <LoadingCard text="Loading deckels..." />
                )}

            </div>
            <ToastContainer />
        </div>
    )
}