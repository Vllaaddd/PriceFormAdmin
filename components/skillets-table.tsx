import { SkilletWithPrices } from "@/prisma/types";
import { Api } from "@/services/api-client";
import { PriceTier } from "@prisma/client";
import { FC, useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { Label } from "./label";
import { Trash2 } from "lucide-react";
import Swal from "sweetalert2";

interface Props{
    skillets: SkilletWithPrices[];
    tiers: PriceTier[];
    onDeleteSkillet?: (id: string) => Promise<void>;
    onDeleteTier?: (id: string) => Promise<void>;
}

export const SkilletsTable: FC<Props> = ({ skillets, tiers, onDeleteSkillet, onDeleteTier }) => {

    const [draft, setDraft] = useState<Record<string, string>>({});

    const findPrice = (skillet: SkilletWithPrices, tierId: number) =>
        skillet.tierPrices.find((tp) => tp.tierId === tierId)?.price;

    const handleChange = async (skilletId: number, tierId: number, value: string) => {
        setDraft((prev) => ({ ...prev, [`${skilletId}:${tierId}`]: value }));

        const price = Number(value);
        if (Number.isNaN(price)) {
            toast.error("Price must be a number");
            return;
        }

        try {
            await Api.skillets.setTierPrice({skilletId, tierId, price});
        } catch (e) {
            console.error(e);
            toast.error("Failed to save");
        }
    };

    return(
        <div className="mb-16">
            <div className="overflow-x-auto shadow-md rounded-2xl border border-gray-200 bg-white">
                <table className="min-w-full text-sm text-left text-gray-700">
                    <thead className="bg-gray-50 text-gray-900 text-sm uppercase font-medium">
                        <tr>
                            <th className="px-5 py-3">Article</th>
                            <th className="px-5 py-3">Format (mm)</th>
                            <th className="px-5 py-3">Knife</th>
                            <th className="px-5 py-3">Density</th>
                            {tiers?.map((tier) => (
                                <th key={tier.id} className="px-5 py-3">
                                    <div className="flex items-center gap-2">
                                        <Label tier={tier} />
                                        <button
                                            type="button"
                                            title="Delete price tier"
                                            aria-label="Delete price tier"
                                            onClick={() => onDeleteTier?.(String(tier.id))}
                                            className="ml-1 inline-flex items-center rounded-lg p-1.5 text-red-600 hover:text-red-700 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-200 transition cursor-pointer"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </th>
                            ))}
                            <th className="px-8 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {skillets?.map((skillet, index) => {

                            return (
                                <tr
                                    key={skillet.id}
                                    className={`transition-colors ${
                                        index % 2 === 0 ? "bg-white" : "bg-gray-100"
                                    } hover:bg-blue-50`}
                                >
                                    <td className="px-5 py-3 font-medium">{skillet.article}</td>
                                    <td className="px-5 py-3 font-medium">{skillet.format}</td>
                                    <td className="px-5 py-3">{skillet.knife}</td>
                                    <td className="px-5 py-3">{skillet.density}</td>
                                    {tiers.map((tierPrice) => {
                                        const key = `${skillet.id}:${tierPrice.id}`;
                                        const value =
                                            draft[key] !== undefined
                                            ? draft[key]
                                            : String(findPrice(skillet, tierPrice.id) ?? "");

                                        return (
                                            <td key={tierPrice.id} className="px-5 py-3">
                                            <input
                                                type="text"
                                                value={value}
                                                onChange={(e) => handleChange(skillet.id, tierPrice.id, e.target.value)}
                                                className="w-24 p-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                                                placeholder="—"
                                            />
                                            </td>
                                        );
                                    })}
                                    <td className="px-5 py-3">
                                        <div className="flex">
                                            <button
                                                type="button"
                                                title="Delete skillet"
                                                aria-label="Delete skillet"
                                                onClick={() => onDeleteSkillet?.(String(skillet.id))}
                                                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-red-600 hover:text-red-700 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-200 transition cursor-pointer"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                <span className="hidden sm:inline">Delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <ToastContainer />
        </div>
    )
}