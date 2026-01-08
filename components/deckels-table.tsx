import { Api } from "@/services/api-client";
import { Deckel } from "@prisma/client";
import { FC, useState } from "react";
import { toast } from "react-toastify";
import { Trash2, Save } from "lucide-react";

interface Props{
    deckels: Deckel[];
    onDeleteDeckel?: (id: string) => Promise<void>;
}

export const DeckelsTable: FC<Props> = ({ deckels, onDeleteDeckel }) => {

    const [draft, setDraft] = useState<Record<number, string>>({})
    const [loadingId, setLoadingId] = useState<number | null>(null);

    const handlePriceChange = async (id: number, price: string) => {
        setDraft((prev) => ({ ...prev, [id]: price }));

        const priceNum = Number(price);
        if (price === "" || isNaN(priceNum)) return;

        setLoadingId(id);
        try {
            await Api.deckels.update(id, { price: priceNum });
            setTimeout(() => setLoadingId(null), 500);
        } catch (error) {
            console.error(error);
            toast.error("Failed to update price");
            setLoadingId(null);
        }
    }

    return(
        <div className="pb-16">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl shadow-gray-200/40">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm whitespace-nowrap">
                        
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-gray-500 sticky left-0 bg-gray-50 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Article</th>
                                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-gray-500 text-right">Price</th>
                                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-gray-500 text-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {deckels?.map((deckel, index) => {
                                const isSaving = loadingId === deckel.id;
                                
                                return (
                                    <tr
                                        key={deckel.id}
                                        className="group hover:bg-blue-50/30 transition-colors duration-200"
                                    >
                                        <td className="px-6 py-4 font-bold text-gray-900 sticky left-0 bg-white group-hover:bg-blue-50/30 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] transition-colors">
                                            {deckel.article}
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            <div className="relative inline-block w-32">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">€</span>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={draft[deckel.id] ?? deckel.price}
                                                    onChange={(e) => handlePriceChange(deckel.id, e.target.value)}
                                                    className="w-full pl-7 pr-3 py-2 text-right font-mono font-medium text-gray-900 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:bg-white outline-none transition-all"
                                                    placeholder="0.00"
                                                />
                                                {isSaving && (
                                                    <div className="absolute -right-6 top-1/2 -translate-y-1/2">
                                                        <Save className="w-4 h-4 text-green-500 animate-pulse" />
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-center">
                                            <button
                                                type="button"
                                                onClick={() => onDeleteDeckel?.(String(deckel.id))}
                                                className="inline-flex items-center justify-center w-9 h-9 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200 cursor-pointer"
                                                title="Delete deckel"
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