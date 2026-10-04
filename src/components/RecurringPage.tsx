import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Recurring } from '../types';
import { 
  CalendarClock, 
  Plus, 
  Edit3, 
  Trash2, 
  Play, 
  Check, 
  X, 
  Clock, 
  Power, 
  Search, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

export const RecurringPage: React.FC = () => {
  const { 
    recurring, 
    accounts, 
    expenseCats, 
    incomeCats, 
    saveRecurring, 
    deleteRecurring, 
    toggleRecurringStatus, 
    createFromRecurring 
  } = useApp();

  // Filters
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Recurring | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState<'รายจ่าย' | 'รายรับ'>('รายจ่าย');
  const [amountStr, setAmountStr] = useState('');
  const [freq, setFreq] = useState<'รายวัน' | 'รายสัปดาห์' | 'รายเดือน' | 'รายปี'>('รายเดือน');
  const [nextDate, setNextDate] = useState(new Date().toISOString().slice(0, 10));
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [categoryId, setCategoryId] = useState('');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<'ใช้งาน' | 'ไม่ใช้งาน'>('ใช้งาน');

  const [isSaving, setIsSaving] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Delete confirm modal
  const [itemToDelete, setItemToDelete] = useState<Recurring | null>(null);

  // Quick preset templates from user brief
  const quickTemplates = [
    { name: 'เงินเดือน', type: 'รายรับ' as const, freq: 'รายเดือน' as const, icon: '💼' },
    { name: 'ค่าเช่า', type: 'รายจ่าย' as const, freq: 'รายเดือน' as const, icon: '🏠' },
    { name: 'ค่าไฟ', type: 'รายจ่าย' as const, freq: 'รายเดือน' as const, icon: '💡' },
    { name: 'ค่าอินเทอร์เน็ต', type: 'รายจ่าย' as const, freq: 'รายเดือน' as const, icon: '🌐' },
    { name: 'ค่าโทรศัพท์', type: 'รายจ่าย' as const, freq: 'รายเดือน' as const, icon: '📱' },
    { name: 'Netflix', type: 'รายจ่าย' as const, freq: 'รายเดือน' as const, icon: '🎬' },
    { name: 'ค่าสมาชิก', type: 'รายจ่าย' as const, freq: 'รายเดือน' as const, icon: '⭐' },
    { name: 'ค่างวด', type: 'รายจ่าย' as const, freq: 'รายเดือน' as const, icon: '🚗' },
    { name: 'เงินโอนประจำ', type: 'รายรับ' as const, freq: 'รายเดือน' as const, icon: '👨‍👩‍👧' },
  ];

  const applyTemplate = (t: typeof quickTemplates[0]) => {
    setName(t.name);
    setType(t.type);
    setFreq(t.freq);
    // Find matching category if possible
    const list = t.type === 'รายรับ' ? incomeCats : expenseCats;
    const matched = list.find(c => c.name.toLowerCase().includes(t.name.toLowerCase()));
    if (matched) setCategoryId(matched.id);
  };

  const openAdd = () => {
    setEditingItem(null);
    setName('');
    setType('รายจ่าย');
    setAmountStr('');
    setFreq('รายเดือน');
    setNextDate(new Date().toISOString().slice(0, 10));
    setAccountId(accounts[0]?.id || '');
    const activeExpense = expenseCats.filter(c => c.status === 'ใช้งาน');
    setCategoryId(activeExpense[0]?.id || expenseCats[0]?.id || '');
    setNote('');
    setStatus('ใช้งาน');
    setError(null);
    setIsModalOpen(true);
  };

  const openEdit = (item: Recurring) => {
    setEditingItem(item);
    setName(item.name);
    setType(item.type);
    setAmountStr(String(item.amount));
    setFreq(item.freq);
    setNextDate(item.nextDate);
    setAccountId(item.accountId || accounts[0]?.id || '');
    setCategoryId(item.categoryId || '');
    setNote(item.note || '');
    setStatus(item.status);
    setError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError('กรุณากรอกชื่อรายการประจำ');
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) return setError('กรุณาระบุจำนวนเงินที่ถูกต้อง');

    setIsSaving(true);
    setError(null);
    try {
      await saveRecurring({
        id: editingItem?.id,
        name: name.trim(),
        type,
        amount,
        freq,
        nextDate,
        accountId: accountId || undefined,
        categoryId: categoryId || undefined,
        note: note.trim() || undefined,
        status,
      });
      setIsModalOpen(false);
      setSuccessToast(editingItem ? 'แก้ไขรายการประจำสำเร็จ' : 'เพิ่มรายการประจำสำเร็จ');
      setTimeout(() => setSuccessToast(null), 3000);
    } catch (err: any) {
      setError(err.message || 'บันทึกไม่สำเร็จ');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateNow = async (item: Recurring) => {
    setProcessingId(item.id);
    try {
      await createFromRecurring(item.id);
      setSuccessToast(`บันทึก "${item.name}" ลงในรายการแล้ว และขยับรอบถัดไปเรียบร้อย`);
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err: any) {
      alert(err.message || 'สร้างรายการไม่สำเร็จ');
    } finally {
      setProcessingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteRecurring(itemToDelete.id);
      setItemToDelete(null);
      setSuccessToast('ลบรายการประจำเรียบร้อยแล้ว');
      setTimeout(() => setSuccessToast(null), 3000);
    } catch (err: any) {
      alert(`ลบไม่สำเร็จ: ${err.message}`);
    }
  };

  const getAccountName = (accId?: string) => {
    return accounts.find(a => a.id === accId)?.name || 'ไม่ระบุบัญชี';
  };

  const getCategory = (item: Recurring) => {
    const cats = item.type === 'รายรับ' ? incomeCats : expenseCats;
    return cats.find(c => c.id === item.categoryId);
  };

  // Due status calculation
  const getDueBadge = (nextDateStr: string) => {
    const today = new Date().toISOString().slice(0, 10);
    if (nextDateStr < today) {
      return (
        <span className="text-[10px] font-extrabold py-0.5 px-2 rounded-full bg-rose-100 text-[#E0533C] flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          <span>เลยกำหนดแล้ว</span>
        </span>
      );
    }
    if (nextDateStr === today) {
      return (
        <span className="text-[10px] font-extrabold py-0.5 px-2 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1 animate-pulse">
          <Clock className="w-3 h-3" />
          <span>ครบกำหนดวันนี้!</span>
        </span>
      );
    }
    // Days remaining
    const diffTime = new Date(nextDateStr).getTime() - new Date(today).getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return (
      <span className="text-[10px] font-bold py-0.5 px-2 rounded-full bg-gray-100 text-gray-600">
        อีก {diffDays} วัน
      </span>
    );
  };

  // Filtered recurring items
  const filteredItems = useMemo(() => {
    return recurring.filter(item => {
      if (filterType === 'expense' && item.type !== 'รายจ่าย') return false;
      if (filterType === 'income' && item.type !== 'รายรับ') return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchNote = (item.note || '').toLowerCase().includes(q);
        if (!matchName && !matchNote) return false;
      }
      return true;
    });
  }, [recurring, filterType, searchQuery]);

  // Group active categories for selector
  const activeIncomeCats = useMemo(() => incomeCats.filter(c => c.status === 'ใช้งาน'), [incomeCats]);
  const activeExpenseCats = useMemo(() => expenseCats.filter(c => c.status === 'ใช้งาน'), [expenseCats]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-20 right-6 z-50 bg-[#3F8F72] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs sm:text-sm font-bold animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-5 sm:p-6 border border-[#EAE6DA] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-100/80 text-purple-700 flex items-center justify-center font-bold shrink-0">
            <CalendarClock className="w-5 h-5 stroke-[2.3]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#17202A] tracking-tight">
              รายการประจำ
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-gray-500 mt-1">
              จัดการรายการที่เกิดขึ้นซ้ำ เช่น เงินเดือน ค่าเช่า ค่าไฟ ค่าอินเทอร์เน็ต ค่าโทรศัพท์ Netflix ค่าสมาชิก ค่างวด เงินโอนประจำ
            </p>
          </div>
        </div>

        <button
          onClick={openAdd}
          className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-[#159B78] hover:bg-[#0F765C] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#159B78]/25 active:scale-95 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>เพิ่มรายการประจำ</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 border border-[#EAE6DA] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Type Tabs */}
          <div className="flex bg-[#FAF8F2] p-1 rounded-2xl border border-[#EAE6DA] gap-1">
            <button
              onClick={() => setFilterType('all')}
              className={`py-1.5 px-3.5 rounded-xl font-bold text-xs transition-all ${
                filterType === 'all'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              ทั้งหมด ({recurring.length})
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`py-1.5 px-3.5 rounded-xl font-bold text-xs transition-all ${
                filterType === 'expense'
                  ? 'bg-white text-[#E0533C] shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              รายจ่ายประจำ ({recurring.filter(r => r.type === 'รายจ่าย').length})
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`py-1.5 px-3.5 rounded-xl font-bold text-xs transition-all ${
                filterType === 'income'
                  ? 'bg-white text-[#3F8F72] shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              รายรับประจำ ({recurring.filter(r => r.type === 'รายรับ').length})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-xs">
            <input
              type="text"
              placeholder="ค้นหารายการประจำ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 bg-[#FAF8F2]/60 focus:bg-white focus:border-[#3F8F72] focus:outline-hidden"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
          </div>
        </div>
      </div>

      {/* Recurring Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#EAE6DA] shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#FAF8F2] border border-[#EAE6DA] flex items-center justify-center mx-auto text-3xl">
            🔁
          </div>
          <div>
            <h4 className="text-base font-extrabold text-gray-800">ยังไม่มีรายการประจำในหมวดนี้</h4>
            <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
              บันทึกรายการที่เกิดขึ้นซ้ำ เช่น เงินเดือน ค่าเช่าบ้าน ค่าไฟ ค่าเน็ต Netflix หรือค่างวด เพื่อเตือนรอบจ่ายและลงบัญชีอัตโนมัติด้วยคลิกเดียว
            </p>
          </div>
          <button
            onClick={openAdd}
            className="py-2.5 px-5 rounded-2xl bg-[#3F8F72] text-white font-bold text-xs hover:bg-[#2F7259] transition-all"
          >
            + เริ่มสร้างรายการประจำแรก
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => {
            const isProcessing = processingId === item.id;
            const isIncome = item.type === 'รายรับ';
            const isActive = item.status === 'ใช้งาน';
            const cat = getCategory(item);

            return (
              <div
                key={item.id}
                className={`bg-white rounded-3xl p-5 border shadow-xs flex flex-col justify-between space-y-4 transition-all ${
                  isActive
                    ? 'border-[#EAE6DA] hover:border-gray-300'
                    : 'border-gray-200 bg-gray-50/70 opacity-60'
                }`}
              >
                {/* Top Section */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#FAF8F2] border border-[#EAE6DA] flex items-center justify-center text-2xl shrink-0">
                      {cat?.icon || (isIncome ? '💼' : '🏷️')}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[10px] font-extrabold py-0.5 px-2 rounded-full ${
                          isIncome ? 'bg-emerald-100 text-[#3F8F72]' : 'bg-rose-100 text-[#E0533C]'
                        }`}>
                          {item.type} • {item.freq}
                        </span>
                        {getDueBadge(item.nextDate)}
                        {!isActive && (
                          <span className="text-[10px] font-bold py-0.5 px-2 rounded-full bg-gray-200 text-gray-600">
                            ปิดใช้งาน
                          </span>
                        )}
                      </div>

                      <h3 className="font-extrabold text-base text-[#252525] mt-1.5">
                        {item.name}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {cat?.name || 'หมวดหมู่ทั่วไป'} • {getAccountName(item.accountId)}
                      </p>
                      {item.note && (
                        <p className="text-[11px] text-gray-500 mt-1 italic">
                          หมายเหตุ: {item.note}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions: Edit & Delete */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => toggleRecurringStatus(item.id)}
                      title={isActive ? 'คลิกเพื่อปิดใช้งาน' : 'คลิกเพื่อเปิดใช้งาน'}
                      className={`p-1.5 rounded-xl transition-all ${
                        isActive ? 'text-[#3F8F72] hover:bg-[#3F8F72]/15' : 'text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEdit(item)}
                      title="แก้ไขรายการประจำ"
                      className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setItemToDelete(item)}
                      title="ลบรายการประจำ"
                      className="p-1.5 rounded-xl text-gray-300 hover:text-[#E0533C] hover:bg-rose-50 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Bottom Trigger Row */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] text-gray-400 block font-medium">
                      กำหนดรอบถัดไป: <strong className="text-gray-700">{item.nextDate}</strong>
                    </span>
                    <span className={`text-xl font-black ${isIncome ? 'text-[#3F8F72]' : 'text-[#252525]'}`}>
                      ฿{item.amount.toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={() => handleCreateNow(item)}
                    disabled={isProcessing || !isActive}
                    title="บันทึกรายการนี้ลงสมุดบัญชีทันที และเลื่อนวันครบกำหนดไปรอบหน้า"
                    className="flex items-center gap-1.5 py-2 px-3.5 rounded-2xl bg-[#3F8F72] hover:bg-[#2F7259] text-white font-bold text-xs shadow-md shadow-[#3F8F72]/20 active:scale-95 transition-all disabled:opacity-50"
                  >
                    <Play className={`w-3.5 h-3.5 fill-current ${isProcessing ? 'animate-spin' : ''}`} />
                    <span>{isProcessing ? 'กำลังบันทึก...' : 'บันทึกลงบัญชีทันที'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Recurring Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-[#EAE6DA] animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#252525]">
                {editingItem ? 'แก้ไขรายการประจำ' : 'เพิ่มรายการประจำ'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-3 p-2.5 rounded-xl bg-rose-50 text-[#E0533C] text-xs font-semibold">
                {error}
              </div>
            )}

            {/* Quick Templates Chips (Only when adding) */}
            {!editingItem && (
              <div className="mb-4">
                <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1.5">
                  ⚡ เลือกเทมเพลตด่วน
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {quickTemplates.map((t, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyTemplate(t)}
                      className={`text-xs font-semibold py-1.5 px-3 rounded-xl border transition-all ${
                        name === t.name 
                          ? 'bg-[#3F8F72] text-white border-[#3F8F72]' 
                          : 'bg-[#FAF8F2] text-gray-700 border-[#EAE6DA] hover:border-gray-400'
                      }`}
                    >
                      {t.icon} {t.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">ชื่อรายการประจำ</label>
                <input
                  type="text"
                  placeholder="เช่น เงินเดือน, ค่าเช่า, ค่าไฟ, Netflix, ค่าเน็ต, ค่างวด"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#3F8F72] focus:outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">ประเภท</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 bg-white text-sm focus:border-[#3F8F72] focus:outline-hidden"
                  >
                    <option value="รายจ่าย">รายจ่ายประจำ</option>
                    <option value="รายรับ">รายรับประจำ</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">ความถี่ของรอบ</label>
                  <select
                    value={freq}
                    onChange={(e) => setFreq(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 bg-white text-sm focus:border-[#3F8F72] focus:outline-hidden"
                  >
                    <option value="รายเดือน">รายเดือน (ยอดนิยม)</option>
                    <option value="รายวัน">รายวัน</option>
                    <option value="รายสัปดาห์">รายสัปดาห์</option>
                    <option value="รายปี">รายปี</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">จำนวนเงิน (฿)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amountStr}
                    onChange={(e) => setAmountStr(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#3F8F72] focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">วันครบกำหนดรอบถัดไป</label>
                  <input
                    type="date"
                    value={nextDate}
                    onChange={(e) => setNextDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#3F8F72] focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">บัญชีที่ใช้ตัด/รับเงิน</label>
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 bg-white text-sm focus:border-[#3F8F72] focus:outline-hidden"
                  >
                    {accounts.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">หมวดหมู่</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 bg-white text-sm focus:border-[#3F8F72] focus:outline-hidden"
                  >
                    {(type === 'รายรับ' ? activeIncomeCats : activeExpenseCats).map(c => (
                      <option key={c.id} value={c.id}>
                        {c.icon || '🏷️'} {c.name} {c.group ? `(${c.group})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">หมายเหตุ (ถ้ามี)</label>
                <input
                  type="text"
                  placeholder="เช่น หักบัญชีกสิกรอัตโนมัติทุกวันที่ 25"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#3F8F72] focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-2xl border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-3 rounded-2xl bg-[#3F8F72] hover:bg-[#2F7259] text-white font-bold text-sm shadow-md shadow-[#3F8F72]/20 transition-all disabled:opacity-50"
                >
                  {isSaving ? 'กำลังบันทึก...' : 'บันทึกรายการประจำ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={Boolean(itemToDelete)}
        title="ลบรายการประจำ"
        message={`คุณต้องการลบรายการประจำ "${itemToDelete?.name}" ใช่หรือไม่? รายการในอดีตที่เคยบันทึกไว้จะไม่ได้รับผลกระทบ`}
        confirmLabel="ยืนยันการลบ"
        cancelLabel="ยกเลิก"
        isDestructive={true}
        onConfirm={confirmDelete}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
};
