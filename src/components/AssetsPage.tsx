import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Asset } from '../types';
import { 
  Landmark, 
  Coins,
  Plus, 
  Edit3, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Building2, 
  Wallet, 
  Tag, 
  X,
  Layers,
  ArrowRight,
  Search,
  Filter,
  ArrowUpDown,
  LayoutGrid,
  List,
  Sparkles,
  Info
} from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

// Sample assets from Master Prompt Section 3
const SAMPLE_ASSETS: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'ทองคำแท่ง 1 บาท',
    category: 'ทองคำ',
    cost: 45000,
    value: 52500,
    buyDate: '2025-03-15',
    note: 'ทองคำแท่ง 96.5%',
    status: 'ใช้งาน',
  },
  {
    name: 'iPhone 16 Pro',
    category: 'Electronics',
    cost: 39900,
    value: 25000,
    buyDate: '2025-10-20',
    note: 'ใช้งานส่วนตัว',
    status: 'ใช้งาน',
  },
  {
    name: 'Honda City',
    category: 'ยานพาหนะ',
    cost: 650000,
    value: 520000,
    buyDate: '2023-06-10',
    note: 'รถยนต์ส่วนตัว',
    status: 'ใช้งาน',
  },
  {
    name: 'กองทุน SCB',
    category: 'กองทุน',
    cost: 100000,
    value: 108500,
    buyDate: '2026-01-05',
    note: 'กองทุนรวม',
    status: 'ใช้งาน',
  },
];

export const AssetsPage: React.FC = () => {
  const { 
    assets, 
    assetCats, 
    accounts, 
    totalAssetCost, 
    totalAssetValue, 
    assetProfitLoss, 
    assetProfitLossPct, 
    saveAsset, 
    deleteAsset 
  } = useApp();

  // Search & Filter & Sort state (Requirement 7)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAccountFilter, setSelectedAccountFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'cost' | 'value' | 'buyDate'>('buyDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  // Form states (Requirement 2 & 8)
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [costStr, setCostStr] = useState('');
  const [valueStr, setValueStr] = useState('');
  const [buyDate, setBuyDate] = useState(new Date().toISOString().slice(0, 10));
  const [accountId, setAccountId] = useState('');
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Asset | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  // Active assets filter
  const activeAssets = useMemo(() => {
    return assets.filter(a => a.status === 'ใช้งาน');
  }, [assets]);

  // Open Add modal
  const openAdd = () => {
    setEditingAsset(null);
    setName('');
    const firstCat = assetCats.find(c => c.status === 'ใช้งาน')?.name || assetCats[0]?.name || 'ทองคำ';
    setCategory(firstCat);
    setCostStr('');
    setValueStr('');
    setBuyDate(new Date().toISOString().slice(0, 10));
    setAccountId('');
    setNote('');
    setError(null);
    setIsModalOpen(true);
  };

  // Open Edit modal
  const openEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setName(asset.name);
    setCategory(asset.category);
    setCostStr(String(asset.cost));
    setValueStr(String(asset.value));
    setBuyDate(asset.buyDate || new Date().toISOString().slice(0, 10));
    setAccountId(asset.accountId || '');
    setNote(asset.note || '');
    setError(null);
    setIsModalOpen(true);
  };

  // Handle Form Submission with Validation (Requirement 8)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError('กรุณาระบุชื่อสินทรัพย์');
    if (!category.trim()) return setError('กรุณาเลือกหมวดหมู่');
    if (!buyDate) return setError('กรุณาระบุวันที่ซื้อ');

    const costNum = parseFloat(costStr);
    if (isNaN(costNum) || costNum < 0) return setError('มูลค่าซื้อต้องเป็นตัวเลขที่ไม่ติดลบ (>= 0)');

    const valueNum = parseFloat(valueStr);
    if (isNaN(valueNum) || valueNum < 0) return setError('มูลค่าปัจจุบันต้องเป็นตัวเลขที่ไม่ติดลบ (>= 0)');

    setIsSaving(true);
    setError(null);
    try {
      await saveAsset({
        id: editingAsset?.id,
        name: name.trim(),
        category: category.trim(),
        cost: costNum,
        value: valueNum,
        buyDate,
        accountId: accountId.trim() || undefined,
        note: note.trim(),
        status: 'ใช้งาน',
      });
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'บันทึกสินทรัพย์ไม่สำเร็จ');
    } finally {
      setIsSaving(false);
    }
  };

  // Confirm delete asset
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteAsset(deleteTarget.id);
    setDeleteTarget(null);
  };

  // Load sample assets (Section 3)
  const handleSeedSamples = async () => {
    setIsSeeding(true);
    try {
      for (const sample of SAMPLE_ASSETS) {
        // Find matching account if applicable
        let matchedAccountId: string | undefined = undefined;
        if (sample.name.includes('ทองคำ')) {
          matchedAccountId = accounts.find(a => a.name.toLowerCase().includes('k plus') || a.name.toLowerCase().includes('kbank'))?.id;
        } else if (sample.name.includes('SCB') || sample.name.includes('iPhone')) {
          matchedAccountId = accounts.find(a => a.name.toLowerCase().includes('scb'))?.id;
        }

        await saveAsset({
          ...sample,
          accountId: matchedAccountId,
        });
      }
    } catch (err) {
      console.error('Error seeding sample assets:', err);
    } finally {
      setIsSeeding(false);
    }
  };

  // Helper to format dates
  const formatDateThai = (dStr?: string) => {
    if (!dStr) return '-';
    try {
      const parts = dStr.split('-');
      if (parts.length === 3) {
        const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
        const day = parseInt(parts[2], 10);
        const month = months[parseInt(parts[1], 10) - 1] || parts[1];
        const year = parseInt(parts[0], 10) + 543;
        return `${day} ${month} ${year}`;
      }
      return dStr;
    } catch {
      return dStr;
    }
  };

  const getAccountName = (accId?: string) => {
    if (!accId) return 'ไม่ระบุบัญชี';
    const acc = accounts.find(a => a.id === accId);
    return acc ? acc.name : 'ไม่ระบุบัญชี';
  };

  const getCategoryIcon = (catName: string) => {
    const found = assetCats.find(c => c.name === catName);
    return found?.icon || '📦';
  };

  // Filtered and sorted assets
  const filteredAssets = useMemo(() => {
    return activeAssets
      .filter((asset) => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = asset.name.toLowerCase().includes(q);
          const matchNote = (asset.note || '').toLowerCase().includes(q);
          const matchCat = asset.category.toLowerCase().includes(q);
          if (!matchName && !matchNote && !matchCat) return false;
        }

        // Category filter
        if (selectedCategory !== 'all' && asset.category !== selectedCategory) {
          return false;
        }

        // Account filter
        if (selectedAccountFilter === 'unspecified') {
          if (asset.accountId) return false;
        } else if (selectedAccountFilter !== 'all') {
          if (asset.accountId !== selectedAccountFilter) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortBy === 'name') {
          comp = a.name.localeCompare(b.name, 'th');
        } else if (sortBy === 'cost') {
          comp = a.cost - b.cost;
        } else if (sortBy === 'value') {
          comp = a.value - b.value;
        } else if (sortBy === 'buyDate') {
          comp = (a.buyDate || '').localeCompare(b.buyDate || '');
        }

        return sortOrder === 'asc' ? comp : -comp;
      });
  }, [activeAssets, searchQuery, selectedCategory, selectedAccountFilter, sortBy, sortOrder]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-5 sm:p-6 border border-[#EAE6DA] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-100/80 text-teal-800 flex items-center justify-center font-bold shrink-0">
            <Coins className="w-5 h-5 stroke-[2.3]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#17202A] tracking-tight">
              สินทรัพย์
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-gray-500 mt-1">
              บันทึกและติดตามสินทรัพย์ที่ถือครอง เช่น ทองคำ หุ้น กองทุน อสังหาฯ ยานพาหนะ และของมีค่า
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {activeAssets.length === 0 && (
            <button
              onClick={handleSeedSamples}
              disabled={isSeeding}
              className="flex items-center gap-1.5 py-2.5 px-3.5 rounded-2xl bg-white border border-[#EAE6DA] hover:border-[#159B78] text-[#159B78] font-bold text-xs sm:text-sm shadow-xs active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
              title="โหลดตัวอย่างข้อมูลสินทรัพย์ 4 รายการเพื่อเริ่มต้นใช้งาน"
            >
              <Sparkles className="w-4 h-4 text-[#F4D35E]" />
              <span>{isSeeding ? 'กำลังโหลด...' : 'โหลดตัวอย่าง'}</span>
            </button>
          )}

          <button
            onClick={openAdd}
            className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-[#159B78] hover:bg-[#0F765C] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#159B78]/25 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>เพิ่มสินทรัพย์</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          SECTION 5: SUMMARY CARDS (4 Metrics)
          1. จำนวนสินทรัพย์
          2. มูลค่าซื้อรวม
          3. มูลค่าปัจจุบันรวม
          4. กำไร / ขาดทุนโดยประมาณ
          ======================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* 1. จำนวนสินทรัพย์ */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#EAE6DA] shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">จำนวนสินทรัพย์</span>
            <div className="w-8 h-8 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center">
              <Layers className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-xl sm:text-3xl font-black text-[#252525]">
            {activeAssets.length} <span className="text-xs font-semibold text-gray-400">รายการ</span>
          </div>
          <p className="text-[11px] text-gray-400 font-medium truncate">
            สินทรัพย์ทั้งหมดที่ถือครอง
          </p>
        </div>

        {/* 2. มูลค่าซื้อรวม */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#EAE6DA] shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">มูลค่าซื้อรวม</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Building2 className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-gray-700">
            ฿{totalAssetCost.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-gray-400 font-medium truncate">
            ต้นทุนการซื้อรวมทั้งหมด
          </p>
        </div>

        {/* 3. มูลค่าปัจจุบันรวม */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#EAE6DA] shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">มูลค่าปัจจุบันรวม</span>
            <div className="w-8 h-8 rounded-xl bg-[#3F8F72]/15 text-[#3F8F72] flex items-center justify-center">
              <Landmark className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-[#3F8F72]">
            ฿{totalAssetValue.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-gray-400 font-medium truncate">
            นำไปคำนวณมูลค่าสุทธิในแดชบอร์ด
          </p>
        </div>

        {/* 4. กำไร / ขาดทุนโดยประมาณ */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#EAE6DA] shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">กำไร / ขาดทุนโดยประมาณ</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              assetProfitLoss >= 0 ? 'bg-emerald-100 text-[#3F8F72]' : 'bg-rose-100 text-[#E0533C]'
            }`}>
              {assetProfitLoss >= 0 ? <TrendingUp className="w-4 h-4 stroke-[2.5]" /> : <TrendingDown className="w-4 h-4 stroke-[2.5]" />}
            </div>
          </div>
          <div className={`text-lg sm:text-2xl font-black ${
            assetProfitLoss >= 0 ? 'text-[#3F8F72]' : 'text-[#E0533C]'
          }`}>
            {assetProfitLoss >= 0 ? '+' : ''}฿{assetProfitLoss.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] font-semibold text-gray-400">
            {assetProfitLoss >= 0 ? 'กำไร' : 'ขาดทุน'} {assetProfitLossPct.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* ========================================================
          SECTION 7: SEARCH / FILTER / SORT BAR
          ======================================================== */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#EAE6DA] shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 justify-between">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาชื่อสินทรัพย์ หรือหมายเหตุ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-[#FAF8F2] border border-[#EAE6DA] text-xs sm:text-sm font-medium text-[#252525] focus:border-[#3F8F72] focus:bg-white focus:outline-hidden transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filters & Sorting */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter by Category */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="py-2.5 px-3 rounded-2xl bg-[#FAF8F2] border border-[#EAE6DA] text-xs font-bold text-[#252525] focus:border-[#3F8F72] focus:outline-hidden cursor-pointer"
            >
              <option value="all">📦 ทุกหมวดหมู่</option>
              {assetCats.map(cat => (
                <option key={cat.id} value={cat.name}>
                  {cat.icon || '🏷️'} {cat.name}
                </option>
              ))}
            </select>

            {/* Filter by Account */}
            <select
              value={selectedAccountFilter}
              onChange={(e) => setSelectedAccountFilter(e.target.value)}
              className="py-2.5 px-3 rounded-2xl bg-[#FAF8F2] border border-[#EAE6DA] text-xs font-bold text-[#252525] focus:border-[#3F8F72] focus:outline-hidden cursor-pointer"
            >
              <option value="all">🏦 ทุกลักษณะบัญชี</option>
              <option value="unspecified">⚪ ไม่ระบุบัญชี</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  💳 {acc.name}
                </option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1 bg-[#FAF8F2] border border-[#EAE6DA] rounded-2xl p-1">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="py-1.5 px-2 bg-transparent text-xs font-bold text-[#252525] focus:outline-hidden cursor-pointer"
              >
                <option value="buyDate">📅 วันที่ซื้อ</option>
                <option value="value">💰 มูลค่าปัจจุบัน</option>
                <option value="cost">🏷️ มูลค่าซื้อ</option>
                <option value="name">🔤 ชื่อสินทรัพย์</option>
              </select>

              <button
                type="button"
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="p-1.5 rounded-xl hover:bg-white text-gray-600 hover:text-[#3F8F72] transition-colors"
                title={sortOrder === 'asc' ? 'เรียงจากน้อยไปมาก' : 'เรียงจากมากไปน้อย'}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* View Mode Toggle: Table / Card */}
            <div className="hidden sm:flex items-center bg-[#FAF8F2] border border-[#EAE6DA] rounded-2xl p-1 gap-1">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-xl transition-all ${
                  viewMode === 'table' ? 'bg-white text-[#3F8F72] shadow-xs font-bold' : 'text-gray-400 hover:text-gray-600'
                }`}
                title="มุมมองตาราง (Desktop Table)"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('card')}
                className={`p-1.5 rounded-xl transition-all ${
                  viewMode === 'card' ? 'bg-white text-[#3F8F72] shadow-xs font-bold' : 'text-gray-400 hover:text-gray-600'
                }`}
                title="มุมมองการ์ด (Card View)"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Results Count & Active Filters Indicator */}
        {(searchQuery || selectedCategory !== 'all' || selectedAccountFilter !== 'all') && (
          <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t border-gray-100">
            <span>พบ <b>{filteredAssets.length}</b> รายการ จากทั้งหมด {activeAssets.length} รายการ</span>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedAccountFilter('all');
              }}
              className="text-[#3F8F72] hover:underline font-bold"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          </div>
        )}
      </div>

      {/* ========================================================
          SECTION 13: EMPTY STATE
          ======================================================== */}
      {activeAssets.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-[#EAE6DA] shadow-xs space-y-4">
          <div className="w-20 h-20 rounded-3xl bg-[#FAF8F2] border border-[#EAE6DA] flex items-center justify-center mx-auto text-4xl shadow-inner">
            🏛️
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-lg sm:text-xl font-black text-[#252525]">ยังไม่มีสินทรัพย์</h3>
            <p className="text-xs sm:text-sm font-semibold text-gray-500">
              เริ่มเพิ่มสินทรัพย์ที่คุณมี เพื่อดูภาพรวมมูลค่าทรัพย์สินของคุณ
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={openAdd}
              className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-[#3F8F72] hover:bg-[#2F7259] text-white font-extrabold text-sm shadow-md shadow-[#3F8F72]/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ เพิ่มสินทรัพย์</span>
            </button>

            <button
              onClick={handleSeedSamples}
              disabled={isSeeding}
              className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-white border border-[#EAE6DA] hover:border-[#3F8F72] text-[#133F2E] font-bold text-sm shadow-xs active:scale-95 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-[#F4D35E]" />
              <span>{isSeeding ? 'กำลังโหลดตัวอย่าง...' : 'โหลดตัวอย่างสินทรัพย์ 4 รายการ'}</span>
            </button>
          </div>
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-[#EAE6DA] shadow-xs space-y-2">
          <p className="text-sm font-bold text-gray-700">ไม่พบรายการสินทรัพย์ที่ตรงกับเงื่อนไขการค้นหา</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedAccountFilter('all');
            }}
            className="text-xs font-bold text-[#3F8F72] hover:underline"
          >
            ล้างคำค้นหาและตัวกรอง
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* ========================================================
            SECTION 4: TABLE VIEW (Desktop Table)
            Column: ชื่อสินทรัพย์, หมวดหมู่, มูลค่าซื้อ, มูลค่าปัจจุบัน, วันที่ซื้อ, บัญชี, หมายเหตุ, การจัดการ
            ======================================================== */
        <div className="bg-white rounded-3xl border border-[#EAE6DA] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#EAE6DA] bg-[#FAF8F2]/80 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">ชื่อสินทรัพย์</th>
                  <th className="py-3.5 px-4">หมวดหมู่</th>
                  <th className="py-3.5 px-4 text-right">มูลค่าซื้อ</th>
                  <th className="py-3.5 px-4 text-right">มูลค่าปัจจุบัน</th>
                  <th className="py-3.5 px-4">วันที่ซื้อ</th>
                  <th className="py-3.5 px-4">บัญชี</th>
                  <th className="py-3.5 px-4">หมายเหตุ</th>
                  <th className="py-3.5 px-4 sm:px-6 text-center">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                {filteredAssets.map((asset) => {
                  const diff = asset.value - asset.cost;
                  const diffPct = asset.cost > 0 ? (diff / asset.cost) * 100 : 0;
                  const isProfit = diff >= 0;

                  return (
                    <tr key={asset.id} className="hover:bg-[#FAF8F2]/60 transition-colors">
                      {/* ชื่อสินทรัพย์ */}
                      <td className="py-3.5 px-4 sm:px-6 font-bold text-[#252525]">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl p-1.5 rounded-xl bg-[#FAF8F2] shrink-0">
                            {getCategoryIcon(asset.category)}
                          </span>
                          <div>
                            <span className="font-extrabold text-gray-900 block">{asset.name}</span>
                            <span className="text-[10px] text-gray-400 font-mono sm:hidden">{asset.category}</span>
                          </div>
                        </div>
                      </td>

                      {/* หมวดหมู่ */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-700 bg-gray-100 py-1 px-2.5 rounded-xl">
                          <span>{getCategoryIcon(asset.category)}</span>
                          <span>{asset.category}</span>
                        </span>
                      </td>

                      {/* มูลค่าซื้อ */}
                      <td className="py-3.5 px-4 text-right font-semibold text-gray-600 whitespace-nowrap">
                        ฿{asset.cost.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* มูลค่าปัจจุบัน */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="font-extrabold text-gray-900">
                          ฿{asset.value.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className={`text-[10px] font-bold ${isProfit ? 'text-[#3F8F72]' : 'text-[#E0533C]'}`}>
                          {isProfit ? '+' : ''}฿{diff.toLocaleString()} ({diffPct >= 0 ? '+' : ''}{diffPct.toFixed(1)}%)
                        </div>
                      </td>

                      {/* วันที่ซื้อ */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-gray-600 font-medium">
                        {formatDateThai(asset.buyDate)}
                      </td>

                      {/* บัญชี */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {asset.accountId ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-700 bg-[#FAF8F2] border border-[#EAE6DA] py-0.5 px-2 rounded-lg">
                            <Wallet className="w-3 h-3 text-[#3F8F72]" />
                            <span>{getAccountName(asset.accountId)}</span>
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">ไม่ระบุบัญชี</span>
                        )}
                      </td>

                      {/* หมายเหตุ */}
                      <td className="py-3.5 px-4 text-gray-500 max-w-[180px] truncate" title={asset.note || ''}>
                        {asset.note || '-'}
                      </td>

                      {/* การจัดการ */}
                      <td className="py-3.5 px-4 sm:px-6 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(asset)}
                            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition-colors"
                            title="แก้ไขสินทรัพย์"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(asset)}
                            className="p-1.5 text-gray-400 hover:text-[#E0533C] rounded-xl hover:bg-rose-50 transition-colors"
                            title="ลบสินทรัพย์"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ========================================================
            CARD / RESPONSIVE VIEW (Mobile & Card preference)
            ======================================================== */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredAssets.map((asset) => {
            const diff = asset.value - asset.cost;
            const diffPct = asset.cost > 0 ? (diff / asset.cost) * 100 : 0;
            const isProfit = diff >= 0;

            return (
              <div
                key={asset.id}
                className="bg-white rounded-3xl p-5 border border-[#EAE6DA] shadow-xs hover:border-[#3F8F72]/40 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl p-2 rounded-2xl bg-[#FAF8F2] shrink-0">
                      {getCategoryIcon(asset.category)}
                    </span>
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-[#252525] text-base truncate">{asset.name}</h4>
                      <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 py-0.5 px-2 rounded-lg">
                        {asset.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEdit(asset)}
                      className="p-1.5 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition-colors"
                      title="แก้ไข"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(asset)}
                      className="p-1.5 text-gray-400 hover:text-[#E0533C] rounded-xl hover:bg-rose-50 transition-colors"
                      title="ลบ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Values & Return */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100 text-xs">
                  <div>
                    <span className="text-gray-400 block text-[11px]">มูลค่าปัจจุบัน</span>
                    <div className="text-base sm:text-lg font-black text-gray-900 mt-0.5">
                      ฿{asset.value.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">มูลค่าซื้อ (ต้นทุน)</span>
                    <div className="text-base sm:text-lg font-semibold text-gray-600 mt-0.5">
                      ฿{asset.cost.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Meta details */}
                <div className="space-y-1 text-xs pt-1 text-gray-500">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">กำไร/ขาดทุน:</span>
                    <span className={`font-bold ${isProfit ? 'text-[#3F8F72]' : 'text-[#E0533C]'}`}>
                      {isProfit ? '+' : ''}฿{diff.toLocaleString()} ({diffPct >= 0 ? '+' : ''}{diffPct.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">วันที่ซื้อ:</span>
                    <span className="font-medium text-gray-700">{formatDateThai(asset.buyDate)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">บัญชีที่อ้างอิง:</span>
                    <span className="font-medium text-gray-700">{getAccountName(asset.accountId)}</span>
                  </div>
                  {asset.note && (
                    <div className="pt-1 text-[11px] text-gray-400 truncate" title={asset.note}>
                      📝 {asset.note}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================
          SECTION 2 & 8: ADD / EDIT MODAL & VALIDATION
          ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#EAE6DA] animate-in zoom-in-95 duration-200 my-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#3F8F72]/15 text-[#3F8F72] flex items-center justify-center font-bold">
                  <Landmark className="w-4 h-4 stroke-[2.5]" />
                </div>
                <h3 className="text-lg sm:text-xl font-black text-[#252525]">
                  {editingAsset ? 'แก้ไขสินทรัพย์' : 'เพิ่มสินทรัพย์ใหม่'}
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)} 
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-[#E0533C] text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              {/* 1. ชื่อสินทรัพย์ (Required) */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  ชื่อสินทรัพย์ <span className="text-[#E0533C]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="เช่น ทองคำแท่ง 1 บาท, iPhone 16 Pro, Honda City"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full py-2.5 px-3.5 rounded-2xl border border-[#EAE6DA] bg-[#FAF8F2] text-sm font-medium text-gray-900 focus:bg-white focus:border-[#3F8F72] focus:outline-hidden transition-all"
                  required
                />
              </div>

              {/* 2. หมวดหมู่ (Required, Dropdown from assetCats) */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  หมวดหมู่ <span className="text-[#E0533C]">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full py-2.5 px-3.5 rounded-2xl border border-[#EAE6DA] bg-[#FAF8F2] text-sm font-bold text-gray-900 focus:bg-white focus:border-[#3F8F72] focus:outline-hidden transition-all cursor-pointer"
                  required
                >
                  {assetCats.map(c => (
                    <option key={c.id} value={c.name}>
                      {c.icon || '📦'} {c.name} {c.status === 'ไม่ใช้งาน' ? '(ปิดใช้งาน)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3 & 4. มูลค่าซื้อ และ มูลค่าปัจจุบัน (Required, Number >= 0) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    มูลค่าซื้อ (฿) <span className="text-[#E0533C]">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="45,000"
                    value={costStr}
                    onChange={(e) => setCostStr(e.target.value)}
                    className="w-full py-2.5 px-3.5 rounded-2xl border border-[#EAE6DA] bg-[#FAF8F2] text-sm font-extrabold text-gray-900 focus:bg-white focus:border-[#3F8F72] focus:outline-hidden transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    มูลค่าปัจจุบัน (฿) <span className="text-[#E0533C]">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="52,500"
                    value={valueStr}
                    onChange={(e) => setValueStr(e.target.value)}
                    className="w-full py-2.5 px-3.5 rounded-2xl border border-[#EAE6DA] bg-[#FAF8F2] text-sm font-extrabold text-[#3F8F72] focus:bg-white focus:border-[#3F8F72] focus:outline-hidden transition-all"
                    required
                  />
                </div>
              </div>

              {/* 5. วันที่ซื้อ (Required) */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  วันที่ซื้อ <span className="text-[#E0533C]">*</span>
                </label>
                <input
                  type="date"
                  value={buyDate}
                  onChange={(e) => setBuyDate(e.target.value)}
                  className="w-full py-2.5 px-3.5 rounded-2xl border border-[#EAE6DA] bg-[#FAF8F2] text-sm font-bold text-gray-900 focus:bg-white focus:border-[#3F8F72] focus:outline-hidden transition-all cursor-pointer"
                  required
                />
              </div>

              {/* 6. บัญชี (Optional - Reference Only) */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  บัญชีที่อ้างอิง (Optional)
                </label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full py-2.5 px-3.5 rounded-2xl border border-[#EAE6DA] bg-[#FAF8F2] text-sm font-medium text-gray-900 focus:bg-white focus:border-[#3F8F72] focus:outline-hidden transition-all cursor-pointer"
                >
                  <option value="">⚪ ไม่ระบุบัญชี</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      💳 {acc.name} ({acc.type})
                    </option>
                  ))}
                </select>
                <div className="flex items-start gap-1.5 mt-1.5 text-[11px] text-gray-500 font-medium">
                  <Info className="w-3.5 h-3.5 text-[#3F8F72] shrink-0 mt-0.5" />
                  <span>
                    เป็นข้อมูลอ้างอิงเท่านั้น <b>ระบบจะไม่สร้าง Transaction</b> และ<b>ไม่หักเงินออกจากยอดบัญชีอัตโนมัติ</b> เพื่อป้องกันยอดเงินซ้ำ
                  </span>
                </div>
              </div>

              {/* 7. หมายเหตุ (Optional) */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  หมายเหตุ (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="รายละเอียดเพิ่มเติม เช่น ทองคำแท่ง 96.5%, ทะเบียนรถ, พอร์ตหุ้น"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full py-2.5 px-3.5 rounded-2xl border border-[#EAE6DA] bg-[#FAF8F2] text-sm font-medium text-gray-900 focus:bg-white focus:border-[#3F8F72] focus:outline-hidden transition-all resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-2xl border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-sm transition-all"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-3 rounded-2xl bg-[#3F8F72] hover:bg-[#2F7259] text-white font-extrabold text-sm shadow-md shadow-[#3F8F72]/20 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSaving ? 'กำลังบันทึก...' : (editingAsset ? 'บันทึกการแก้ไข' : 'เพิ่มสินทรัพย์')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Delete */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="ลบรายการสินทรัพย์"
        message={`คุณต้องการลบสินทรัพย์ "${deleteTarget?.name}" (มูลค่าปัจจุบัน ฿${deleteTarget?.value?.toLocaleString()}) ใช่หรือไม่? ระบบจะคำนวณมูลค่าสุทธิใหม่ทันที`}
        confirmLabel="ยืนยันการลบ"
        cancelLabel="ยกเลิก"
        isDestructive={true}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
