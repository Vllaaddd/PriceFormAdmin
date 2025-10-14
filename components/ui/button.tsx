import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "outline" | "destructive" | "ghost"
    size?: "default" | "sm" | "lg"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", ...props }, ref) => {
        const base =
            "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"

        const variants: Record<string, string> = {
            default: "bg-blue-600 text-white hover:bg-blue-700",
            outline: "border border-gray-300 bg-white text-gray-800 hover:bg-gray-50",
            destructive: "bg-red-600 text-white hover:bg-red-700",
            ghost: "bg-transparent hover:bg-gray-100 text-gray-700",
        }

        const sizes: Record<string, string> = {
            default: "h-10 px-4 py-2 text-sm",
            sm: "h-8 px-3 text-sm",
            lg: "h-12 px-6 text-base",
        }

        return (
            <button
                ref={ref}
                className={cn(base, variants[variant], sizes[size], className)}
                {...props}
            />
        )
    }
)

Button.displayName = "Button"

export { Button }
