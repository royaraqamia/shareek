/** @format */

import { useNavigate } from "react-router-dom";
import { Clock } from "./Box";

export default function PendingApproval() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 via-white to-violet-50/30" dir="rtl">
            {/* Main Content */}
            <div className="flex-1 flex flex-col px-5 py-8 max-w-lg mx-auto w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-[100px] h-[100px] mx-auto mb-6 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-full flex items-center justify-center">
                        <Clock className="w-12 h-12 text-violet-600" />
                    </div>
                    <h1 className="text-[24px] font-[700] text-slate-900 tracking-tight mb-2 leading-relaxed">
                        بانتظار الموافقة
                    </h1>
                    <p className="text-slate-500 text-[16px] leading-relaxed">
                        تم إنشاء حسابك بنجاح وهو الآن بانتظار الموافقة.
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100/80 p-6">
                    <p className="text-slate-600 text-[16px] leading-relaxed text-center">
                        ستتمكن من الدخول إلى حسابك بعد أن تتم مراجعة طلبك والموافقة عليه.
                    </p>

                    {/* Submit Button */}
                    <button
                        onClick={() => navigate("/login")}
                        className="w-full h-[48px] bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 active:scale-[0.98] text-white text-[16px] font-[600] leading-relaxed rounded-[12px] shadow-lg shadow-violet-500/25 transition-all duration-200 mt-4"
                    >
                        العودة إلى تسجيل الدخول
                    </button>
                </div>
            </div>
        </div>
    );
}
