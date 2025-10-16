import { EmailRecipient } from "@prisma/client"
import { ApiRoutes } from "./constants"
import { axiosInstance } from "./instance"
import { NextRequest } from "next/server"

export const getAll = async (): Promise<EmailRecipient[]> => {

    const { data } = await axiosInstance.get(ApiRoutes.RECIPIENTS)

    return data

}

export const create = async (data: any): Promise<EmailRecipient> => {

    const res = await axiosInstance.post(ApiRoutes.RECIPIENTS, data)

    return res.data

}

export const deleteRecipient = async (id: number): Promise<EmailRecipient> => {

    const { data } = await axiosInstance.delete(`${ApiRoutes.RECIPIENTS}/${id}`)

    return data

}