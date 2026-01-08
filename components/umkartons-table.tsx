import { UmkartonWithPrices } from "@/prisma/types";
import { FC } from "react";
import { Trash2 } from "lucide-react";

interface Props{
    umkartons: UmkartonWithPrices[];
    onDeleteUmkarton?: (id: string) => Promise<void>;
}

export const UmkartonsTable: FC<Props> = ({ umkartons, onDeleteUmkarton }) => {

    return(
        <div className="pb-16">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl shadow-gray-200/40">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm whitespace-nowrap">
                        
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-gray-500 sticky left-0 bg-gray-50 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Article</th>
                                
                                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-gray-500">FS Dim</th>
                                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-gray-500">FS Qty</th>
                                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-gray-500">Height</th>
                                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-gray-500">Depth</th>
                                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-gray-500">Width</th>
                                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-gray-500 bg-blue-50/30">Price</th>
                                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-gray-500 text-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {umkartons?.map((umkarton) => {
                                return (
                                    <tr
                                        key={umkarton.id}
                                        className="group hover:bg-blue-50/30 transition-colors duration-200"
                                    >
                                        <td className="px-6 py-4 font-bold text-gray-900 sticky left-0 bg-white group-hover:bg-blue-50/30 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] transition-colors">
                                            {umkarton.article}
                                        </td>
                                        
                                        <td className="px-6 py-4 text-gray-600">{umkarton.fsDimension || '-'}</td>
                                        <td className="px-6 py-4 text-gray-600">{umkarton.fsQty || '-'}</td>
                                        <td className="px-6 py-4 text-gray-600 font-mono">{umkarton.height}</td>
                                        <td className="px-6 py-4 text-gray-600 font-mono">{umkarton.depth}</td>
                                        <td className="px-6 py-4 text-gray-600 font-mono">{umkarton.width}</td>
                                        
                                        <td className="px-6 py-4 font-mono font-medium text-blue-700 bg-blue-50/10">
                                            {umkarton.basePrice?.toFixed(2)} €
                                        </td>

                                        <td className="px-6 py-4 text-center">
                                            <button
                                                type="button"
                                                onClick={() => onDeleteUmkarton?.(String(umkarton.id))}
                                                className="inline-flex items-center justify-center w-8 h-8 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                                                title="Delete umkarton"
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