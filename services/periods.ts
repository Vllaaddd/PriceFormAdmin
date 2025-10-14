import { Period } from "@prisma/client"
import { ApiRoutes } from "./constants"
import { axiosInstance } from "./instance"

export const getAll = async () => {

    const { data } = await axiosInstance.get<Period[]>(ApiRoutes.PERIODS)

    return data

}

export const update = async (id: number, data: string) => {
    const res = await axiosInstance.patch<Period>(`${ApiRoutes.PERIODS}/${id}`, data)

    return res.data
}