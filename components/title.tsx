import { FC } from "react";

interface Props {
    active: boolean;
    title: string;
}

export const Title: FC<Props> = ({ active, title }) => {
    return (
        <div
            className={`
                w-full px-4 py-2 rounded-lg text-center cursor-pointer
                font-semibold transition-all duration-200 select-none
                ${active
                    ? "bg-white text-black shadow-md"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white hover:shadow-sm"
                }
            `}
        >
            <h2 className="text-base">{title}</h2>
        </div>
  );
};
