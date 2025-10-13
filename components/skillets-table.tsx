import { FC, useState } from "react";

type Skillet = {
    id: number;
    format: number;
    knife: string;
    density: number;
    smallPrice: number;
    mediumPrice: number;
    largePrice: number;
    smallDescription: string;
    mediumDescription: string;
    largeDescription: string;
}

interface Props{
    skillets: Skillet[];
    title: string;
}

export const SkilletsTable: FC<Props> = ({ skillets, title }) => {

    return(
        <div className="mb-16">
            <h1 className="text-2xl font-semibold mb-6 text-gray-800">{title}</h1>
            <div className="overflow-x-auto shadow-md rounded-2xl border border-gray-200 bg-white">
                <table className="min-w-full text-sm text-left text-gray-700">
                    <thead className="bg-gray-50 text-gray-900 text-sm uppercase font-medium">
                        <tr>
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

                            return (
                                <tr
                                    key={skillet.id}
                                    className={`transition-colors ${
                                        index % 2 === 0 ? "bg-white" : "bg-gray-100"
                                    } hover:bg-blue-50`}
                                >
                                    <td className="px-5 py-3 font-medium">{skillet.format}</td>
                                    <td className="px-5 py-3">{skillet.knife}</td>
                                    <td className="px-5 py-3">{skillet.density}</td>
                                    <td className="px-5 py-3">{skillet.smallPrice}</td>
                                    <td className="px-5 py-3">{skillet.mediumPrice}</td>
                                    <td className="px-5 py-3">{skillet.largePrice}</td>
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