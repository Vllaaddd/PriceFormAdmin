'use client'

import { useEffect, useState } from "react";
import { Line } from '@prisma/client';
import { Api } from "@/services/api-client";
import { LinesTable } from "@/components/lines-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingCard } from "@/components/loading-card";

export default function LinesPage(){

    const [lines, setLines] = useState<Line[]>([]);
    const [bpLines, setBpLines] = useState<Line[]>([]);
    const [consumerLines, setConsumerLines] = useState<Line[]>([]);
    const [cateringLines, setCateringLines] = useState<Line[]>([]);

    useEffect(() => {
        async function fetchData() {
            const allLines = await Api.lines.getAll();
            setLines(allLines);
            
            const filteredBPLines = allLines
            .filter((line) => line.lineType === "BP")
            .sort((a, b) => a.maxLength - b.maxLength);
            
            setBpLines(filteredBPLines);
            
            const filteredConsumerLines = allLines
            .filter((line) => line.lineType === "Consumer roll")
            .sort((a, b) => {
                if (a.material === b.material) {
                    return a.maxLength - b.maxLength;
                }
                if (a.material === "Alu") return -1;
                if (b.material === "Alu") return 1;
                if (a.material === "Frischhaltefolie") return -1;
                if (b.material === "Frischhaltefolie") return 1;
                return 0;
            });

            setConsumerLines(filteredConsumerLines);
            
            const filteredCateringLines = allLines
            .filter((line) => line.lineType === "Catering roll")
            .sort((a, b) => {
                if (a.material === b.material) {
                    return a.maxLength - b.maxLength;
                }
                if (a.material === "Alu") return -1;
                if (b.material === "Alu") return 1;
                if (a.material === "Frischhaltefolie") return -1;
                if (b.material === "Frischhaltefolie") return 1;
                return 0;
            });

            setCateringLines(filteredCateringLines);     
        }

        fetchData();
    }, []);

    return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 py-10 px-6">
      <div className="max-w-7xl mx-auto space-y-10">
        
        <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">
                Lines Dashboard
            </h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300">
                <CardHeader>
                    <CardTitle>Total Lines</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold text-blue-600">{lines.length}</p>
                </CardContent>
            </Card>

            <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300">
                <CardHeader>
                    <CardTitle>Consumer Lines</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold text-green-600">{consumerLines.length}</p>
                </CardContent>
            </Card>

            <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300">
                <CardHeader>
                    <CardTitle>BP Lines</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold text-purple-600">{bpLines.length}</p>
                </CardContent>
            </Card>

            <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300">
                <CardHeader>
                    <CardTitle>Catering Lines</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold text-orange-600">
                        {cateringLines.length}
                    </p>
                </CardContent>
            </Card>
        </div>

        <div className="space-y-16">
            {consumerLines?.length > 0 ? (
                <LinesTable lines={consumerLines} title="Consumer Lines" />
            ) : (
                <LoadingCard text="Loading consumer lines..." />
            )}

            {bpLines?.length > 0 ? (
                <LinesTable lines={bpLines} title="AV Speed BP Lines" />
            ) : (
                <LoadingCard text="Loading BP lines..." />
            )}

            {cateringLines?.length > 0 ? (
                <LinesTable lines={cateringLines} title="Catering Lines" />
            ) : (
                <LoadingCard text="Loading catering lines..." />
            )}
        </div>
      </div>
    </div>
  );
}