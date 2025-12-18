'use client'

import { CalculationSheet } from "@/components/calculation-sheet";
import { EmailModal } from "@/components/email-modal";
import { Api } from "@/services/api-client"
import { sendEmail } from "@/services/emails";
import { Calculation } from "@prisma/client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react"
import { toast, ToastContainer } from "react-toastify";

export default function CalculationPage(){

    const { id } = useParams()
    const [calculation, setCalculation] = useState<Calculation | undefined>(undefined)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [emailText, setEmailText] = useState("")

    useEffect(() => {
        const fetchCalculation = async (id: number) => {
            
            const calculation = await Api.calculations.getOneCalculation(id)
            setCalculation(calculation)

            const text = await Api.emailtext.getText()
            setEmailText(text.text)

        }

        fetchCalculation(Number(id))
    }, [])

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
                {calculation ? (
                    <div className="bg-white shadow-xl rounded-none sm:rounded-sm overflow-hidden border border-gray-200">
                        
                        <div className="bg-white p-6 border-b border-gray-200 flex justify-between items-start">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800 mb-1">{calculation.title}</h1>
                                <p className="text-sm text-gray-500">
                                    Created: {new Date(calculation.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                    {calculation.roll}
                                </span>
                            </div>
                        </div>

                        <div className="p-4 sm:p-8 bg-gray-50">
                        
                            <CalculationSheet data={calculation} />
                            
                            {calculation.remarks && (
                                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 text-sm text-yellow-800 font-mono">
                                    <span className="font-bold">Remarks:</span> {calculation.remarks}
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8 print:hidden">
                                <button
                                    className="px-4 py-2 text-sm rounded bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition cursor-pointer"
                                    onClick={() => setIsModalOpen(true)}
                                >
                                    Send to email
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                    </div>
                )}
            </div>

            <EmailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSend={async (email) => {
                    try {
                        await sendEmail(email, calculation, 'recipient', emailText)
                        toast.success("Email sent successfully!")
                    } catch (error) {
                        console.error("Error sending email:", error)
                        toast.error("Failed to send email")
                    }
                }}
            />

            <ToastContainer position="bottom-right" />
        </div>
    )
}