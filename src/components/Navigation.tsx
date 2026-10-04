import React, { useState } from 'react';
import { 
  Home, 
  Receipt, 
  Wallet, 
  PieChart, 
  CreditCard,
  PiggyBank, 
  Landmark,
  CalendarClock, 
  Settings,
  Plus,
  MoreHorizontal,
  X
} from 'lucide-react';
import { BrandLogo, NongTangMascot } from '../assets/logo';

export type NavTab = 
  | 'home' 
  | 'transactions' 
  | 'accounts' 
  | 'categories' 
  | 'projects' 
  | 'budgets' 
  | 'debts' 
  | 'savings' 
  | 'assets' 
  | 'recurring' 
  | 'subscriptions' 
  | 'settings';

interface NavigationProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenAddModal?: () => void;
}

export const navItems = [
  { id: 'home' as NavTab, label: 'ภาพรวม', icon: Home },
  { id: 'transactions' as NavTab, label: 'รายการ', icon: Receipt },
  { id: 'accounts' as NavTab, label: 'บัญชี', icon: Wallet },
  { id: 'budgets' as NavTab, label: 'งบประมาณ', icon: PieChart },
  { id: 'debts' as NavTab, label: 'หนี้สิน', icon: CreditCard },
  { id: 'savings' as NavTab, label: 'เป้าหมายการออม', icon: PiggyBank },
  { id: 'assets' as NavTab, label: 'สินทรัพย์', icon: Landmark },
  { id: 'recurring' as NavTab, label: 'รายการประจำ', icon: CalendarClock },
  { id: 'settings' as NavTab, label: 'ตั้งค่า', icon: Settings },
];

export const DesktopSidebar: React.FC<NavigationProps> = ({ currentTab, onSelectTab }) => {
  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-[#EAE6DA] p-4 shrink-0 min-h-[calc(100vh-65px)] justify-between">
      <div>
        {/* Brand Logo in Sidebar */}
        <div className="px-3 py-2 mb-3">
          <BrandLogo mode="full" size="md" />
        </div>

        {/* Sidebar Nav Items */}
        <div className="space-y-1 overflow-y-auto pr-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all ${
                  isActive
                    ? 'bg-[#159B78] text-white shadow-md shadow-[#159B78]/25'
                    : 'text-gray-600 hover:bg-[#FAF8F2] hover:text-[#252525]'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mascot Card at Bottom of Sidebar (from Reference Mockup) */}
      <div className="mt-4 p-4 rounded-3xl bg-linear-to-b from-[#FFF9E6] to-[#EDF7F2] border border-[#EAE6DA] relative overflow-hidden flex items-center gap-3 shadow-2xs">
        <NongTangMascot className="w-14 h-14 shrink-0 -ml-1" />
        <div>
          <span className="font-black text-xs text-[#133F2E] leading-tight block">
            จดง่าย
          </span>
          <span className="font-extrabold text-xs text-[#3F8F72] leading-tight block">
            รู้เงินทุกวัน
          </span>
          <span className="font-bold text-[10px] text-gray-500 leading-tight block mt-0.5">
            กับจดตังค์!
          </span>
        </div>
      </div>
    </aside>
  );
};

export const MobileBottomNav: React.FC<NavigationProps> = ({ 
  currentTab, 
  onSelectTab,
  onOpenAddModal 
}) => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const moreItems = [
    { id: 'budgets' as NavTab, label: 'งบประมาณ', icon: PieChart },
    { id: 'debts' as NavTab, label: 'หนี้สิน', icon: CreditCard },
    { id: 'savings' as NavTab, label: 'เป้าหมายการออม', icon: PiggyBank },
    { id: 'assets' as NavTab, label: 'สินทรัพย์', icon: Landmark },
    { id: 'recurring' as NavTab, label: 'รายการประจำ', icon: CalendarClock },
    { id: 'settings' as NavTab, label: 'ตั้งค่า', icon: Settings },
  ];

  return (
    <>
      {/* Mobile More Sheet */}
      {isMoreMenuOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex flex-col justify-end lg:hidden animate-in fade-in duration-200"
          onClick={() => setIsMoreMenuOpen(false)}
        >
          <div 
            className="bg-white rounded-t-3xl p-5 border-t border-[#EAE6DA] space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="font-black text-sm text-[#252525]">เมนูเพิ่มเติม</span>
              <button 
                onClick={() => setIsMoreMenuOpen(false)}
                className="p-1 rounded-xl text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {moreItems.map(item => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTab(item.id);
                      setIsMoreMenuOpen(false);
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
                      isActive 
                        ? 'bg-[#3F8F72]/15 border-[#3F8F72] text-[#3F8F72] font-bold' 
                        : 'border-gray-200 bg-[#FAF8F2] text-gray-700 hover:bg-white'
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-1 text-[#3F8F72]" />
                    <span className="text-xs font-semibold">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Mobile Bottom Nav (Section 20 & Reference Mockup) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#EAE6DA] px-3 py-1.5 safe-area-pb">
        <div className="flex items-center justify-around max-w-md mx-auto relative">
          {/* Tab 1: ภาพรวม */}
          <button
            onClick={() => onSelectTab('home')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              currentTab === 'home' ? 'text-[#159B78] font-bold' : 'text-gray-400 font-medium'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">ภาพรวม</span>
          </button>

          {/* Tab 2: รายการ */}
          <button
            onClick={() => onSelectTab('transactions')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              currentTab === 'transactions' ? 'text-[#159B78] font-bold' : 'text-gray-400 font-medium'
            }`}
          >
            <Receipt className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">รายการ</span>
          </button>

          {/* Floating Action Button: Center "+ จดตังค์" */}
          <div className="-mt-6 flex flex-col items-center">
            <button
              onClick={() => onOpenAddModal && onOpenAddModal()}
              className="w-13 h-13 rounded-full bg-[#159B78] hover:bg-[#0F765C] text-white flex items-center justify-center shadow-lg shadow-[#159B78]/35 active:scale-90 transition-all border-4 border-[#FAF8F2]"
              title="จดตังค์"
            >
              <Plus className="w-6 h-6 stroke-[3]" />
            </button>
            <span className="text-[10px] font-extrabold text-[#159B78] mt-0.5">จดตังค์</span>
          </div>

          {/* Tab 3: บัญชี */}
          <button
            onClick={() => onSelectTab('accounts')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              currentTab === 'accounts' ? 'text-[#159B78] font-bold' : 'text-gray-400 font-medium'
            }`}
          >
            <Wallet className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">บัญชี</span>
          </button>

          {/* Tab 4: อื่น ๆ */}
          <button
            onClick={() => setIsMoreMenuOpen(true)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              isMoreMenuOpen || ['budgets', 'debts', 'savings', 'assets', 'recurring', 'settings'].includes(currentTab)
                ? 'text-[#159B78] font-bold' 
                : 'text-gray-400 font-medium'
            }`}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">อื่น ๆ</span>
          </button>
        </div>
      </nav>
    </>
  );
};
