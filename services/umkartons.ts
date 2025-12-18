import { PriceTier, Umkarton } from "@prisma/client"
import { axiosInstance } from "./instance"
import { ApiRoutes } from "./constants"
import { UmkartonWithPrices } from "@/prisma/types"

export const getAll = async (): Promise<UmkartonWithPrices[]> => {

    const { data } = await axiosInstance.get<UmkartonWithPrices[]>(ApiRoutes.UMKARTONS)

    return data

}

export const getOne = async (id: string): Promise<UmkartonWithPrices> => {

    const { data } = await axiosInstance.get<UmkartonWithPrices>(`${ApiRoutes.UMKARTONS}/${id}`)

    return data

}

export const update = async (id: number, data: any): Promise<UmkartonWithPrices> => {
    
    const res = await axiosInstance.patch<UmkartonWithPrices>(`${ApiRoutes.UMKARTONS}/${id}`, data)

    return res.data

}

export const create = async(data: any): Promise<UmkartonWithPrices> => {
    
    const res = await axiosInstance.post(ApiRoutes.UMKARTONS, data)

    return res.data
    
}

export const getAllTiers = async(): Promise<PriceTier[]> => {

    const { data } = await axiosInstance.get(ApiRoutes.UMKARTONSPRICETIERS)

    return data

}

export const setTierPrice = async(data: any): Promise<PriceTier> =>{

    const res = await axiosInstance.patch(ApiRoutes.UMKARTONSPRICETIERS, data)

    return res.data

}

export const createPriceTier = async(data: any): Promise<PriceTier> => {

    const res = await axiosInstance.post(ApiRoutes.UMKARTONSPRICETIERS, data)

    return res.data

}

export const deleteUmkarton = async(id: string): Promise<Umkarton> => {

    const { data } = await axiosInstance.delete(`${ApiRoutes.UMKARTONS}/${id}`)

    return data

}

export const deletePriceTier = async(id: string): Promise<PriceTier> => {

    const { data } = await axiosInstance.delete(`${ApiRoutes.UMKARTONSPRICETIERS}/${id}`)

    return data

}

export const find = async (filters: {
    fsDimension: number;
    displayCarton: string;
    width: number;
    bedoManu: string;
}): Promise<UmkartonWithPrices> => {
    const params = new URLSearchParams();
    params.append("fsDimension", String(filters.fsDimension));
    params.append("displayCarton", filters.displayCarton);
    params.append("width", String(filters.width));
    params.append("bedoManu", String(filters.bedoManu));

    const { data } = await axiosInstance.get<UmkartonWithPrices>(`${ApiRoutes.UMKARTONS}/find?${params.toString()}`);
    return data;
};