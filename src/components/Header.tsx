import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BrandLogo } from '../assets/logo';
import { 
  RefreshCw, 
  ExternalLink, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  FileSpreadsheet, 
  LogOut,
  Search,
  Bell,
  User as UserIcon,
  ChevronDown
} from 'lucide-react';

interface HeaderProps {
  onOpenAddModal: () => void;
  onNavigateSettings: () => void;
  onSearch?: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onOpenAddModal, 
  onNavigateSettings,
  onSearch 
}) => {
  const { user, spreadsheet, isSyncing, lastSyncTime, syncError, syncData, handleLogout } = useApp();
  const [searchInput, setSearchInput] = useState('');
  const [hasNotification, setHasNotification] = useState(true);

  const formatLastSync = (d: Date | null) => {
    if (!d) return '';
    return d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) onSearch(searchInput);
  };

  return (
    <header className="sticky top-0 z-30 bg-[#FBF9F4]/95 backdrop-blur-md border-b border-[#EAE6DA] px-4 lg:px-8 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <BrandLogo mode="full" size="md" />
        </div>

        {/* Center: Search Bar (Desktop) - Section 5 */}
        <div className="hidden md:flex flex-1 max-w-md mx-2">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="ค้นหารายการ, บัญชี, หมวดหมู่..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                if (onSearch) onSearch(e.target.value);
              }}
              className="w-full pl-9 pr-12 py-2 rounded-2xl bg-white border border-[#EAE6DA] text-xs sm:text-sm font-medium text-[#17202A] placeholder:text-gray-400 focus:border-[#159B78] focus:outline-hidden transition-all shadow-2xs"
            />
            <kbd className="hidden sm:inline-flex items-center absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
              ⌘K
            </kbd>
          </form>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Database Sync Status (Desktop) */}
          {spreadsheet && (
            <div className="hidden xl:flex items-center gap-2 bg-white py-1.5 px-3 rounded-2xl border border-[#EAE6DA] shadow-2xs text-xs">
              <div className="flex items-center gap-1.5 text-gray-600">
                <FileSpreadsheet className="w-3.5 h-3.5 text-[#3F8F72]" />
                <span className="font-semibold truncate max-w-[110px]" title={spreadsheet.name}>
                  {spreadsheet.name}
                </span>
              </div>
              <div className="h-3 w-px bg-gray-200" />
              {isSyncing ? (
                <span className="flex items-center gap-1 text-[#3F8F72] text-[11px] font-semibold animate-pulse">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  ซิงค์...
                </span>
              ) : (
                <span className="text-[11px] text-gray-400 font-medium">
                  {lastSyncTime ? `${formatLastSync(lastSyncTime)} น.` : 'พร้อมใช้งาน'}
                </span>
              )}
            </div>
          )}

          {/* Primary Action Button: [ + ] จดตังค์ (Desktop & Mobile Header) */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 bg-[#159B78] hover:bg-[#0F765C] text-white px-3.5 sm:px-4 py-2 rounded-2xl font-bold text-xs sm:text-sm shadow-md shadow-[#159B78]/25 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>จดตังค์</span>
          </button>

          {/* Notification Bell */}
          <button
            onClick={() => setHasNotification(!hasNotification)}
            className="relative p-2 rounded-2xl bg-white border border-[#EAE6DA] hover:border-[#159B78] text-gray-600 hover:text-[#159B78] transition-colors shadow-2xs cursor-pointer"
            title="การแจ้งเตือน"
          >
            <Bell className="w-4 h-4" />
            {hasNotification && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF8F7A] ring-2 ring-white" />
            )}
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-1">
            <button
              onClick={onNavigateSettings}
              className="flex items-center gap-2 p-1 sm:pr-2.5 sm:pl-1 rounded-2xl bg-white border border-[#EAE6DA] hover:border-[#159B78] transition-all shadow-2xs cursor-pointer"
              title={`${user?.displayName || 'Jelliline Daae'} (${user?.email || 'jelldaae@gmail.com'})`}
            >
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full ring-2 ring-[#159B78]/30 object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#F4D35E] text-[#17202A] font-black flex items-center justify-center text-xs">
                  {user?.displayName ? user.displayName[0].toUpperCase() : 'J'}
                </div>
              )}
              <span className="hidden sm:block text-xs font-bold text-[#17202A] max-w-[120px] truncate text-left">
                {user?.displayName || 'Jelliline Daae'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
