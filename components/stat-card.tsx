import { cn } from "@/lib/utils";
import { FC } from "react";
import { Card, CardContent } from "./ui/card";

interface Props{
    title: string;
    value: any;
}

export const StatCard: FC<Props> = ({ title, value }) => {
  return (
    <Card className={cn("shadow-md border-none transition hover:scale-[1.02] hover:shadow-xl duration-300")}>
      <CardContent className="p-6 text-center">
        <h3 className="text-gray-500 text-sm font-medium mb-2">{title}</h3>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      </CardContent>
    </Card>
  )
}