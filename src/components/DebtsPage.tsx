import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Debt, Transaction } from '../types';
import { 
  CreditCard, 
  Plus, 
  Edit3, 
  Trash2, 
  Calendar, 
  DollarSign, 
  Building2, 
  Percent, 
  X,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  Sparkles,
  Zap,
  ArrowRight,
  Clock,
  PieChart as PieChartIcon,
  BarChart3,
  Layers,
  Search,
  Filter,
  Flame,
  Snowflake,
  ShieldAlert,
  ChevronRight,
  Wallet,
  History,
  Info
} from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';
import { NongTangMascot } from '../assets/logo';

interface DebtsPageProps {
  onPayDebt: (debt: Debt) => void;
}

export const DebtsPage: React.FC<DebtsPageProps> = ({ onPayDebt }) => {
  const { 
    debts, 
    totalDebtRemaining, 
    accounts, 
    transactions,
    saveDebt, 
    deleteDebt, 
    saveTransaction,
    monthlyIncome 
  } = useApp();

  // Active view tab: 'overview' | 'strategy' | 'analytics' | 'history'
  const [activeTab, setActiveTab] = useState<'overview' | 'strategy' | 'analytics' | 'history'>('overview');

  // Strategy simulator settings
  const [strategyMode, setStrategyMode] = useState<'avalanche' | 'snowball'>('avalanche');
  const [extraMonthlyPay, setExtraMonthlyPay] = useState<number>(2000);

  // Filter & Search states
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'interest-desc' | 'remaining-asc' | 'remaining-desc' | 'due-soon'>('interest-desc');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);

  // Payment Modal state
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedDebtForPay, setSelectedDebtForPay] = useState<Debt | null>(null);
  const [payAmountStr, setPayAmountStr] = useState<string>('');
  const [payPrincipalStr, setPayPrincipalStr] = useState<string>('');
  const [payInterestStr, setPayInterestStr] = useState<string>('0');
  const [payAccountId, setPayAccountId] = useState<string>('');
  const [payDate, setPayDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [payNote, setPayNote] = useState<string>('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  // Form states for Add/Edit Debt
  const [name, setName] = useState('');
  const [category, setCategory] = useState('บัตรเครดิต');
  const [creditor, setCreditor] = useState('');
  const [initialStr, setInitialStr] = useState('');
  const [interestStr, setInterestStr] = useState('16.0');
  const [minPayStr, setMinPayStr] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [accountId, setAccountId] = useState('');
  const [note, setNote] = useState('');
  const [creditLimitStr, setCreditLimitStr] = useState('');
  const [cycleCutDate, setCycleCutDate] = useState('');
  const [totalTenorStr, setTotalTenorStr] = useState('');
  const [paidTenorStr, setPaidTenorStr] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Debt | null>(null);

  // History of debt payment transactions
  const debtPaymentHistory = useMemo(() => {
    return transactions.filter(t => t.type === 'debt_payment' && t.status !== 'ลบแล้ว');
  }, [transactions]);

  // Aggregate KPI computations
  const totalPaid = useMemo(() => {
    return debts.reduce((sum, d) => sum + (d.paid || 0), 0);
  }, [debts]);

  const totalInitial = useMemo(() => {
    return debts.reduce((sum, d) => sum + (d.initial || 0), 0);
  }, [debts]);

  const totalMonthlyMinPay = useMemo(() => {
    return debts.reduce((sum, d) => {
      const remaining = d.remaining ?? d.initial;
      if (remaining <= 0) return sum;
      return sum + (d.minPay || 0);
    }, 0);
  }, [debts]);

  const weightedAvgInterest = useMemo(() => {
    let sumWeightInterest = 0;
    let sumRemaining = 0;
    debts.forEach(d => {
      const remaining = d.remaining ?? d.initial;
      if (remaining > 0) {
        sumWeightInterest += remaining * (d.interest || 0);
        sumRemaining += remaining;
      }
    });
    if (sumRemaining === 0) return 0;
    return sumWeightInterest / sumRemaining;
  }, [debts]);

  // Next upcoming payment
  const upcomingDebts = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return debts
      .filter(d => (d.remaining ?? d.initial) > 0 && d.dueDate)
      .map(d => {
        const parts = (d.dueDate || '').split('-');
        let targetDate = new Date();
        if (parts.length === 3) {
          targetDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        } else if (parts.length === 1 && !isNaN(parseInt(parts[0]))) {
          // If just day of month
          const day = parseInt(parts[0]);
          targetDate = new Date(today.getFullYear(), today.getMonth(), day);
          if (targetDate < today) {
            targetDate = new Date(today.getFullYear(), today.getMonth() + 1, day);
          }
        }
        const diffTime = targetDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return {
          debt: d,
          diffDays,
          targetDate,
        };
      })
      .sort((a, b) => a.diffDays - b.diffDays);
  }, [debts]);

  const nearestDue = upcomingDebts[0];

  // Category list for filter
  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    debts.forEach(d => {
      if (d.category) set.add(d.category);
    });
    return Array.from(set);
  }, [debts]);

  // Filtered & sorted debts
  const filteredDebts = useMemo(() => {
    return debts.filter(d => {
      if (categoryFilter !== 'all' && d.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = d.name.toLowerCase().includes(q);
        const matchCreditor = (d.creditor || '').toLowerCase().includes(q);
        const matchNote = (d.note || '').toLowerCase().includes(q);
        if (!matchName && !matchCreditor && !matchNote) return false;
      }
      return true;
    }).sort((a, b) => {
      const remA = a.remaining ?? a.initial;
      const remB = b.remaining ?? b.initial;
      if (sortBy === 'interest-desc') {
        return (b.interest || 0) - (a.interest || 0);
      }
      if (sortBy === 'remaining-asc') {
        return remA - remB;
      }
      if (sortBy === 'remaining-desc') {
        return remB - remA;
      }
      if (sortBy === 'due-soon') {
        return (a.dueDate || '').localeCompare(b.dueDate || '');
      }
      return 0;
    });
  }, [debts, categoryFilter, searchQuery, sortBy]);

  // Strategy payoff order
  const strategyDebts = useMemo(() => {
    const active = debts.filter(d => (d.remaining ?? d.initial) > 0);
    if (strategyMode === 'avalanche') {
      // Highest interest first
      return [...active].sort((a, b) => (b.interest || 0) - (a.interest || 0));
    } else {
      // Smallest balance first
      return [...active].sort((a, b) => (a.remaining ?? a.initial) - (b.remaining ?? b.initial));
    }
  }, [debts, strategyMode]);

  // Strategy simulation calculations
  const strategySimulation = useMemo(() => {
    let totalRem = debts.reduce((sum, d) => sum + (d.remaining ?? d.initial), 0);
    if (totalRem <= 0) {
      return {
        baselineMonths: 0,
        acceleratedMonths: 0,
        savedMonths: 0,
        estimatedInterestSaved: 0,
        debtFreeDate: 'ไม่มีหนี้คงเหลือ',
      };
    }

    const baselineMonthly = Math.max(totalMonthlyMinPay, totalRem * 0.05);
    const acceleratedMonthly = baselineMonthly + (extraMonthlyPay || 0);

    const baselineMonths = Math.ceil(totalRem / Math.max(1, baselineMonthly * 0.9));
    const acceleratedMonths = Math.ceil(totalRem / Math.max(1, acceleratedMonthly * 0.92));
    const savedMonths = Math.max(0, baselineMonths - acceleratedMonths);

    // Approximate interest savings
    const avgRate = (weightedAvgInterest || 15) / 100 / 12;
    const estimatedInterestBaseline = totalRem * avgRate * (baselineMonths / 2);
    const estimatedInterestAccelerated = totalRem * avgRate * (acceleratedMonths / 2);
    const estimatedInterestSaved = Math.max(0, estimatedInterestBaseline - estimatedInterestAccelerated);

    const today = new Date();
    today.setMonth(today.getMonth() + acceleratedMonths);
    const debtFreeDate = today.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' });

    return {
      baselineMonths,
      acceleratedMonths,
      savedMonths,
      estimatedInterestSaved,
      debtFreeDate,
    };
  }, [debts, totalMonthlyMinPay, extraMonthlyPay, weightedAvgInterest]);

  // Open Add modal
  const openAdd = () => {
    setEditingDebt(null);
    setName('');
    setCategory('บัตรเครดิต');
    setCreditor('');
    setInitialStr('');
    setInterestStr('16.0');
    setMinPayStr('');
    setDueDate('');
    setAccountId(accounts[0]?.id || '');
    setNote('');
    setCreditLimitStr('');
    setCycleCutDate('');
    setTotalTenorStr('');
    setPaidTenorStr('');
    setError(null);
    setIsModalOpen(true);
  };

  // Open Edit modal
  const openEdit = (d: Debt) => {
    setEditingDebt(d);
    setName(d.name);
    setCategory(d.category || 'บัตรเครดิต');
    setCreditor(d.creditor || '');
    setInitialStr(String(d.initial || ''));
    setInterestStr(String(d.interest ?? 0));
    setMinPayStr(String(d.minPay ?? ''));
    setDueDate(d.dueDate || '');
    setAccountId(d.accountId || '');
    setNote(d.note || '');
    setCreditLimitStr(d.creditLimit ? String(d.creditLimit) : '');
    setCycleCutDate(d.cycleCutDate || '');
    setTotalTenorStr(d.totalTenor ? String(d.totalTenor) : '');
    setPaidTenorStr(d.paidTenor ? String(d.paidTenor) : '');
    setError(null);
    setIsModalOpen(true);
  };

  // Open Pay Modal
  const openPayModal = (d: Debt) => {
    setSelectedDebtForPay(d);
    const rem = d.remaining ?? d.initial;
    const defaultPay = d.minPay && d.minPay > 0 ? Math.min(d.minPay, rem) : rem;
    setPayAmountStr(String(defaultPay));
    setPayPrincipalStr(String(defaultPay));
    setPayInterestStr('0');
    setPayAccountId(d.accountId || (accounts[0]?.id ?? ''));
    setPayDate(new Date().toISOString().slice(0, 10));
    setPayNote(`ชำระหนี้: ${d.name}`);
    setPayError(null);
    setIsPayModalOpen(true);
  };

  // Handle Save Debt
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError('กรุณากรอกชื่อหนี้สิน');
    const initial = parseFloat(initialStr) || 0;
    if (initial <= 0) return setError('กรุณาระบุยอดหนี้เริ่มต้นที่ถูกต้อง');

    setIsSaving(true);
    setError(null);
    try {
      await saveDebt({
        id: editingDebt?.id,
        name: name.trim(),
        category,
        creditor: creditor.trim(),
        initial,
        interest: parseFloat(interestStr) || 0,
        minPay: parseFloat(minPayStr) || 0,
        dueDate: dueDate || undefined,
        accountId: accountId || undefined,
        note: note.trim(),
        creditLimit: creditLimitStr ? parseFloat(creditLimitStr) : undefined,
        cycleCutDate: cycleCutDate || undefined,
        totalTenor: totalTenorStr ? parseInt(totalTenorStr) : undefined,
        paidTenor: paidTenorStr ? parseInt(paidTenorStr) : undefined,
      });
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'บันทึกหนี้สินไม่สำเร็จ');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Submit Payment
  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDebtForPay) return;
    const totalAmount = parseFloat(payAmountStr) || 0;
    if (totalAmount <= 0) {
      return setPayError('กรุณาระบุจำนวนเงินที่ต้องการชำระ');
    }
    if (!payAccountId) {
      return setPayError('กรุณาเลือกบัญชีที่ใช้ตัดเงิน');
    }

    const principal = parseFloat(payPrincipalStr) || totalAmount;
    const interest = parseFloat(payInterestStr) || 0;

    setIsProcessingPayment(true);
    setPayError(null);
    try {
      await saveTransaction({
        date: payDate,
        type: 'debt_payment',
        amount: totalAmount,
        principal,
        interest,
        accountId: payAccountId,
        debtId: selectedDebtForPay.id,
        description: payNote.trim() || `ชำระหนี้: ${selectedDebtForPay.name}`,
        currency: 'THB',
        status: 'ใช้งาน',
      });
      setIsPayModalOpen(false);
    } catch (err: any) {
      setPayError(err.message || 'บันทึกการชำระหนี้ไม่สำเร็จ');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteDebt(deleteTarget.id);
    setDeleteTarget(null);
  };

  // Helper function to get friendly category icon
  const getCategoryIcon = (catName: string) => {
    if (catName.includes('บัตรเครดิต')) return '💳';
    if (catName.includes('บ้าน') || catName.includes('คอนโด')) return '🏠';
    if (catName.includes('รถ') || catName.includes('ยานพาหนะ')) return '🚗';
    if (catName.includes('บุคคล') || catName.includes('ยืม')) return '🤝';
    if (catName.includes('ผ่อน')) return '🛍️';
    return '📋';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 animate-in fade-in duration-300">
      
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-5 sm:p-6 border border-[#EAE6DA] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-100/80 text-[#E0533C] flex items-center justify-center font-bold shrink-0">
            <CreditCard className="w-5 h-5 stroke-[2.3]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-[#17202A] tracking-tight">หนี้สิน</h1>
              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-100 text-[#E0533C]">
                {debts.filter(d => (d.remaining ?? d.initial) > 0).length} รายการค้างชำระ
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-gray-500 mt-1">
              จัดการภาระหนี้ ติดตามดอกเบี้ย และวางแผนปลดหนี้ให้หมดเร็วขึ้น
            </p>
          </div>
        </div>

        {/* Standardized Button [ + ] เพิ่มหนี้สิน */}
        <button
          onClick={openAdd}
          className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-[#159B78] hover:bg-[#0F765C] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#159B78]/25 active:scale-95 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>เพิ่มหนี้สิน</span>
        </button>
      </div>

      {/* 2. Top Summary KPI Cards (Pastel Fintech) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Remaining Debt */}
        <div className="bg-white rounded-3xl p-5 border border-[#EAE6DA] shadow-xs space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">หนี้คงเหลือรวม</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-[#E0533C] flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#E0533C] tracking-tight">
            ฿{totalDebtRemaining.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-gray-400">
            <span>เริ่มต้น: ฿{totalInitial.toLocaleString()}</span>
          </div>
        </div>

        {/* Monthly Obligation */}
        <div className="bg-white rounded-3xl p-5 border border-[#EAE6DA] shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">ผ่อนชำระ/เดือน</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-600 tracking-tight">
            ฿{totalMonthlyMinPay.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-gray-400 font-medium truncate">
            {monthlyIncome > 0 
              ? `DTI ~${Math.round((totalMonthlyMinPay / monthlyIncome) * 100)}% ของรายรับ` 
              : 'ยอดขั้นต่ำที่ต้องจ่าย'}
          </div>
        </div>

        {/* Weighted Avg Interest */}
        <div className="bg-white rounded-3xl p-5 border border-[#EAE6DA] shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">ดอกเบี้ยเฉลี่ย</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-indigo-600 tracking-tight">
            {weightedAvgInterest.toFixed(1)}% <span className="text-xs font-bold text-gray-400">ต่อปี</span>
          </div>
          <div className="text-[11px] text-gray-400 font-medium">
            ถ่วงน้ำหนักตามยอดหนี้
          </div>
        </div>

        {/* Total Paid */}
        <div className="bg-white rounded-3xl p-5 border border-[#EAE6DA] shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">ชำระแล้วสะสม</span>
            <div className="w-8 h-8 rounded-xl bg-[#3F8F72]/15 text-[#3F8F72] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#3F8F72] tracking-tight">
            ฿{totalPaid.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-[#3F8F72] font-semibold">
            {totalInitial > 0 ? `ลดลงแล้ว ${Math.round((totalPaid / totalInitial) * 100)}%` : '0%'}
          </div>
        </div>
      </div>

      {/* Due Alert Banner if payment is near */}
      {nearestDue && nearestDue.diffDays <= 7 && (
        <div className={`p-4 rounded-3xl border flex items-center justify-between gap-3 ${
          nearestDue.diffDays < 0 
            ? 'bg-rose-50 border-rose-200 text-rose-800' 
            : 'bg-amber-50 border-amber-200 text-amber-800'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
              nearestDue.diffDays < 0 ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
            }`}>
              <AlertCircle className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="font-extrabold text-sm flex items-center gap-2">
                <span>{nearestDue.diffDays < 0 ? 'เกินกำหนดชำระแล้ว!' : 'ใกล้ถึงกำหนดชำระเร็วๆ นี้!'}</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white/70">
                  {nearestDue.debt.name} (฿{(nearestDue.debt.minPay || 0).toLocaleString()})
                </span>
              </div>
              <p className="text-xs opacity-80 mt-0.5">
                กำหนดชำระ: {nearestDue.debt.dueDate} ({nearestDue.diffDays < 0 ? `เลยมาแล้ว ${Math.abs(nearestDue.diffDays)} วัน` : `เหลืออีก ${nearestDue.diffDays} วัน`})
              </p>
            </div>
          </div>

          <button
            onClick={() => openPayModal(nearestDue.debt)}
            className="py-2 px-3.5 rounded-xl bg-white text-[#252525] font-bold text-xs shadow-xs hover:bg-gray-50 shrink-0 cursor-pointer"
          >
            บันทึกชำระทันที
          </button>
        </div>
      )}

      {/* 3. Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200/80 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-2 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-[#3F8F72] text-white shadow-xs'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-[#EAE6DA]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>รายการหนี้สิน ({debts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('strategy')}
          className={`py-2 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'strategy'
              ? 'bg-[#3F8F72] text-white shadow-xs'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-[#EAE6DA]'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>วางแผนปลดหนี้ (Avalanche & Snowball)</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`py-2 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-[#3F8F72] text-white shadow-xs'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-[#EAE6DA]'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>วิเคราะห์ภาระหนี้</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`py-2 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'bg-[#3F8F72] text-white shadow-xs'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-[#EAE6DA]'
          }`}
        >
          <History className="w-4 h-4" />
          <span>ประวัติการชำระ ({debtPaymentHistory.length})</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: OVERVIEW & DEBT CARDS LIST */}
      {/* ======================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Filter & Search Bar */}
          <div className="bg-white rounded-3xl p-4 border border-[#EAE6DA] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Category selector */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="py-2 px-3 rounded-2xl border border-gray-200 text-xs font-bold text-gray-700 bg-[#FAF8F2] focus:outline-hidden"
              >
                <option value="all">ทุกประเภทหนี้สิน</option>
                <option value="บัตรเครดิต">💳 บัตรเครดิต</option>
                <option value="สินเชื่อบุคคล">🏦 สินเชื่อบุคคล / เงินกู้</option>
                <option value="ผ่อนสินค้า">🛍️ ผ่อนสินค้า 0%</option>
                <option value="รถยนต์">🚗 ผ่อนรถยนต์</option>
                <option value="บ้าน">🏠 สินเชื่อบ้าน/คอนโด</option>
                <option value="หนี้บุคคล">🤝 หนี้บุคคล</option>
              </select>

              {/* Sort by */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="py-2 px-3 rounded-2xl border border-gray-200 text-xs font-bold text-gray-700 bg-[#FAF8F2] focus:outline-hidden"
              >
                <option value="interest-desc">ดอกเบี้ยสูงสุด (ประหยัดดอกเบี้ย)</option>
                <option value="remaining-asc">ยอดหนี้น้อยสุด (ปิดก้อนเล็ก)</option>
                <option value="remaining-desc">ยอดหนี้มากสุด</option>
                <option value="due-soon">วันครบกำหนดเร็วสุด</option>
              </select>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="ค้นหาชื่อหนี้สิน หรือเจ้าหนี้..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-2xl border border-gray-200 text-xs focus:outline-hidden focus:border-[#3F8F72] bg-[#FAF8F2]"
              />
            </div>
          </div>

          {/* Cards Grid */}
          {filteredDebts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#EAE6DA] shadow-xs space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-[#FAF8F2] flex items-center justify-center mx-auto text-3xl">
                💳
              </div>
              <h4 className="text-base font-bold text-gray-800">ไม่พบรายการหนี้สิน</h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                {debts.length === 0 
                  ? 'คุณยังไม่มีรายการหนี้สินในระบบ กดปุ่ม “+ เพิ่มหนี้สิน” เพื่อเริ่มต้นบันทึกและวางแผนชำระ'
                  : 'ไม่พบรายการที่ตรงกับเงื่อนไขการค้นหาหรือตัวกรอง'}
              </p>
              {debts.length === 0 && (
                <button
                  onClick={openAdd}
                  className="mt-2 py-2 px-4 rounded-xl bg-[#3F8F72] text-white font-bold text-xs shadow-xs"
                >
                  + เพิ่มหนี้สินรายการแรก
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDebts.map((d) => {
                const remaining = d.remaining ?? d.initial;
                const paid = d.paid ?? 0;
                const isPaidOff = remaining <= 0;
                const pctPaid = d.initial > 0 ? Math.min(100, Math.round((paid / d.initial) * 100)) : (isPaidOff ? 100 : 0);

                return (
                  <div
                    key={d.id}
                    className={`bg-white rounded-3xl p-5 border transition-all flex flex-col justify-between space-y-4 hover:shadow-md ${
                      isPaidOff 
                        ? 'border-emerald-200 bg-emerald-50/20' 
                        : 'border-[#EAE6DA] hover:border-rose-300'
                    }`}
                  >
                    {/* Top Row: Icon, Title & Edit/Delete */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                          isPaidOff ? 'bg-emerald-100' : 'bg-rose-50 border border-rose-100'
                        }`}>
                          {getCategoryIcon(d.category)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-gray-900 text-base">{d.name}</h4>
                            {isPaidOff && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700">
                                ปิดยอดแล้ว
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-400 font-medium">
                            {d.creditor ? `เจ้าหนี้: ${d.creditor}` : d.category}
                            {d.dueDate ? ` • ครบกำหนด ${d.dueDate}` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(d)}
                          className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                          title="แก้ไข"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(d)}
                          className="p-1.5 text-gray-400 hover:text-[#E0533C] rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title="ลบ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Middle: Numbers */}
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                      <div>
                        <span className="text-[11px] font-bold text-gray-400 block">ยอดหนี้คงเหลือ</span>
                        <div className={`text-lg sm:text-xl font-black tracking-tight ${
                          isPaidOff ? 'text-emerald-600' : 'text-[#E0533C]'
                        }`}>
                          ฿{remaining.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] font-bold text-gray-400 block">ชำระแล้ว</span>
                        <div className="text-lg sm:text-xl font-bold text-[#3F8F72] tracking-tight">
                          ฿{paid.toLocaleString()} <span className="text-xs font-semibold text-gray-400">({pctPaid}%)</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isPaidOff ? 'bg-emerald-500' : 'bg-[#3F8F72]'
                          }`}
                          style={{ width: `${pctPaid}%` }}
                        />
                      </div>
                    </div>

                    {/* Bottom Row: Interest, Min Pay & Action Button */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                      <div className="space-y-0.5">
                        <div className="font-bold text-gray-700 text-[11px]">
                          ดอกเบี้ย {d.interest}% ต่อปี
                        </div>
                        <div className="text-gray-400 text-[10px]">
                          ขั้นต่ำ ฿{(d.minPay || 0).toLocaleString()} / เดือน
                        </div>
                      </div>

                      {!isPaidOff && (
                        <button
                          onClick={() => openPayModal(d)}
                          className="py-1.5 px-3.5 rounded-xl bg-[#3F8F72] hover:bg-[#2F7259] text-white font-bold text-xs shadow-xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                        >
                          <DollarSign className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>บันทึกชำระ</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: PAYOFF STRATEGY (Avalanche vs Snowball) */}
      {/* ======================================================== */}
      {activeTab === 'strategy' && (
        <div className="space-y-6">
          {/* Strategy Mode Selector */}
          <div className="bg-white rounded-3xl p-6 border border-[#EAE6DA] shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-[#252525] flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  <span>กลยุทธ์การปลดหนี้ (Debt Freedom Strategies)</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  เลือกแนวทางที่เหมาะกับคุณเพื่อปิดหนี้ให้หมดเร็วที่สุด
                </p>
              </div>

              {/* Mode Toggle Buttons */}
              <div className="flex items-center gap-2 p-1 bg-[#FAF8F2] rounded-2xl border border-[#EAE6DA] self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setStrategyMode('avalanche')}
                  className={`py-1.5 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    strategyMode === 'avalanche'
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Debt Avalanche (ลดดอกเบี้ยสูงสุด)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStrategyMode('snowball')}
                  className={`py-1.5 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    strategyMode === 'snowball'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Snowflake className="w-3.5 h-3.5" />
                  <span>Debt Snowball (ปิดก้อนเล็กสร้างกำลังใจ)</span>
                </button>
              </div>
            </div>

            {/* Strategy Explanation Card */}
            <div className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
              strategyMode === 'avalanche'
                ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                : 'bg-indigo-50/70 border-indigo-200 text-indigo-900'
            }`}>
              <div className="p-2 rounded-xl bg-white shadow-2xs shrink-0 text-xl">
                {strategyMode === 'avalanche' ? '🔥' : '❄️'}
              </div>
              <div className="text-xs space-y-1">
                <div className="font-extrabold text-sm">
                  {strategyMode === 'avalanche' 
                    ? 'กลยุทธ์ Avalanche: ปิดหนี้ที่ “ดอกเบี้ยสูงที่สุด” ก่อนเสมอ' 
                    : 'กลยุทธ์ Snowball: ปิดหนี้ที่ “ยอดคงเหลือน้อยที่สุด” ก่อนเสมอ'}
                </div>
                <p className="opacity-90 leading-relaxed">
                  {strategyMode === 'avalanche'
                    ? 'จ่ายขั้นต่ำให้กับทุกหนี้ แล้วนำเงินส่วนเกินทั้งหมดทุ่มไปที่หนี้ที่มีอัตราดอกเบี้ยสูงสุด วิธีนี้จะช่วยประหยัดเงินดอกเบี้ยรวมได้มากที่สุดในทางคณิตศาสตร์!'
                    : 'จ่ายขั้นต่ำให้กับทุกหนี้ แล้วนำเงินส่วนเกินทั้งหมดทุ่มไปที่หนี้ที่ยอดคงเหลือน้อยที่สุด เมื่อปิดได้ 1 ก้อนจะเกิดกำลังใจ และนำเงินค่างวดนั้นไปทบก้อนต่อไปแบบลูกบอลหิมะ!'}
                </p>
              </div>
            </div>

            {/* Extra Monthly Payment Simulator */}
            <div className="p-5 rounded-2xl bg-[#FAF8F2] border border-[#EAE6DA] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-sm text-[#252525]">เงินจ่ายหนี้เพิ่มเติมต่อเดือน (Extra Monthly Payment)</h4>
                  <p className="text-xs text-gray-500">จำลองผลลัพธ์เมื่อเพิ่มเงินจ่ายหนี้มากกว่าขั้นต่ำ</p>
                </div>

                <div className="flex items-center gap-2">
                  {[1000, 2000, 3000, 5000].map(val => (
                    <button
                      key={val}
                      onClick={() => setExtraMonthlyPay(val)}
                      className={`py-1 px-2.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        extraMonthlyPay === val 
                          ? 'bg-[#3F8F72] text-white border-[#3F8F72]' 
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      +฿{val.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Slider */}
              <div className="space-y-1.5">
                <input
                  type="range"
                  min="0"
                  max="20000"
                  step="500"
                  value={extraMonthlyPay}
                  onChange={(e) => setExtraMonthlyPay(parseInt(e.target.value) || 0)}
                  className="w-full accent-[#3F8F72] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] font-bold text-gray-400">
                  <span>+฿0 (จ่ายเฉพาะขั้นต่ำ)</span>
                  <span className="text-[#3F8F72] font-black text-sm">+฿{extraMonthlyPay.toLocaleString()} / เดือน</span>
                  <span>+฿20,000</span>
                </div>
              </div>

              {/* Simulation Result KPI Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-white p-3.5 rounded-xl border border-gray-200">
                  <span className="text-[11px] text-gray-500 font-bold block">ปลดหนี้หมดเร็วกว่าเดิม</span>
                  <div className="text-lg font-black text-[#3F8F72]">
                    {strategySimulation.savedMonths} เดือน
                  </div>
                  <span className="text-[10px] text-gray-400">จากปกติ {strategySimulation.baselineMonths} เหลือ {strategySimulation.acceleratedMonths} เดือน</span>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-gray-200">
                  <span className="text-[11px] text-gray-500 font-bold block">ประหยัดดอกเบี้ยได้โดยประมาณ</span>
                  <div className="text-lg font-black text-emerald-600">
                    ฿{Math.round(strategySimulation.estimatedInterestSaved).toLocaleString()}
                  </div>
                  <span className="text-[10px] text-gray-400">ไม่ต้องเสียดอกเบี้ยให้สถาบันการเงิน</span>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-gray-200">
                  <span className="text-[11px] text-gray-500 font-bold block">เป้าหมายวันปลอดหนี้ (Debt-Free)</span>
                  <div className="text-lg font-black text-[#252525]">
                    {strategySimulation.debtFreeDate}
                  </div>
                  <span className="text-[10px] text-gray-400">เมื่อทำตามแผนอย่างต่อเนื่อง</span>
                </div>
              </div>
            </div>
          </div>

          {/* Strategy Prioritized Payoff Order */}
          <div className="bg-white rounded-3xl p-6 border border-[#EAE6DA] shadow-xs space-y-4">
            <h4 className="font-extrabold text-base text-[#252525]">
              ลำดับการชำระหนี้ที่แนะนำตามแผน {strategyMode === 'avalanche' ? 'Avalanche' : 'Snowball'}
            </h4>

            {strategyDebts.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">ไม่มีหนี้ที่ต้องชำระ ยินดีด้วยคุณไม่มีหนี้คงเหลือ!</p>
            ) : (
              <div className="space-y-3">
                {strategyDebts.map((d, index) => {
                  const rem = d.remaining ?? d.initial;
                  const isTopTarget = index === 0;

                  return (
                    <div
                      key={d.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isTopTarget 
                          ? 'border-amber-400 bg-amber-50/40 shadow-xs ring-1 ring-amber-400/50' 
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                          isTopTarget ? 'bg-amber-400 text-amber-950 shadow-2xs' : 'bg-gray-100 text-gray-600'
                        }`}>
                          #{index + 1}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#252525]">{d.name}</span>
                            {isTopTarget && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-200 text-amber-900 animate-pulse">
                                เป้าหมายอันดับ 1 (ทุ่มปิดก้อนนี้ก่อน)
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-400">
                            ดอกเบี้ย {d.interest}% • ยอดผ่อนขั้นต่ำ ฿{(d.minPay || 0).toLocaleString()}/เดือน
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4">
                        <div className="text-right">
                          <span className="text-[10px] text-gray-400 block">คงเหลือ</span>
                          <span className="text-base font-black text-[#E0533C]">
                            ฿{rem.toLocaleString()}
                          </span>
                        </div>

                        <button
                          onClick={() => openPayModal(d)}
                          className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isTopTarget 
                              ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs' 
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          }`}
                        >
                          บันทึกชำระ
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

      {/* ======================================================== */}
      {/* TAB 3: DEBT ANALYTICS & BREAKDOWN */}
      {/* ======================================================== */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category Breakdown */}
            <div className="bg-white rounded-3xl p-6 border border-[#EAE6DA] shadow-xs space-y-4">
              <h4 className="font-extrabold text-base text-[#252525] flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-[#3F8F72]" />
                <span>สัดส่วนหนี้สินตามหมวดหมู่</span>
              </h4>

              <div className="space-y-3">
                {categoriesList.map(cat => {
                  const catDebts = debts.filter(d => d.category === cat);
                  const catRem = catDebts.reduce((sum, d) => sum + (d.remaining ?? d.initial), 0);
                  const pct = totalDebtRemaining > 0 ? Math.round((catRem / totalDebtRemaining) * 100) : 0;

                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-gray-700 flex items-center gap-1.5">
                          <span>{getCategoryIcon(cat)}</span>
                          <span>{cat}</span>
                        </span>
                        <span className="text-gray-900">฿{catRem.toLocaleString()} ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#3F8F72]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Interest Rate Ranking */}
            <div className="bg-white rounded-3xl p-6 border border-[#EAE6DA] shadow-xs space-y-4">
              <h4 className="font-extrabold text-base text-[#252525] flex items-center gap-2">
                <Percent className="w-5 h-5 text-indigo-600" />
                <span>จัดอันดับอัตราดอกเบี้ย (% ต่อปี)</span>
              </h4>

              <div className="space-y-2.5">
                {[...debts]
                  .sort((a, b) => (b.interest || 0) - (a.interest || 0))
                  .map(d => (
                    <div
                      key={d.id}
                      className="flex items-center justify-between p-2.5 rounded-2xl bg-[#FAF8F2] border border-[#EAE6DA] text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{getCategoryIcon(d.category)}</span>
                        <span className="font-bold text-gray-800">{d.name}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono text-gray-500">฿{(d.remaining ?? d.initial).toLocaleString()}</span>
                        <span className={`font-black px-2 py-0.5 rounded-full text-[11px] ${
                          (d.interest || 0) >= 18 
                            ? 'bg-rose-100 text-rose-700' 
                            : (d.interest || 0) >= 10 
                            ? 'bg-amber-100 text-amber-700' 
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {d.interest}%
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: PAYMENT HISTORY */}
      {/* ======================================================== */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl p-6 border border-[#EAE6DA] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-extrabold text-base text-[#252525]">ประวัติการบันทึกชำระหนี้</h4>
              <p className="text-xs text-gray-400">รายการธุรกรรมชำระหนี้ที่บันทึกไว้ในระบบทั้งหมด</p>
            </div>
          </div>

          {debtPaymentHistory.length === 0 ? (
            <div className="p-8 text-center bg-[#FAF8F2] rounded-2xl border border-dashed border-[#EAE6DA] text-gray-400 text-xs">
              ยังไม่มีประวัติการบันทึกชำระหนี้
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-400 font-bold uppercase">
                    <th className="pb-3">วันที่</th>
                    <th className="pb-3">รายการหนี้สิน</th>
                    <th className="pb-3">บัญชีที่จ่าย</th>
                    <th className="pb-3 text-right">เงินต้น</th>
                    <th className="pb-3 text-right">ดอกเบี้ย</th>
                    <th className="pb-3 text-right">ยอดรวม</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {debtPaymentHistory.map(tx => {
                    const linkedDebt = debts.find(d => d.id === tx.debtId);
                    const linkedAcc = accounts.find(a => a.id === tx.accountId);

                    return (
                      <tr key={tx.id} className="hover:bg-gray-50/60">
                        <td className="py-3 text-gray-600">{tx.date}</td>
                        <td className="py-3 font-bold text-gray-900">
                          {linkedDebt ? linkedDebt.name : tx.description}
                        </td>
                        <td className="py-3 text-gray-500">
                          {linkedAcc ? linkedAcc.name : '-'}
                        </td>
                        <td className="py-3 text-right text-emerald-600 font-bold">
                          ฿{(tx.principal || tx.amount || 0).toLocaleString()}
                        </td>
                        <td className="py-3 text-right text-rose-500 font-bold">
                          ฿{(tx.interest || 0).toLocaleString()}
                        </td>
                        <td className="py-3 text-right font-black text-gray-900">
                          ฿{(tx.amount || 0).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: RECORD PAYMENT */}
      {/* ======================================================== */}
      {isPayModalOpen && selectedDebtForPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-[#EAE6DA] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#3F8F72]/15 text-[#3F8F72] flex items-center justify-center font-bold">
                  <DollarSign className="w-4 h-4 stroke-[3]" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#252525]">บันทึกการชำระหนี้</h3>
                  <p className="text-[11px] text-gray-400">{selectedDebtForPay.name}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsPayModalOpen(false)} 
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {payError && (
              <div className="mb-3 p-2.5 rounded-xl bg-rose-50 text-[#E0533C] text-xs font-semibold">
                {payError}
              </div>
            )}

            <form onSubmit={handleConfirmPayment} className="space-y-3.5">
              {/* Total Amount */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  ยอดเงินที่ชำระทั้งหมด (฿) <span className="text-[#E0533C]">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={payAmountStr}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPayAmountStr(val);
                    setPayPrincipalStr(val);
                    setPayInterestStr('0');
                  }}
                  className="w-full py-2.5 px-3.5 rounded-2xl border border-gray-300 text-lg font-black text-gray-900 focus:border-[#3F8F72] focus:outline-hidden"
                  required
                />
              </div>

              {/* Split: Principal vs Interest */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-[#FAF8F2] border border-[#EAE6DA]">
                <div>
                  <label className="text-[11px] font-bold text-gray-600 block mb-1">เงินต้น (฿)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={payPrincipalStr}
                    onChange={(e) => setPayPrincipalStr(e.target.value)}
                    className="w-full p-2 rounded-xl border border-gray-300 text-xs font-bold bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-600 block mb-1">ดอกเบี้ย (฿)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={payInterestStr}
                    onChange={(e) => setPayInterestStr(e.target.value)}
                    className="w-full p-2 rounded-xl border border-gray-300 text-xs font-bold bg-white"
                  />
                </div>
              </div>

              {/* Source Account */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  ตัดเงินจากบัญชี <span className="text-[#E0533C]">*</span>
                </label>
                <select
                  value={payAccountId}
                  onChange={(e) => setPayAccountId(e.target.value)}
                  className="w-full py-2.5 px-3.5 rounded-2xl border border-gray-300 bg-white text-xs font-bold focus:border-[#3F8F72] focus:outline-hidden"
                  required
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} (คงเหลือ ฿{(acc.balance || 0).toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">วันที่ชำระ</label>
                <input
                  type="date"
                  value={payDate}
                  onChange={(e) => setPayDate(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs"
                  required
                />
              </div>

              {/* Note */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">บันทึกช่วยจำ</label>
                <input
                  type="text"
                  placeholder="เช่น จ่ายตัดรอบบิล มีนาคม"
                  value={payNote}
                  onChange={(e) => setPayNote(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isProcessingPayment}
                  className="flex-1 py-2.5 rounded-xl bg-[#3F8F72] hover:bg-[#2F7259] text-white font-bold text-xs shadow-md shadow-[#3F8F72]/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isProcessingPayment ? 'กำลังบันทึก...' : 'ยืนยันการชำระ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD / EDIT DEBT */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-[#EAE6DA] animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#3F8F72]/15 text-[#3F8F72] flex items-center justify-center font-bold">
                  <CreditCard className="w-4 h-4" />
                </div>
                <h3 className="text-base font-extrabold text-[#252525]">
                  {editingDebt ? 'แก้ไขข้อมูลหนี้สิน' : 'เพิ่มหนี้สินใหม่'}
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-3 p-2.5 rounded-xl bg-rose-50 text-[#E0533C] text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3.5">
              {/* Name */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  ชื่อรายการหนี้สิน <span className="text-[#E0533C]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="เช่น บัตรเครดิต KBank OneSiam, สินเชื่อบ้าน SCB, ผ่อนรถยนต์"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full py-2.5 px-3.5 rounded-2xl border border-gray-300 text-xs font-semibold focus:border-[#3F8F72] focus:outline-hidden"
                  required
                />
              </div>

              {/* Category & Creditor */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">ประเภทหนี้สิน</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-2xl border border-gray-300 bg-white text-xs font-semibold focus:border-[#3F8F72] focus:outline-hidden"
                  >
                    <option value="บัตรเครดิต">💳 บัตรเครดิต</option>
                    <option value="สินเชื่อบุคคล">🏦 สินเชื่อบุคคล / เงินกู้</option>
                    <option value="ผ่อนสินค้า">🛍️ ผ่อนสินค้า 0%</option>
                    <option value="รถยนต์">🚗 ผ่อนรถยนต์</option>
                    <option value="บ้าน">🏠 สินเชื่อบ้าน / คอนโด</option>
                    <option value="หนี้บุคคล">🤝 หนี้บุคคล / ยืมเพื่อน</option>
                    <option value="อื่น ๆ">📋 อื่น ๆ</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">เจ้าหนี้ / สถาบันการเงิน</label>
                  <input
                    type="text"
                    placeholder="เช่น ธนาคารกสิกรไทย, KTC"
                    value={creditor}
                    onChange={(e) => setCreditor(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-2xl border border-gray-300 text-xs font-semibold focus:border-[#3F8F72] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Initial Debt & Interest */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    ยอดหนี้ตั้งต้น (฿) <span className="text-[#E0533C]">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={initialStr}
                    onChange={(e) => setInitialStr(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-2xl border border-gray-300 text-xs font-bold focus:border-[#3F8F72] focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    อัตราดอกเบี้ย (% ต่อปี)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="16.0"
                    value={interestStr}
                    onChange={(e) => setInterestStr(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-2xl border border-gray-300 text-xs font-bold focus:border-[#3F8F72] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Min Pay & Due Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    ยอดชำระขั้นต่ำ / ค่างวด (฿)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={minPayStr}
                    onChange={(e) => setMinPayStr(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-2xl border border-gray-300 text-xs font-bold focus:border-[#3F8F72] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    วันครบกำหนดชำระ
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full py-2 px-3 rounded-2xl border border-gray-300 text-xs font-semibold focus:border-[#3F8F72] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Linked Account */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  บัญชีที่ใช้ตัดเงินชำระประจำ (ถ้ามี)
                </label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-2xl border border-gray-300 bg-white text-xs font-semibold focus:border-[#3F8F72] focus:outline-hidden"
                >
                  <option value="">-- ไม่ระบุ --</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </select>
              </div>

              {/* Note */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">หมายเหตุ / เลขที่สัญญา</label>
                <input
                  type="text"
                  placeholder="เช่น สัญญาเลขที่ 123456"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full py-2 px-3 rounded-2xl border border-gray-300 text-xs"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 rounded-xl bg-[#3F8F72] hover:bg-[#2F7259] text-white font-bold text-xs shadow-md shadow-[#3F8F72]/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? 'กำลังบันทึก...' : 'บันทึกหนี้สิน'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="ลบรายการหนี้สินใช่หรือไม่?"
        message={`ต้องการลบรายการหนี้ "${deleteTarget?.name}" ออกจากระบบและ Google Sheets หรือไม่?`}
        confirmLabel="ลบหนี้สิน"
        cancelLabel="ยกเลิก"
        isDestructive={true}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
