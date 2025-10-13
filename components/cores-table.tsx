import { FC } from "react";

type Core = {
    id: number;
    width: number;
    length: number;
    thickness: number;
    type?: string;
    price: number;
}

interface Props{
    cores: Core[];
    title: string
}

export const CoresTable: FC<Props> = ({ cores, title }) => {

    return(
        <div className="pb-10">
            <h1 className="text-2xl font-semibold mb-6 text-gray-800">
                {title}
            </h1>

            <div className="overflow-x-auto shadow-md rounded-2xl border border-gray-200 bg-white w-[720px]">
                <table className="min-w-full text-sm text-left text-gray-700">
                    <thead className="bg-gray-50 text-gray-900 uppercase font-medium">
                        <tr>
                            <th className="px-5 py-3 text-center">Dimensions</th>
                            <th className="px-5 py-3 text-center">Type</th>
                            <th className="px-5 py-3 text-center">Price</th>
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
                                    {core.length} x {core.width} x {core.thickness} mm
                                </td>
                                <td className="px-5 py-3 text-center font-medium text-gray-900">
                                    {core.type}
                                </td>
                                <td className="px-5 py-3 text-center font-medium text-gray-900">
                                    {core.price}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}