'use client'

import { useEffect, useState } from "react";
import { Api } from "@/services/api-client";
import { Calculation } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import Swal from "sweetalert2";
import Link from "next/link";
import { LoadingCard } from "@/components/loading-card";
import { Edit2, Eye, Trash2, Search, Calendar, Layers, Ruler, FileText } from "lucide-react"; 

export default function CalculationsEditPage() {
    const [calculations, setCalculations] = useState<Calculation[]>([]);
    const [filteredCalculations, setFilteredCalculations] = useState<Calculation[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        async function fetchData() {
            try {
                const data = await Api.calculations.getAll();
                const sortedData = data.sort(
                    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                setCalculations(sortedData);
                setFilteredCalculations(sortedData);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    useEffect(() => {
        const lowerQuery = searchQuery.toLowerCase();
        const filtered = calculations.filter(c => 
            c.title.toLowerCase().includes(lowerQuery) || 
            c.material.toLowerCase().includes(lowerQuery)
        );
        setFilteredCalculations(filtered);
    }, [searchQuery, calculations]);

    async function handleDelete(id: number) {
        Swal.fire({
            title: `Delete calculation?`,
            text: "This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#3b82f6',
            confirmButtonText: "Yes, delete"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await Api.calculations.deleteCalculation(id);
                    setCalculations((prev) => prev.filter((c) => c.id !== id));
                    setFilteredCalculations((prev) => prev.filter((c) => c.id !== id));
                    toast.success("Deleted successfully!");
                } catch (err) {
                    toast.error("Failed to delete.");
                }
            }
        });
    }

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* HEADER */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                            <FileText className="w-8 h-8 text-blue-600" />
                            Manage Calculations
                        </h1>
                        <p className="text-gray-500 mt-1 text-base">
                            Total records: <span className="font-bold text-gray-900">{filteredCalculations.length}</span>
                        </p>
                    </div>
                    <div className="relative w-full md:w-80">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by title or material..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition shadow-sm"
                        />
                    </div>
                </div>

                {/* TABLE CARD */}
                <Card className="shadow-lg border border-gray-300 rounded-xl overflow-hidden bg-white">
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-10">
                                <LoadingCard text="Loading calculations..." />
                            </div>
                        ) : filteredCalculations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                                <div className="bg-gray-100 p-6 rounded-full mb-4">
                                    <Search className="h-10 w-10 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">No calculations found</h3>
                                <p className="mt-2 text-gray-500">
                                    Try adjusting your search filters.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    {/* Більш контрастний заголовок */}
                                    <thead>
                                        <tr className="bg-gray-100 border-b-2 border-gray-300 text-xs uppercase tracking-wider text-gray-700 font-bold">
                                            <th className="px-6 py-4 border-r border-gray-200">Title & Date</th>
                                            <th className="px-6 py-4 border-r border-gray-200">Material</th>
                                            <th className="px-6 py-4 border-r border-gray-200 w-1/3">Dimensions</th>
                                            <th className="px-6 py-4 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {filteredCalculations.map((calc) => (
                                            <tr 
                                                key={calc.id} 
                                                className="group hover:bg-blue-50/50 transition-colors duration-200"
                                            >
                                                {/* Title & Date Column */}
                                                <td className="px-6 py-4 border-r border-gray-100">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-base font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                                                            {calc.title}
                                                        </span>
                                                        {/* ТУТ ЗАМІСТЬ ID ТЕПЕР ДАТА */}
                                                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                                                            <Calendar className="w-3.5 h-3.5" />
                                                            {new Date(calc.createdAt).toLocaleDateString() + " " + new Date(calc.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Material Column */}
                                                <td className="px-6 py-4 border-r border-gray-100">
                                                    <div className="flex items-center gap-2">
                                                        <Layers className="w-4 h-4 text-blue-600" />
                                                        <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-md border border-gray-200">
                                                            {calc.material}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Dimensions Column (Ваша логіка) */}
                                                <td className="px-6 py-4 border-r border-gray-100">
                                                    <div className="flex items-start gap-2 text-sm text-gray-700 font-medium">
                                                        <Ruler className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                                        <span>
                                                            {calc.material !== "Baking paper"
                                                                ? `${calc.materialWidth} mm × ${calc.materialLength} m × ${calc.materialThickness} my`
                                                                : calc.typeOfProduct === 'Consumer sheets'
                                                                    ? `${calc?.sheetWidth} mm × ${calc.sheetLength} mm`
                                                                    : `${calc?.materialWidth} mm × ${calc.rollLength} m`
                                                            }
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Actions Column */}
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-3">
                                                        <Link href={`/calculations/${calc.id}`}>
                                                            <div className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-100 rounded-lg cursor-pointer transition-all" title="View">
                                                                <Eye className="h-5 w-5" />
                                                            </div>
                                                        </Link>

                                                        <Link href={`/calculations/edit/${calc.id}`}>
                                                            <div className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-100 rounded-lg cursor-pointer transition-all" title="Edit">
                                                                <Edit2 className="h-5 w-5" />
                                                            </div>
                                                        </Link>

                                                        <button
                                                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-lg cursor-pointer transition-all"
                                                            onClick={() => handleDelete(calc.id)}
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="h-5 w-5" />
                                                        </button>
                                                    </div>
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