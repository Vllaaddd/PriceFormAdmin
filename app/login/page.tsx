"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signInSocial } from "@/lib/actions/auth-actions";
import { LockKeyhole, Loader2 } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/auth/session");
                const session = await res.json();
                
                if (session?.user) {
                    router.push("/");
                } else {
                    setIsChecking(false);
                }
            } catch (error) {
                console.error("Session check failed", error);
                setIsChecking(false);
            }
        })();
    }, [router]);

    if (isChecking) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-slate-100 via-indigo-50 to-cyan-50 p-4">
            <div className="w-full max-w-md bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/50 text-center">
                
                <div className="mx-auto bg-indigo-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                    <LockKeyhole className="w-8 h-8 text-indigo-600" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
                    Admin Portal
                </h1>
                
                <p className="text-gray-500 mb-8 text-sm">
                    Secure access for administrators only. <br/>
                    Please authenticate to continue.
                </p>

                <div className="relative mb-8">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white/50 px-2 text-gray-400 font-medium">
                            Login with
                        </span>
                    </div>
                </div>

                <button
                    onClick={() => signInSocial("google")}
                    className="group relative w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 font-medium border border-gray-200 px-4 py-3.5 rounded-xl transition-all duration-200 hover:shadow-lg active:scale-[0.98] cursor-pointer"
                >
                    <img 
                        src="https://www.svgrepo.com/show/475656/google-color.svg" 
                        alt="Google" 
                        className="w-5 h-5 transition-transform group-hover:scale-110" 
                    />
                    <span>Sign in with Google</span>
                </button>

                <p className="mt-8 text-xs text-gray-400">
                    Protected by secure authentication gateway.
                </p>
            </div>
        </div>
    );
}