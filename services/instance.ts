import axios from 'axios'

// let baseURL: string;

// if (typeof window === "undefined") {
    
//     const vercelUrl = process.env.VERCEL_URL
//         ? `https://${process.env.VERCEL_URL}`
//         : "http://localhost:3000";

//     baseURL = vercelUrl;

// } else {
//     baseURL = "";
// }

export const axiosInstance = axios.create({
    baseURL: "https://price-form-admin.vercel.app/",
})