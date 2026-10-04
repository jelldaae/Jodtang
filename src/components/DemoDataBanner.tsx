import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Trash2, Settings, X, RefreshCw, CheckCircle2 } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

interface DemoDataBannerProps {
  onNavigateSettings?: () => void;
}

export const DemoDataBanner: React.FC<DemoDataBannerProps> = ({ onNavigateSettings }) => {
  const { isDemoActive, demoItemCounts, deleteDemoData, loadDemoData } = useApp();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReloading, setIsReloading] = useState(false);

  if (!isDemoActive) {
    return null;
  }

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteDemoData();
      setIsConfirmOpen(false);
    } catch (err) {
      console.error('Failed to delete demo data', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReload = async () => {
    setIsReloading(true);
    try {
      await loadDemoData(true);
    } catch (err) {
      console.error('Failed to reload demo data', err);
    } finally {
      setIsReloading(false);
    }
  };

  if (isDismissed) {
    return (
      <div className="bg-[#FEF3C7] border-b border-[#FDE68A] py-1.5 px-4 text-xs font-bold text-[#92400E] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
          <span>ระบบกำลังแสดงข้อมูลตัวอย่าง (Demo Data)</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDismissed(false)}
            className="text-xs text-[#B45309] hover:underline cursor-pointer"
          >
            แสดงแถบแจ้งเตือน
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={() => setIsConfirmOpen(true)}
            className="text-xs text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
          >
            ล้างข้อมูลตัวอย่าง
          </button>
        </div>
        <ConfirmModal
          isOpen={isConfirmOpen}
          title="ยืนยันการล้างข้อมูลตัวอย่าง (Clear Demo Data)"
          message="ระบบจะลบเฉพาะข้อมูลตัวอย่าง (ที่ระบุ isDemo: true) เท่านั้น ได้แก่ บัญชีตัวอย่าง 6 บัญชี, งบประมาณ, หนี้สิน, เป้าหมาย, สินทรัพย์ และรายการบันทึกตัวอย่าง โดยข้อมูลจริงที่คุณบันทึกเองจะไม่ถูกลบอย่างแน่นอน"
          confirmLabel={isDeleting ? 'กำลังล้าง...' : 'ยืนยันล้างข้อมูลตัวอย่าง'}
          cancelLabel="ยกเลิก"
          isDestructive={true}
          onConfirm={handleConfirmDelete}
          onCancel={() => setIsConfirmOpen(false)}
        />
      </div>
    );
  }

  return (
    <>
      <div className="bg-gradient-to-r from-[#FFFBEB] via-[#FEF3C7] to-[#FDE68A] border-b border-[#FCD34D]/60 py-2.5 px-4 sm:px-6 text-xs sm:text-sm text-[#78350F] shadow-xs transition-all animate-in fade-in slide-in-from-top-1">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-2.5">
          {/* Left Info */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-[#F59E0B] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-4 h-4 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 font-black text-[#92400E]">
                <span>โหมดข้อมูลตัวอย่าง (Demo Data Mode)</span>
                <span className="bg-[#F59E0B]/20 text-[#B45309] text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-[#F59E0B]/30">
                  {demoItemCounts.transactions} รายการ • {demoItemCounts.accounts} บัญชี • {demoItemCounts.budgets} งบ
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#92400E]/80 mt-0.5">
                ข้อมูลจำลองเชื่อมโยงกันทั้งระบบ (isDemo: true) เพื่อให้เห็นภาพการทำงานจริง — คุณสามารถล้างข้อมูลตัวอย่างได้ทุกเมื่อ
              </p>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
            <button
              onClick={handleReload}
              disabled={isReloading}
              title="โหลดข้อมูลตัวอย่างใหม่อีกครั้ง"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/80 hover:bg-white text-[#92400E] font-bold text-xs border border-[#FCD34D] transition-all active:scale-95 shadow-2xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isReloading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">รีเซ็ตตัวอย่าง</span>
            </button>

            {onNavigateSettings && (
              <button
                onClick={onNavigateSettings}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/80 hover:bg-white text-[#92400E] font-bold text-xs border border-[#FCD34D] transition-all active:scale-95 shadow-2xs cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>การตั้งค่า</span>
              </button>
            )}

            <button
              onClick={() => setIsConfirmOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>ล้างข้อมูลตัวอย่าง</span>
            </button>

            <button
              onClick={() => setIsDismissed(true)}
              title="ซ่อนแถบแจ้งเตือน"
              className="p-1.5 rounded-lg text-[#92400E]/60 hover:text-[#92400E] hover:bg-[#FDE68A]/60 transition-colors ml-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        title="ยืนยันการล้างข้อมูลตัวอย่าง (Clear Demo Data)"
        message="ระบบจะลบเฉพาะข้อมูลตัวอย่างที่มี isDemo: true เท่านั้น (6 บัญชี, 12 งบประมาณ, 4 หนี้สิน, 4 เป้าหมาย, 5 สินทรัพย์, 8 รายการประจำ และ 30 ธุรกรรมตัวอย่าง) ข้อมูลจริงทั้งหมดที่คุณสร้างเองจะไม่ถูกลบ"
        confirmLabel={isDeleting ? 'กำลังล้าง...' : 'ยืนยันล้างข้อมูลตัวอย่าง'}
        cancelLabel="ยกเลิก"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </>
  );
};
