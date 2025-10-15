import { Api } from "@/services/api-client";
import { Skillet } from "@prisma/client";
import { FC, useState } from "react";

interface Props{
    skillets: Skillet[];
}

export const SkilletsTable: FC<Props> = ({ skillets }) => {

    const [price, setPrice] = useState<Record<number, { small: string; medium: string; large: string; }>>({})

    const handelPriceChange = async (id: number, price: string, type: string) => {

        setPrice((prev) => ({
            ...prev,
            [id]: {
                ...prev[id],
                [type === "smallPrice" ? "small" : type === "mediumPrice" ? "medium" : "large"]: price
            }
        }))

        await Api.skillets.update(Number(id), { [type]: Number(price) })

    }

    return(
        <div className="mb-16">
            <div className="overflow-x-auto shadow-md rounded-2xl border border-gray-200 bg-white">
                <table className="min-w-full text-sm text-left text-gray-700">
                    <thead className="bg-gray-50 text-gray-900 text-sm uppercase font-medium">
                        <tr>
                            <th className="px-5 py-3">Article</th>
                            <th className="px-5 py-3">Format</th>
                            <th className="px-5 py-3">Knife</th>
                            <th className="px-5 py-3">Density</th>
                            <th className="px-5 py-3">30k-200k</th>
                            <th className="px-5 py-3">200k-500k</th>
                            <th className="px-5 py-3">500-1m</th>
                            <th className="px-5 py-3">30k-200k</th>
                            <th className="px-5 py-3">200k-500k</th>
                            <th className="px-5 py-3">500-1m</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {skillets?.map((skillet, index) => {

                            const current = price[skillet.id] || {};

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
                                    <td>
                                        <input
                                            type="string"
                                            value={current.small ?? skillet.smallPrice}
                                            onChange={(e) =>
                                                handelPriceChange( skillet.id, e.target.value, 'smallPrice' )
                                            }
                                            className="w-24 p-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="string"
                                            value={current.medium ?? skillet.mediumPrice}
                                            onChange={(e) =>
                                                handelPriceChange( skillet.id, e.target.value, 'mediumPrice' )
                                            }
                                            className="w-24 p-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="string"
                                            value={current.large ?? skillet.largePrice}
                                            onChange={(e) =>
                                                handelPriceChange( skillet.id, e.target.value, 'mediumPrice' )
                                            }
                                            className="w-24 p-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                                        />
                                    </td>
                                    <td className="px-5 py-3">{skillet.smallDescription}</td>
                                    <td className="px-5 py-3">{skillet.mediumDescription}</td>
                                    <td className="px-5 py-3">{skillet.largeDescription}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}