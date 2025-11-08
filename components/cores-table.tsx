import { Api } from "@/services/api-client";
import { Trash2 } from "lucide-react";
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

    const handlePriceChange = async (id: number, price: string) => {

        setPrice((prev) => ({
            ...prev,
            [id]: price
        }))

        await Api.cores.update(id, { price: Number(price) })

    }

    return(
        <div className="pb-10">

            <div className="overflow-x-auto shadow-md rounded-2xl border border-gray-200 bg-white">
                <table className="min-w-full text-sm text-left text-gray-700">
                    <thead className="bg-gray-50 text-gray-900 text-sm uppercase font-medium">
                        <tr>
                            <th className="px-5 py-3 text-center">Article</th>
                            <th className="px-5 py-3 text-center">Dimensions</th>
                            <th className="px-5 py-3 text-center">Type</th>
                            <th className="px-5 py-3 text-center">Price</th>
                            <th className="px-5 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {cores?.map((core, index) => (
                            <tr
                                key={core.id}
                                className={`transition-colors ${
                                index % 2 === 0 ? "bg-white" : "bg-gray-100"
                                } hover:bg-blue-50`}
                            >
                                <td className="px-5 py-3 text-center font-medium text-gray-900">
                                    {core.article}
                                </td>
                                <td className="px-5 py-3 text-center font-medium text-gray-900">
                                    {core.length} x {core.width} x {core.thickness} mm
                                </td>
                                <td className="px-5 py-3 text-center font-medium text-gray-900">
                                    {core.type}
                                </td>
                                <td className="px-5 py-3 text-center font-medium text-gray-900">
                                    <input
                                        type="string"
                                        value={price[core.id] ?? core.price}
                                        onChange={(e) =>
                                            handlePriceChange( core.id, e.target.value )
                                        }
                                        className="w-24 p-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                                    />
                                </td>
                                <td className="px-5 py-3">
                                    <div className="flex justify-center">
                                        <button
                                            type="button"
                                            title="Delete core"
                                            aria-label="Delete core"
                                            onClick={() => onDeleteCore?.(String(core.id))}
                                            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-red-600 hover:text-red-700 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-200 transition cursor-pointer"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            <span className="hidden sm:inline">Delete</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}