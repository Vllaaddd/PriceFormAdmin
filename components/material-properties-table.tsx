"use client";

import { Api } from "@/services/api-client";
import { Trash2 } from "lucide-react";
import { FC, useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import Swal from "sweetalert2";

type Material = {
    id: number;
    material: string;
    density?: string;
    costPerKg: string;
};

interface Props {
    materials: Material[];
    title: string;
    periodId: number;
    onDelete: () => void;
}

export const MaterialPropertiesTable: FC<Props> = ({ materials, title, periodId, onDelete }) => {
    const [costPerKg, setCostPerKg] = useState<Record<number, string>>({});
    const [sortedMaterials, setSortedMaterials] = useState<Material[]>([]);

    useEffect(() => {
        setSortedMaterials(
            materials.sort((a, b) => {
                if (a.material === "Alu") return -1;
                if (b.material === "Alu") return 1;
                if (a.material === "PE") return -1;
                if (b.material === "PE") return 1;
                if (a.material === "PVC") return -1;
                if (b.material === "PVC") return 1;
                return 0;
            })
        );
    }, [materials]);

    const handleCostPerKgChange = async (id: number, cost: string) => {
        setCostPerKg((prev) => ({ ...prev, [id]: cost }));
        await Api.periods.update(id, cost);
    };

    const handleDeletePeriod = async (id: number) => {

        Swal.fire({
            title: `Do you want to delete period?`,
            showCancelButton: true,
            confirmButtonText: "Delete",
            cancelButtonColor: 'red'
        }).then( async (result) => {
        if (result.isConfirmed) {
            try {
                await Api.periods.deletePeriod(id);
                toast.success("Period deleted!");
                onDelete?.()
            } catch (err) {
                toast.error("Failed to delete period.");
            }
            } else if (result.isDenied) {
                Swal.fire("Changes are not saved", "", "info");
                return
            }
        });

    }

    return (
        <div className="pb-10">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                    <span className="block w-1 h-6 bg-blue-500 rounded-full"></span>
                    {title}
                </h1>

                <button
                    onClick={() => handleDeletePeriod(periodId)}
                    className="flex items-center gap-1 text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg shadow-sm transition-all duration-200 cursor-pointer"
                >
                    <Trash2 size={16} />
                    Delete
                </button>
            </div>

            <div className="overflow-x-auto shadow-md rounded-2xl border border-gray-200 bg-white">
                <table className="min-w-full text-sm text-left text-gray-700">
                    <thead className="bg-gray-50 text-gray-900 uppercase font-medium">
                        <tr>
                            <th className="px-5 py-3 text-center">Material</th>
                            <th className="px-5 py-3 text-center">Density</th>
                            <th className="px-5 py-3 text-center">Cost per kg</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {sortedMaterials?.map((material, index) => (
                            <tr
                                key={material.id}
                                className={`transition-colors ${
                                index % 2 === 0 ? "bg-white" : "bg-gray-100"
                                } hover:bg-blue-50`}
                            >
                                <td className="px-5 py-3 text-center font-medium text-gray-900">
                                    {material.material}
                                </td>
                                <td className="px-5 py-3 text-center">
                                    {material.density || "-"}
                                </td>
                                <td className="px-5 py-3 text-center">
                                    <input
                                        type="number"
                                        step="0.001"
                                        value={costPerKg[material.id] ?? material.costPerKg ?? ""}
                                        onChange={(e) =>
                                            handleCostPerKgChange(
                                                material.id,
                                                e.target.value.replace(",", ".")
                                            )
                                        }
                                        className="w-24 p-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <ToastContainer />
        </div>
    );
};
