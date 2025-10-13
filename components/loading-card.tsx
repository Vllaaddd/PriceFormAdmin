import { FC } from "react";

interface Props{
    text: string;
}

export const LoadingCard: FC<Props> = ({ text }) => {
    return(
        <div className="flex justify-center items-center py-10 text-gray-500 italic">
            <div className="animate-pulse">{text}</div>
        </div>
    )
}