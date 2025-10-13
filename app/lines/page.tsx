'use client'

import { useEffect, useState } from "react";
import { Line } from '@prisma/client';
import { Api } from "@/services/api-client";
import { LinesTable } from "@/components/lines-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingCard } from "@/components/loading-card";

export default function Home(){

    const [lines, setLines] = useState<Line[]>([]);
    const [mainLines, setMainLines] = useState<Line[]>([]);
    const [bpLines, setBpLines] = useState<Line[]>([]);
    const [speedLine1, setSpeedLine1] = useState<Line[]>([]);
    const [speedLine2, setSpeedLine2] = useState<Line[]>([]);

    useEffect(() => {
        async function fetchData() {
            const allLines = await Api.lines.getAll();
            setLines(allLines);

            const filteredMainLines = allLines
                .filter((line) => line.lineType === "Main lines")
                .sort((a, b) => {
                    if (a.materialType === b.materialType) {
                        return a.length - b.length;
                    }
                    if (a.materialType === "Alu") return -1;
                    if (b.materialType === "Alu") return 1;
                    if (a.materialType === "Frischhaltefolie") return -1;
                    if (b.materialType === "Frischhaltefolie") return 1;
                    return 0;
                });
            setMainLines(filteredMainLines)
            
            const filteredBPLines = allLines
            .filter((line) => line.lineType === "BP lines")
            .sort((a, b) => a.length - b.length);
            
            setBpLines(filteredBPLines);
            
            const filteredSpeedLine1 = allLines
            .filter((line) => line.lineType === "Speed 4,5 and 4,6")
            .sort((a, b) => {
                if (a.materialType === b.materialType) {
                    return a.length - b.length;
                }
                if (a.materialType === "Alu") return -1;
                if (b.materialType === "Alu") return 1;
                if (a.materialType === "Frischhaltefolie") return -1;
                if (b.materialType === "Frischhaltefolie") return 1;
                return 0;
            });
            
            setSpeedLine1(filteredSpeedLine1);
            
            const filteredSpeedLine2 = allLines
            .filter((line) => line.lineType === "Speed 6,4")
            .sort((a, b) => {
                if (a.materialType === b.materialType) {
                    return a.length - b.length;
                }
                if (a.materialType === "Alu") return -1;
                if (b.materialType === "Alu") return 1;
                if (a.materialType === "Frischhaltefolie") return -1;
                if (b.materialType === "Frischhaltefolie") return 1;
                return 0;
            });

            setSpeedLine2(filteredSpeedLine2);     
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
                    <CardTitle>Main Lines</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold text-green-600">{mainLines.length}</p>
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
                    <CardTitle>Speed Lines</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold text-orange-600">
                        {speedLine1.length + speedLine2.length}
                    </p>
                </CardContent>
            </Card>
        </div>

        <div className="space-y-16">
            {mainLines?.length > 0 ? (
                <LinesTable lines={mainLines} title="AV Speed Main Lines" />
            ) : (
                <LoadingCard text="Loading main lines..." />
            )}

            {bpLines?.length > 0 ? (
                <LinesTable lines={bpLines} title="AV Speed BP Lines" />
            ) : (
                <LoadingCard text="Loading BP lines..." />
            )}

            {speedLine1?.length > 0 ? (
                <LinesTable lines={speedLine1} title="AV Speed Line 4.5 and 4.6" />
            ) : (
                <LoadingCard text="Loading Speed 4.5 and 4.6..." />
            )}

            {speedLine2?.length > 0 ? (
                <LinesTable lines={speedLine2} title="AV Speed Line 6.4" />
            ) : (
                <LoadingCard text="Loading Speed 6.4..." />
            )}
        </div>
      </div>
    </div>
  );
}