import { PriceTier, Skillet } from "@prisma/client"
import { axiosInstance } from "./instance"
import { ApiRoutes } from "./constants"
import { SkilletWithPrices } from "@/prisma/types"

export const getAll = async (): Promise<SkilletWithPrices[]> => {

    const { data } = await axiosInstance.get<SkilletWithPrices[]>(ApiRoutes.SKILLETS)

    return data

}

export const getOne = async (id: string): Promise<SkilletWithPrices> => {

    const { data } = await axiosInstance.get<SkilletWithPrices>(`${ApiRoutes.SKILLETS}/${id}`)

    return data

}

export const update = async (id: number, data: any): Promise<SkilletWithPrices> => {
    
    const res = await axiosInstance.patch<SkilletWithPrices>(`${ApiRoutes.SKILLETS}/${id}`, data)

    return res.data

}

export const create = async(data: any): Promise<SkilletWithPrices> => {
    
    const res = await axiosInstance.post(ApiRoutes.SKILLETS, data)

    return res.data
    
}

export const getAllTiers = async(): Promise<PriceTier[]> => {

    const { data } = await axiosInstance.get(ApiRoutes.PRICETIERS)

    return data

}

export const setTierPrice = async(data: any): Promise<PriceTier> =>{

    const res = await axiosInstance.patch(ApiRoutes.PRICETIERS, data)

    return res.data

}

export const createPriceTier = async(data: any): Promise<PriceTier> => {

    const res = await axiosInstance.post(ApiRoutes.PRICETIERS, data)

    return res.data

}

export const deleteSkillet = async(id: string): Promise<Skillet> => {

    const { data } = await axiosInstance.delete(`${ApiRoutes.SKILLETS}/${id}`)

    return data

}

export const deletePriceTier = async(id: string): Promise<PriceTier> => {

    const { data } = await axiosInstance.delete(`${ApiRoutes.PRICETIERS}/${id}`)

    return data

}

export const find = async (filters: {
    width: number;
    height: number;
    knife: string;
    density: number;
}): Promise<SkilletWithPrices> => {
    const params = new URLSearchParams();
    params.append("width", String(filters.width));
    params.append("height", String(filters.height));
    params.append("knife", filters.knife);
    params.append("density", String(filters.density));

    const { data } = await axiosInstance.get<SkilletWithPrices>(`${ApiRoutes.SKILLETS}/find?${params.toString()}`);
    return data;
};