'use client'

import { useEffect, useState } from "react"
import { Api } from "@/services/api-client"
import { PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmailRecipient } from "@prisma/client"
import { LoadingCard } from "@/components/loading-card"
import Swal from "sweetalert2"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { toast, ToastContainer } from "react-toastify"
import { CreateInput } from "@/components/create-input"

export default function EmailRecipientsPage(){
    const [recipients, setRecipients] = useState<EmailRecipient[]>([])
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [recipientName, setRecipientName] = useState("")
    const [recipientEmail, setRecipientEmail] = useState("")
    
    useEffect(() => {
        async function fetchRecipients() {
            try {
                const data = await Api.recipients.getAll()
                setRecipients(data)
            } catch (err) {
                console.error(err)
                toast.error("Failed to load recipients")
            }
        }

        fetchRecipients()
    }, [])

    const handleCreate = async () => {
        if (!recipientName || !recipientEmail) {
            toast.error('Please fill all fields!')
            return;
        }

        try {
            const newRecipient = await Api.recipients.create({ name: recipientName, email: recipientEmail })
            setRecipients(prev => [...prev, newRecipient])
            setIsDialogOpen(false);
            setRecipientName("");
            setRecipientEmail("");
            toast.success("Recipient added successfully!")
        } catch (error) {
            console.error(error);
            toast.error("Failed to create recipient")
        }

    };
    
    const handleDelete = async (id: number) => {
        Swal.fire({
            title: `Do you want to delete this recipient?`,
            showCancelButton: true,
            confirmButtonText: "Delete",
            cancelButtonColor: 'red'
        }).then( async (result) => {
            if (result.isConfirmed) {
                try {
                    await Api.recipients.deleteRecipient(id)
                    setRecipients(prev => prev.filter(r => r.id !== id))
                    toast.success("Recipient deleted")
                } catch (err) {
                    console.error(err)
                    toast.error("Failed to delete recipient")
                }
            }
        });
    }
    
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 py-10 px-6">
            <div className="max-w-4xl mx-auto space-y-10 flex flex-col items-center">

                <div className="flex justify-between w-full items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        Email Recipients
                    </h1>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild className="cursor-pointer">
                            <Button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl shadow-sm transition-all duration-200">
                                <PlusCircle className="w-4 h-4" />
                                New recipient
                            </Button>
                        </DialogTrigger>

                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Create New Recipient</DialogTitle>
                            </DialogHeader>

                            <div className="flex flex-col gap-3 py-2">

                                <CreateInput
                                    title="Name"
                                    placeholder="Name"
                                    value={recipientName}
                                    onChange={(e) =>
                                        setRecipientName(e.target.value)
                                    }
                                />

                                <CreateInput
                                    title="Email"
                                    placeholder="Email"
                                    value={recipientEmail}
                                    onChange={(e) =>
                                        setRecipientEmail(e.target.value)
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

                {recipients.length > 0 ? (
                    <div className="overflow-x-auto shadow-md rounded-2xl border border-gray-200 bg-white w-full">
                    <table className="min-w-full text-sm text-left text-gray-700">
                        <thead className="bg-gray-50 text-gray-900 text-sm uppercase font-medium">
                        <tr>
                            <th className="px-5 py-3">Name</th>
                            <th className="px-5 py-3">Email</th>
                            <th className="px-5 py-3 text-right">Delete recipient</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {recipients.map((r, i) => (
                            <tr
                            key={r.id}
                            className={`transition-colors ${
                                i % 2 === 0 ? "bg-white" : "bg-gray-50"
                            } hover:bg-blue-50`}
                            >
                            <td className="px-5 py-3">{r.name}</td>
                            <td className="px-5 py-3">{r.email}</td>
                            <td className="px-5 py-3 text-right">
                                <button
                                onClick={() => handleDelete(r.id)}
                                className="text-red-600 hover:text-red-800 font-medium transition cursor-pointer"
                                >
                                Delete
                                </button>
                            </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    </div>
                ) : (
                    <LoadingCard text="Loading recipients..." />
                )}
            </div>
            <ToastContainer />
        </div>
    )
}