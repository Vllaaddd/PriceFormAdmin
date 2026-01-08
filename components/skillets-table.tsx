import { SkilletWithPrices } from "@/prisma/types";
import { Api } from "@/services/api-client";
import { PriceTier } from "@prisma/client";
import { FC, useState } from "react";
import { toast } from "react-toastify";
import { Label } from "./label";
import { Trash2, Save } from "lucide-react";

interface Props{
    skillets: SkilletWithPrices[];
    tiers: PriceTier[];
    onDeleteSkillet?: (id: string) => Promise<void>;
    onDeleteTier?: (id: string) => Promise<void>;
}

export const SkilletsTable: FC<Props> = ({ skillets, tiers, onDeleteSkillet, onDeleteTier }) => {

    const [draft, setDraft] = useState<Record<string, string>>({});
    const [loadingField, setLoadingField] = useState<string | null>(null);

    const findPrice = (skillet: SkilletWithPrices, tierId: number) =>
        skillet?.tierPrices?.find((tp: any) => tp.tierId === tierId)?.price;

    const handleChange = async (skilletId: number, tierId: number, value: string) => {
        const key = `${skilletId}:${tierId}`;
        setDraft((prev) => ({ ...prev, [key]: value }));

        const price = Number(value);
        if (value === "") return; 

        if (Number.isNaN(price)) {
            return;
        }

        setLoadingField(key);
        try {
            await Api.skillets.setTierPrice({skilletId, tierId, price});
            setTimeout(() => setLoadingField(null), 500);
        } catch (e) {
            console.error(e);
            toast.error("Failed to save price");
            setLoadingField(null);
        }
    };

    return(
        <div className="pb-16">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl shadow-gray-200/40">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm whitespace-nowrap">
                        
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-gray-500 sticky left-0 bg-gray-50 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Article</th>
                                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-gray-500">Knife</th>
                                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-gray-500">Density</th>
                                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-gray-500">Height</th>
                                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-gray-500">Depth</th>
                                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-gray-500">Width</th>
                                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-gray-500 bg-blue-50/30">Base Price</th>
                                
                                {tiers?.map((tier) => (
                                    <th key={tier.id} className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-gray-500 min-w-[140px]">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-gray-400">Qty range</span>
                                                <Label tier={tier} />
                                            </div>
                                            <button
                                                type="button"
                                                title="Delete tier"
                                                onClick={() => onDeleteTier?.(String(tier.id))}
                                                className="rounded p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </th>
                                ))}
                                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-gray-500 text-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {skillets?.map((skillet, index) => {
                                return (
                                    <tr
                                        key={skillet.id}
                                        className="group hover:bg-blue-50/30 transition-colors duration-200"
                                    >
                                        <td className="px-6 py-4 font-bold text-gray-900 sticky left-0 bg-white group-hover:bg-blue-50/30 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] transition-colors">
                                            {skillet.article}
                                        </td>
                                        
                                        <td className="px-6 py-4 text-gray-600">{skillet.knife}</td>
                                        <td className="px-6 py-4 text-gray-600 font-mono">{skillet.density}</td>
                                        <td className="px-6 py-4 text-gray-600 font-mono">{skillet.height}</td>
                                        <td className="px-6 py-4 text-gray-600 font-mono">{skillet.depth}</td>
                                        <td className="px-6 py-4 text-gray-600 font-mono">{skillet.width}</td>
                                        
                                        <td className="px-6 py-4 font-mono font-medium text-blue-700 bg-blue-50/10">
                                            {skillet.basePrice?.toFixed(2)} €
                                        </td>

                                        {tiers.map((tierPrice) => {
                                            const key = `${skillet.id}:${tierPrice.id}`;
                                            const dbValue = findPrice(skillet, tierPrice.id);
                                            const value = draft[key] !== undefined ? draft[key] : String(dbValue ?? "");
                                            const isSaving = loadingField === key;

                                            return (
                                                <td key={tierPrice.id} className="px-4 py-3">
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">€</span>
                                                        <input
                                                            type="number"
                                                            step="0.0001"
                                                            value={value}
                                                            onChange={(e) => handleChange(skillet.id, tierPrice.id, e.target.value)}
                                                            className={`
                                                                w-full pl-6 pr-2 py-1.5 text-right font-mono text-sm text-gray-900 
                                                                bg-gray-50 border border-gray-200 rounded-lg 
                                                                focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:bg-white 
                                                                outline-none transition-all
                                                                ${!dbValue && !value ? 'bg-red-50 border-red-100' : ''}
                                                            `}
                                                            placeholder="-"
                                                        />
                                                        {isSaving && (
                                                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                                                <Save className="w-3 h-3 text-green-500 animate-pulse" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            );
                                        })}

                                        <td className="px-6 py-4 text-center">
                                            <button
                                                type="button"
                                                onClick={() => onDeleteSkillet?.(String(skillet.id))}
                                                className="inline-flex items-center justify-center w-8 h-8 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                                                title="Delete skillet"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}