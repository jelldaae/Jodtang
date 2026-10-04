import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, 
  PieChart
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { loginWithGoogle, isLoading, syncError } = useApp();

  return (
    <div className="min-h-screen bg-[#FAF8F2] flex flex-col justify-center items-center p-4 sm:p-6 text-[#252525]">
      <div className="w-full max-w-md bg-white rounded-3xl p-7 sm:p-9 shadow-xl border border-[#EAE6DA] text-center space-y-6 animate-in zoom-in-95 duration-300">
        {/* Brand 3D Icon & Title */}
        <div className="flex flex-col items-center justify-center space-y-4 pt-2">
          <div className="w-24 h-24 sm:w-28 sm:h-28 drop-shadow-xl hover:scale-105 transition-transform">
            <img 
              src="/Logo-icon.png" 
              alt="Logo-icon.png" 
              className="w-full h-full object-contain pointer-events-none" 
            />
          </div>

          <div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl sm:text-4xl font-black text-[#133F2E] tracking-tight font-['IBM_Plex_Sans_Thai',sans-serif]">
                จดตังค์
              </span>
              <span className="text-xl sm:text-2xl font-extrabold text-[#3F8F72] uppercase font-['Plus_Jakarta_Sans',sans-serif]">
                JODTANG
              </span>
            </div>
            <p className="text-sm font-semibold text-gray-500 mt-1.5">
              จดง่าย รู้เงินทุกวัน
            </p>
          </div>
        </div>

        {/* Highlights */}
        <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#EAE6DA] text-left text-xs sm:text-sm space-y-2.5">
          <div className="flex items-center gap-2.5 text-gray-700 font-semibold">
            <ShieldCheck className="w-4 h-4 text-[#3F8F72] shrink-0" />
            <span>เชื่อมต่อด้วย <b>Google Account</b> (1 Email = 1 User)</span>
          </div>
          <div className="flex items-center gap-2.5 text-gray-700 font-semibold">
            <PieChart className="w-4 h-4 text-[#3F8F72] shrink-0" />
            <span>สรุปรายรับ รายจ่าย งบประมาณ และยอดเงินอัตโนมัติ</span>
          </div>
        </div>

        {syncError && (
          <div className="p-3 rounded-2xl bg-rose-50 text-[#E0533C] text-xs font-semibold text-left">
            {syncError}
          </div>
        )}

        {/* Official Google Sign-in button with Google logo */}
        <div className="space-y-3 pt-1">
          <button
            type="button"
            onClick={loginWithGoogle}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3.5 py-3.5 px-6 rounded-2xl bg-white hover:bg-gray-50 border border-gray-300 hover:border-gray-400 text-gray-800 font-bold text-sm sm:text-base shadow-sm hover:shadow-md transition-all active:scale-98 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-[#3F8F72] border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                <path fill="none" d="M0 0h48v48H0z" />
              </svg>
            )}
            <span>{isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบด้วย Google'}</span>
          </button>

          <p className="text-[11px] text-gray-400">
            ระบบจะสร้างหรือเชื่อมต่อไฟล์ Google Sheet ส่วนตัวใน Google Drive ของคุณโดยตรง
          </p>
        </div>
      </div>
    </div>
  );
};
