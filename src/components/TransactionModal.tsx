import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Transaction, TransactionType } from '../types';
import { 
  X, 
  Calendar, 
  Wallet, 
  FileText, 
  ArrowRightLeft, 
  Check, 
  CreditCard, 
  PiggyBank, 
  HandCoins,
  Search
} from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editTx?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  editTx,
}) => {
  const { 
    accounts, 
    incomeCats, 
    expenseCats, 
    projects, 
    debts, 
    receivables, 
    goals, 
    saveTransaction 
  } = useApp();

  const [type, setType] = useState<TransactionType>('expense');
  const [amountStr, setAmountStr] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [accountId, setAccountId] = useState<string>('');
  const [toAccountId, setToAccountId] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [projectId, setProjectId] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  
  // Extra fields
  const [debtId, setDebtId] = useState<string>('');
  const [principalStr, setPrincipalStr] = useState<string>('');
  const [interestStr, setInterestStr] = useState<string>('');
  const [receivableId, setReceivableId] = useState<string>('');
  const [goalId, setGoalId] = useState<string>('');
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize or reset form
  useEffect(() => {
    if (editTx) {
      setType(editTx.type);
      setAmountStr(String(editTx.amount));
      setDate(editTx.date);
      setAccountId(editTx.accountId);
      setToAccountId(editTx.toAccountId || '');
      setCategoryId(editTx.categoryId || '');
      setProjectId(editTx.projectId || '');
      setDescription(editTx.description || '');
      setDebtId(editTx.debtId || '');
      setPrincipalStr(editTx.principal != null ? String(editTx.principal) : '');
      setInterestStr(editTx.interest != null ? String(editTx.interest) : '');
      setReceivableId(editTx.receivableId || '');
      setGoalId(editTx.goalId || '');
    } else {
      setType('expense');
      setAmountStr('');
      setDate(new Date().toISOString().slice(0, 10));
      setAccountId(accounts[0]?.id || '');
      setToAccountId(accounts[1]?.id || '');
      setCategoryId(expenseCats[0]?.id || '');
      setProjectId('');
      setDescription('');
      setDebtId(debts[0]?.id || '');
      setPrincipalStr('');
      setInterestStr('');
      setReceivableId(receivables[0]?.id || '');
      setGoalId(goals[0]?.id || '');
    }
    setError(null);
  }, [editTx, isOpen, accounts, expenseCats, incomeCats, debts, receivables, goals]);

  const [selectedCatGroup, setSelectedCatGroup] = useState<string>('all');
  const [modalCatSearch, setModalCatSearch] = useState<string>('');

  // Set default category when type changes
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setSelectedCatGroup('all');
    setModalCatSearch('');
    if (newType === 'income') {
      const activeInc = incomeCats.filter(c => c.status === 'ใช้งาน');
      setCategoryId(activeInc[0]?.id || incomeCats[0]?.id || '');
    } else if (newType === 'expense' || newType === 'subscription') {
      const activeExp = expenseCats.filter(c => c.status === 'ใช้งาน');
      setCategoryId(activeExp[0]?.id || expenseCats[0]?.id || '');
    }
  };

  const availableGroups = useMemo(() => {
    const list = type === 'income' ? incomeCats : expenseCats;
    const active = list.filter(c => c.status === 'ใช้งาน' || c.id === categoryId);
    return Array.from(new Set(active.map(c => c.group || 'อื่น ๆ')));
  }, [type, incomeCats, expenseCats, categoryId]);

  const currentCategories = useMemo(() => {
    const list = type === 'income' ? incomeCats : expenseCats;
    return list.filter(c => {
      if (c.status !== 'ใช้งาน' && c.id !== categoryId) return false;
      if (selectedCatGroup !== 'all' && c.group !== selectedCatGroup) return false;
      if (modalCatSearch.trim()) {
        const q = modalCatSearch.toLowerCase();
        return c.name.toLowerCase().includes(q) || (c.group && c.group.toLowerCase().includes(q));
      }
      return true;
    });
  }, [type, incomeCats, expenseCats, categoryId, selectedCatGroup, modalCatSearch]);

  if (!isOpen) return null;

  const handleKeypadPress = (val: string) => {
    if (val === 'DEL') {
      setAmountStr(prev => prev.slice(0, -1));
    } else if (val === '.') {
      if (!amountStr.includes('.')) {
        setAmountStr(prev => (prev === '' ? '0.' : prev + '.'));
      }
    } else {
      // number
      if (amountStr === '0') {
        setAmountStr(val);
      } else {
        setAmountStr(prev => prev + val);
      }
    }
  };

  const handleQuickAdd = (add: number) => {
    const current = parseFloat(amountStr) || 0;
    setAmountStr(String(current + add));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let amount = parseFloat(amountStr);
    if (type === 'debt_payment') {
      const principal = parseFloat(principalStr) || 0;
      const interest = parseFloat(interestStr) || 0;
      amount = principal + interest;
    }

    if (isNaN(amount) || amount <= 0) {
      if (type !== 'saving') {
        setError('กรุณาระบุจำนวนเงินที่ถูกต้อง');
        return;
      }
    }

    if (!accountId) {
      setError('กรุณาเลือกบัญชี');
      return;
    }

    if (type === 'transfer' && (!toAccountId || toAccountId === accountId)) {
      setError('กรุณาเลือกบัญชีปลายทางที่แตกต่างกัน');
      return;
    }

    setIsSubmitting(true);

    try {
      // Auto-set description if empty
      let finalDesc = description.trim();
      if (!finalDesc) {
        if (type === 'expense' || type === 'income') {
          const cat = currentCategories.find(c => c.id === categoryId);
          finalDesc = cat?.name || (type === 'income' ? 'รายรับ' : 'รายจ่าย');
        } else if (type === 'transfer') {
          const fromAcc = accounts.find(a => a.id === accountId);
          const toAcc = accounts.find(a => a.id === toAccountId);
          finalDesc = `โอนจาก ${fromAcc?.name} ไป ${toAcc?.name}`;
        } else if (type === 'debt_payment') {
          const debt = debts.find(d => d.id === debtId);
          finalDesc = `ชำระหนี้: ${debt?.name || ''}`;
        } else if (type === 'receivable_receipt') {
          const rec = receivables.find(r => r.id === receivableId);
          finalDesc = `รับเงินจาก: ${rec?.name || ''}`;
        } else if (type === 'saving') {
          const goal = goals.find(g => g.id === goalId);
          finalDesc = `ออมเงิน: ${goal?.name || ''}`;
        }
      }

      await saveTransaction({
        id: editTx?.id,
        date,
        type,
        accountId,
        toAccountId: type === 'transfer' ? toAccountId : undefined,
        projectId: projectId || undefined,
        categoryId: (type === 'expense' || type === 'income' || type === 'subscription' || type === 'refund') ? categoryId : undefined,
        description: finalDesc,
        amount,
        currency: 'THB',
        debtId: type === 'debt_payment' ? debtId : undefined,
        principal: type === 'debt_payment' ? parseFloat(principalStr) || 0 : undefined,
        interest: type === 'debt_payment' ? parseFloat(interestStr) || 0 : undefined,
        receivableId: type === 'receivable_receipt' ? receivableId : undefined,
        goalId: type === 'saving' ? goalId : undefined,
      });

      onClose();
    } catch (err: any) {
      console.error('Save transaction error:', err);
      setError(err.message || 'บันทึกรายการไม่สำเร็จ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#EAE6DA] overflow-hidden my-auto animate-in zoom-in-95 duration-200"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <h2 className="text-xl font-bold text-[#252525]">
            {editTx ? 'แก้ไขรายการ' : 'เพิ่มรายการ'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type Switcher Tabs */}
        <div className="px-6 pb-4">
          <div className="flex bg-[#FAF8F2] p-1 rounded-2xl border border-[#EAE6DA] overflow-x-auto gap-1">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`flex-1 min-w-[70px] py-2 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                type === 'expense'
                  ? 'bg-[#3F8F72] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              รายจ่าย
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`flex-1 min-w-[70px] py-2 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                type === 'income'
                  ? 'bg-[#3F8F72] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              รายรับ
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('transfer')}
              className={`flex-1 min-w-[70px] py-2 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                type === 'transfer'
                  ? 'bg-[#3F8F72] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              โอนเงิน
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('debt_payment')}
              className={`flex-1 min-w-[75px] py-2 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                type === 'debt_payment'
                  ? 'bg-[#3F8F72] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ชำระหนี้
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('saving')}
              className={`flex-1 min-w-[75px] py-2 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                type === 'saving'
                  ? 'bg-[#3F8F72] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ออมเงิน
            </button>
          </div>
        </div>

        {/* Amount Section */}
        <div className="px-6 py-2 text-center bg-linear-to-b from-[#FAF8F2]/60 to-white">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
            {type === 'debt_payment' ? 'ยอดชำระรวม (เงินต้น + ดอกเบี้ย)' : 'จำนวนเงิน (บาท)'}
          </label>
          <div className="flex items-center justify-center gap-1.5 text-3xl sm:text-4xl font-extrabold text-[#252525]">
            <span className="text-[#3F8F72]">฿</span>
            {type === 'debt_payment' ? (
              <span>{((parseFloat(principalStr) || 0) + (parseFloat(interestStr) || 0)).toLocaleString()}</span>
            ) : (
              <input
                type="number"
                step="0.01"
                placeholder="0"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="w-48 text-center bg-transparent border-b-2 border-transparent hover:border-[#3F8F72]/30 focus:border-[#3F8F72] focus:outline-hidden font-extrabold"
              />
            )}
          </div>

          {/* Quick Amount Add Chips */}
          {type !== 'debt_payment' && (
            <div className="flex items-center justify-center gap-1.5 mt-3 flex-wrap">
              {[50, 100, 500, 1000].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleQuickAdd(chip)}
                  className="px-2.5 py-1 rounded-full bg-white border border-[#EAE6DA] hover:border-[#3F8F72] text-xs font-semibold text-gray-700 hover:text-[#3F8F72] transition-all active:scale-95 shadow-2xs"
                >
                  +{chip}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAmountStr('')}
                className="px-2.5 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-600 transition-all"
              >
                ล้าง
              </button>
            </div>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4 max-h-[50vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-2xl bg-[#FF8F7A]/20 text-[#E0533C] text-sm font-medium">
              {error}
            </div>
          )}

          {/* Debt Breakdown if type is debt_payment */}
          {type === 'debt_payment' && (
            <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#EAE6DA] space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">เลือกหนี้สินที่ชำระ</label>
                <select
                  value={debtId}
                  onChange={(e) => setDebtId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 bg-white text-sm font-medium focus:border-[#3F8F72] focus:outline-hidden"
                >
                  {debts.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} (คงเหลือ ฿{d.remaining?.toLocaleString() ?? d.initial.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">เงินต้น (฿)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={principalStr}
                    onChange={(e) => setPrincipalStr(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 bg-white text-sm font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">ดอกเบี้ย (฿)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={interestStr}
                    onChange={(e) => setInterestStr(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 bg-white text-sm font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Saving Goal Selector */}
          {type === 'saving' && (
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">เป้าหมายการออม</label>
              <select
                value={goalId}
                onChange={(e) => setGoalId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 bg-white text-sm font-medium focus:border-[#3F8F72] focus:outline-hidden"
              >
                {goals.map(g => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.progress ?? 0}% - ฿{g.current?.toLocaleString() ?? 0}/฿{g.target.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Receivable Selector */}
          {type === 'receivable_receipt' && (
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">ลูกหนี้ที่ได้รับชำระ</label>
              <select
                value={receivableId}
                onChange={(e) => setReceivableId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 bg-white text-sm font-medium focus:border-[#3F8F72] focus:outline-hidden"
              >
                {receivables.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} (คงเหลือ ฿{r.remaining?.toLocaleString() ?? r.initial.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Category Selector (for Expense and Income) */}
          {(type === 'expense' || type === 'income') && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-600 block">หมวดหมู่</label>
                <div className="relative w-36 sm:w-44">
                  <input
                    type="text"
                    placeholder="ค้นหาหมวดหมู่..."
                    value={modalCatSearch}
                    onChange={(e) => setModalCatSearch(e.target.value)}
                    className="w-full pl-7 pr-2 py-1 text-xs rounded-xl border border-gray-200 bg-[#FAF8F2] focus:bg-white focus:border-[#3F8F72] focus:outline-hidden"
                  />
                  <Search className="w-3 h-3 text-gray-400 absolute left-2 top-2" />
                </div>
              </div>

              {/* Group Pill Selector */}
              {availableGroups.length > 1 && (
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setSelectedCatGroup('all')}
                    className={`py-1 px-2.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${
                      selectedCatGroup === 'all'
                        ? 'bg-[#3F8F72] text-white shadow-xs'
                        : 'bg-[#FAF8F2] text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    ทั้งหมด
                  </button>
                  {availableGroups.map((grp) => (
                    <button
                      key={grp}
                      type="button"
                      onClick={() => setSelectedCatGroup(grp)}
                      className={`py-1 px-2.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${
                        selectedCatGroup === grp
                          ? 'bg-[#3F8F72] text-white shadow-xs'
                          : 'bg-[#FAF8F2] text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {grp.replace('กลุ่ม', '')}
                    </button>
                  ))}
                </div>
              )}

              {/* Category Grid */}
              {currentCategories.length === 0 ? (
                <div className="py-6 text-center text-xs text-gray-400 bg-[#FAF8F2] rounded-2xl">
                  ไม่พบหมวดหมู่ที่ค้นหา
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto pr-1">
                  {currentCategories.map((cat) => {
                    const isSelected = categoryId === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategoryId(cat.id)}
                        className={`flex flex-col items-center justify-center p-2 rounded-2xl border transition-all active:scale-95 ${
                          isSelected
                            ? 'border-[#3F8F72] bg-[#3F8F72]/15 shadow-xs font-bold text-[#252525]'
                            : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <span className="text-2xl mb-1">{cat.icon || '🏷️'}</span>
                        <span className="text-[11px] truncate w-full text-center leading-tight">
                          {cat.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Account Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">
                {type === 'transfer' ? 'บัญชีต้นทาง (หักเงิน)' : 'บัญชี / กระเป๋าเงิน'}
              </label>
              <div className="relative">
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full p-2.5 pl-9 rounded-xl border border-gray-300 bg-white text-sm font-medium focus:border-[#3F8F72] focus:outline-hidden"
                  required
                >
                  {accounts
                    .filter(a => a.status === 'ใช้งาน' || a.id === accountId)
                    .map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} • {acc.type} (฿{(acc.balance ?? acc.opening).toLocaleString()})
                      </option>
                    ))}
                </select>
                <Wallet className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            {type === 'transfer' && (
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">บัญชีปลายทาง (เข้าเงิน)</label>
                <div className="relative">
                  <select
                    value={toAccountId}
                    onChange={(e) => setToAccountId(e.target.value)}
                    className="w-full p-2.5 pl-9 rounded-xl border border-gray-300 bg-white text-sm font-medium focus:border-[#3F8F72] focus:outline-hidden"
                    required
                  >
                    {accounts
                      .filter(a => a.id !== accountId && (a.status === 'ใช้งาน' || a.id === toAccountId))
                      .map(acc => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} • {acc.type} (฿{(acc.balance ?? acc.opening).toLocaleString()})
                        </option>
                      ))}
                  </select>
                  <ArrowRightLeft className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">วันที่ทำรายการ</label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-2.5 pl-9 rounded-xl border border-gray-300 bg-white text-sm font-medium focus:border-[#3F8F72] focus:outline-hidden"
                  required
                />
                <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Description & Note */}
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">รายละเอียด / หมายเหตุ (ถ้ามี)</label>
            <div className="relative">
              <input
                type="text"
                placeholder="เช่น ข้าวเที่ยง, ค่าน้ำมัน, ช้อปปิ้ง"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2.5 pl-9 rounded-xl border border-gray-300 bg-white text-sm font-medium focus:border-[#3F8F72] focus:outline-hidden"
              />
              <FileText className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Project Selector (Optional) */}
          {projects.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">โครงการ (ถ้ามี)</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 bg-white text-sm font-medium focus:border-[#3F8F72] focus:outline-hidden"
              >
                <option value="">-- ไม่ระบุโครงการ --</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#3F8F72] hover:bg-[#2F7259] text-white font-bold text-base shadow-lg shadow-[#3F8F72]/25 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>กำลังบันทึกลง Google Sheet...</span>
                </>
              ) : (
                <>
                  <Check className="w-5 h-5 stroke-[2.5]" />
                  <span>{editTx ? 'บันทึกการแก้ไข' : 'บันทึกรายการ'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
