import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Budget } from '../types';
import { 
  PieChart, 
  Plus, 
  Edit3, 
  AlertTriangle, 
  CheckCircle2, 
  X 
} from 'lucide-react';

export const BudgetsPage: React.FC = () => {
  const { budgets, expenseCats, saveBudget } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [categoryId, setCategoryId] = useState(expenseCats[0]?.id || '');
  const [amountStr, setAmountStr] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openAdd = () => {
    setEditingBudget(null);
    setMonth(new Date().toISOString().slice(0, 7));
    setCategoryId(expenseCats[0]?.id || '');
    setAmountStr('');
    setError(null);
    setIsModalOpen(true);
  };

  const openEdit = (b: Budget) => {
    setEditingBudget(b);
    setMonth(b.month);
    setCategoryId(b.categoryId);
    setAmountStr(String(b.amount));
    setError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      setError('กรุณาระบุจำนวนงบประมาณที่มากกว่า 0');
      return;
    }
    if (!categoryId) {
      setError('กรุณาเลือกหมวดหมู่');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await saveBudget({
        id: editingBudget?.id,
        month,
        categoryId,
        amount,
      });
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'บันทึกงบประมาณไม่สำเร็จ');
    } finally {
      setIsSaving(false);
    }
  };

  const getCategory = (catId: string) => {
    return expenseCats.find(c => c.id === catId) || expenseCats.find(c => c.name === catId);
  };

  // Filter budgets for current selected month
  const currentMonthBudgets = budgets.filter(b => b.month === month);

  const totalBudget = currentMonthBudgets.reduce((sum, b) => sum + Number(b.amount || 0), 0);
  const totalActual = currentMonthBudgets.reduce((sum, b) => sum + Number(b.actual || 0), 0);
  const totalRemaining = totalBudget - totalActual;
  const totalPct = totalBudget > 0 ? Math.round((totalActual / totalBudget) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-in fade-in duration-300">
      {/* Title & Add */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-5 sm:p-6 border border-[#EAE6DA] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100/80 text-amber-700 flex items-center justify-center font-bold shrink-0">
            <PieChart className="w-5 h-5 stroke-[2.3]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#17202A] tracking-tight">
              งบประมาณรายจ่าย
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-gray-500 mt-1">
              วางแผนและควบคุมการใช้จ่ายตามหมวดหมู่
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="p-2 text-xs font-bold rounded-2xl border border-gray-200 bg-[#FAF8F2]"
          />

          <button
            onClick={openAdd}
            className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-[#159B78] hover:bg-[#0F765C] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#159B78]/25 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>ตั้งงบ</span>
          </button>
        </div>
      </div>

      {/* Overview Card */}
      <div className="bg-white rounded-3xl p-6 border border-[#EAE6DA] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            ภาพรวมงบประมาณเดือน {month}
          </span>
          <span className={`text-xs font-bold py-1 px-3 rounded-full ${
            totalPct > 100 ? 'bg-rose-100 text-[#E0533C]' : totalPct >= 80 ? 'bg-amber-100 text-amber-700' : 'bg-[#3F8F72]/15 text-[#3F8F72]'
          }`}>
            {totalPct > 100 ? 'เกินงบรวม' : totalPct >= 80 ? 'ใกล้เต็มงบ' : 'อยู่ในงบ'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <span className="text-xs text-gray-500">งบประมาณรวม</span>
            <div className="text-base sm:text-xl font-black text-gray-900 mt-0.5">
              ฿{totalBudget.toLocaleString()}
            </div>
          </div>
          <div>
            <span className="text-xs text-gray-500">ใช้จริงแล้ว</span>
            <div className="text-base sm:text-xl font-black text-[#FF8F7A] mt-0.5">
              ฿{totalActual.toLocaleString()}
            </div>
          </div>
          <div>
            <span className="text-xs text-gray-500">คงเหลือ</span>
            <div className={`text-base sm:text-xl font-black mt-0.5 ${totalRemaining < 0 ? 'text-[#E0533C]' : 'text-[#3F8F72]'}`}>
              ฿{totalRemaining.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              totalPct > 100 ? 'bg-[#E0533C]' : totalPct >= 80 ? 'bg-amber-500' : 'bg-[#3F8F72]'
            }`}
            style={{ width: `${Math.min(100, totalPct)}%` }}
          />
        </div>
      </div>

      {/* Budgets List */}
      {currentMonthBudgets.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#EAE6DA] shadow-xs space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#FAF8F2] flex items-center justify-center mx-auto text-2xl">
            🎯
          </div>
          <h4 className="text-base font-bold text-gray-800">ยังไม่ได้ตั้งงบประมาณในเดือนนี้</h4>
          <p className="text-xs text-gray-500">กดปุ่ม "+ ตั้งงบ" เพื่อกำหนดเพดานการใช้จ่ายในแต่ละหมวดหมู่</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {currentMonthBudgets.map((b) => {
            const cat = getCategory(b.categoryId);
            const pct = b.pct ?? 0;
            const isOver = pct > 100;
            const isWarning = pct >= 80 && !isOver;

            return (
              <div
                key={b.id}
                className="bg-white rounded-3xl p-5 border border-[#EAE6DA] shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{cat?.icon || '🏷️'}</span>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm sm:text-base">
                        {cat?.name || 'หมวดหมู่'}
                      </h4>
                      <span className="text-[11px] text-gray-400">
                        {pct}% ใช้ไปแล้ว
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-bold py-0.5 px-2 rounded-full ${
                      isOver ? 'bg-rose-100 text-[#E0533C]' : isWarning ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {b.state}
                    </span>

                    <button
                      onClick={() => openEdit(b)}
                      className="p-1 text-gray-400 hover:text-gray-700 rounded-lg"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isOver ? 'bg-[#E0533C]' : isWarning ? 'bg-amber-500' : 'bg-[#3F8F72]'
                    }`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-gray-500">
                    ใช้ไป: <b className="text-gray-900">฿{(b.actual ?? 0).toLocaleString()}</b>
                  </span>
                  <span className="text-gray-500">
                    งบ: <b className="text-gray-900">฿{b.amount.toLocaleString()}</b>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Budget Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-[#EAE6DA] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#252525]">
                {editingBudget ? 'แก้ไขงบประมาณ' : 'ตั้งงบประมาณใหม่'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 text-[#E0533C] text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">ประจำเดือน</label>
                <input
                  type="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-sm"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">หมวดหมู่รายจ่าย</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 bg-white text-sm"
                  required
                >
                  {expenseCats.filter(c => c.status === 'ใช้งาน' || c.id === categoryId).map(c => (
                    <option key={c.id} value={c.id}>
                      {c.icon || '🏷️'} {c.name} {c.group ? `(${c.group.replace('กลุ่ม', '')})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">จำนวนงบประมาณ (฿)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-sm"
                  required
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-3 rounded-xl bg-[#3F8F72] hover:bg-[#2F7259] text-white font-bold text-sm transition-colors"
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
