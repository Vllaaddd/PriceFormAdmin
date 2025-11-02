import axios from 'axios'

export const axiosInstance = axios.create({
    baseURL: "https://price-form-admin.vercel.app/",
})