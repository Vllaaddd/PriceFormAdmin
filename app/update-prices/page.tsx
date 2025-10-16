'use client'

import { Api } from "@/services/api-client";
import { useState } from "react";
import * as XLSX from 'xlsx';

interface ParsedRow {
    article: string;
    smallPrice?: number;
    mediumPrice?: number;
    largePrice?: number;
    corePrice?: number;
}

export default function Home(){
    
    const [rows, setRows] = useState<ParsedRow[]>([]);
    const [loading, setLoading] = useState(false);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const data = evt.target?.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            const parsed: ParsedRow[] = (jsonData as any[]).map((row) => ({
                article: row['article']?.toString()?.trim() || '',
                smallPrice: parseFloat(row['smallPrice']) || undefined,
                mediumPrice: parseFloat(row['mediumPrice']) || undefined,
                largePrice: parseFloat(row['largePrice']) || undefined,
                corePrice: parseFloat(row['corePrice']) || undefined,
            }));

            setRows(parsed);
        };
        reader.readAsBinaryString(file);
    };

    const handleUpdate = async () => {
        if (!rows.length) return alert('No data found in Excel!');
        setLoading(true);

        // try {
        //     for (const row of rows) {
        //         if (row.article) {
        //             if (row.smallPrice || row.mediumPrice || row.largePrice) {
        //                 await Api.skillets.updateByArticle(row.article, {
        //                     smallPrice: row.smallPrice,
        //                     mediumPrice: row.mediumPrice,
        //                     largePrice: row.largePrice,
        //                 });
        //             }

        //             if (row.corePrice) {
        //                 await Api.cores.updateByArticle(row.article, { price: row.corePrice });
        //             }
        //         }
        //     }

        //     alert('✅ Prices updated successfully!');
        // }catch (err) {
        //     console.error(err);
        //     alert('❌ Error while updating!');
        // }finally {
        //     setLoading(false);
        // }
    };
    
    return(
        <div className="min-h-screen bg-gray-100 p-10 flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-6 text-gray-900">
                Excel Price Uploader
            </h1>

            { !rows.length && (
                <div
                    onDrop={(e) => {
                        e.preventDefault();
                        handleFileUpload({ target: { files: e.dataTransfer.files } } as any);
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    className="border-2 border-dashed border-blue-400 rounded-2xl p-8 text-center bg-blue-50 hover:bg-blue-100 transition mb-10"
                >
                    <p className="text-blue-700 font-semibold mb-2">
                        Drag & Drop your Excel file here
                    </p>
                    <p className="text-gray-500 text-sm">or click to browse</p>
                    <input
                        type="file"
                        accept=".xlsx, .xls"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="excel-input"
                    />
                    <label
                        htmlFor="excel-input"
                        className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition cursor-pointer"
                    >
                        Choose File
                    </label>
                </div>
            ) }

            {rows.length > 0 && (
                <div className="bg-white shadow-md rounded-xl p-4 w-full max-w-4xl">
                    <table className="w-full text-sm text-gray-700">
                        <thead>
                            <tr className="bg-gray-200 text-gray-900">
                                <th className="px-3 py-2">Article</th>
                                <th className="px-3 py-2">Small</th>
                                <th className="px-3 py-2">Medium</th>
                                <th className="px-3 py-2">Large</th>
                                <th className="px-3 py-2">Core Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((r, i) => (
                                <tr key={i} className={i % 2 ? 'bg-gray-50' : 'bg-white'}>
                                <td className="px-3 py-2 font-medium">{r.article}</td>
                                <td className="px-3 py-2">{r.smallPrice ?? '-'}</td>
                                <td className="px-3 py-2">{r.mediumPrice ?? '-'}</td>
                                <td className="px-3 py-2">{r.largePrice ?? '-'}</td>
                                <td className="px-3 py-2">{r.corePrice ?? '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {rows.length > 0 && (
                <button
                    onClick={handleUpdate}
                    disabled={loading}
                    className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition cursor-pointer"
                >
                    {loading ? 'Updating...' : 'Update Prices'}
                </button>
            )}
        </div>
    )
}
