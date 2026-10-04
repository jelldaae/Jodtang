import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Goal, Transaction, DEFAULT_GOAL_CATEGORIES } from '../types';
import { NongTangMascot } from '../assets/logo';
import { 
  Target, 
  Plus, 
  Edit3, 
  Trash2, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Wallet, 
  Sparkles, 
  X, 
  ChevronRight, 
  ArrowUpRight, 
  History, 
  PauseCircle, 
  PlayCircle,
  PiggyBank,
  PartyPopper,
  Info,
  Pause,
  Play,
  ArrowUpDown,
  ArrowRightLeft,
  ShieldCheck,
  Check
} from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

interface SavingsPageProps {
  onDepositGoal?: (goal: Goal) => void;
}

export const SavingsPage: React.FC<SavingsPageProps> = () => {
  const { 
    goals, 
    totalSavingsCurrent, 
    accounts, 
    transactions,
    saveGoal, 
    deleteGoal,
    saveTransaction 
  } = useApp();

  // Filter tabs: 'all' | 'active' | 'paused' | 'completed' | 'cancelled' (Section 35)
  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'active' | 'paused' | 'completed' | 'cancelled'>('all');
  
  // Sort options (Section 36)
  const [sortBy, setSortBy] = useState<'closest_deadline' | 'progress_desc' | 'progress_asc' | 'target_desc' | 'deadline_asc'>('closest_deadline');

  // Modal states
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  // Pause Confirmation Modal state (Section 22)
  const [goalToPause, setGoalToPause] = useState<Goal | null>(null);

  // Deposit Money Modal state (Sections 15 - 17: Track Only vs Actual Transfer)
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositTargetGoal, setDepositTargetGoal] = useState<Goal | null>(null);
  const [depositAmountStr, setDepositAmountStr] = useState('');
  const [savingMode, setSavingMode] = useState<'TRACK_ONLY' | 'ACTUAL_TRANSFER'>('TRACK_ONLY');
  const [depositAccountId, setDepositAccountId] = useState('');
  const [depositToAccountId, setDepositToAccountId] = useState('');
  const [depositDate, setDepositDate] = useState(new Date().toISOString().slice(0, 10));
  const [depositNote, setDepositNote] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositError, setDepositError] = useState<string | null>(null);

  // Detail Modal state
  const [detailGoal, setDetailGoal] = useState<Goal | null>(null);

  // Form states for Goal Create/Edit
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🎯');
  const [category, setCategory] = useState(DEFAULT_GOAL_CATEGORIES[0]?.name || 'ทั่วไป');
  const [targetStr, setTargetStr] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [deadline, setDeadline] = useState('');
  const [accountId, setAccountId] = useState('');
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Goal | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  // Emoji Suggestions
  const goalEmojiSuggestions = [
    '🏠', '🚗', '✈️', '🩺', '🎓', '🎁', '🛡️', '📈', '👨‍👩‍👧', '💍', '🌴', '🎯',
    '💻', '📱', '👶', '🚴', '🏍️', '🏢', '🪙', '💎', '🎨', '🎸', '🏖️', '⛰️'
  ];

  // Enriched Goals with Dynamic Calculations (Section 31 & Section 13)
  const enrichedGoals = useMemo(() => {
    // Map transactions with type === 'saving' or 'transfer' linked to goalId
    const savingsMap: { [goalId: string]: number } = {};
    transactions.forEach(tx => {
      if (tx.status === 'ลบแล้ว' || !tx.goalId) return;
      if (tx.type === 'saving' || tx.type === 'transfer') {
        savingsMap[tx.goalId] = (savingsMap[tx.goalId] || 0) + (Number(tx.amount) || 0);
      }
    });

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    return goals.map(g => {
      const current = savingsMap[g.id] || 0;
      const target = Number(g.target) || 1;
      const remaining = Math.max(0, target - current);
      const progress = Math.min(100, Math.round((current / target) * 100));

      // Calculate days remaining
      let daysRemaining: number | null = null;
      if (g.deadline) {
        const diffMs = new Date(g.deadline).getTime() - new Date(todayStr).getTime();
        daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      }

      // Auto status computation (Sections 1, 8, 9, 11)
      let computedStatus: 'กำลังออม' | 'ใกล้ถึงเป้าหมาย' | 'บรรลุเป้าหมาย' | 'เลยกำหนด' | 'พักเป้าหมาย' | 'ยกเลิกเป้าหมาย' = 'กำลังออม';
      if (g.goalStatus === 'พักเป้าหมาย') {
        computedStatus = 'พักเป้าหมาย';
      } else if (g.goalStatus === 'ยกเลิกเป้าหมาย') {
        computedStatus = 'ยกเลิกเป้าหมาย';
      } else if (progress >= 100) {
        computedStatus = 'บรรลุเป้าหมาย';
      } else if (daysRemaining !== null && daysRemaining < 0) {
        computedStatus = 'เลยกำหนด';
      } else if (progress >= 80) {
        computedStatus = 'ใกล้ถึงเป้าหมาย';
      }

      return {
        ...g,
        current,
        remaining,
        progress,
        daysRemaining,
        computedStatus,
      };
    });
  }, [goals, transactions]);

  // Overall Financial Summary for Goals (Section 25: Summary Metrics)
  const summary = useMemo(() => {
    const active = enrichedGoals.filter(g => g.status === 'ใช้งาน');
    const totTarget = active.reduce((sum, g) => sum + (Number(g.target) || 0), 0);
    const totSaved = active.reduce((sum, g) => sum + (g.current || 0), 0);
    const pct = totTarget > 0 ? Math.min(100, Math.round((totSaved / totTarget) * 100)) : 0;
    const activeCount = active.filter(g => g.computedStatus === 'กำลังออม' || g.computedStatus === 'ใกล้ถึงเป้าหมาย').length;
    const pausedCount = active.filter(g => g.computedStatus === 'พักเป้าหมาย').length;
    const completedCount = active.filter(g => g.computedStatus === 'บรรลุเป้าหมาย').length;
    const cancelledCount = active.filter(g => g.computedStatus === 'ยกเลิกเป้าหมาย').length;

    return {
      totalTarget: totTarget,
      totalSaved: totSaved,
      overallProgress: pct,
      totalGoalsCount: active.length,
      activeCount,
      pausedCount,
      completedCount,
      cancelledCount,
    };
  }, [enrichedGoals]);

  // Filtered & Sorted Goals (Sections 35 & 36)
  const filteredAndSortedGoals = useMemo(() => {
    const list = enrichedGoals.filter(g => {
      if (g.status !== 'ใช้งาน') return false;
      if (activeTabFilter === 'active') return g.computedStatus === 'กำลังออม' || g.computedStatus === 'ใกล้ถึงเป้าหมาย';
      if (activeTabFilter === 'paused') return g.computedStatus === 'พักเป้าหมาย';
      if (activeTabFilter === 'completed') return g.computedStatus === 'บรรลุเป้าหมาย';
      if (activeTabFilter === 'cancelled') return g.computedStatus === 'ยกเลิกเป้าหมาย';
      return true;
    });

    list.sort((a, b) => {
      switch (sortBy) {
        case 'closest_deadline': {
          const aDays = a.daysRemaining != null ? a.daysRemaining : 99999;
          const bDays = b.daysRemaining != null ? b.daysRemaining : 99999;
          return aDays - bDays;
        }
        case 'progress_desc':
          return (b.progress || 0) - (a.progress || 0);
        case 'progress_asc':
          return (a.progress || 0) - (b.progress || 0);
        case 'target_desc':
          return Number(b.target || 0) - Number(a.target || 0);
        case 'deadline_asc':
          return (a.deadline || '9999').localeCompare(b.deadline || '9999');
        default:
          return 0;
      }
    });

    return list;
  }, [enrichedGoals, activeTabFilter, sortBy]);

  // Open Create Goal modal
  const openAdd = () => {
    setEditingGoal(null);
    setName('');
    setIcon('🎯');
    setCategory(DEFAULT_GOAL_CATEGORIES[0]?.name || 'บ้านและที่อยู่อาศัย');
    setTargetStr('');
    setStartDate(new Date().toISOString().slice(0, 10));
    setDeadline('');
    setAccountId(accounts[0]?.id || '');
    setNote('');
    setFormError(null);
    setIsGoalModalOpen(true);
  };

  // Open Edit Goal modal
  const openEdit = (g: Goal) => {
    setEditingGoal(g);
    setName(g.name);
    setIcon(g.icon || '🎯');
    setCategory(g.category);
    setTargetStr(String(g.target));
    setStartDate(g.startDate || new Date().toISOString().slice(0, 10));
    setDeadline(g.deadline || '');
    setAccountId(g.accountId || '');
    setNote(g.note || '');
    setFormError(null);
    setIsGoalModalOpen(true);
  };

  // Save Goal
  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setFormError('กรุณากรอกชื่อเป้าหมายการออม');
    const target = parseFloat(targetStr);
    if (isNaN(target) || target <= 0) return setFormError('กรุณากรอกจำนวนเงินเป้าหมายที่ถูกต้อง (> 0)');

    setIsSaving(true);
    setFormError(null);
    try {
      await saveGoal({
        id: editingGoal?.id,
        name: name.trim(),
        icon: icon.trim() || '🎯',
        category,
        target,
        startDate: startDate || undefined,
        deadline: deadline || undefined,
        accountId: accountId || undefined,
        note: note.trim(),
        status: 'ใช้งาน',
        goalStatus: editingGoal?.goalStatus || 'กำลังออม',
      });
      setIsGoalModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'บันทึกเป้าหมายไม่สำเร็จ');
    } finally {
      setIsSaving(false);
    }
  };

  // Open Deposit Money Modal ("+ เพิ่มเงินออม" - Section 15 & 16)
  const openDeposit = (g: Goal, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (g.goalStatus === 'พักเป้าหมาย') {
      alert('เป้าหมายนี้อยู่ในสถานะพัก กรุณากด "เริ่มออมต่อ" ก่อนทำการออมเงิน');
      return;
    }
    setDepositTargetGoal(g);
    setDepositAmountStr('');
    setSavingMode('TRACK_ONLY');
    setDepositAccountId(g.accountId || accounts[0]?.id || '');
    setDepositToAccountId(accounts[1]?.id || accounts[0]?.id || '');
    setDepositDate(new Date().toISOString().slice(0, 10));
    setDepositNote(`ออมเงินเพื่อ: ${g.name}`);
    setDepositError(null);
    setIsDepositModalOpen(true);
  };

  // Handle Deposit Money (Supports Mode A: Track Only vs Mode B: Actual Transfer - Sections 15 - 18)
  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositTargetGoal) return;
    if (depositTargetGoal.goalStatus === 'พักเป้าหมาย') {
      return setDepositError('เป้าหมายนี้อยู่ในสถานะพัก กรุณาเริ่มออมต่อก่อน');
    }
    const amount = parseFloat(depositAmountStr);
    if (isNaN(amount) || amount <= 0) return setDepositError('กรุณาระบุจำนวนเงินที่ถูกต้อง (> 0)');
    if (!depositAccountId) return setDepositError('กรุณาเลือกบัญชี');

    setIsDepositing(true);
    setDepositError(null);
    try {
      if (savingMode === 'ACTUAL_TRANSFER') {
        if (!depositToAccountId) {
          throw new Error('กรุณาเลือกบัญชีปลายทางที่ต้องการย้ายเงินเข้า');
        }
        if (depositAccountId === depositToAccountId) {
          throw new Error('บัญชีต้นทางและปลายทางต้องไม่เป็นบัญชีเดียวกัน');
        }
        // Mode B (Section 17): Actual Transfer between real accounts, linked to Goal
        await saveTransaction({
          type: 'transfer',
          amount,
          accountId: depositAccountId,
          toAccountId: depositToAccountId,
          goalId: depositTargetGoal.id,
          date: depositDate,
          description: depositNote.trim() || `ย้ายเงินเข้าเป้าหมาย: ${depositTargetGoal.name}`,
        });
      } else {
        // Mode A (Section 16): Track Only - increases goal savings without altering account balances!
        await saveTransaction({
          type: 'saving',
          amount,
          accountId: depositAccountId,
          goalId: depositTargetGoal.id,
          date: depositDate,
          description: depositNote.trim() || `ออมเงินเข้าเป้าหมาย: ${depositTargetGoal.name}`,
        });
      }
      setIsDepositModalOpen(false);
    } catch (err: any) {
      setDepositError(err.message || 'บันทึกรายการออมเงินไม่สำเร็จ');
    } finally {
      setIsDepositing(false);
    }
  };

  // Open Pause Confirmation Modal (Section 22)
  const openPauseConfirm = (g: Goal, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setGoalToPause(g);
  };

  // Confirm Pause Goal (Section 22)
  const handleConfirmPause = async () => {
    if (!goalToPause) return;
    await saveGoal({
      ...goalToPause,
      goalStatus: 'พักเป้าหมาย',
    });
    if (detailGoal && detailGoal.id === goalToPause.id) {
      setDetailGoal({ ...detailGoal, goalStatus: 'พักเป้าหมาย' });
    }
    setGoalToPause(null);
  };

  // Resume Goal (Section 23): Switches PAUSED -> ACTIVE directly
  const handleResumeGoal = async (g: Goal, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    await saveGoal({
      ...g,
      goalStatus: 'กำลังออม',
    });
    if (detailGoal && detailGoal.id === g.id) {
      setDetailGoal({ ...detailGoal, goalStatus: 'กำลังออม' });
    }
  };

  // Confirm delete Goal
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteGoal(deleteTarget.id);
    if (detailGoal?.id === deleteTarget.id) setDetailGoal(null);
    setDeleteTarget(null);
  };

  // Seed sample goals from Master Prompt
  const handleSeedSamples = async () => {
    setIsSeeding(true);
    try {
      const defaultSamples = [
        {
          name: 'ดาวน์คอนโด',
          icon: '🏠',
          category: 'บ้านและที่อยู่อาศัย',
          target: 500000,
          deadline: '2027-06-30',
          initialSave: 340000,
          note: 'สำหรับคอนโดใกล้รถไฟฟ้า',
        },
        {
          name: 'ท่องเที่ยวญี่ปุ่น',
          icon: '✈️',
          category: 'การเดินทาง',
          target: 80000,
          deadline: '2026-12-15',
          initialSave: 45000,
          note: 'ทริปชมหิมะและซากุระ',
        },
        {
          name: 'กองทุนฉุกเฉิน',
          icon: '🛡️',
          category: 'เงินสำรองฉุกเฉิน',
          target: 120000,
          deadline: '2027-03-31',
          initialSave: 75000,
          note: 'สำรองค่าใช้จ่าย 6 เดือน',
        },
      ];

      for (const sample of defaultSamples) {
        const goalId = await saveGoal({
          name: sample.name,
          icon: sample.icon,
          category: sample.category,
          target: sample.target,
          deadline: sample.deadline,
          note: sample.note,
          accountId: accounts[0]?.id,
          status: 'ใช้งาน',
          goalStatus: 'กำลังออม',
        });

        // Add initial saving transaction
        if (sample.initialSave > 0 && accounts[0]?.id) {
          await saveTransaction({
            type: 'saving',
            amount: sample.initialSave,
            accountId: accounts[0]?.id,
            goalId,
            date: new Date().toISOString().slice(0, 10),
            description: `เงินสะสมเริ่มต้น: ${sample.name}`,
          });
        }
      }
    } catch (err) {
      console.error('Error seeding goals:', err);
    } finally {
      setIsSeeding(false);
    }
  };

  const getAccountName = (accId?: string) => {
    if (!accId) return 'ไม่ระบุบัญชี';
    const acc = accounts.find(a => a.id === accId);
    return acc ? acc.name : 'ไม่ระบุบัญชี';
  };

  // Format Thai dates
  const formatDateThai = (dStr?: string) => {
    if (!dStr) return '-';
    try {
      const parts = dStr.split('-');
      if (parts.length === 3) {
        const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
        const day = parseInt(parts[2], 10);
        const m = months[parseInt(parts[1], 10) - 1] || parts[1];
        const y = parseInt(parts[0], 10) + 543;
        return `${day} ${m} ${y}`;
      }
      return dStr;
    } catch {
      return dStr;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-5 sm:p-6 border border-[#EAE6DA] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center font-bold shrink-0">
            <PiggyBank className="w-5 h-5 stroke-[2.3]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#17202A] tracking-tight">
              เป้าหมายการออม
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-gray-500 mt-1">
              สร้างเป้าหมายทางการเงิน ติดตามความคืบหน้า และจัดสรรเงินออมอย่างเป็นระบบ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {enrichedGoals.filter(g => g.status === 'ใช้งาน').length === 0 && (
            <button
              onClick={handleSeedSamples}
              disabled={isSeeding}
              className="flex items-center gap-1.5 py-2.5 px-3.5 rounded-2xl bg-white border border-[#EAE6DA] hover:border-[#D97706] text-[#B45309] font-bold text-xs sm:text-sm shadow-xs active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#F59E0B]" />
              <span>{isSeeding ? 'กำลังโหลด...' : 'โหลดตัวอย่าง'}</span>
            </button>
          )}

          <button
            onClick={openAdd}
            className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-[#159B78] hover:bg-[#0F765C] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#159B78]/25 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>สร้างเป้าหมาย</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          SECTION 19: SUMMARY CARDS (4 Metrics)
          1. เป้าหมายทั้งหมด
          2. เงินที่ออมแล้ว
          3. เป้าหมายรวม
          4. ความคืบหน้าโดยรวม
          ======================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* 1. เป้าหมายทั้งหมด */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#EAE6DA] shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">เป้าหมายทั้งหมด</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-[#D97706] flex items-center justify-center">
              <Target className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-xl sm:text-3xl font-black text-[#252525]">
            {totalGoalsCount} <span className="text-xs font-semibold text-gray-400">เป้าหมาย</span>
          </div>
          <p className="text-[11px] text-gray-400 font-medium truncate">
            เป้าหมายที่กำลังดำเนินการ
          </p>
        </div>

        {/* 2. เงินที่ออมแล้ว */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#EAE6DA] shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">เงินที่ออมแล้ว</span>
            <div className="w-8 h-8 rounded-xl bg-[#3F8F72]/15 text-[#3F8F72] flex items-center justify-center">
              <PiggyBank className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-[#3F8F72]">
            ฿{totalSaved.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-gray-400 font-medium truncate">
            ยอดเงินที่จัดสรรแล้วทั้งหมด
          </p>
        </div>

        {/* 3. เป้าหมายรวม */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#EAE6DA] shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">เป้าหมายรวม</span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Wallet className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-gray-800">
            ฿{totalTarget.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-gray-400 font-medium truncate">
            จำนวนเงินเป้าหมายสะสมทั้งหมด
          </p>
        </div>

        {/* 4. ความคืบหน้าโดยรวม */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#EAE6DA] shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">ความคืบหน้าโดยรวม</span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-[#8B5CF6]">
            {overallProgress}%
          </div>
          <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden mt-1">
            <div 
              className="h-full bg-linear-to-r from-[#8B5CF6] to-[#A78BFA] rounded-full transition-all" 
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-[#EAE6DA] shadow-xs gap-1.5 overflow-x-auto">
        {[
          { id: 'all', label: 'ทั้งหมด' },
          { id: 'active', label: 'กำลังออม' },
          { id: 'completed', label: 'บรรลุเป้าหมาย 🎉' },
          { id: 'paused', label: 'พักเป้าหมาย' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTabFilter(tab.id as any)}
            className={`py-2 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
              activeTabFilter === tab.id
                ? 'bg-[#3F8F72] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-[#FAF8F2]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ========================================================
          SECTION 20 & 25: GOAL CARDS
          ======================================================== */}
      {totalGoalsCount === 0 ? (
        /* Empty State (Section 23) */
        <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-[#EAE6DA] shadow-xs space-y-4">
          <div className="w-20 h-20 rounded-3xl bg-[#FFFBEB] border border-[#FDE68A] flex items-center justify-center mx-auto text-4xl shadow-inner">
            🐷
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-lg sm:text-xl font-black text-[#252525]">ยังไม่มีเป้าหมายการออม</h3>
            <p className="text-xs sm:text-sm font-semibold text-gray-500">
              ตั้งเป้าหมายแรก แล้วค่อย ๆ ออมไปด้วยกัน 💚
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={openAdd}
              className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-[#3F8F72] hover:bg-[#2F7259] text-white font-extrabold text-sm shadow-md shadow-[#3F8F72]/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ สร้างเป้าหมาย</span>
            </button>

            <button
              onClick={handleSeedSamples}
              disabled={isSeeding}
              className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-white border border-[#EAE6DA] hover:border-[#F59E0B] text-[#B45309] font-bold text-sm shadow-xs active:scale-95 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-[#F59E0B]" />
              <span>{isSeeding ? 'กำลังโหลด...' : 'โหลดตัวอย่าง 3 เป้าหมาย'}</span>
            </button>
          </div>
        </div>
      ) : filteredGoals.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-[#EAE6DA] shadow-xs space-y-2">
          <p className="text-sm font-bold text-gray-700">ไม่มีเป้าหมายในหมวดนี้</p>
          <button
            onClick={() => setActiveTabFilter('all')}
            className="text-xs font-bold text-[#3F8F72] hover:underline"
          >
            แสดงเป้าหมายทั้งหมด
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGoals.map((g) => {
            const isDone = (g.progress || 0) >= 100;
            const isPaused = g.goalStatus === 'พักเป้าหมาย';

            return (
              <div
                key={g.id}
                onClick={() => setDetailGoal(g)}
                className={`bg-white rounded-3xl p-5 border transition-all flex flex-col justify-between space-y-4 cursor-pointer hover:shadow-md ${
                  isDone 
                    ? 'border-[#3F8F72]/40 bg-linear-to-b from-white to-[#F0F8F5]' 
                    : isPaused 
                    ? 'border-gray-200 opacity-75' 
                    : 'border-[#EAE6DA] hover:border-[#3F8F72]/50'
                }`}
              >
                <div>
                  {/* Top: Icon + Name + Category + Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl p-2 rounded-2xl bg-[#FAF8F2] border border-gray-100 shrink-0">
                        {g.icon || '🎯'}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-extrabold text-[#252525] text-base truncate">{g.name}</h4>
                          {isDone && <span title="บรรลุเป้าหมายแล้ว!">🎉</span>}
                        </div>
                        <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 py-0.5 px-2 rounded-lg inline-block truncate">
                          {g.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <span className={`text-[10px] font-bold py-1 px-2.5 rounded-full ${
                        isDone 
                          ? 'bg-[#3F8F72]/15 text-[#3F8F72]' 
                          : isPaused 
                          ? 'bg-gray-200 text-gray-600' 
                          : g.computedStatus === 'ใกล้ถึงเป้าหมาย' 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-emerald-50 text-[#3F8F72]'
                      }`}>
                        {g.computedStatus}
                      </span>
                    </div>
                  </div>

                  {/* Amounts & Progress */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-baseline justify-between text-xs">
                      <div>
                        <span className="text-gray-400 block text-[10px]">ออมแล้ว</span>
                        <span className="text-lg font-black text-[#133F2E]">
                          ฿{(g.current || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-400 block text-[10px]">เป้าหมาย</span>
                        <span className="text-sm font-bold text-gray-700">
                          ฿{g.target.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2.5 rounded-full bg-gray-100 overflow-hidden relative">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isDone 
                            ? 'bg-[#3F8F72]' 
                            : 'bg-linear-to-r from-[#F59E0B] via-[#10B981] to-[#3F8F72]'
                        }`}
                        style={{ width: `${g.progress || 0}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs font-bold pt-0.5">
                      <span className="text-[#3F8F72]">{g.progress}% สำเร็จ</span>
                      <span className="text-gray-500 font-medium">
                        {isDone ? '🎉 ออมครบแล้ว' : `ขาดอีก ฿${(g.remaining || 0).toLocaleString()}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Bottom: Remaining Days & Action Button */}
                <div className="pt-3 border-t border-gray-100 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>{g.deadline ? formatDateThai(g.deadline) : 'ไม่กำหนดวัน'}</span>
                    </div>
                    {g.daysRemaining !== null && (
                      <span className={`font-semibold ${
                        g.daysRemaining < 0 
                          ? 'text-[#E0533C]' 
                          : g.daysRemaining <= 30 
                          ? 'text-[#F59E0B]' 
                          : 'text-gray-500'
                      }`}>
                        {g.daysRemaining < 0 ? 'เลยกำหนดแล้ว' : `เหลืออีก ${g.daysRemaining} วัน`}
                      </span>
                    )}
                  </div>

                  {/* Button: + เพิ่มเงินออม */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => openDeposit(g, e)}
                      className="flex-1 py-2 px-3 rounded-2xl bg-[#3F8F72] hover:bg-[#2F7259] text-white text-xs font-extrabold shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      <span>+ เพิ่มเงินออม</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEdit(g);
                      }}
                      className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                      title="แก้ไขเป้าหมาย"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================
          CREATE / EDIT GOAL MODAL
          ======================================================== */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#EAE6DA] animate-in zoom-in-95 duration-200 my-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#F59E0B]/20 text-[#D97706] flex items-center justify-center font-bold">
                  <Target className="w-4 h-4 stroke-[2.5]" />
                </div>
                <h3 className="text-lg sm:text-xl font-black text-[#252525]">
                  {editingGoal ? 'แก้ไขเป้าหมายการออม' : 'สร้างเป้าหมายการออม'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsGoalModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-[#E0533C] text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveGoal} className="space-y-4">
              {/* ชื่อเป้าหมาย */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  ชื่อเป้าหมาย <span className="text-[#E0533C]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="เช่น ดาวน์คอนโด, เที่ยวญี่ปุ่น, เงินสำรองฉุกเฉิน"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full py-2.5 px-3.5 rounded-2xl border border-[#EAE6DA] bg-[#FAF8F2] text-sm font-medium text-gray-900 focus:bg-white focus:border-[#3F8F72] focus:outline-hidden"
                  required
                />
              </div>

              {/* Emoji Icon Picker */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  ไอคอนเป้าหมาย (Emoji)
                </label>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-[#FAF8F2] border border-[#EAE6DA] flex items-center justify-center text-2xl shrink-0">
                    {icon || '🎯'}
                  </div>
                  <input
                    type="text"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    placeholder="เลือก Emoji ด้านล่าง"
                    className="flex-1 py-2 px-3 rounded-2xl border border-[#EAE6DA] bg-[#FAF8F2] text-sm"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5 mt-1.5 p-2 bg-[#FAF8F2] rounded-2xl border border-[#EAE6DA] max-h-20 overflow-y-auto">
                  {goalEmojiSuggestions.map(e => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setIcon(e)}
                      className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all ${
                        icon === e ? 'bg-[#3F8F72] text-white shadow-xs' : 'hover:bg-white'
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* หมวดหมู่ */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  หมวดหมู่ <span className="text-[#E0533C]">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full py-2.5 px-3.5 rounded-2xl border border-[#EAE6DA] bg-[#FAF8F2] text-sm font-bold text-gray-900 focus:bg-white focus:border-[#3F8F72] cursor-pointer"
                  required
                >
                  {DEFAULT_GOAL_CATEGORIES.map(c => (
                    <option key={c.name} value={c.name}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* จำนวนเงินเป้าหมาย */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  จำนวนเงินเป้าหมาย (฿) <span className="text-[#E0533C]">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  min="1"
                  placeholder="500,000"
                  value={targetStr}
                  onChange={(e) => setTargetStr(e.target.value)}
                  className="w-full py-2.5 px-3.5 rounded-2xl border border-[#EAE6DA] bg-[#FAF8F2] text-sm font-extrabold text-[#133F2E] focus:bg-white focus:border-[#3F8F72]"
                  required
                />
              </div>

              {/* วันที่เป้าหมาย */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    วันที่เริ่มต้น
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full py-2 px-3 rounded-2xl border border-[#EAE6DA] bg-[#FAF8F2] text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    วันที่เป้าหมาย (Deadline)
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full py-2 px-3 rounded-2xl border border-[#EAE6DA] bg-[#FAF8F2] text-xs font-medium"
                  />
                </div>
              </div>

              {/* บัญชีที่ใช้เก็บเงิน (Optional Reference) */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  บัญชีที่ใช้เก็บเงิน (Optional)
                </label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full py-2.5 px-3.5 rounded-2xl border border-[#EAE6DA] bg-[#FAF8F2] text-sm font-medium"
                >
                  <option value="">⚪ ไม่ระบุบัญชี</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      💳 {acc.name} ({acc.type})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-400 mt-1">
                  * เป็นข้อมูลอ้างอิงเท่านั้น ระบบไม่หักเงินออกจากบัญชีอัตโนมัติ
                </p>
              </div>

              {/* หมายเหตุ */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  หมายเหตุ (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="รายละเอียดเพิ่มเติม เช่น วัตถุประสงค์ หรือแผนการออม"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full py-2 px-3.5 rounded-2xl border border-[#EAE6DA] bg-[#FAF8F2] text-sm resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsGoalModalOpen(false)}
                  className="flex-1 py-3 rounded-2xl border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-sm"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-3 rounded-2xl bg-[#3F8F72] hover:bg-[#2F7259] text-white font-extrabold text-sm shadow-md shadow-[#3F8F72]/20 disabled:opacity-50"
                >
                  {isSaving ? 'กำลังบันทึก...' : (editingGoal ? 'บันทึกการแก้ไข' : 'สร้างเป้าหมาย')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          DEPOSIT MONEY MODAL ("+ เพิ่มเงินออม" - Section 15 & 16)
          ======================================================== */}
      {isDepositModalOpen && depositTargetGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#EAE6DA] animate-in zoom-in-95 duration-200 my-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#3F8F72]/15 text-[#3F8F72] flex items-center justify-center font-bold">
                  <PiggyBank className="w-4 h-4 stroke-[2.5]" />
                </div>
                <h3 className="text-lg sm:text-xl font-black text-[#252525]">
                  เพิ่มเงินออม
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDepositModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Goal Summary Banner */}
            <div className="p-3.5 rounded-2xl bg-[#EDF7F2] border border-[#CFEBE2] mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{depositTargetGoal.icon || '🎯'}</span>
                <div>
                  <h4 className="font-extrabold text-xs text-[#133F2E]">{depositTargetGoal.name}</h4>
                  <p className="text-[11px] text-gray-500">
                    ออมแล้ว ฿{(depositTargetGoal.current || 0).toLocaleString()} / ฿{depositTargetGoal.target.toLocaleString()}
                  </p>
                </div>
              </div>
              <span className="text-xs font-black text-[#3F8F72]">
                {depositTargetGoal.progress}%
              </span>
            </div>

            {depositError && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-[#E0533C] text-xs font-semibold">
                {depositError}
              </div>
            )}

            <form onSubmit={handleDepositSubmit} className="space-y-4">
              {/* จำนวนเงินที่ต้องการออม */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  จำนวนเงินที่ต้องการออม (฿) <span className="text-[#E0533C]">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  min="1"
                  placeholder="เช่น 10,000"
                  value={depositAmountStr}
                  onChange={(e) => setDepositAmountStr(e.target.value)}
                  className="w-full py-2.5 px-3.5 rounded-2xl border border-[#EAE6DA] bg-[#FAF8F2] text-base font-black text-[#3F8F72] focus:bg-white focus:border-[#3F8F72]"
                  required
                  autoFocus
                />
              </div>

              {/* บัญชีที่ใช้ตัดเงิน */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  ตัดเงินจากบัญชี <span className="text-[#E0533C]">*</span>
                </label>
                <select
                  value={depositAccountId}
                  onChange={(e) => setDepositAccountId(e.target.value)}
                  className="w-full py-2.5 px-3.5 rounded-2xl border border-[#EAE6DA] bg-[#FAF8F2] text-sm font-bold text-gray-900 focus:bg-white focus:border-[#3F8F72] cursor-pointer"
                  required
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      💳 {acc.name} (คงเหลือ ฿{(acc.balance ?? acc.opening ?? 0).toLocaleString()})
                    </option>
                  ))}
                </select>
                <div className="flex items-start gap-1.5 mt-1.5 text-[11px] text-gray-500">
                  <Info className="w-3.5 h-3.5 text-[#3F8F72] shrink-0 mt-0.5" />
                  <span>
                    ระบบจะบันทึกเป็นการจัดสรรเงินออม ไม่นับเป็นรายจ่าย และไม่ลดมูลค่าสุทธิ (Net Worth)
                  </span>
                </div>
              </div>

              {/* วันที่ออมเงิน */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  วันที่ออม
                </label>
                <input
                  type="date"
                  value={depositDate}
                  onChange={(e) => setDepositDate(e.target.value)}
                  className="w-full py-2 px-3 rounded-2xl border border-[#EAE6DA] bg-[#FAF8F2] text-sm font-medium"
                  required
                />
              </div>

              {/* หมายเหตุ */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  หมายเหตุ (Optional)
                </label>
                <input
                  type="text"
                  placeholder="เช่น เก็บจากเงินเดือน, โบนัส"
                  value={depositNote}
                  onChange={(e) => setDepositNote(e.target.value)}
                  className="w-full py-2 px-3.5 rounded-2xl border border-[#EAE6DA] bg-[#FAF8F2] text-sm"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsDepositModalOpen(false)}
                  className="flex-1 py-3 rounded-2xl border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-sm"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isDepositing}
                  className="flex-1 py-3 rounded-2xl bg-[#3F8F72] hover:bg-[#2F7259] text-white font-extrabold text-sm shadow-md shadow-[#3F8F72]/20 disabled:opacity-50"
                >
                  {isDepositing ? 'กำลังบันทึก...' : 'ยืนยันเพิ่มเงินออม'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          GOAL DETAIL MODAL (Section 27)
          ======================================================== */}
      {detailGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#EAE6DA] animate-in zoom-in-95 duration-200 my-auto space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2 rounded-2xl bg-[#FAF8F2] border border-gray-100">
                  {detailGoal.icon || '🎯'}
                </span>
                <div>
                  <h3 className="text-lg font-black text-[#252525]">{detailGoal.name}</h3>
                  <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                    {detailGoal.category}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailGoal(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Success Celebration Banner if 100% (Section 28) */}
            {(detailGoal.progress || 0) >= 100 && (
              <div className="p-4 rounded-2xl bg-linear-to-r from-[#FFFBEB] to-[#EDF7F2] border border-[#FDE68A] flex items-center gap-3 animate-in zoom-in-95">
                <PartyPopper className="w-7 h-7 text-[#D97706] shrink-0" />
                <div>
                  <h4 className="font-black text-xs text-[#B45309]">🎉 เป้าหมายสำเร็จแล้ว!</h4>
                  <p className="text-[11px] text-gray-600">
                    คุณออมเงินสำหรับ {detailGoal.name} ครบ ฿{detailGoal.target.toLocaleString()} แล้ว ยอดเยี่ยมมาก!
                  </p>
                </div>
              </div>
            )}

            {/* Progress Card */}
            <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#EAE6DA] space-y-2">
              <div className="flex justify-between items-baseline text-xs">
                <span className="text-gray-500 font-bold">ความคืบหน้า</span>
                <span className="text-base font-black text-[#3F8F72]">{detailGoal.progress}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-white overflow-hidden shadow-inner">
                <div
                  className="h-full bg-linear-to-r from-[#F59E0B] via-[#10B981] to-[#3F8F72] rounded-full transition-all"
                  style={{ width: `${detailGoal.progress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs pt-1">
                <div>
                  <span className="text-gray-400 text-[10px] block">ออมแล้ว</span>
                  <span className="font-extrabold text-[#133F2E]">฿{(detailGoal.current || 0).toLocaleString()}</span>
                </div>
                <div className="text-right">
                  <span className="text-gray-400 text-[10px] block">เป้าหมาย</span>
                  <span className="font-extrabold text-gray-700">฿{detailGoal.target.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Meta details */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-white border border-gray-100">
                <span className="text-gray-400 block text-[10px]">คงเหลือที่ต้องออม</span>
                <span className="text-sm font-black text-[#E0533C]">฿{(detailGoal.remaining || 0).toLocaleString()}</span>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-gray-100">
                <span className="text-gray-400 block text-[10px]">กำหนดวันเป้าหมาย</span>
                <span className="text-xs font-bold text-gray-800">
                  {detailGoal.deadline ? formatDateThai(detailGoal.deadline) : 'ไม่กำหนด'}
                </span>
              </div>
            </div>

            {/* Savings History */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                <History className="w-4 h-4 text-[#3F8F72]" />
                <span>ประวัติการออมเงิน</span>
              </div>
              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                {transactions
                  .filter(tx => tx.goalId === detailGoal.id && tx.status !== 'ลบแล้ว')
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map(tx => (
                    <div
                      key={tx.id}
                      className="p-2.5 rounded-xl border border-gray-100 bg-[#FAF8F2]/60 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-gray-800 block text-xs">{tx.description}</span>
                        <span className="text-[10px] text-gray-400">
                          {formatDateThai(tx.date)} • {getAccountName(tx.accountId)}
                        </span>
                      </div>
                      <span className="font-black text-[#3F8F72] text-xs">
                        +฿{Number(tx.amount).toLocaleString()}
                      </span>
                    </div>
                  ))}
                {transactions.filter(tx => tx.goalId === detailGoal.id && tx.status !== 'ลบแล้ว').length === 0 && (
                  <div className="p-4 text-center text-xs text-gray-400 bg-[#FAF8F2] rounded-xl">
                    ยังไม่มีรายการเพิ่มเงินออม
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const g = detailGoal;
                  setDetailGoal(null);
                  openDeposit(g);
                }}
                className="flex-1 py-2.5 px-4 rounded-2xl bg-[#3F8F72] hover:bg-[#2F7259] text-white text-xs font-extrabold shadow-sm flex items-center justify-center gap-1"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ เพิ่มเงินออม</span>
              </button>

              <button
                type="button"
                onClick={() => togglePauseGoal(detailGoal)}
                className="py-2.5 px-3 rounded-2xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold flex items-center gap-1"
              >
                {detailGoal.goalStatus === 'พักเป้าหมาย' ? (
                  <>
                    <PlayCircle className="w-4 h-4 text-[#3F8F72]" />
                    <span>กลับมาออม</span>
                  </>
                ) : (
                  <>
                    <PauseCircle className="w-4 h-4 text-amber-600" />
                    <span>พักเป้าหมาย</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  const g = detailGoal;
                  setDetailGoal(null);
                  openEdit(g);
                }}
                className="p-2.5 rounded-2xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold"
                title="แก้ไข"
              >
                <Edit3 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setDeleteTarget(detailGoal)}
                className="p-2.5 rounded-2xl border border-rose-200 text-[#E0533C] hover:bg-rose-50 text-xs font-bold"
                title="ลบ"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="ลบเป้าหมายการออม"
        message={`คุณต้องการลบเป้าหมาย "${deleteTarget?.name}" ออกจากระบบใช่หรือไม่? รายการออมเงินในอดีตจะยังคงถูกบันทึกไว้ในระบบ`}
        confirmLabel="ยืนยันการลบ"
        cancelLabel="ยกเลิก"
        isDestructive={true}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
