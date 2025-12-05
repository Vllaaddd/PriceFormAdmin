import { UmkartonWithPrices } from "@/prisma/types";
import { Api } from "@/services/api-client";
import { PriceTier } from "@prisma/client";
import { FC, useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { Label } from "./label";
import { Trash2 } from "lucide-react";

interface Props{
    umkartons: UmkartonWithPrices[];
    tiers: PriceTier[];
    onDeleteUmkarton?: (id: string) => Promise<void>;
    onDeleteTier?: (id: string) => Promise<void>;
}

export const UmkartonsTable: FC<Props> = ({ umkartons, tiers, onDeleteUmkarton, onDeleteTier }) => {

    const [draft, setDraft] = useState<Record<string, string>>({});

    const findPrice = (umkarton: UmkartonWithPrices, tierId: number) =>
        umkarton?.tierPrices?.find((tp: any) => tp.tierId === tierId)?.price;

    const handleChange = async (umkartonId: number, tierId: number, value: string) => {
        setDraft((prev) => ({ ...prev, [`${umkartonId}:${tierId}`]: value }));

        const price = Number(value);
        if (Number.isNaN(price)) {
            toast.error("Price must be a number");
            return;
        }

        try {
            await Api.umkartons.setTierPrice({umkartonId, tierId, price});
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
                            <th className="px-5 py-3">FS dimension</th>
                            <th className="px-5 py-3">FS quantity</th>
                            <th className="px-5 py-3">Height</th>
                            <th className="px-5 py-3">Depth</th>
                            <th className="px-5 py-3">Width</th>
                            <th className="px-5 py-3">Price</th>
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
                        {umkartons?.map((umkarton, index) => {

                            return (
                                <tr
                                    key={umkarton.id}
                                    className={`transition-colors ${
                                        index % 2 === 0 ? "bg-white" : "bg-gray-100"
                                    } hover:bg-blue-50`}
                                >
                                    <td className="px-5 py-3 font-medium">{umkarton.article}</td>
                                    <td className="px-5 py-3">{umkarton.fsDimension}</td>
                                    <td className="px-5 py-3">{umkarton.fsQty}</td>
                                    <td className="px-5 py-3">{umkarton.height}</td>
                                    <td className="px-5 py-3">{umkarton.depth}</td>
                                    <td className="px-5 py-3">{umkarton.width}</td>
                                    <td className="px-5 py-3">{umkarton.basePrice}</td>
                                    {tiers.map((tierPrice) => {
                                        const key = `${umkarton.id}:${tierPrice.id}`;
                                        const value =
                                            draft[key] !== undefined
                                            ? draft[key]
                                            : String(findPrice(umkarton, tierPrice.id) ?? "");

                                        return (
                                            <td key={tierPrice.id} className="px-5 py-3">
                                            <input
                                                type="text"
                                                value={value}
                                                onChange={(e) => handleChange(umkarton.id, tierPrice.id, e.target.value)}
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
                                                title="Delete umkarton"
                                                aria-label="Delete umkarton"
                                                onClick={() => onDeleteUmkarton?.(String(umkarton.id))}
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