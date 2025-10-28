import { Api } from "@/services/api-client";
import { FC, useState } from "react";

type Line = {
    id: number;
    materialType: string
    length: number
    totalDuration: number
    totalMeters: number
    avSpeed: number
    rollLength: string
    processingTime: number
    costPerMin: number
    valuePerRoll: number
    lineType: string
}

interface Props{
    lines: Line[];
    title: string
}

export const LinesTable: FC<Props> = ({ lines, title }) => {

    const [rollLengths, setRollLengths] = useState<Record<number, string>>({});
    const [costPerMin, setCostPerMin] = useState<Record<number, string>>({})
    const [avSpeed, setAvSpeed] = useState<Record<number, string>>({})

    const handleRollLengthChange = async (id: number, rollLength: string) => {

        const rollLengthNum = Number(rollLength);

        const line = lines.find((line) => line.id === id);
        if (!line) return;

        const processingTime = rollLengthNum / line.avSpeed;
        const valuePerRoll = processingTime * line.costPerMin;

        setRollLengths((prev) => ({
            ...prev,
            [id]: rollLength,
        }));

        await Api.lines.update(id, { 
            rollLength,
            processingTime,
            valuePerRoll
        });
    };

    const handleCostPerMinChange = async (id: number, costPerMin: string) => {


        const line = lines.find((line) => line.id === id);
        if (!line) return;

        const valuePerRoll = line.processingTime * Number(costPerMin);

        setCostPerMin((prev) => ({
            ...prev,
            [id]: costPerMin,
        }));

        await Api.lines.update(id, {
            costPerMin: Number(costPerMin),
            valuePerRoll
        });
    };

    const handleSpeedChange = async (id: number, avSpeed: string) => {


        const line = lines.find((line) => line.id === id);
        if (!line) return;

        setAvSpeed((prev) => ({
            ...prev,
            [id]: avSpeed,
        }));

        await Api.lines.update(id, {
            avSpeed: Number(avSpeed)
        });
    };

    return(
        <div className="mb-16">
            <h1 className="text-2xl font-semibold mb-6 text-gray-800">{title}</h1>
            <div className="overflow-x-auto shadow-md rounded-2xl border border-gray-200 bg-white">
                <table className="min-w-full text-sm text-left text-gray-700">
                    <thead className="bg-gray-50 text-gray-900 text-sm uppercase font-medium">
                        <tr>
                            <th className="px-5 py-3">Material type</th>
                            <th className="px-5 py-3">Max length</th>
                            <th className="px-5 py-3">Total duration</th>
                            <th className="px-5 py-3">Total meters</th>
                            <th className="px-5 py-3">AV speed</th>
                            <th className="px-5 py-3">Roll length</th>
                            <th className="px-5 py-3">Processing time (min)</th>
                            <th className="px-5 py-3">Cost per 1 min</th>
                            <th className="px-5 py-3">Value per roll</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {lines?.map((line, index) => {
                            const currentRollLength = rollLengths[line.id] ?? Number(line.rollLength);
                            const processingTime = Number(currentRollLength) / line.avSpeed;
                            const valuePerRoll = processingTime * (Number(costPerMin[line.id]) || line.costPerMin);

                            return (
                                <tr
                                    key={line.id}
                                    className={`transition-colors ${
                                        index % 2 === 0 ? "bg-white" : "bg-gray-100"
                                    } hover:bg-blue-50`}
                                >
                                    <td className="px-5 py-3 font-medium">{line.materialType}</td>
                                    <td className="px-5 py-3">{line.length}</td>
                                    <td className="px-5 py-3">{line.totalDuration}</td>
                                    <td className="px-5 py-3">{line.totalMeters}</td>
                                    <td className="px-5 py-3">
                                        <input
                                            type="string"
                                            value={avSpeed[line.id] ?? line.avSpeed ?? ""}
                                            onChange={(e) =>
                                                handleSpeedChange( line.id, e.target.value )
                                            }
                                            className="w-24 p-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                                        />
                                    </td>
                                    <td className="px-5 py-3">
                                        <input
                                            type="string"
                                            value={rollLengths[line.id] ?? line.rollLength ?? ""}
                                            onChange={(e) =>
                                                handleRollLengthChange( line.id, e.target.value )
                                            }
                                            className="w-24 p-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                                        />
                                    </td>
                                    <td className="px-5 py-3">{processingTime.toFixed(3)}</td>
                                    <td className="px-5 py-3">
                                        <input
                                            type="string"
                                            value={costPerMin[line.id] ?? line.costPerMin.toFixed(3) ?? ""}
                                            onChange={(e) =>
                                                handleCostPerMinChange( line.id, e.target.value )
                                            }
                                            className="w-24 p-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                                        />
                                    </td>
                                    <td className="px-5 py-3 font-semibold text-blue-700">{valuePerRoll.toFixed(3)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}