import { PriceTier } from "@prisma/client";
import { FC } from "react";

type Props = {
    tier: PriceTier;
}

export const Label: FC<Props> = ({ tier }) => {
    const format = (v: number) => {
        return v >= 1000 ? `${v / 1000}k` : `${v}`;
    };

    return `${format(tier.minQty)}-${format(tier.maxQty)}`;
}