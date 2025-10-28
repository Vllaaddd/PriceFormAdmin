import { Core } from "@prisma/client"
import { ApiRoutes } from "./constants"
import { axiosInstance } from "./instance"

export const getAll = async (): Promise<Core[]> => {

    const { data } = await axiosInstance.get<Core[]>(ApiRoutes.CORES)

    return data

}

export const update = async (id: number, data: any): Promise<Core> => {

    const res = await axiosInstance.patch(`${ApiRoutes.CORES}/${id}`, data)

    return res.data

}

export const updateByArticle = async (article: string, data: any): Promise<Core[]> => {

    const res = await axiosInstance.patch(`${ApiRoutes.CORES}/by-article/${article}`, data)

    return res.data

}

export const create = async(data: any): Promise<Core> => {
    
    const res = await axiosInstance.post(ApiRoutes.CORES, data)

    return res.data
    
}

export const find = async (filters: {
    length: number;
    type: string;
}): Promise<Core> => {
    const params = new URLSearchParams();
    params.append("length", String(filters.length));
    params.append("type", String(filters.type));

    const { data } = await axiosInstance.get<Core>(`${ApiRoutes.CORES}/find?${params.toString()}`);
    return data;
};