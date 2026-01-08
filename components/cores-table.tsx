import { Api } from "@/services/api-client";
import { Trash2, Save, Ruler } from "lucide-react";
import { FC, useState } from "react";

type Core = {
    id: number;
    width: number;
    length: number;
    thickness: number;
    type?: string;
    price: number;
    article: string;
}

interface Props{
    cores: Core[];
    onDeleteCore?: (id: string) => Promise<void>;
}

export const CoresTable: FC<Props> = ({ cores, onDeleteCore }) => {

    const [price, setPrice] = useState<Record<number, string>>({})
    const [loadingId, setLoadingId] = useState<number | null>(null);

    const handlePriceChange = async (id: number, price: string) => {
        setPrice((prev) => ({
            ...prev,
            [id]: price
        }))
        
        setLoadingId(id);
        await Api.cores.update(id, { price: Number(price) })
        setTimeout(() => setLoadingId(null), 500);
    }

    const getTypeBadgeStyle = (type?: string) => {
        const t = type?.toLowerCase() || "";
        if (t.includes('consumer')) return "bg-purple-100 text-purple-700 border-purple-200";
        if (t.includes('catering')) return "bg-orange-100 text-orange-700 border-orange-200";
        return "bg-gray-100 text-gray-700 border-gray-200";
    }

    return(
        <div className="pb-10">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl shadow-gray-200/40">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm whitespace-nowrap">
                        
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-gray-500">Article</th>
                                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-gray-500 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <Ruler className="w-3 h-3" /> Dimensions
                                    </div>
                                </th>
                                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-gray-500 text-center">Type</th>
                                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-gray-500 text-right">Price (€)</th>
                                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-gray-500 text-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {cores?.map((core) => (
                                <tr
                                    key={core.id}
                                    className="group hover:bg-blue-50/30 transition-colors duration-200"
                                >
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-gray-900 text-base">{core.article}</span>
                                    </td>

                                    <td className="px-6 py-4 text-center">
                                        <div className="inline-flex items-center gap-1 font-mono text-gray-600 bg-gray-50 px-3 py-1 rounded-md border border-gray-100">
                                            <span className="font-semibold text-gray-900">{core.length}</span>
                                            <span className="text-gray-400">×</span>
                                            <span className="font-semibold text-gray-900">{core.width}</span>
                                            <span className="text-gray-400">×</span>
                                            <span className="font-semibold text-gray-900">{core.thickness}</span>
                                            <span className="text-xs text-gray-400 ml-1">mm</span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeBadgeStyle(core.type)}`}>
                                            {core.type || "N/A"}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4 text-right">
                                        <div className="relative inline-block w-28">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">€</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={price[core.id] ?? core.price}
                                                onChange={(e) => handlePriceChange(core.id, e.target.value)}
                                                className="w-full pl-7 pr-3 py-1.5 text-right font-mono font-medium text-gray-900 bg-white border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                            />
                                            {loadingId === core.id && (
                                                <div className="absolute -right-6 top-1/2 -translate-y-1/2 text-green-500">
                                                    <Save className="w-4 h-4 animate-pulse" />
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 text-center">
                                        <button
                                            type="button"
                                            onClick={() => onDeleteCore?.(String(core.id))}
                                            className="inline-flex items-center justify-center w-8 h-8 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200 cursor-pointer"
                                            title="Delete core"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}