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

export const find = async (filters: {
    material: string;
    lineType: string;
    length: number;
}): Promise<Skillet> => {
    const params = new URLSearchParams();
    params.append("material", filters.material);
    params.append("lineType", filters.lineType);
    params.append("length", String(filters.length));

    const { data } = await axiosInstance.get<Skillet>(`${ApiRoutes.SKILLETS}/find?${params.toString()}`);
    return data;
};