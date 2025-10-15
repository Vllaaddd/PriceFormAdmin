import { Skillet } from "@prisma/client"
import { axiosInstance } from "./instance"
import { ApiRoutes } from "./constants"

export const getAll = async (): Promise<Skillet[]> => {

    const { data } = await axiosInstance.get<Skillet[]>(ApiRoutes.SKILLETS)

    return data

}

export const getOne = async (id: string): Promise<Skillet> => {

    const { data } = await axiosInstance.get<Skillet>(`${ApiRoutes.SKILLETS}/${id}`)

    return data

}

export const update = async (id: number, data: any): Promise<Skillet> => {
    
    const res = await axiosInstance.patch<Skillet>(`${ApiRoutes.SKILLETS}/${id}`, data)

    return res.data

}

export const find = async (filters: {
    format: number;
    knife: string;
    density: number;
}): Promise<Skillet> => {
    const params = new URLSearchParams();
    params.append("format", String(filters.format));
    params.append("knife", filters.knife);
    params.append("density", String(filters.density));

    const { data } = await axiosInstance.get<Skillet>(`${ApiRoutes.SKILLETS}/find?${params.toString()}`);
    return data;
};
