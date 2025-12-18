'use client'

import { useEffect, useState } from "react";
import { Api } from "@/services/api-client";
import { Calculation } from "@prisma/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Swal from "sweetalert2";
import Link from "next/link";
import { LoadingCard } from "@/components/loading-card";

export default function CalculationsEditPage() {
    const [calculations, setCalculations] = useState<Calculation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            const data = await Api.calculations.getAll();
            setCalculations(data.sort(
                (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            ));
            setLoading(false);
        }
        fetchData();
    }, []);

    async function handleDelete(id: number) {
        Swal.fire({
            title: `Do you want to delete calculation?`,
            showCancelButton: true,
            confirmButtonText: "Delete",
            cancelButtonColor: 'red'
        }).then( async (result) => {
            if (result.isConfirmed) {
                try {
                    await Api.calculations.deleteCalculation(id);
                    setCalculations((prev) => prev.filter((c) => c.id !== id));
                    toast.success("Calculation deleted!");
                } catch (err) {
                    toast.error("Failed to delete calculation.");
                }
            } else if (result.isDenied) {
                Swal.fire("Changes are not saved", "", "info");
                return
            }
        });
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 py-10 px-6">
            <div className="max-w-6xl mx-auto space-y-10">

                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">Calculations</h1>
                    <p className="text-gray-600 text-lg">View, edit, or delete existing calculations</p>
                </div>

                <Card className="shadow-md">
                    <CardHeader>
                        <CardTitle>All Calculations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <LoadingCard text="Loading calculations..." />
                        ) : calculations.length === 0 ? (
                            <p className="text-gray-500 text-center py-6">No calculations found</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-left">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="p-3 text-sm font-semibold text-gray-700">#</th>
                                            <th className="p-3 text-sm font-semibold text-gray-700">Title</th>
                                            <th className="p-3 text-sm font-semibold text-gray-700">Material</th>
                                            <th className="p-3 text-sm font-semibold text-gray-700">Width</th>
                                            <th className="p-3 text-sm font-semibold text-gray-700">Date</th>
                                            <th className="p-3 text-sm font-semibold text-gray-700 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {calculations.map((calc, i) => (
                                            <tr key={calc.id} className="border-b hover:bg-gray-50 transition">
                                                <td className="p-3 text-gray-600">{i + 1}</td>
                                                <td className="p-3 text-gray-800">{calc.title}</td>
                                                <td className="p-3">{calc.material}</td>
                                                <td className="p-3">{calc.materialWidth}</td>
                                                <td className="p-3 text-gray-500">
                                                    {new Date(calc.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="p-3 flex items-center justify-center gap-2">
                                                    <Link href={`/calculations/edit/${calc.id}`}>
                                                        <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="cursor-pointer"
                                                        >
                                                        Edit
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        className="cursor-pointer"
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleDelete(calc.id)}
                                                    >
                                                        Delete
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}