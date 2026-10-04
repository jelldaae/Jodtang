import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  INCOME_GROUPS, 
  EXPENSE_GROUPS, 
  Category,
  AssetCategory 
} from '../types';
import { 
  Plus, 
  LogOut, 
  ShieldCheck, 
  Database, 
  Tags, 
  Edit3, 
  Trash2, 
  X, 
  CheckCircle2, 
  Search, 
  ExternalLink, 
  RefreshCw, 
  FileText, 
  Power, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles,
  Landmark,
  Settings
} from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

export const SettingsPage: React.FC = () => {
  const { 
    user, 
    spreadsheet, 
    isSyncing, 
    lastSyncTime, 
    syncData, 
    createNewSpreadsheet, 
    connectSpreadsheetById, 
    handleLogout,
    incomeCats,
    expenseCats,
    assetCats,
    saveCategory,
    deleteCategory,
    toggleCategoryStatus,
    saveAssetCategory,
    deleteAssetCategory,
    toggleAssetCategoryStatus,
    isDemoActive,
    demoItemCounts,
    loadDemoData,
    deleteDemoData
  } = useApp();

  // Active sub-tab within Settings
  const [activeTab, setActiveTab] = useState<'expense' | 'income' | 'asset' | 'account' | 'demo'>('expense');
  
  // Demo Data action state
  const [isDemoConfirmOpen, setIsDemoConfirmOpen] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [demoActionMsg, setDemoActionMsg] = useState<string | null>(null);
  
  // Search query for categories
  const [catSearch, setCatSearch] = useState('');

  // Category Modal state (Income & Expense)
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isIncomeModal, setIsIncomeModal] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catName, setCatName] = useState('');
  const [catGroup, setCatGroup] = useState<string>('');
  const [catIcon, setCatIcon] = useState('🏷️');
  const [catStatus, setCatStatus] = useState<'ใช้งาน' | 'ไม่ใช้งาน'>('ใช้งาน');
  const [isSavingCat, setIsSavingCat] = useState(false);
  const [catModalError, setCatModalError] = useState<string | null>(null);

  // Asset Category Modal state (Section 11)
  const [isAssetCatModalOpen, setIsAssetCatModalOpen] = useState(false);
  const [editingAssetCatId, setEditingAssetCatId] = useState<string | null>(null);
  const [assetCatName, setAssetCatName] = useState('');
  const [assetCatIcon, setAssetCatIcon] = useState('📦');
  const [assetCatStatus, setAssetCatStatus] = useState<'ใช้งาน' | 'ไม่ใช้งาน'>('ใช้งาน');
  const [isSavingAssetCat, setIsSavingAssetCat] = useState(false);
  const [assetCatModalError, setAssetCatModalError] = useState<string | null>(null);
  const [assetCatToDelete, setAssetCatToDelete] = useState<{ id: string; name: string } | null>(null);

  // Delete category confirmation modal
  const [catToDelete, setCatToDelete] = useState<{ id: string; name: string; isIncome: boolean } | null>(null);

  // Logout confirm modal
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  // Manual DB connection
  const [inputSheetId, setInputSheetId] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectMsg, setConnectMsg] = useState<string | null>(null);

  // Quick Emoji Suggestions for Income & Expense
  const emojiSuggestions = isIncomeModal 
    ? ['💼', '🎁', '⏰', '💸', '💻', '🧑‍🏫', '🛠️', '🌟', '🛍️', '🏪', '🏢', '📹', '📢', '🤝', '💖', '🔗', '📈', '💹', '🏦', '🪙', '🏠', '👨‍👩‍👧', '🛡️', '🧧', '🎟️', '📦', '✨']
    : ['🏠', '🏦', '🏢', '🔨', '🛋️', '🍛', '☕', '🍰', '🍻', '🥦', '⛽', '🚆', '🚕', '🛣️', '🔧', '🚗', '💡', '🚰', '🍳', '📱', '🌐', '💊', '🏥', '🦷', '🌿', '🏋️‍♂️', '🩺', '🛡️', '🩹', '🚙', '👗', '👟', '💄', '🎧', '🧴', '🎟️', '🏖️', '🎮', '🎨', '🎓', '📚', '✏️', '💻', '📢', '🖨️', '🧾', '💳', '🎬', '🎵', '📺', '☁️', '🤖', '🕊️', '🎁', '💌', '🚨', '📦'];

  // Quick Emoji Suggestions for Assets
  const assetEmojiSuggestions = [
    '💵', '🏦', '🥇', '📊', '📑', '🪙', '🏢', '🚗', '📱', '💻', '💎', '📦', 
    '🏠', '🛵', '🚲', '⌚', '💍', '🎨', '🚜', '🛥️', '🛍️', '📸', '🎧', '🎸'
  ];

  // Open Asset Category Modal
  const openAddAssetCat = () => {
    setEditingAssetCatId(null);
    setAssetCatName('');
    setAssetCatIcon('📦');
    setAssetCatStatus('ใช้งาน');
    setAssetCatModalError(null);
    setIsAssetCatModalOpen(true);
  };

  const openEditAssetCat = (cat: AssetCategory) => {
    setEditingAssetCatId(cat.id);
    setAssetCatName(cat.name);
    setAssetCatIcon(cat.icon || '📦');
    setAssetCatStatus(cat.status);
    setAssetCatModalError(null);
    setIsAssetCatModalOpen(true);
  };

  const handleSaveAssetCat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetCatName.trim()) {
      setAssetCatModalError('กรุณาระบุชื่อหมวดหมู่สินทรัพย์');
      return;
    }

    setIsSavingAssetCat(true);
    setAssetCatModalError(null);
    try {
      await saveAssetCategory({
        id: editingAssetCatId || undefined,
        name: assetCatName.trim(),
        icon: assetCatIcon.trim() || '📦',
        status: assetCatStatus,
      });
      setIsAssetCatModalOpen(false);
    } catch (err: any) {
      setAssetCatModalError(`บันทึกไม่สำเร็จ: ${err.message}`);
    } finally {
      setIsSavingAssetCat(false);
    }
  };

  const confirmDeleteAssetCategory = async () => {
    if (!assetCatToDelete) return;
    try {
      await deleteAssetCategory(assetCatToDelete.id);
      setAssetCatToDelete(null);
    } catch (err: any) {
      alert(`ลบไม่สำเร็จ: ${err.message}`);
    }
  };

  // Open modal to add or edit
  const openAddCat = (isIncome: boolean, defaultGroup?: string) => {
    setIsIncomeModal(isIncome);
    setEditingCatId(null);
    setCatName('');
    setCatGroup(defaultGroup || (isIncome ? INCOME_GROUPS[0] : EXPENSE_GROUPS[0]));
    setCatIcon(isIncome ? '💵' : '🛍️');
    setCatStatus('ใช้งาน');
    setCatModalError(null);
    setIsCatModalOpen(true);
  };

  const openEditCat = (cat: Category, isIncome: boolean) => {
    setIsIncomeModal(isIncome);
    setEditingCatId(cat.id);
    setCatName(cat.name);
    setCatGroup(cat.group || (isIncome ? INCOME_GROUPS[0] : EXPENSE_GROUPS[0]));
    setCatIcon(cat.icon || '🏷️');
    setCatStatus(cat.status);
    setCatModalError(null);
    setIsCatModalOpen(true);
  };

  const handleSaveCat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) {
      setCatModalError('กรุณาระบุชื่อหมวดหมู่');
      return;
    }
    if (!catGroup) {
      setCatModalError('กรุณาเลือกกลุ่ม');
      return;
    }

    setIsSavingCat(true);
    setCatModalError(null);
    try {
      await saveCategory(
        {
          id: editingCatId || undefined,
          name: catName.trim(),
          group: catGroup,
          icon: catIcon.trim() || '🏷️',
          status: catStatus,
        },
        isIncomeModal
      );
      setIsCatModalOpen(false);
    } catch (err: any) {
      setCatModalError(`บันทึกไม่สำเร็จ: ${err.message}`);
    } finally {
      setIsSavingCat(false);
    }
  };

  const confirmDeleteCategory = async () => {
    if (!catToDelete) return;
    try {
      await deleteCategory(catToDelete.id, catToDelete.isIncome);
      setCatToDelete(null);
    } catch (err: any) {
      alert(`ลบไม่สำเร็จ: ${err.message}`);
    }
  };

  const handleManualConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputSheetId.trim()) return;
    setIsConnecting(true);
    setConnectMsg(null);
    try {
      await connectSpreadsheetById(inputSheetId);
      setConnectMsg('เชื่อมต่อสำเร็จ!');
      setInputSheetId('');
    } catch (err: any) {
      setConnectMsg(`ผิดพลาด: ${err.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleCreateNew = async () => {
    if (!window.confirm('ต้องการสร้างฐานข้อมูลใหม่ใช่หรือไม่?')) return;
    try {
      await createNewSpreadsheet();
      alert('สร้างฐานข้อมูลใหม่สำเร็จแล้ว');
    } catch (err: any) {
      alert(`ผิดพลาด: ${err.message}`);
    }
  };

  // Grouped Categories computation
  const groupedIncome = useMemo(() => {
    const q = catSearch.trim().toLowerCase();
    const map = new Map<string, Category[]>();
    
    // Initialize all 9 groups
    INCOME_GROUPS.forEach(g => map.set(g, []));

    incomeCats.forEach(cat => {
      if (q && !cat.name.toLowerCase().includes(q) && !(cat.group && cat.group.toLowerCase().includes(q))) {
        return;
      }
      const g = cat.group || 'กลุ่มรายได้อื่น ๆ';
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(cat);
    });

    return map;
  }, [incomeCats, catSearch]);

  const groupedExpense = useMemo(() => {
    const q = catSearch.trim().toLowerCase();
    const map = new Map<string, Category[]>();

    // Initialize all 15 groups
    EXPENSE_GROUPS.forEach(g => map.set(g, []));

    expenseCats.forEach(cat => {
      if (q && !cat.name.toLowerCase().includes(q) && !(cat.group && cat.group.toLowerCase().includes(q))) {
        return;
      }
      const g = cat.group || 'กลุ่มรายจ่ายอื่น ๆ';
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(cat);
    });

    return map;
  }, [expenseCats, catSearch]);

  const filteredAssetCats = useMemo(() => {
    const q = catSearch.trim().toLowerCase();
    return assetCats.filter(c => {
      if (!q) return true;
      return c.name.toLowerCase().includes(q);
    });
  }, [assetCats, catSearch]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-5 sm:p-6 border border-[#EAE6DA] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold shrink-0">
            <Settings className="w-5 h-5 stroke-[2.3]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#17202A] tracking-tight">
              ตั้งค่า
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-gray-500 mt-1">
              จัดการหมวดหมู่รายรับ-รายจ่าย ข้อมูลบัญชีผู้ใช้ และการตั้งค่าระบบ
            </p>
          </div>
        </div>

        {/* Quick Add Category Button */}
        {activeTab !== 'account' && activeTab !== 'demo' && (
          <button
            onClick={() => {
              if (activeTab === 'asset') {
                openAddAssetCat();
              } else {
                openAddCat(activeTab === 'income');
              }
            }}
            className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-[#159B78] hover:bg-[#0F765C] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#159B78]/25 active:scale-95 transition-all self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>
              เพิ่มหมวดหมู่{activeTab === 'income' ? 'รายรับ' : activeTab === 'asset' ? 'สินทรัพย์' : 'รายจ่าย'}
            </span>
          </button>
        )}
      </div>

      {/* Main Tabs Navigation within Settings */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-[#EAE6DA] shadow-xs gap-1.5 overflow-x-auto">
        <button
          onClick={() => setActiveTab('expense')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'expense'
              ? 'bg-[#3F8F72] text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-[#FAF8F2]'
          }`}
        >
          <ArrowDownRight className="w-4 h-4" />
          <span>หมวดหมู่รายจ่าย ({expenseCats.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('income')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'income'
              ? 'bg-[#3F8F72] text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-[#FAF8F2]'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>หมวดหมู่รายรับ ({incomeCats.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('asset')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'asset'
              ? 'bg-[#3F8F72] text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-[#FAF8F2]'
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>หมวดหมู่สินทรัพย์ ({assetCats.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('account')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'account'
              ? 'bg-[#3F8F72] text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-[#FAF8F2]'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>บัญชีผู้ใช้ & ความปลอดภัย</span>
        </button>

        <button
          onClick={() => setActiveTab('demo')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'demo'
              ? 'bg-[#159B78] text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-[#FAF8F2]'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>ข้อมูลตัวอย่าง (Demo Data)</span>
          {isDemoActive && (
            <span className="bg-amber-400 text-amber-950 text-[10px] font-black px-1.5 py-0.5 rounded-full">
              {demoItemCounts.transactions}
            </span>
          )}
        </button>
      </div>

      {/* Search Bar for Categories */}
      {activeTab !== 'account' && activeTab !== 'demo' && (
        <div className="relative">
          <input
            type="text"
            placeholder={
              activeTab === 'asset' 
                ? 'ค้นหาหมวดหมู่สินทรัพย์...' 
                : `ค้นหาหมวดหมู่${activeTab === 'income' ? 'รายรับ' : 'รายจ่าย'}...`
            }
            value={catSearch}
            onChange={(e) => setCatSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 bg-white text-sm focus:border-[#3F8F72] focus:outline-hidden shadow-xs"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
          {catSearch && (
            <button
              onClick={() => setCatSearch('')}
              className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600 text-xs"
            >
              ล้าง
            </button>
          )}
        </div>
      )}

      {/* TAB A: หมวดหมู่รายจ่าย (15 กลุ่มหลัก) */}
      {activeTab === 'expense' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-gray-500 uppercase">
              15 กลุ่มรายจ่ายหลัก • ปรับแต่งหมวดหมู่ย่อยได้ตามใจชอบ
            </span>
            <span className="text-xs text-gray-400">
              เปิด/ปิดการใช้งานเพื่อแสดงเฉพาะที่ใช้ประจำ
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {EXPENSE_GROUPS.map((groupName, gIdx) => {
              const cats = groupedExpense.get(groupName) || [];
              const activeCount = cats.filter(c => c.status === 'ใช้งาน').length;

              return (
                <div
                  key={groupName}
                  className="bg-white rounded-3xl p-5 border border-[#EAE6DA] shadow-xs flex flex-col justify-between hover:border-gray-300 transition-all space-y-3.5"
                >
                  {/* Group Header */}
                  <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#FAF8F2] border border-[#EAE6DA] flex items-center justify-center text-[11px] font-black text-gray-600">
                          {gIdx + 1}
                        </span>
                        <h3 className="font-extrabold text-sm text-[#252525]">
                          {groupName}
                        </h3>
                      </div>
                      <span className="text-[11px] text-gray-400 mt-0.5 block pl-8">
                        {activeCount} / {cats.length} หมวดหมู่ย่อยพร้อมใช้งาน
                      </span>
                    </div>

                    <button
                      onClick={() => openAddCat(false, groupName)}
                      title="เพิ่มหมวดหมู่ย่อยในกลุ่มนี้"
                      className="flex items-center gap-1 text-[11px] font-bold text-[#3F8F72] hover:bg-[#3F8F72]/10 py-1 px-2.5 rounded-xl border border-[#3F8F72]/30 transition-all shrink-0 active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      <span>เพิ่มย่อย</span>
                    </button>
                  </div>

                  {/* Subcategories list */}
                  {cats.length === 0 ? (
                    <div className="py-4 text-center text-xs text-gray-400">
                      ยังไม่มีหมวดหมู่ย่อยในกลุ่มนี้
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                      {cats.map((cat) => {
                        const isActive = cat.status === 'ใช้งาน';

                        return (
                          <div
                            key={cat.id}
                            className={`flex items-center justify-between p-2 rounded-2xl border transition-all ${
                              isActive
                                ? 'bg-[#FAF8F2]/70 border-[#EAE6DA] text-gray-800'
                                : 'bg-gray-50/80 border-gray-200 text-gray-400 opacity-70'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-xl shrink-0">{cat.icon || '🏷️'}</span>
                              <div className="truncate">
                                <span className={`text-xs font-bold block truncate ${isActive ? 'text-gray-900' : 'text-gray-500 line-through'}`}>
                                  {cat.name}
                                </span>
                                <span className="text-[10px] text-gray-400 block">
                                  {isActive ? 'ใช้งานอยู่' : 'ปิดใช้งาน'}
                                </span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 shrink-0">
                              {/* Toggle active / inactive */}
                              <button
                                onClick={() => toggleCategoryStatus(cat.id, false)}
                                title={isActive ? 'คลิกเพื่อปิดใช้งาน' : 'คลิกเพื่อเปิดใช้งาน'}
                                className={`p-1.5 rounded-xl transition-all ${
                                  isActive
                                    ? 'text-[#3F8F72] hover:bg-[#3F8F72]/15'
                                    : 'text-gray-400 hover:bg-gray-200'
                                }`}
                              >
                                <Power className="w-3.5 h-3.5" />
                              </button>

                              {/* Edit */}
                              <button
                                onClick={() => openEditCat(cat, false)}
                                title="แก้ไขชื่อและไอคอน"
                                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => setCatToDelete({ id: cat.id, name: cat.name, isIncome: false })}
                                title="ลบหมวดหมู่"
                                className="p-1.5 rounded-xl text-gray-300 hover:text-[#E0533C] hover:bg-rose-50 transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB B: หมวดหมู่รายรับ (9 กลุ่มหลัก) */}
      {activeTab === 'income' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-gray-500 uppercase">
              9 กลุ่มรายรับหลัก • ปรับแต่งหมวดหมู่ย่อยได้ตามใจชอบ
            </span>
            <span className="text-xs text-gray-400">
              เปิด/ปิดการใช้งานเพื่อแสดงเฉพาะที่ใช้ประจำ
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {INCOME_GROUPS.map((groupName, gIdx) => {
              const cats = groupedIncome.get(groupName) || [];
              const activeCount = cats.filter(c => c.status === 'ใช้งาน').length;

              return (
                <div
                  key={groupName}
                  className="bg-white rounded-3xl p-5 border border-[#EAE6DA] shadow-xs flex flex-col justify-between hover:border-gray-300 transition-all space-y-3.5"
                >
                  {/* Group Header */}
                  <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#FAF8F2] border border-[#EAE6DA] flex items-center justify-center text-[11px] font-black text-gray-600">
                          {gIdx + 1}
                        </span>
                        <h3 className="font-extrabold text-sm text-[#252525]">
                          {groupName}
                        </h3>
                      </div>
                      <span className="text-[11px] text-gray-400 mt-0.5 block pl-8">
                        {activeCount} / {cats.length} หมวดหมู่ย่อยพร้อมใช้งาน
                      </span>
                    </div>

                    <button
                      onClick={() => openAddCat(true, groupName)}
                      title="เพิ่มหมวดหมู่ย่อยในกลุ่มนี้"
                      className="flex items-center gap-1 text-[11px] font-bold text-[#3F8F72] hover:bg-[#3F8F72]/10 py-1 px-2.5 rounded-xl border border-[#3F8F72]/30 transition-all shrink-0 active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      <span>เพิ่มย่อย</span>
                    </button>
                  </div>

                  {/* Subcategories list */}
                  {cats.length === 0 ? (
                    <div className="py-4 text-center text-xs text-gray-400">
                      ยังไม่มีหมวดหมู่ย่อยในกลุ่มนี้
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                      {cats.map((cat) => {
                        const isActive = cat.status === 'ใช้งาน';

                        return (
                          <div
                            key={cat.id}
                            className={`flex items-center justify-between p-2 rounded-2xl border transition-all ${
                              isActive
                                ? 'bg-[#FAF8F2]/70 border-[#EAE6DA] text-gray-800'
                                : 'bg-gray-50/80 border-gray-200 text-gray-400 opacity-70'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-xl shrink-0">{cat.icon || '🏷️'}</span>
                              <div className="truncate">
                                <span className={`text-xs font-bold block truncate ${isActive ? 'text-gray-900' : 'text-gray-500 line-through'}`}>
                                  {cat.name}
                                </span>
                                <span className="text-[10px] text-gray-400 block">
                                  {isActive ? 'ใช้งานอยู่' : 'ปิดใช้งาน'}
                                </span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 shrink-0">
                              {/* Toggle active / inactive */}
                              <button
                                onClick={() => toggleCategoryStatus(cat.id, true)}
                                title={isActive ? 'คลิกเพื่อปิดใช้งาน' : 'คลิกเพื่อเปิดใช้งาน'}
                                className={`p-1.5 rounded-xl transition-all ${
                                  isActive
                                    ? 'text-[#3F8F72] hover:bg-[#3F8F72]/15'
                                    : 'text-gray-400 hover:bg-gray-200'
                                }`}
                              >
                                <Power className="w-3.5 h-3.5" />
                              </button>

                              {/* Edit */}
                              <button
                                onClick={() => openEditCat(cat, true)}
                                title="แก้ไขชื่อและไอคอน"
                                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => setCatToDelete({ id: cat.id, name: cat.name, isIncome: true })}
                                title="ลบหมวดหมู่"
                                className="p-1.5 rounded-xl text-gray-300 hover:text-[#E0533C] hover:bg-rose-50 transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB ASSET: หมวดหมู่สินทรัพย์ (Section 11) */}
      {activeTab === 'asset' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EAE6DA] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-[#252525]">หมวดหมู่สินทรัพย์ (Asset Categories)</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  หมวดหมู่หลักสำหรับจัดประเภทสินทรัพย์ (Master Data ที่แสดงในหน้า “สินทรัพย์” แบบ Dynamic)
                </p>
              </div>
              <button
                onClick={openAddAssetCat}
                className="flex items-center gap-1.5 py-2 px-3.5 rounded-2xl bg-[#3F8F72] hover:bg-[#2F7259] text-white font-bold text-xs shadow-xs active:scale-95 transition-all self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ เพิ่มหมวดหมู่สินทรัพย์</span>
              </button>
            </div>

            {filteredAssetCats.length === 0 ? (
              <div className="p-8 text-center bg-[#FAF8F2] rounded-2xl border border-dashed border-[#EAE6DA] text-gray-500 text-xs">
                ไม่พบหมวดหมู่สินทรัพย์ที่ค้นหา
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredAssetCats.map(cat => {
                  const isActive = cat.status === 'ใช้งาน';
                  return (
                    <div
                      key={cat.id}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        isActive 
                          ? 'border-gray-200 bg-white hover:border-[#3F8F72]/50 shadow-xs' 
                          : 'border-gray-100 bg-gray-50/70 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-2xl p-1.5 rounded-xl bg-[#FAF8F2] shrink-0 border border-gray-100">
                          {cat.icon || '📦'}
                        </span>
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-[#252525] truncate">{cat.name}</h4>
                          <span className={`text-[10px] font-semibold ${isActive ? 'text-[#3F8F72]' : 'text-gray-400'}`}>
                            {isActive ? '● ใช้งาน' : '○ ไม่ใช้งาน'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {/* Toggle active / inactive */}
                        <button
                          type="button"
                          onClick={() => toggleAssetCategoryStatus(cat.id)}
                          title={isActive ? 'คลิกเพื่อปิดใช้งาน' : 'คลิกเพื่อเปิดใช้งาน'}
                          className={`p-1.5 rounded-xl transition-all ${
                            isActive
                              ? 'text-[#3F8F72] hover:bg-[#3F8F72]/15'
                              : 'text-gray-400 hover:bg-gray-200'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit */}
                        <button
                          type="button"
                          onClick={() => openEditAssetCat(cat)}
                          title="แก้ไขชื่อและไอคอน"
                          className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => setAssetCatToDelete({ id: cat.id, name: cat.name })}
                          title="ลบหมวดหมู่"
                          className="p-1.5 rounded-xl text-gray-300 hover:text-[#E0533C] hover:bg-rose-50 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB C: บัญชีผู้ใช้ & ความปลอดภัย */}
      {activeTab === 'account' && (
        <div className="space-y-6">
          {/* User Account Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#EAE6DA] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#3F8F72]/15 text-[#3F8F72] flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#252525]">ข้อมูลบัญชีผู้ใช้งาน</h3>
                  <p className="text-xs text-gray-400">เข้าสู่ระบบด้วย Google Account (1 Email = 1 User)</p>
                </div>
              </div>

              <span className="text-[11px] font-bold text-[#3F8F72] bg-[#3F8F72]/10 py-1 px-3 rounded-full">
                ยืนยันตัวตนแล้ว
              </span>
            </div>

            {user ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#FAF8F2] border border-[#EAE6DA]">
                <div className="flex items-center gap-3.5">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-12 h-12 rounded-full ring-2 ring-[#3F8F72]/40 object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#F4D35E] text-[#252525] font-bold text-xl flex items-center justify-center">
                      {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
                    </div>
                  )}
                  <div>
                    <h4 className="font-extrabold text-[#252525] text-base">{user.displayName || 'ผู้ใช้งาน'}</h4>
                    <p className="text-xs text-gray-500 font-medium">{user.email}</p>
                    <div className="flex items-center gap-1 text-[11px] text-[#3F8F72] font-semibold mt-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>ข้อมูลการเงินของคุณปลอดภัยและเป็นส่วนตัว 100%</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsLogoutConfirmOpen(true)}
                  className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl border border-gray-300 hover:border-[#E0533C] text-gray-600 hover:text-[#E0533C] font-bold text-xs transition-colors self-start sm:self-center"
                >
                  <LogOut className="w-4 h-4" />
                  <span>ออกจากระบบ</span>
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-500">ไม่ได้เข้าสู่ระบบ</p>
            )}
          </div>

          {/* Database Connection Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#EAE6DA] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#3F8F72]/15 text-[#3F8F72] flex items-center justify-center font-bold">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#252525]">การเชื่อมต่อฐานข้อมูล</h3>
                  <p className="text-xs text-gray-400">จัดเก็บข้อมูลการเงินทั้งหมดในระบบคลาวด์ของคุณเอง</p>
                </div>
              </div>

              <button
                onClick={() => syncData()}
                disabled={isSyncing}
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl border border-[#3F8F72] text-[#3F8F72] hover:bg-[#3F8F72]/10 font-bold text-xs transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>ซิงค์ข้อมูลตอนนี้</span>
              </button>
            </div>

            {spreadsheet ? (
              <div className="space-y-3.5 p-4 rounded-2xl bg-[#FAF8F2] border border-[#EAE6DA]">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase">ฐานข้อมูลปัจจุบัน</span>
                    <div className="text-base font-extrabold text-gray-900 flex items-center gap-2 mt-0.5">
                      <FileText className="w-4 h-4 text-[#3F8F72]" />
                      <span>{spreadsheet.name}</span>
                    </div>
                  </div>

                  <a
                    href={spreadsheet.webViewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-[#3F8F72] hover:bg-[#2F7259] text-white font-bold text-xs shadow-xs transition-all"
                  >
                    <span>เปิดดูข้อมูลดิบ</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="pt-2 border-t border-gray-200/60 text-xs text-gray-500 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>รหัสอ้างอิง:</span>
                    <code className="bg-white px-2 py-0.5 rounded-md font-mono text-[11px] border border-gray-200">
                      {spreadsheet.id}
                    </code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>การซิงค์ล่าสุด:</span>
                    <span className="font-semibold text-gray-700">
                      {lastSyncTime ? lastSyncTime.toLocaleString('th-TH') : 'ยังไม่ได้ซิงค์'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-amber-50 text-amber-800 text-xs">
                กำลังค้นหาหรือเชื่อมต่อกับฐานข้อมูลของคุณ...
              </div>
            )}

            {/* Advanced connection options */}
            <div className="pt-2 border-t border-gray-100 space-y-3">
              <h4 className="text-xs font-bold text-gray-700 uppercase">ตัวเลือกเพิ่มเติม</h4>

              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={handleCreateNew}
                  className="py-2 px-3 rounded-xl border border-gray-300 hover:border-[#3F8F72] text-xs font-bold text-gray-700 hover:text-[#3F8F72] transition-colors"
                >
                  + สร้างฐานข้อมูลใหม่
                </button>
              </div>

              <form onSubmit={handleManualConnect} className="space-y-2 pt-1">
                <label className="text-xs text-gray-500 block">หรือเชื่อมต่อด้วย ID / ลิงก์อื่น:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="เช่น 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms หรือ URL"
                    value={inputSheetId}
                    onChange={(e) => setInputSheetId(e.target.value)}
                    className="flex-1 p-2 text-xs rounded-xl border border-gray-300 bg-white"
                  />
                  <button
                    type="submit"
                    disabled={isConnecting || !inputSheetId.trim()}
                    className="py-2 px-4 rounded-xl bg-gray-800 text-white font-bold text-xs hover:bg-black disabled:opacity-50"
                  >
                    {isConnecting ? 'กำลังเชื่อม...' : 'เชื่อมต่อ'}
                  </button>
                </div>
                {connectMsg && <p className="text-xs font-medium text-[#3F8F72]">{connectMsg}</p>}
              </form>
            </div>
          </div>
        </div>
      )}

      {/* TAB E: ข้อมูลตัวอย่าง (Demo Data Master Prompt Sections 1 - 28) */}
      {activeTab === 'demo' && (
        <div className="space-y-6">
          {/* Demo Control Status Header */}
          <div className="bg-white rounded-3xl p-6 border border-[#EAE6DA] shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
                  isDemoActive ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base sm:text-lg text-[#252525]">
                      ระบบข้อมูลตัวอย่าง (Demo Data / Sample Data)
                    </h3>
                    {isDemoActive ? (
                      <span className="bg-amber-100 text-amber-800 text-[11px] font-black px-2.5 py-0.5 rounded-full border border-amber-300">
                        กำลังใช้งาน ({demoItemCounts.transactions} ธุรกรรม)
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-600 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-gray-200">
                        ไม่มีข้อมูลตัวอย่าง (Clean State)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    ตามข้อกำหนด Master Prompt: ข้อมูลตัวอย่างจะระบุ <code>isDemo: true</code> และเชื่อมโยงจริงทุกโมดูล
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0">
                <button
                  onClick={async () => {
                    setIsDemoLoading(true);
                    setDemoActionMsg(null);
                    try {
                      await loadDemoData(true);
                      setDemoActionMsg('โหลดข้อมูลตัวอย่างทั้ง 7 โมดูลสำเร็จเรียบร้อย');
                    } catch (e: any) {
                      setDemoActionMsg(`ผิดพลาด: ${e.message}`);
                    } finally {
                      setIsDemoLoading(false);
                    }
                  }}
                  disabled={isDemoLoading}
                  className="flex items-center gap-2 py-2.5 px-4 rounded-2xl bg-[#159B78] hover:bg-[#0F765C] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#159B78]/25 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${isDemoLoading ? 'animate-spin' : ''}`} />
                  <span>{isDemoActive ? 'โหลดข้อมูลตัวอย่างใหม่' : '🚀 โหลดข้อมูลตัวอย่าง'}</span>
                </button>

                {isDemoActive && (
                  <button
                    onClick={() => setIsDemoConfirmOpen(true)}
                    disabled={isDemoLoading}
                    className="flex items-center gap-2 py-2.5 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 text-[#E0533C] border border-rose-200 font-bold text-xs sm:text-sm active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>ล้างข้อมูลตัวอย่าง</span>
                  </button>
                )}
              </div>
            </div>

            {demoActionMsg && (
              <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{demoActionMsg}</span>
              </div>
            )}

            {/* Core Principle Callout */}
            <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#EAE6DA] text-xs text-gray-600 space-y-1.5">
              <div className="font-extrabold text-[#252525] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#159B78]" />
                <span>หลักการทำงานของ Demo Data ใน JODTANG:</span>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-gray-500">
                <li>
                  <strong className="text-gray-700">แยกข้อมูลชัดเจน:</strong> ข้อมูลตัวอย่างจะมีแฟลก <code>isDemo: true</code> ขณะที่ข้อมูลที่ผู้ใช้สร้างเองจะมี <code>isDemo: false</code>
                </li>
                <li>
                  <strong className="text-gray-700">ปลอดภัย 100%:</strong> เมื่อกด "ล้างข้อมูลตัวอย่าง" ระบบจะลบเฉพาะรายการที่มี <code>isDemo: true</code> ข้อมูลจริงที่คุณบันทึกไว้จะไม่หายอย่างแน่นอน
                </li>
                <li>
                  <strong className="text-gray-700">ข้อมูลจริงใน State:</strong> คำนวณยอดเงินคงเหลือ, ภาพรวมหนี้สิน, กราฟ, งบประมาณ และเป้าหมายตามสูตรจริง ไม่ใช่ Mock Text
                </li>
                <li>
                  <strong className="text-gray-700">นโยบายความเป็นส่วนตัว:</strong> หน้า Dashboard และภาพรวมจะไม่แสดงเลขที่บัญชีหรือเลขบัตรเครดิต
                </li>
              </ul>
            </div>
          </div>

          {/* 7 Modules Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Module 1: บัญชีและกระเป๋าเงิน (6 บัญชี) */}
            <div className="bg-white rounded-3xl p-5 border border-[#EAE6DA] shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🏦</span>
                    <h4 className="font-extrabold text-sm text-[#252525]">1. บัญชี & กระเป๋าเงิน</h4>
                  </div>
                  <span className="text-xs font-bold text-[#159B78] bg-[#159B78]/10 px-2 py-0.5 rounded-full">
                    6 บัญชี
                  </span>
                </div>
                <div className="space-y-2 mt-3 text-xs">
                  <div className="flex justify-between py-1 border-b border-gray-50">
                    <span className="text-gray-600">💵 เงินสด</span>
                    <span className="font-bold text-gray-900">฿3,500</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-50">
                    <span className="text-gray-600">🟢 KBank (xxx-x-12345-x)</span>
                    <span className="font-bold text-gray-900">฿12,850</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-50">
                    <span className="text-gray-600">🟣 SCB (xxx-x-67890-x)</span>
                    <span className="font-bold text-gray-900">฿10,500</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-50">
                    <span className="text-gray-600">📱 TrueMoney</span>
                    <span className="font-bold text-gray-900">฿2,000</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-50">
                    <span className="text-gray-600">🏦 KBank Savings</span>
                    <span className="font-bold text-gray-900">฿35,000</span>
                  </div>
                  <div className="flex justify-between py-1 text-rose-600">
                    <span>💳 KBank Credit Card</span>
                    <span className="font-bold">ค้าง ฿42,500</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Module 2: งบประมาณ (12 หมวดหมู่) */}
            <div className="bg-white rounded-3xl p-5 border border-[#EAE6DA] shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📊</span>
                    <h4 className="font-extrabold text-sm text-[#252525]">2. งบประมาณ (ต.ค. 2569)</h4>
                  </div>
                  <span className="text-xs font-bold text-[#159B78] bg-[#159B78]/10 px-2 py-0.5 rounded-full">
                    12 หมวดหมู่
                  </span>
                </div>
                <div className="space-y-1.5 mt-3 text-xs">
                  <p className="text-gray-500 font-medium">
                    งบประมาณรวม <strong>฿45,000</strong> ประจำเดือนปัจจุบัน:
                  </p>
                  <div className="grid grid-cols-2 gap-1 text-[11px] text-gray-600">
                    <span>• บ้าน: ฿8,000</span>
                    <span>• อาหาร: ฿8,000</span>
                    <span>• เดินทาง: ฿5,000</span>
                    <span>• โทรศัพท์: ฿1,500</span>
                    <span>• สุขภาพ: ฿2,000</span>
                    <span>• ช้อปปิ้ง: ฿4,000</span>
                    <span>• บันเทิง: ฿3,000</span>
                    <span>• การศึกษา: ฿2,500</span>
                    <span>• งาน/ธุรกิจ: ฿5,000</span>
                    <span>• Sub: ฿2,500</span>
                    <span>• บริจาค: ฿1,500</span>
                    <span>• อื่น ๆ: ฿2,000</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Module 3: หนี้สิน (4 รายการ) */}
            <div className="bg-white rounded-3xl p-5 border border-[#EAE6DA] shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">💳</span>
                    <h4 className="font-extrabold text-sm text-[#252525]">3. หนี้สิน (Debts)</h4>
                  </div>
                  <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                    4 รายการ
                  </span>
                </div>
                <div className="space-y-2 mt-3 text-xs">
                  <div className="flex justify-between py-1 border-b border-gray-50">
                    <span className="text-gray-600">KBank Credit Card (16%)</span>
                    <span className="font-bold text-rose-600">฿42,500</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-50">
                    <span className="text-gray-600">SCB Credit Card (15%)</span>
                    <span className="font-bold text-rose-600">฿8,500</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-50">
                    <span className="text-gray-600">สินเชื่อรถยนต์ (5.5%)</span>
                    <span className="font-bold text-rose-600">฿285,000</span>
                  </div>
                  <div className="flex justify-between py-1 text-rose-600">
                    <span>สินเชื่อบ้าน (3.5%)</span>
                    <span className="font-bold">฿780,000</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Module 4: เป้าหมายการออม (4 รายการ) */}
            <div className="bg-white rounded-3xl p-5 border border-[#EAE6DA] shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🎯</span>
                    <h4 className="font-extrabold text-sm text-[#252525]">4. เป้าหมายการออม</h4>
                  </div>
                  <span className="text-xs font-bold text-[#159B78] bg-[#159B78]/10 px-2 py-0.5 rounded-full">
                    4 เป้าหมาย
                  </span>
                </div>
                <div className="space-y-2 mt-3 text-xs">
                  <div className="flex justify-between py-1 border-b border-gray-50">
                    <span className="text-gray-600">เงินสำรองฉุกเฉิน</span>
                    <span className="font-bold text-[#159B78]">฿35,000 / ฿100,000</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-50">
                    <span className="text-gray-600">เที่ยวญี่ปุ่น</span>
                    <span className="font-bold text-[#159B78]">฿22,000 / ฿60,000</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-50">
                    <span className="text-gray-600">ซื้อ MacBook</span>
                    <span className="font-bold text-[#159B78]">฿25,000 / ฿70,000</span>
                  </div>
                  <div className="flex justify-between py-1 text-gray-600">
                    <span>เงินลงทุน</span>
                    <span className="font-bold text-[#159B78]">฿50,000 / ฿200,000</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Module 5: สินทรัพย์ (5 รายการ) */}
            <div className="bg-white rounded-3xl p-5 border border-[#EAE6DA] shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">💎</span>
                    <h4 className="font-extrabold text-sm text-[#252525]">5. สินทรัพย์ (Assets)</h4>
                  </div>
                  <span className="text-xs font-bold text-[#159B78] bg-[#159B78]/10 px-2 py-0.5 rounded-full">
                    5 รายการ
                  </span>
                </div>
                <div className="space-y-2 mt-3 text-xs">
                  <div className="flex justify-between py-1 border-b border-gray-50">
                    <span className="text-gray-600">ทองคำแท่ง 1 บาท</span>
                    <span className="font-bold text-emerald-600">฿50,000 (+฿5,000)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-50">
                    <span className="text-gray-600">กองทุนรวม</span>
                    <span className="font-bold text-emerald-600">฿25,000 (+฿5,000)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-50">
                    <span className="text-gray-600">MacBook</span>
                    <span className="font-bold text-gray-700">฿38,000</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-50">
                    <span className="text-gray-600">กล้องถ่ายรูป</span>
                    <span className="font-bold text-gray-700">฿28,000</span>
                  </div>
                  <div className="flex justify-between py-1 text-gray-600">
                    <span>เงินลงทุนหุ้น</span>
                    <span className="font-bold text-emerald-600">฿32,000 (+฿2,000)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Module 6: รายการประจำ & 30 ธุรกรรม */}
            <div className="bg-white rounded-3xl p-5 border border-[#EAE6DA] shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🔁</span>
                    <h4 className="font-extrabold text-sm text-[#252525]">6. รายการประจำ & ธุรกรรม</h4>
                  </div>
                  <span className="text-xs font-bold text-[#159B78] bg-[#159B78]/10 px-2 py-0.5 rounded-full">
                    8 ประจำ • 30 บันทึก
                  </span>
                </div>
                <div className="space-y-1.5 mt-3 text-xs text-gray-600">
                  <p>
                    • <strong>8 รายการประจำ:</strong> เงินเดือน, Freelance, Netflix, Spotify, เน็ต, โทรศัพท์, ค่างวดรถ, ค่างวดบ้าน
                  </p>
                  <p>
                    • <strong>30 ธุรกรรมตัวอย่าง:</strong> ครอบคลุมรายรับ 6 รายการ, รายจ่าย 23 รายการ, โอนเงิน 1 รายการ
                  </p>
                  <div className="pt-2 text-[11px] text-gray-400 font-medium">
                    บันทึกระหว่างวันที่ 1 - 4 ต.ค. 2026 สอดคล้องกับเดือนปัจจุบัน
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Clear Demo Modal */}
      <ConfirmModal
        isOpen={isDemoConfirmOpen}
        title="ยืนยันการล้างข้อมูลตัวอย่าง (Clear Demo Data)"
        message="ระบบจะลบเฉพาะข้อมูลตัวอย่าง (ที่ระบุ isDemo: true) เท่านั้น ได้แก่ บัญชีตัวอย่าง 6 บัญชี, งบประมาณ 12 รายการ, หนี้สิน 4 รายการ, เป้าหมาย 4 รายการ, สินทรัพย์ 5 รายการ, รายการประจำ 8 รายการ และ 30 ธุรกรรมตัวอย่าง โดยข้อมูลจริงที่คุณบันทึกเองจะไม่ถูกลบอย่างแน่นอน"
        confirmLabel={isDemoLoading ? 'กำลังล้าง...' : 'ยืนยันล้างข้อมูลตัวอย่าง'}
        cancelLabel="ยกเลิก"
        isDestructive={true}
        onConfirm={async () => {
          setIsDemoLoading(true);
          try {
            await deleteDemoData();
            setDemoActionMsg('ล้างข้อมูลตัวอย่างเรียบร้อยแล้ว ค่าทั้งหมดกลับสู่สถานะข้อมูลจริงของคุณ');
            setIsDemoConfirmOpen(false);
          } catch (e: any) {
            setDemoActionMsg(`ผิดพลาด: ${e.message}`);
          } finally {
            setIsDemoLoading(false);
          }
        }}
        onCancel={() => setIsDemoConfirmOpen(false)}
      />

      {/* Category Modal (Add / Edit) */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-[#EAE6DA] animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#252525]">
                {editingCatId 
                  ? `แก้ไขหมวดหมู่${isIncomeModal ? 'รายรับ' : 'รายจ่าย'}` 
                  : `เพิ่มหมวดหมู่${isIncomeModal ? 'รายรับ' : 'รายจ่าย'}`}
              </h3>
              <button 
                onClick={() => setIsCatModalOpen(false)} 
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {catModalError && (
              <div className="mb-3 p-2.5 rounded-xl bg-rose-50 text-[#E0533C] text-xs font-semibold">
                {catModalError}
              </div>
            )}

            <form onSubmit={handleSaveCat} className="space-y-4">
              {/* Emoji Icon & Quick Selection */}
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">ไอคอนหมวดหมู่ (Emoji)</label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="🏷️"
                    value={catIcon}
                    onChange={(e) => setCatIcon(e.target.value)}
                    className="w-16 p-2 text-center text-2xl rounded-xl border border-gray-300 bg-white"
                    maxLength={4}
                  />
                  <span className="text-xs text-gray-400">เลือกจากด้านล่างหรือพิมพ์ Emoji เอง</span>
                </div>

                {/* Quick Emoji Chips */}
                <div className="flex flex-wrap gap-1 p-2 rounded-2xl bg-[#FAF8F2] border border-[#EAE6DA] max-h-24 overflow-y-auto">
                  {emojiSuggestions.map((emoji, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCatIcon(emoji)}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-lg hover:bg-white transition-all ${
                        catIcon === emoji ? 'bg-white shadow-xs ring-2 ring-[#3F8F72]' : ''
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Name */}
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">ชื่อหมวดหมู่</label>
                <input
                  type="text"
                  placeholder="เช่น เงินเดือน, ค่ากาแฟ, ค่าสมาชิก"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#3F8F72] focus:outline-hidden"
                  required
                />
              </div>

              {/* Group Select */}
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">กลุ่มหลัก</label>
                <select
                  value={catGroup}
                  onChange={(e) => setCatGroup(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 bg-white text-sm focus:border-[#3F8F72] focus:outline-hidden"
                  required
                >
                  {(isIncomeModal ? INCOME_GROUPS : EXPENSE_GROUPS).map((grp, i) => (
                    <option key={grp} value={grp}>
                      {i + 1}. {grp}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Select */}
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">สถานะการใช้งาน</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCatStatus('ใช้งาน')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all ${
                      catStatus === 'ใช้งาน'
                        ? 'bg-[#3F8F72]/15 border-[#3F8F72] text-[#3F8F72]'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    ✓ เปิดใช้งาน
                  </button>
                  <button
                    type="button"
                    onClick={() => setCatStatus('ไม่ใช้งาน')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all ${
                      catStatus === 'ไม่ใช้งาน'
                        ? 'bg-gray-200 border-gray-400 text-gray-800'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    ✕ ปิดใช้งาน
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-50 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSavingCat}
                  className="flex-1 py-2.5 rounded-xl bg-[#3F8F72] hover:bg-[#2F7259] text-white text-xs font-bold shadow-md shadow-[#3F8F72]/20 transition-all disabled:opacity-50"
                >
                  {isSavingCat ? 'กำลังบันทึก...' : 'บันทึกหมวดหมู่'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Asset Category Modal (Section 11) */}
      {isAssetCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-[#EAE6DA] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#3F8F72]/15 text-[#3F8F72] flex items-center justify-center font-bold">
                  <Landmark className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-[#252525]">
                  {editingAssetCatId ? 'แก้ไขหมวดหมู่สินทรัพย์' : 'เพิ่มหมวดหมู่สินทรัพย์'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAssetCatModalOpen(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {assetCatModalError && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-50 text-[#E0533C] text-xs font-semibold">
                {assetCatModalError}
              </div>
            )}

            <form onSubmit={handleSaveAssetCat} className="space-y-4">
              {/* Category Name */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  ชื่อหมวดหมู่สินทรัพย์ <span className="text-[#E0533C]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="เช่น ทองคำ, หุ้น, ยานพาหนะ, Cryptocurrency"
                  value={assetCatName}
                  onChange={(e) => setAssetCatName(e.target.value)}
                  className="w-full py-2.5 px-3.5 rounded-2xl border border-gray-300 text-sm focus:border-[#3F8F72] focus:outline-hidden"
                  required
                />
              </div>

              {/* Icon / Emoji */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  ไอคอนประจำหมวดหมู่ (Emoji)
                </label>
                <div className="flex items-center gap-2">
                  <div className="w-11 h-11 rounded-2xl bg-[#FAF8F2] border border-gray-300 flex items-center justify-center text-2xl shrink-0">
                    {assetCatIcon || '📦'}
                  </div>
                  <input
                    type="text"
                    placeholder="พิมพ์ Emoji หรือเลือกจากด้านล่าง"
                    value={assetCatIcon}
                    onChange={(e) => setAssetCatIcon(e.target.value)}
                    className="flex-1 py-2.5 px-3.5 rounded-2xl border border-gray-300 text-sm focus:border-[#3F8F72] focus:outline-hidden"
                  />
                </div>

                {/* Suggestions */}
                <div className="mt-2 flex flex-wrap gap-1.5 p-2 bg-[#FAF8F2] rounded-2xl border border-[#EAE6DA] max-h-24 overflow-y-auto">
                  {assetEmojiSuggestions.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setAssetCatIcon(emoji)}
                      className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all ${
                        assetCatIcon === emoji ? 'bg-[#3F8F72] text-white shadow-xs' : 'hover:bg-white'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  สถานะการใช้งาน
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAssetCatStatus('ใช้งาน')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all ${
                      assetCatStatus === 'ใช้งาน'
                        ? 'bg-[#3F8F72]/15 border-[#3F8F72] text-[#3F8F72]'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    ✓ เปิดใช้งาน
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssetCatStatus('ไม่ใช้งาน')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all ${
                      assetCatStatus === 'ไม่ใช้งาน'
                        ? 'bg-gray-200 border-gray-400 text-gray-800'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    ✕ ปิดใช้งาน
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAssetCatModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-50 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSavingAssetCat}
                  className="flex-1 py-2.5 rounded-xl bg-[#3F8F72] hover:bg-[#2F7259] text-white text-xs font-bold shadow-md shadow-[#3F8F72]/20 transition-all disabled:opacity-50"
                >
                  {isSavingAssetCat ? 'กำลังบันทึก...' : 'บันทึกหมวดหมู่'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Asset Category Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(assetCatToDelete)}
        title="ลบหมวดหมู่สินทรัพย์"
        message={`คุณต้องการลบหมวดหมู่ "${assetCatToDelete?.name}" ใช่หรือไม่? รายการสินทรัพย์เดิมที่ใช้หมวดหมู่นี้จะยังคงอยู่`}
        confirmLabel="ยืนยันการลบ"
        cancelLabel="ยกเลิก"
        isDestructive={true}
        onConfirm={confirmDeleteAssetCategory}
        onCancel={() => setAssetCatToDelete(null)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(catToDelete)}
        title="ลบหมวดหมู่"
        message={`คุณต้องการลบหมวดหมู่ "${catToDelete?.name}" ใช่หรือไม่? รายการในอดีตที่เคยบันทึกไว้จะยังคงอยู่`}
        confirmLabel="ยืนยันการลบ"
        cancelLabel="ยกเลิก"
        isDestructive={true}
        onConfirm={confirmDeleteCategory}
        onCancel={() => setCatToDelete(null)}
      />

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={isLogoutConfirmOpen}
        title="ออกจากระบบ"
        message="คุณต้องการออกจากระบบหรือไม่? คุณสามารถเข้าสู่ระบบด้วย Google Account เดิมเพื่อกลับมาใช้งานฐานข้อมูลเดิมได้ทุกเมื่อ"
        confirmLabel="ออกจากระบบ"
        cancelLabel="ยกเลิก"
        isDestructive={false}
        onConfirm={handleLogout}
        onCancel={() => setIsLogoutConfirmOpen(false)}
      />
    </div>
  );
};
