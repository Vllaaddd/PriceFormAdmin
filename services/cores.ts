import { Core } from "@prisma/client"
import { ApiRoutes } from "./constants"
import { axiosInstance } from "./instance"

export const getAll = async (): Promise<Core[]> => {

    const { data } = await axiosInstance.get<Core[]>(ApiRoutes.CORES)

    return data

}