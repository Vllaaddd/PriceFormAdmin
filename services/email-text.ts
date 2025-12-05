import { EmailText } from "@prisma/client"
import { axiosInstance } from "./instance"
import { ApiRoutes } from "./constants"

export const getText = async (): Promise<EmailText> => {

    const { data } = await axiosInstance.get<EmailText>(ApiRoutes.EMAILTEXT)

    return data
}

export const updateText = async (text: string, id: number): Promise<EmailText> => {

    const { data } = await axiosInstance.put<EmailText>(`${ApiRoutes.EMAILTEXT}/${id}`, { text })

    return data
}