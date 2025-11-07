import { SkilletWithPrices } from "@/prisma/types";
import { Api } from "@/services/api-client";
import { PriceTier } from "@prisma/client";
import { FC, useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";

interface Props{
    skillets: SkilletWithPrices[];
}

export const SkilletsTable: FC<Props> = ({ skillets }) => {

    const [priceTiers, setPriceTiers] = useState<PriceTier[]>([])
    const [draft, setDraft] = useState<Record<string, string>>({});

    useEffect(() => {

        const fetchPriceTiers = async () => {

            try {
                
                const tiers = await Api.skillets.getAllTiers()
                tiers.sort((a: PriceTier, b: PriceTier) => a.minQty - b.minQty);
                setPriceTiers(tiers)

            } catch (error) {
                console.error(error)
            }

        }

        fetchPriceTiers()

    }, [])

    const findPrice = (skillet: SkilletWithPrices, tierId: number) =>
        skillet.tierPrices.find((tp) => tp.tierId === tierId)?.price;

    const handleChange = async (skilletId: number, tierId: number, value: string) => {
        setDraft((prev) => ({ ...prev, [`${skilletId}:${tierId}`]: value }));

        const price = Number(value);
        if (Number.isNaN(price)) {
            toast.error("Price must be a number");
            return;
        }

        try {
            await Api.skillets.setTierPrice({skilletId, tierId, price});
        } catch (e) {
            console.error(e);
            toast.error("Failed to save");
        }
    };

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
                            {priceTiers?.map(priceTier => (
                                <th className="px-5 py-3" key={priceTier.id}>{priceTier.minQty}-{priceTier.maxQty}</th>
                            ))}
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
                                    <td className="px-5 py-3 font-medium">{skillet.article}</td>
                                    <td className="px-5 py-3 font-medium">{skillet.format}</td>
                                    <td className="px-5 py-3">{skillet.knife}</td>
                                    <td className="px-5 py-3">{skillet.density}</td>
                                    {priceTiers.map((tierPrice) => {
                                        const key = `${skillet.id}:${tierPrice.id}`;
                                        const value =
                                            draft[key] !== undefined
                                            ? draft[key]
                                            : String(findPrice(skillet, tierPrice.id) ?? "");

                                        return (
                                            <td key={tierPrice.id} className="px-5 py-3">
                                            <input
                                                type="text"
                                                value={value}
                                                onChange={(e) => handleChange(skillet.id, tierPrice.id, e.target.value)}
                                                className="w-24 p-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                                                placeholder="—"
                                            />
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <ToastContainer />
        </div>
    )
}