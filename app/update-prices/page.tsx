'use client'

import { Api } from "@/services/api-client";
import { ArrowDown, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import * as XLSX from 'xlsx';

interface ParsedRow {
    article: string;
    price?: number;
}

export default function Home(){
    
    const [rows, setRows] = useState<ParsedRow[]>([]);
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement | null>(null);

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
                article: row['Nr.']?.toString()?.trim() || '',
                price: parseFloat(row['EPF']) || undefined,
            }));

            setRows(parsed);
        };
        reader.readAsBinaryString(file);
    };

    const handleUpdate = async () => {
        if (!rows.length) return alert('No data found in Excel!');
        setLoading(true); 

        for (const row of rows) {
            if (row.article !== undefined && row.price !== undefined){
                try{
                    // if (row.price) {
                    //     await Api.skillets.updateByArticle(row.article, {
                    //         smallPrice: row.smallPrice,
                    //         mediumPrice: row.mediumPrice,
                    //         largePrice: row.largePrice,
                    //     });
                    // }

                    if (row.price) {
                        await Api.cores.updateByArticle(row.article, { price: row.price });
                    }
                    toast.success(' Prices updated successfully!');
                }catch (err) {
                    console.error(err);
                    toast.error('Error while updating!');
                    setLoading(false);
                }finally {
                    setLoading(false);
                }
            }else if(row.article && row.price === undefined){
                toast.error(`Invalid price for article ${row.article}!`);
                setLoading(false);
            }else{
                toast.error(`Invalid data!`);
                setLoading(false);
            }
        }
    };

    const scrollToBottom = () => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleCloseTable = () => {
        setRows([]);
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
                                <th className="px-3 py-2">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((r, i) => (
                                <tr key={i} className={i % 2 ? 'bg-gray-50' : 'bg-white'}>
                                <td className="px-3 py-2 font-medium text-center">{r.article}</td>
                                <td className="px-3 py-2 text-center">{r.price ?? '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div ref={bottomRef}></div>
                </div>
            )}

            {rows.length > 0 && (
                <div className="fixed bottom-6 right-6 flex flex-col sm:flex-row gap-3 sm:gap-4 z-50">
                    <button
                        onClick={handleCloseTable}
                        className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transition cursor-pointer w-[50px] h-[50px] flex items-center justify-center shadow-md active:scale-95 sm:w-[48px] sm:h-[48px]"
                        title="Close table"
                    >
                        <X size={22} />
                    </button>

                    <button
                        onClick={scrollToBottom}
                        className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition cursor-pointer w-[50px] h-[50px] flex items-center justify-center shadow-md active:scale-95 sm:w-[48px] sm:h-[48px]"
                        title="Scroll to bottom"
                    >
                        <ArrowDown size={24} />
                    </button>
                </div>
            )}

            {rows.length > 0 && (
                <button
                    onClick={handleUpdate}
                    disabled={loading}
                    className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition cursor-pointer"
                >
                    {loading ? 'Updating, please wait...' : 'Update Prices'}
                </button>
            )}
            <ToastContainer />
        </div>
    )
}
