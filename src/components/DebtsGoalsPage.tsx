import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Debt, Receivable, Goal } from '../types';
import { 
  PiggyBank, 
  CreditCard, 
  HandCoins, 
  Plus, 
  Edit3, 
  Calendar, 
  Check, 
  X,
  Target,
  ArrowRight
} from 'lucide-react';

interface DebtsGoalsPageProps {
  onOpenAddTransactionWithType?: (type: string, idRef?: string) => void;
}

export const DebtsGoalsPage: React.FC<DebtsGoalsPageProps> = () => {
  const { 
    debts, 
    receivables, 
    goals, 
    saveDebt, 
    saveReceivable, 
    saveGoal 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'goals' | 'debts' | 'receivables'>('goals');

  // Modals state
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);

  const [isRecModalOpen, setIsRecModalOpen] = useState(false);
  const [editingRec, setEditingRec] = useState<Receivable | null>(null);

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [creditor, setCreditor] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [interestStr, setInterestStr] = useState('');
  const [minPayStr, setMinPayStr] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Open Debt Form
  const openDebtForm = (d?: Debt) => {
    setEditingDebt(d || null);
    setName(d?.name || '');
    setCategory(d?.category || 'บัตรเครดิต/สินเชื่อ');
    setCreditor(d?.creditor || '');
    setAmountStr(d ? String(d.initial) : '');
    setInterestStr(d ? String(d.interest) : '0');
    setMinPayStr(d ? String(d.minPay) : '0');
    setDueDate(d?.dueDate || '');
    setNote(d?.note || '');
    setError(null);
    setIsDebtModalOpen(true);
  };

  // Open Receivable Form
  const openRecForm = (r?: Receivable) => {
    setEditingRec(r || null);
    setName(r?.name || '');
    setCategory(r?.category || 'ยืมส่วนตัว');
    setAmountStr(r ? String(r.initial) : '');
    setDueDate(r?.dueDate || '');
    setNote(r?.note || '');
    setError(null);
    setIsRecModalOpen(true);
  };

  // Open Goal Form
  const openGoalForm = (g?: Goal) => {
    setEditingGoal(g || null);
    setName(g?.name || '');
    setCategory(g?.category || 'ทั่วไป');
    setAmountStr(g ? String(g.target) : '');
    setDueDate(g?.deadline || '');
    setNote(g?.note || '');
    setError(null);
    setIsGoalModalOpen(true);
  };

  const handleSaveDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError('กรุณากรอกชื่อหนี้สิน');
    setIsSaving(true);
    try {
      await saveDebt({
        id: editingDebt?.id,
        name: name.trim(),
        category,
        creditor: creditor.trim(),
        initial: parseFloat(amountStr) || 0,
        interest: parseFloat(interestStr) || 0,
        minPay: parseFloat(minPayStr) || 0,
        dueDate: dueDate || undefined,
        note: note.trim(),
      });
      setIsDebtModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'บันทึกไม่สำเร็จ');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveReceivable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError('กรุณากรอกชื่อลูกหนี้');
    setIsSaving(true);
    try {
      await saveReceivable({
        id: editingRec?.id,
        name: name.trim(),
        category,
        initial: parseFloat(amountStr) || 0,
        dueDate: dueDate || undefined,
        note: note.trim(),
      });
      setIsRecModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'บันทึกไม่สำเร็จ');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError('กรุณากรอกชื่อเป้าหมาย');
    setIsSaving(true);
    try {
      await saveGoal({
        id: editingGoal?.id,
        name: name.trim(),
        category,
        target: parseFloat(amountStr) || 0,
        deadline: dueDate || undefined,
        note: note.trim(),
      });
      setIsGoalModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'บันทึกไม่สำเร็จ');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-in fade-in duration-300">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <img src="/Logo-icon.png" alt="Logo-icon.png" className="w-5 h-5 object-contain" />
          <h2 className="text-xl sm:text-2xl font-black text-[#252525]">หนี้สิน ลูกหนี้ & การออม</h2>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">ติดตามภาระหนี้ สินเชื่อ เงินที่ให้ยืม และความคืบหน้าเป้าหมายการออม</p>
      </div>

      {/* Tabs Switcher */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-[#EAE6DA] shadow-2xs">
        <button
          onClick={() => setActiveTab('goals')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeTab === 'goals'
              ? 'bg-[#3F8F72] text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <PiggyBank className="w-4 h-4" />
          <span>เป้าหมายการออม ({goals.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('debts')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeTab === 'debts'
              ? 'bg-[#3F8F72] text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>หนี้สิน ({debts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('receivables')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeTab === 'receivables'
              ? 'bg-[#3F8F72] text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <HandCoins className="w-4 h-4" />
          <span>ลูกหนี้ ({receivables.length})</span>
        </button>
      </div>

      {/* 1. Goals Tab */}
      {activeTab === 'goals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">
              เป้าหมายเงินออมทั้งหมด {goals.length} รายการ
            </span>
            <button
              onClick={() => openGoalForm()}
              className="flex items-center gap-1.5 py-2 px-3.5 rounded-2xl bg-[#3F8F72] hover:bg-[#2F7259] text-white font-bold text-xs shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มเป้าหมาย</span>
            </button>
          </div>

          {goals.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-[#EAE6DA] shadow-xs space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF8F2] flex items-center justify-center mx-auto text-2xl">
                🐷
              </div>
              <h4 className="text-base font-bold text-gray-800">ยังไม่มีเป้าหมายการออม</h4>
              <p className="text-xs text-gray-500">ตั้งเป้าหมาย เช่น กองทุนฉุกเฉิน, เที่ยวญี่ปุ่น, ซื้อคอนโด</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {goals.map((g) => (
                <div key={g.id} className="bg-white rounded-3xl p-5 border border-[#EAE6DA] shadow-xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-extrabold text-gray-900 text-base">{g.name}</h4>
                      <span className="text-[11px] text-gray-400">
                        {g.deadline ? `กำหนด: ${g.deadline}` : 'ไม่มีกำหนดเวลา'}
                      </span>
                    </div>
                    <button onClick={() => openGoalForm(g)} className="p-1 text-gray-400 hover:text-gray-700">
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-[#3F8F72]">฿{(g.current ?? 0).toLocaleString()}</span>
                      <span className="text-gray-400">เป้า: ฿{g.target.toLocaleString()} ({g.progress ?? 0}%)</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-linear-to-r from-[#3F8F72] to-[#48BB78] transition-all duration-500"
                        style={{ width: `${g.progress ?? 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-1 text-xs text-gray-400 flex justify-between">
                    <span>ขาดอีก ฿{(g.remaining ?? g.target).toLocaleString()}</span>
                    {g.progress && g.progress >= 100 && (
                      <span className="text-[#3F8F72] font-bold">🎉 สำเร็จแล้ว!</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. Debts Tab */}
      {activeTab === 'debts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">
              หนี้สินและสินเชื่อ {debts.length} รายการ
            </span>
            <button
              onClick={() => openDebtForm()}
              className="flex items-center gap-1.5 py-2 px-3.5 rounded-2xl bg-[#3F8F72] hover:bg-[#2F7259] text-white font-bold text-xs shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มหนี้สิน</span>
            </button>
          </div>

          {debts.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-[#EAE6DA] shadow-xs space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF8F2] flex items-center justify-center mx-auto text-2xl">
                💳
              </div>
              <h4 className="text-base font-bold text-gray-800">ไม่มีรายการหนี้สิน</h4>
              <p className="text-xs text-gray-500">บันทึกยอดหนี้เพื่อวางแผนชำระและลดดอกเบี้ย</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {debts.map((d) => (
                <div key={d.id} className="bg-white rounded-3xl p-5 border border-[#EAE6DA] shadow-xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-extrabold text-gray-900 text-base">{d.name}</h4>
                      <span className="text-[11px] text-gray-400">
                        {d.creditor ? `เจ้าหนี้: ${d.creditor}` : d.category}
                      </span>
                    </div>
                    <button onClick={() => openDebtForm(d)} className="p-1 text-gray-400 hover:text-gray-700">
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-gray-100">
                    <div>
                      <span className="text-gray-400">ยอดหนี้คงเหลือ</span>
                      <div className="text-base font-black text-[#E0533C]">
                        ฿{(d.remaining ?? d.initial).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400">ชำระแล้ว</span>
                      <div className="text-base font-bold text-[#3F8F72]">
                        ฿{(d.paid ?? 0).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-gray-500 pt-1">
                    <span>ดอกเบี้ย: {d.interest}% / ปี</span>
                    <span>ขั้นต่ำ: ฿{d.minPay.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. Receivables Tab */}
      {activeTab === 'receivables' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">
              ลูกหนี้ {receivables.length} รายการ
            </span>
            <button
              onClick={() => openRecForm()}
              className="flex items-center gap-1.5 py-2 px-3.5 rounded-2xl bg-[#3F8F72] hover:bg-[#2F7259] text-white font-bold text-xs shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มลูกหนี้</span>
            </button>
          </div>

          {receivables.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-[#EAE6DA] shadow-xs space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF8F2] flex items-center justify-center mx-auto text-2xl">
                🤝
              </div>
              <h4 className="text-base font-bold text-gray-800">ไม่มีรายการลูกหนี้</h4>
              <p className="text-xs text-gray-500">บันทึกยอดเงินที่คุณให้ผู้อื่นยืม เพื่อไม่ให้ลืมทวงถาม</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {receivables.map((r) => (
                <div key={r.id} className="bg-white rounded-3xl p-5 border border-[#EAE6DA] shadow-xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-extrabold text-gray-900 text-base">{r.name}</h4>
                      <span className="text-[11px] text-gray-400">
                        {r.dueDate ? `กำหนดคืน: ${r.dueDate}` : r.category}
                      </span>
                    </div>
                    <button onClick={() => openRecForm(r)} className="p-1 text-gray-400 hover:text-gray-700">
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-gray-100">
                    <div>
                      <span className="text-gray-400">ยอดคงค้าง</span>
                      <div className="text-base font-black text-amber-600">
                        ฿{(r.remaining ?? r.initial).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400">รับคืนแล้ว</span>
                      <div className="text-base font-bold text-[#3F8F72]">
                        ฿{(r.received ?? 0).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Goal Modal */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-[#EAE6DA] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#252525]">
                {editingGoal ? 'แก้ไขเป้าหมายการออม' : 'เพิ่มเป้าหมายการออม'}
              </h3>
              <button onClick={() => setIsGoalModalOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            {error && <div className="mb-3 p-2.5 rounded-xl bg-rose-50 text-[#E0533C] text-xs font-semibold">{error}</div>}
            <form onSubmit={handleSaveGoal} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">ชื่อเป้าหมาย</label>
                <input
                  type="text"
                  placeholder="เช่น ทริปเที่ยวญี่ปุ่น, กองทุนสำรอง"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-sm"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">ยอดเงินเป้าหมาย (฿)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-sm"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">กำหนดเวลาเป้าหมาย (ถ้ามี)</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-sm"
                />
              </div>
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsGoalModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold text-sm"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-3 rounded-xl bg-[#3F8F72] text-white font-bold text-sm"
                >
                  {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Debt Modal */}
      {isDebtModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-[#EAE6DA] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#252525]">
                {editingDebt ? 'แก้ไขหนี้สิน' : 'เพิ่มหนี้สิน'}
              </h3>
              <button onClick={() => setIsDebtModalOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            {error && <div className="mb-3 p-2.5 rounded-xl bg-rose-50 text-[#E0533C] text-xs font-semibold">{error}</div>}
            <form onSubmit={handleSaveDebt} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">ชื่อรายการหนี้</label>
                <input
                  type="text"
                  placeholder="เช่น บัตรเครดิต KBank, กู้ซื้อบ้าน"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-sm"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">เจ้าหนี้</label>
                  <input
                    type="text"
                    placeholder="เช่น ธนาคารกสิกร"
                    value={creditor}
                    onChange={(e) => setCreditor(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">ยอดตั้งต้น (฿)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={amountStr}
                    onChange={(e) => setAmountStr(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-sm"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">ดอกเบี้ย (% ต่อปี)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="16.0"
                    value={interestStr}
                    onChange={(e) => setInterestStr(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">ชำระขั้นต่ำ (฿)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={minPayStr}
                    onChange={(e) => setMinPayStr(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-sm"
                  />
                </div>
              </div>
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsDebtModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold text-sm"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-3 rounded-xl bg-[#3F8F72] text-white font-bold text-sm"
                >
                  {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receivable Modal */}
      {isRecModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-[#EAE6DA] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#252525]">
                {editingRec ? 'แก้ไขลูกหนี้' : 'เพิ่มลูกหนี้'}
              </h3>
              <button onClick={() => setIsRecModalOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            {error && <div className="mb-3 p-2.5 rounded-xl bg-rose-50 text-[#E0533C] text-xs font-semibold">{error}</div>}
            <form onSubmit={handleSaveReceivable} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">ชื่อลูกหนี้ / รายละเอียด</label>
                <input
                  type="text"
                  placeholder="เช่น เพื่อนยืมเงิน, ค่าของรอลูกค้าจ่าย"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-sm"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">จำนวนเงินที่ยืม (฿)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-sm"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">กำหนดวันชำระคืน</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-sm"
                />
              </div>
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsRecModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold text-sm"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-3 rounded-xl bg-[#3F8F72] text-white font-bold text-sm"
                >
                  {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
