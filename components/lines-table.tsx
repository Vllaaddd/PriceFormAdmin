import { Api } from "@/services/api-client";
import { FC, useState } from "react";

type Line = {
    id: number;
    material: string
    maxLength: number
    minWidth: number | null
    maxWidth: number | null
    lineType: string
    price: number
}

interface Props{
    lines: Line[];
    title: string
}

export const LinesTable: FC<Props> = ({ lines, title }) => {

    const [linePrice, setLinePrice] = useState<Record<number, number>>({});

    const handlePriceChange = async (lineId: number, newPrice: number) => {

        setLinePrice((prev) => ({
            ...prev,
            [lineId]: newPrice,
        }));

        const newLinePrice = await Api.lines.update(lineId, { price: newPrice });

    }

    return(
        <div className="mb-16">
            <h1 className="text-2xl font-semibold mb-6 text-gray-800">{title}</h1>
            <div className="overflow-x-auto shadow-md rounded-2xl border border-gray-200 bg-white">
                <table className="min-w-full text-sm text-left text-gray-700">
                    <thead className="bg-gray-50 text-gray-900 text-sm uppercase font-medium">
                        <tr>
                            <th className="px-5 py-3">Material</th>
                            <th className="px-5 py-3">Line type</th>
                            <th className="px-5 py-3">Max length</th>
                            <th className="px-5 py-3">Min width</th>
                            <th className="px-5 py-3">Max width</th>
                            <th className="px-5 py-3">Price</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {lines?.map((line, index) => {
                            return (
                                <tr
                                    key={line.id}
                                    className={`transition-colors ${
                                        index % 2 === 0 ? "bg-white" : "bg-gray-100"
                                    } hover:bg-blue-50`}
                                >
                                    <td className="px-5 py-3 font-medium">{line.material}</td>
                                    <td className="px-5 py-3">{line.lineType}</td>
                                    <td className="px-5 py-3">{line.maxLength}</td>
                                    <td className="px-5 py-3">{line.minWidth}</td>
                                    <td className="px-5 py-3">{line.maxWidth}</td>
                                    <td className="px-5 py-3">
                                        <input
                                            type="string"
                                            value={linePrice[line.id] ?? line.price ?? ""}
                                            onChange={(e) =>
                                                handlePriceChange( Number(line.id), Number(e.target.value) )
                                            }
                                            className="w-24 p-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}