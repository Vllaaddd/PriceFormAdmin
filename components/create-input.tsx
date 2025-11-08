import { FC, JSX } from "react";
import { Input } from "./ui/input";

type Props = {
    title: string | JSX.Element,
    placeholder?: string,
    value: string | number,
    type?: string,
    onChange: (e: any) => void,
}

export const CreateInput: FC<Props> = ({ title, placeholder = '', value, type = 'string', onChange }) => {
    return(
        <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
                {title}
            </label>
            <Input
                placeholder={placeholder}
                value={value}
                type={type}
                onChange={onChange}
            />
        </div>
    )
}