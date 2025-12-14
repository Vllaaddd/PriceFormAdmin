import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function NoAccessPage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center border border-gray-100">
        
        <div className="mx-auto bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mb-6">
          <ShieldAlert className="w-10 h-10 text-red-600" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Access Denied
        </h1>
        
        <p className="text-gray-500 text-lg mb-8 leading-relaxed">
          You do not have permission to view this page. Please contact your administrator or sign in with an authorized account.
        </p>

        <Link 
          href="/login" 
          className="inline-flex items-center justify-center gap-2 w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 hover:shadow-lg active:scale-[0.98]"
        >
          <ArrowLeft className="w-5 h-5" />
          Return to Login
        </Link>
      </div>
    </div>
  );
}