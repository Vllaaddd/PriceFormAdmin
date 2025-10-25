"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInSocial } from "@/lib/actions/auth-actions";

export default function LoginPage(){
    const router = useRouter();

    useEffect(() => {
        (async () => {
            const session = await fetch("/api/auth/session").then((res) => res.json());
            if (session?.user) router.push("/");
        })();
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-2xl shadow-md text-center space-y-4">
                <h1 className="text-2xl font-semibold">Admin Login</h1>
                <p className="text-gray-600">Login with Google to continue</p>

                <button
                    onClick={() => signInSocial("google")}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-lg flex items-center justify-center gap-2 w-full cursor-pointer"
                >
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                    Sign in with Google
                </button>
            </div>
        </div>
    );
}