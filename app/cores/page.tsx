'use client'

import { CoresTable } from "@/components/cores-table";
import { CreateInput } from "@/components/create-input";
import { LoadingCard } from "@/components/loading-card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Api } from "@/services/api-client";
import { Core } from "@prisma/client";
import { PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import Swal from "sweetalert2";

export default function CoresPage(){
  
    const [cores, setCores] = useState<Core[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const [form, setForm] = useState({
        article: "",
        length: '',
        width: '',
        thickness: '',
        type: '',
        price: '',
    });

    useEffect(() => {
        async function fetchData() {
            
        const cores = await Api.cores.getAll();
        
        const sortedCores = cores.sort((a, b) => {
            if (a.length === b.length) {
                return a.thickness - b.thickness;
            }
                return a.length - b.length;
        });

        setCores(sortedCores)     

        }

        fetchData();
    }, []);

    const handleCreate = async () => {
        if (!form.article || !form.length || !form.width || !form.thickness || !form.type || !form.price) {
            toast.error('Please fill all fields!')
            return;
        }

        try {
            const newCore = await Api.cores.create(form)
            setCores(prev => [...prev, newCore])
            toast.success(`New core "${form.article}" created!`)
            setIsDialogOpen(false);
            setForm({ article: "", length: "", width: "", thickness: "", type: "", price: ""});
        } catch (error) {
            console.error(error);
            toast.error("Failed to create core")
        }
    };

    const handleDeleteCore = async (coreId: string) => {
    
        Swal.fire({
            title: `Do you want to delete core?`,
            showCancelButton: true,
            confirmButtonText: "Delete",
            cancelButtonColor: 'red'
        }).then( async (result) => {
            if (result.isConfirmed) {
                try {
                    await Api.cores.deleteCore(coreId)
                    setCores((prev) => prev.filter((c) => c.id !== Number(coreId)));
                    toast.success("Core deleted!");
                } catch (error) {
                    toast.error("Failed to delete core.");
                }
            } else if (result.isDenied) {
                Swal.fire("Changes are not saved", "", "info");
                return
            }
        });
    };

    return(
        <div className='min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 py-10 px-6'>
            <div className="max-w-7xl mx-auto space-y-10">

                <div className="flex items-center justify-center gap-10 mb-8">

                    <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">
                        Cores Overview
                    </h1>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild className="cursor-pointer">
                            <Button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl shadow-sm transition-all duration-200">
                                <PlusCircle className="w-4 h-4" />
                                New Core
                            </Button>
                        </DialogTrigger>

                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Create New Core</DialogTitle>
                            </DialogHeader>

                            <div className="flex flex-col gap-3 py-2">
                                <CreateInput
                                    title="Core article"
                                    placeholder="e.g. M40480"
                                    value={form.article}
                                    onChange={(e) =>
                                        setForm((prev) => ({ ...prev, article: e.target.value }))
                                    }
                                />

                                <CreateInput
                                    title="Length"
                                    placeholder="e.g. 315 (mm)"
                                    value={form.length}
                                    onChange={(e) =>
                                        setForm((prev) => ({ ...prev, length: e.target.value }))
                                    }
                                />

                                <CreateInput
                                    title="Width"
                                    placeholder="e.g. 30 (mm)"
                                    value={form.width}
                                    onChange={(e) =>
                                        setForm((prev) => ({ ...prev, width: e.target.value }))
                                    }
                                />

                                <CreateInput
                                    title="Thickness"
                                    placeholder="e.g. 2 (mm)"
                                    value={form.thickness}
                                    onChange={(e) =>
                                        setForm((prev) => ({ ...prev, thickness: e.target.value }))
                                    }
                                />

                                <CreateInput
                                    title="Type"
                                    placeholder="e.g. Consumer / Catering"
                                    value={form.type}
                                    onChange={(e) =>
                                        setForm((prev) => ({ ...prev, type: e.target.value }))
                                    }
                                />

                                <CreateInput
                                    title="Price"
                                    placeholder="e.g. 0.10"
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
                                    onClick={handleCreate}
                                >
                                    Create
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {cores?.length > 0 ? (
                    <CoresTable cores={cores as any} onDeleteCore={handleDeleteCore} />
                ) : (
                    <LoadingCard text="Loading cores..." />
                )}
            </div>
            <ToastContainer />
        </div>
    )
}