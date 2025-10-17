import { Admin } from "@prisma/client"
import { ApiRoutes } from "./constants"
import { axiosInstance } from "./instance"

export const getAll = async (): Promise<Admin[]> => {

    const { data } = await axiosInstance.get(ApiRoutes.ADMINS)

    return data

}

export const create = async (data: any): Promise<Admin> => {

    const res = await axiosInstance.post(ApiRoutes.ADMINS, data)

    return res.data

}

export const deleteAdmin = async (id: number): Promise<Admin> => {

    const { data } = await axiosInstance.delete(`${ApiRoutes.ADMINS}/${id}`)

    return data

}