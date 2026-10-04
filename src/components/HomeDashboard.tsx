import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Transaction } from '../types';
import { 
  Plus, 
  Wallet, 
  CreditCard, 
  PiggyBank, 
  TrendingUp,
  Building2,
  Calendar,
  Layers,
  FileText,
  Target,
  ChevronDown,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Zap,
  LayoutDashboard,
  Utensils,
  Car,
  ShoppingBag,
  Home as HomeIcon,
  HeartPulse,
  Tv,
  GraduationCap,
  Receipt,
  Users,
  Smile,
  Activity,
  Heart,
  Briefcase,
  Tag,
  DollarSign,
  Sun,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  ReceiptText,
  Pause
} from 'lucide-react';
import { NongTangMascot } from '../assets/logo';

interface HomeDashboardProps {
  onOpenAddModal: () => void;
  onNavigateTransactions: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onNavigateAccounts?: () => void;
  onNavigateDebts?: () => void;
  onNavigateSavings?: () => void;
  onNavigateAssets?: () => void;
  onNavigateBudgets?: () => void;
}

// Category Badge Helper with Soft Color Styling matching JODTANG Design System
const CategoryBadge: React.FC<{ name: string; size?: 'sm' | 'md' }> = ({ name, size = 'md' }) => {
  const lower = name.toLowerCase();

  let bgClass = 'bg-[#FFF3ED] text-[#F97316]'; // Food/Drink
  let IconComponent = Utensils;

  if (lower.includes('อาหาร') || lower.includes('กิน') || lower.includes('กาแฟ') || lower.includes('ข้าว') || lower.includes('food')) {
    bgClass = 'bg-[#FFF3ED] text-[#F97316]';
    IconComponent = Utensils;
  } else if (lower.includes('เดินทาง') || lower.includes('รถ') || lower.includes('grab') || lower.includes('น้ำมัน') || lower.includes('bts') || lower.includes('mrt') || lower.includes('transport')) {
    bgClass = 'bg-[#EFF6FF] text-[#2563EB]';
    IconComponent = Car;
  } else if (lower.includes('ช้อป') || lower.includes('ซื้อของ') || lower.includes('เสื้อผ้า') || lower.includes('shopping')) {
    bgClass = 'bg-[#FDF2F4] text-[#F43F5E]';
    IconComponent = ShoppingBag;
  } else if (lower.includes('บ้าน') || lower.includes('คอนโด') || lower.includes('เช่า') || lower.includes('ห้อง') || lower.includes('home')) {
    bgClass = 'bg-[#FEFCE8] text-[#CA8A04]';
    IconComponent = HomeIcon;
  } else if (lower.includes('สุขภาพ') || lower.includes('ยา') || lower.includes('หมอ') || lower.includes('health')) {
    bgClass = 'bg-[#FEF2F2] text-[#DC2626]';
    IconComponent = HeartPulse;
  } else if (lower.includes('บันเทิง') || lower.includes('netflix') || lower.includes('เกม') || lower.includes('หนัง') || lower.includes('entertainment')) {
    bgClass = 'bg-[#FAF5FF] text-[#9333EA]';
    IconComponent = Tv;
  } else if (lower.includes('ศึกษา') || lower.includes('เรียน') || lower.includes('หนังสือ') || lower.includes('education')) {
    bgClass = 'bg-[#EEF2FF] text-[#4F46E5]';
    IconComponent = GraduationCap;
  } else if (lower.includes('สาธารณูปโภค') || lower.includes('น้ำ') || lower.includes('ไฟ') || lower.includes('บิล') || lower.includes('เน็ต') || lower.includes('โทร') || lower.includes('utility')) {
    bgClass = 'bg-[#ECFEFF] text-[#0891B2]';
    IconComponent = Zap;
  } else if (lower.includes('ครอบครัว') || lower.includes('ลูก') || lower.includes('พ่อแม่') || lower.includes('family')) {
    bgClass = 'bg-[#F0FDF4] text-[#16A34A]';
    IconComponent = Users;
  } else if (lower.includes('สัตว์') || lower.includes('หมา') || lower.includes('แมว') || lower.includes('pet')) {
    bgClass = 'bg-[#FFFBEB] text-[#D97706]';
    IconComponent = Smile;
  } else if (lower.includes('กีฬา') || lower.includes('ฟิตเนส') || lower.includes('sport')) {
    bgClass = 'bg-[#ECFDF5] text-[#059669]';
    IconComponent = Activity;
  } else if (lower.includes('บริจาค') || lower.includes('ทำบุญ') || lower.includes('donation')) {
    bgClass = 'bg-[#FFF1F2] text-[#E11D48]';
    IconComponent = Heart;
  } else if (lower.includes('ธุรกิจ') || lower.includes('งาน') || lower.includes('business')) {
    bgClass = 'bg-[#F0F9FF] text-[#0284C7]';
    IconComponent = Briefcase;
  } else if (lower.includes('เงินเดือน') || lower.includes('รายได้') || lower.includes('salary') || lower.includes('income')) {
    bgClass = 'bg-[#ECFDF5] text-[#059669]';
    IconComponent = DollarSign;
  } else {
    bgClass = 'bg-[#F8F6EF] text-[#7A8490]';
    IconComponent = Tag;
  }

  const boxSize = size === 'sm' ? 'w-8 h-8 rounded-xl' : 'w-10 h-10 rounded-2xl';
  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <div className={`${boxSize} ${bgClass} flex items-center justify-center font-bold shrink-0 transition-transform hover:scale-105`}>
      <IconComponent className={`${iconSize} stroke-[2.2]`} />
    </div>
  );
};

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onOpenAddModal,
  onNavigateTransactions,
  onEditTransaction,
  onNavigateAccounts,
  onNavigateDebts,
  onNavigateSavings,
  onNavigateAssets,
  onNavigateBudgets,
}) => {
  const { 
    user, 
    totalBalance, 
    totalDebtRemaining,
    totalSavingsCurrent,
    totalAssetValue,
    netWorth,
    transactions,
    accounts,
    expenseCats,
    budgets,
    debts,
    goals,
    assets,
    isDemoActive,
    loadDemoData
  } = useApp();

  // Selected Month (defaults to current YYYY-MM)
  const currentMonthStr = useMemo(() => new Date().toISOString().slice(0, 7), []);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);

  // Chart range: daily (รายวัน), weekly (รายสัปดาห์), monthly (รายเดือน), yearly (รายปี) (Requirement 9)
  type ChartGranularity = 'daily' | 'weekly' | 'monthly' | 'yearly';
  const [chartRange, setChartRange] = useState<ChartGranularity>('daily');

  // Chart hover state
  const [hoveredPoint, setHoveredPoint] = useState<{ date: string; income: number; expense: number; x: number } | null>(null);

  // Thai Date formatting for today
  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);
  
  const todayThaiDate = useMemo(() => {
    const now = new Date();
    const months = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
    const day = now.getDate();
    const m = months[now.getMonth()];
    const y = now.getFullYear() + 543;
    return `${day} ${m} ${y}`;
  }, []);

  const monthDisplayName = useMemo(() => {
    try {
      const [year, month] = selectedMonth.split('-');
      const months = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
      ];
      const mIdx = parseInt(month, 10) - 1;
      const thaiYear = parseInt(year, 10) + 543;
      return `${months[mIdx]} ${thaiYear}`;
    } catch {
      return selectedMonth;
    }
  }, [selectedMonth]);

  // ========================================================
  // 1. TODAY DATA CALCULATIONS
  // ========================================================
  const { todayInc, todayExp, todayRem, todayIncCount, todayExpCount } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    let incCount = 0;
    let expCount = 0;

    transactions.forEach(tx => {
      if (tx.status === 'ลบแล้ว') return;
      if (tx.date !== todayIso) return;
      const amt = Number(tx.amount) || 0;
      if (tx.type === 'income' || tx.type === 'refund' || tx.type === 'receivable_receipt') {
        inc += amt;
        incCount++;
      } else if (tx.type === 'expense' || tx.type === 'subscription' || tx.type === 'debt_payment') {
        exp += amt;
        expCount++;
      }
    });

    return {
      todayInc: inc,
      todayExp: exp,
      todayRem: inc - exp,
      todayIncCount: incCount,
      todayExpCount: expCount,
    };
  }, [transactions, todayIso]);

  // ========================================================
  // 2. MONTHLY DATA & GROWTH CALCULATIONS
  // ========================================================
  const { 
    monthlyInc, 
    monthlyExp, 
    incGrowthPct, 
    expGrowthPct,
    monthlyIncCount,
    monthlyExpCount
  } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    let incCount = 0;
    let expCount = 0;
    let prevInc = 0;
    let prevExp = 0;

    const [yearStr, monthStr] = selectedMonth.split('-');
    const y = parseInt(yearStr, 10);
    const m = parseInt(monthStr, 10);
    const prevMonthDate = new Date(y, m - 2, 1);
    const prevMonthStr = prevMonthDate.toISOString().slice(0, 7);

    transactions.forEach(tx => {
      if (tx.status === 'ลบแล้ว') return;
      const amt = Number(tx.amount) || 0;
      const txMonth = tx.date.slice(0, 7);

      if (txMonth === selectedMonth) {
        if (tx.type === 'income' || tx.type === 'refund' || tx.type === 'receivable_receipt') {
          inc += amt;
          incCount++;
        } else if (tx.type === 'expense' || tx.type === 'subscription' || tx.type === 'debt_payment') {
          exp += amt;
          expCount++;
        }
      } else if (txMonth === prevMonthStr) {
        if (tx.type === 'income' || tx.type === 'refund' || tx.type === 'receivable_receipt') {
          prevInc += amt;
        } else if (tx.type === 'expense' || tx.type === 'subscription' || tx.type === 'debt_payment') {
          prevExp += amt;
        }
      }
    });

    const incGrowth = prevInc > 0 ? Math.round(((inc - prevInc) / prevInc) * 100) : 0;
    const expGrowth = prevExp > 0 ? Math.round(((exp - prevExp) / prevExp) * 100) : 0;

    return {
      monthlyInc: inc,
      monthlyExp: exp,
      incGrowthPct: incGrowth,
      expGrowthPct: expGrowth,
      monthlyIncCount: incCount,
      monthlyExpCount: expCount,
    };
  }, [transactions, selectedMonth]);

  // ========================================================
  // 3. TODAY SPENDABLE CALCULATION (วันนี้ใช้ได้)
  // ========================================================
  const todaySpendableData = useMemo(() => {
    const [yearStr, monthStr] = selectedMonth.split('-');
    const y = parseInt(yearStr, 10);
    const m = parseInt(monthStr, 10);
    const daysInMonth = new Date(y, m, 0).getDate();
    const currentDay = Math.min(new Date().getDate(), daysInMonth);
    const remainingDays = Math.max(1, daysInMonth - currentDay + 1);

    const monthBudgets = budgets.filter(b => b.month === selectedMonth && b.status === 'ใช้งาน');
    const totalBudgetAmt = monthBudgets.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
    const effectiveBudget = totalBudgetAmt;
    const remainingBudget = Math.max(0, effectiveBudget - monthlyExp);
    const dailyLimit = remainingDays > 0 && effectiveBudget > 0 ? Math.round(remainingBudget / remainingDays) : 0;

    const todaySpent = todayExp;
    const remainingToday = Math.max(0, dailyLimit - todaySpent);
    const progressPct = dailyLimit > 0 ? Math.min(100, Math.round((todaySpent / dailyLimit) * 100)) : 0;

    let statusText = 'ใช้ได้สบาย';
    let statusBadgeClass = 'bg-[#EBF7F2] text-[#159B78] border-[#CFEBE2]';
    let isOverDaily = false;

    if (effectiveBudget === 0) {
      statusText = 'ยังไม่ตั้งงบ';
      statusBadgeClass = 'bg-[#FAF8F2] text-gray-500 border-[#EAE6DA]';
    } else if (todaySpent > dailyLimit) {
      statusText = 'เกินแผน';
      statusBadgeClass = 'bg-[#FDF2F2] text-[#F36B5B] border-[#FAD2D2]';
      isOverDaily = true;
    } else if (progressPct >= 80) {
      statusText = 'ควรระวัง';
      statusBadgeClass = 'bg-[#FEF7EE] text-[#F59E0B] border-[#FDE68A]';
    }

    return {
      dailyLimit,
      todaySpent,
      remainingToday,
      progressPct,
      remainingDays,
      statusText,
      statusBadgeClass,
      isOverDaily,
    };
  }, [selectedMonth, budgets, monthlyExp, todayExp]);

  // ========================================================
  // 4. TODAY CATEGORY SPENDING (หมวดหมู่ที่ใช้จ่ายวันนี้)
  // ========================================================
  const todayCategorySpending = useMemo(() => {
    const catMap: { [key: string]: { name: string; amount: number } } = {};
    let totalSpent = 0;

    transactions.forEach(tx => {
      if (tx.status === 'ลบแล้ว') return;
      if (tx.date !== todayIso) return;
      if (tx.type === 'expense' || tx.type === 'subscription' || tx.type === 'debt_payment') {
        const amt = Number(tx.amount) || 0;
        totalSpent += amt;
        const cat = expenseCats.find(c => c.id === tx.categoryId);
        const name = cat?.name || tx.description || 'อื่น ๆ';
        if (!catMap[name]) {
          catMap[name] = { name, amount: 0 };
        }
        catMap[name].amount += amt;
      }
    });

    const list = Object.values(catMap).sort((a, b) => b.amount - a.amount);
    const withPct = list.slice(0, 5).map(item => ({
      ...item,
      pct: totalSpent > 0 ? Math.round((item.amount / totalSpent) * 100) : 0,
    }));

    return {
      list: withPct,
      totalSpent,
    };
  }, [transactions, todayIso, expenseCats]);

  // ========================================================
  // 5. CHART DATA (แนวโน้มรายรับ - รายจ่าย: รายวัน / รายสัปดาห์ / รายเดือน / รายปี) (Requirement 9)
  // ========================================================
  const chartData = useMemo(() => {
    const now = new Date();

    if (chartRange === 'daily') {
      // รายวัน: 14 วันล่าสุด (แสดงผลชัดเจน อ่านง่าย ไม่แน่นเกินไป)
      const dates: string[] = [];
      for (let i = 13; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        dates.push(d.toISOString().slice(0, 10));
      }

      const dailyIncMap: { [date: string]: number } = {};
      const dailyExpMap: { [date: string]: number } = {};

      transactions.forEach(tx => {
        if (tx.status === 'ลบแล้ว') return;
        const amt = Number(tx.amount) || 0;
        if (tx.type === 'income' || tx.type === 'refund' || tx.type === 'receivable_receipt') {
          dailyIncMap[tx.date] = (dailyIncMap[tx.date] || 0) + amt;
        } else if (tx.type === 'expense' || tx.type === 'subscription' || tx.type === 'debt_payment') {
          dailyExpMap[tx.date] = (dailyExpMap[tx.date] || 0) + amt;
        }
      });

      return dates.map(d => ({
        date: d,
        income: dailyIncMap[d] || 0,
        expense: dailyExpMap[d] || 0,
        label: d.slice(8) + '/' + d.slice(5, 7),
      }));
    }

    if (chartRange === 'weekly') {
      // รายสัปดาห์: 8 สัปดาห์ล่าสุด
      const weeks: { start: string; end: string; label: string; tooltip: string }[] = [];
      for (let w = 7; w >= 0; w--) {
        const endD = new Date(now);
        endD.setDate(endD.getDate() - w * 7);
        const startD = new Date(endD);
        startD.setDate(startD.getDate() - 6);
        const startIso = startD.toISOString().slice(0, 10);
        const endIso = endD.toISOString().slice(0, 10);
        const label = `${startIso.slice(8)}/${startIso.slice(5, 7)}`;
        const tooltip = `${startIso.slice(8)}/${startIso.slice(5, 7)} - ${endIso.slice(8)}/${endIso.slice(5, 7)}`;
        weeks.push({ start: startIso, end: endIso, label, tooltip });
      }

      return weeks.map((wk, idx) => {
        let inc = 0;
        let exp = 0;
        transactions.forEach(tx => {
          if (tx.status === 'ลบแล้ว') return;
          if (tx.date >= wk.start && tx.date <= wk.end) {
            const amt = Number(tx.amount) || 0;
            if (tx.type === 'income' || tx.type === 'refund' || tx.type === 'receivable_receipt') {
              inc += amt;
            } else if (tx.type === 'expense' || tx.type === 'subscription' || tx.type === 'debt_payment') {
              exp += amt;
            }
          }
        });
        return {
          date: `สัปดาห์ที่ ${idx + 1} (${wk.tooltip})`,
          income: inc,
          expense: exp,
          label: `W${idx + 1}`,
        };
      });
    }

    if (chartRange === 'monthly') {
      // รายเดือน: 12 เดือนของปีปัจจุบัน
      const thaiMonthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
      const thaiFullMonths = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
      const [yearStr] = selectedMonth.split('-');
      const year = parseInt(yearStr || '2026', 10);
      const thaiYear = year + 543;

      const monthlyList = [];
      for (let m = 1; m <= 12; m++) {
        const mStr = `${year}-${String(m).padStart(2, '0')}`;
        let inc = 0;
        let exp = 0;
        transactions.forEach(tx => {
          if (tx.status === 'ลบแล้ว') return;
          if (tx.date.startsWith(mStr)) {
            const amt = Number(tx.amount) || 0;
            if (tx.type === 'income' || tx.type === 'refund' || tx.type === 'receivable_receipt') {
              inc += amt;
            } else if (tx.type === 'expense' || tx.type === 'subscription' || tx.type === 'debt_payment') {
              exp += amt;
            }
          }
        });
        monthlyList.push({
          date: `${thaiFullMonths[m - 1]} ${thaiYear}`,
          income: inc,
          expense: exp,
          label: thaiMonthNames[m - 1],
        });
      }
      return monthlyList;
    }

    if (chartRange === 'yearly') {
      // รายปี: 5 ปีล่าสุด
      const currentYear = now.getFullYear();
      const yearsList = [];
      for (let y = currentYear - 4; y <= currentYear; y++) {
        const yStr = String(y);
        const thaiY = y + 543;
        let inc = 0;
        let exp = 0;
        transactions.forEach(tx => {
          if (tx.status === 'ลบแล้ว') return;
          if (tx.date.startsWith(yStr)) {
            const amt = Number(tx.amount) || 0;
            if (tx.type === 'income' || tx.type === 'refund' || tx.type === 'receivable_receipt') {
              inc += amt;
            } else if (tx.type === 'expense' || tx.type === 'subscription' || tx.type === 'debt_payment') {
              exp += amt;
            }
          }
        });
        yearsList.push({
          date: `ปี พ.ศ. ${thaiY}`,
          income: inc,
          expense: exp,
          label: String(thaiY),
        });
      }
      return yearsList;
    }

    return [];
  }, [transactions, chartRange, selectedMonth]);

  const chartSubtitle = useMemo(() => {
    switch (chartRange) {
      case 'daily': return 'เปรียบเทียบการเงินรายวัน (14 วันล่าสุด)';
      case 'weekly': return 'เปรียบเทียบการเงินรายสัปดาห์ (8 สัปดาห์ล่าสุด)';
      case 'monthly': return 'เปรียบเทียบการเงินรายเดือน (12 เดือนของปี)';
      case 'yearly': return 'เปรียบเทียบการเงินรายปี (5 ปีย้อนหลัง)';
    }
  }, [chartRange]);

  const chartMax = useMemo(() => {
    const maxVal = Math.max(...chartData.map(d => Math.max(d.income, d.expense)), 3000);
    return maxVal * 1.15;
  }, [chartData]);

  // SVG Coordinates for Chart
  const svgChart = useMemo(() => {
    const width = 800;
    const height = 220;
    const paddingX = 35;
    const paddingY = 25;
    const plotW = width - paddingX * 2;
    const plotH = height - paddingY * 2;
    const n = chartData.length;
    const barWidth = Math.min(20, Math.max(5, (plotW / n) * 0.32));

    const points = chartData.map((d, i) => {
      const x = paddingX + (i / Math.max(1, n - 1)) * plotW;
      const yInc = height - paddingY - (d.income / chartMax) * plotH;
      const yExp = height - paddingY - (d.expense / chartMax) * plotH;
      return {
        ...d,
        x,
        yInc,
        yExp,
        hInc: (d.income / chartMax) * plotH,
        hExp: (d.expense / chartMax) * plotH,
      };
    });

    return {
      width,
      height,
      points,
      barWidth,
      paddingY,
    };
  }, [chartData, chartMax]);

  // Bank icon helper
  const getAccountIcon = (accType: string, accName: string) => {
    const lower = accName.toLowerCase();
    if (lower.includes('kbank') || lower.includes('กสิกร')) return '🟢';
    if (lower.includes('scb') || lower.includes('ไทยพาณิชย์')) return '🟣';
    if (lower.includes('bbl') || lower.includes('กรุงเทพ')) return '🔵';
    if (lower.includes('krungsri') || lower.includes('กรุงศรี')) return '🟡';
    if (lower.includes('ttb') || lower.includes('ทหารไทย')) return '🔷';
    if (accType === 'เงินสด') return '💵';
    if (accType === 'บัตรเครดิต') return '💳';
    if (accType === 'e-Wallet' || accType === 'ทรูมันนี่') return '📱';
    if (accType === 'การลงทุน' || accType === 'พอร์ตหุ้น') return '📈';
    return '🏦';
  };

  // Recent transactions list
  const recentTransactions = useMemo(() => {
    return transactions
      .filter(t => t.status !== 'ลบแล้ว')
      .slice(0, 4);
  }, [transactions]);

  // Budget summary
  const budgetSummary = useMemo(() => {
    const monthBudgets = budgets.filter(b => b.month === selectedMonth && b.status === 'ใช้งาน');
    const totalAllocated = monthBudgets.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
    const spent = monthlyExp;
    const spentPct = totalAllocated > 0 ? Math.min(100, Math.round((spent / totalAllocated) * 100)) : 0;
    return {
      totalAllocated,
      spent,
      remaining: Math.max(0, totalAllocated - spent),
      spentPct,
    };
  }, [budgets, selectedMonth, monthlyExp]);

  const userName = user?.displayName || 'คุณ Jelliline Daae';

  return (
    <div className="max-w-7xl mx-auto space-y-6 lg:space-y-7 animate-in fade-in duration-300 pb-24 font-['IBM_Plex_Sans_Thai',sans-serif]">
      
      {/* ========================================================
          1. HEADER WITH FRIENDLY GREETING SPEECH BUBBLE & MASCOT
          ======================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-3xl p-5 sm:p-6 border border-[#EAE6DA] shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-[#159B78]/15 text-[#159B78] flex items-center justify-center font-bold shrink-0">
            <LayoutDashboard className="w-5 h-5 stroke-[2.3]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#17202A] tracking-tight">
              ภาพรวมการเงิน
            </h1>
            <div className="relative inline-flex items-center mt-1">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
              />
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#159B78] hover:text-[#0F765C] cursor-pointer">
                <Calendar className="w-4 h-4" />
                <span>{monthDisplayName}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Greeting Anchor: Mascot + Speech Bubble (From Reference Mockup) */}
        <div className="flex items-center gap-3 self-end md:self-auto bg-[#FBF9F4] py-2 px-3.5 rounded-2xl border border-[#EAE6DA]">
          <div className="text-right">
            <span className="text-xs font-black text-[#17202A] block">
              สวัสดีค่ะ {userName} 👋
            </span>
            <span className="text-[11px] font-semibold text-gray-400 block">
              วันนี้การเงินเป็นยังไงบ้าง?
            </span>
          </div>
          <NongTangMascot className="w-9 h-9 shrink-0 drop-shadow-xs" />
        </div>
      </div>

      {/* Onboarding / Clean State Prompt */}
      {!isDemoActive && transactions.length === 0 && (
        <div className="rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50 to-[#FAF8F2] border border-[#159B78]/30 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#159B78] text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
              <Sparkles className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm sm:text-base text-[#17202A]">
                ยินดีต้อนรับสู่ จดตังค์ (JODTANG) — ตอนนี้ระบบว่างเปล่า (ค่าทุกอย่างเป็น 0)
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">
                คุณสามารถกด <strong>[ + ] จดตังค์</strong> เพื่อเริ่มจดรายการจริง หรือกด <strong>โหลดข้อมูลตัวอย่าง</strong> เพื่อทดลองดูภาพรวมระบบ
              </p>
            </div>
          </div>
          <button
            onClick={() => loadDemoData(true)}
            className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-[#159B78] hover:bg-[#0F765C] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#159B78]/20 active:scale-95 transition-all shrink-0 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>🚀 โหลดข้อมูลตัวอย่าง (Demo Data)</span>
          </button>
        </div>
      )}

      {/* ========================================================
          2. HERO: “สรุปการใช้จ่ายวันนี้” (LARGE FEATURED SECTION)
          Matches Reference Mockup with Mascot & Big Action Button
          ======================================================== */}
      <div className="relative overflow-hidden rounded-[26px] bg-white border border-[#EAE6DA] shadow-xs p-6 sm:p-7 lg:p-8 space-y-6">
        
        {/* Top Header of Hero Card */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#159B78] flex items-center justify-center text-white font-bold shadow-xs">
              <ReceiptText className="w-4 h-4 stroke-[2.5]" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#17202A] tracking-tight">
              สรุปการใช้จ่ายวันนี้
            </h2>
          </div>
          
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-gray-400 bg-[#FAF8F2] px-3 py-1 rounded-xl border border-[#EAE6DA]/60">
            <Calendar className="w-3.5 h-3.5 text-[#159B78]" />
            <span>{todayThaiDate}</span>
          </div>
        </div>

        {/* 3 Metrics Cards Grid - Full 3 Columns across the top (Spacious & Prominent) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-5">
          
          {/* Card 1: รายรับวันนี้ */}
          <div className="p-5 rounded-2xl bg-[#FAF8F2] border border-[#EAE6DA]/80 space-y-2 hover:border-[#159B78]/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-gray-500">รายรับวันนี้</span>
              <div className="w-8 h-8 rounded-xl bg-[#159B78]/15 text-[#159B78] flex items-center justify-center font-bold">
                <FileText className="w-4 h-4 stroke-[2.3]" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#159B78] tracking-tight">
              ฿{todayInc.toLocaleString('th-TH', { minimumFractionDigits: 0 })}
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-gray-400">
              <span className="text-[#159B78] font-bold">↑</span>
              <span>{todayIncCount} รายการ</span>
            </div>
          </div>

          {/* Card 2: รายจ่ายวันนี้ */}
          <div className="p-5 rounded-2xl bg-[#FAF8F2] border border-[#EAE6DA]/80 space-y-2 hover:border-[#F36B5B]/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-gray-500">รายจ่ายวันนี้</span>
              <div className="w-8 h-8 rounded-xl bg-[#FF8F7A]/20 text-[#F36B5B] flex items-center justify-center font-bold">
                <ShoppingBag className="w-4 h-4 stroke-[2.3]" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#F36B5B] tracking-tight">
              ฿{todayExp.toLocaleString('th-TH', { minimumFractionDigits: 0 })}
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-gray-400">
              <span className="text-[#F36B5B] font-bold">↓</span>
              <span>{todayExpCount} รายการ</span>
            </div>
          </div>

          {/* Card 3: คงเหลือวันนี้ */}
          <div className="p-5 rounded-2xl bg-[#FAF8F2] border border-[#EAE6DA]/80 space-y-2 hover:border-[#F6B91A]/50 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-gray-500">คงเหลือวันนี้</span>
              <div className="w-8 h-8 rounded-xl bg-[#F6B91A]/20 text-[#B45309] flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4 stroke-[2.3]" />
              </div>
            </div>
            <div className={`text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight ${
              todayRem >= 0 ? 'text-[#17202A]' : 'text-[#F36B5B]'
            }`}>
              ฿{todayRem.toLocaleString('th-TH', { minimumFractionDigits: 0 })}
            </div>
            <div className="text-xs font-semibold text-gray-400">
              รายรับ - รายจ่ายวันนี้
            </div>
          </div>

        </div>

        {/* Bottom Action Row (Underneath the 3 Cards - matching user drawing) */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-linear-to-r from-[#FFFDF5] via-[#FAF8F2] to-[#EDF7F2] border border-[#EAE6DA]">
          
          {/* Friendly Mascot with Speech Bubble */}
          <div className="flex items-center gap-3">
            <NongTangMascot className="w-13 h-13 sm:w-15 sm:h-15 shrink-0 drop-shadow-xs" />
            <div className="bg-white py-2 px-4 rounded-2xl border border-[#EAE6DA] shadow-2xs text-xs sm:text-sm font-bold text-[#17202A] animate-in fade-in">
              {todayRem >= 0 ? 'เก่งมากเลย! วันนี้เหลือเงินตั้งเยอะ 😋' : 'วันนี้ใช้เงินเกินแผนนิดหน่อย พรุ่งนี้ลุยใหม่นะ! 🌱'}
            </div>
          </div>

          {/* Primary Action Button: [ + ] จดตังค์ */}
          <button
            type="button"
            onClick={onOpenAddModal}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-8 rounded-2xl bg-[#159B78] hover:bg-[#0F765C] text-white font-bold text-base shadow-md shadow-[#159B78]/25 active:scale-95 transition-all cursor-pointer h-[48px] shrink-0"
          >
            <Plus className="w-5 h-5 stroke-[3]" />
            <span>จดตังค์</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          3. ROW 2: MONTHLY INCOME / EXPENSE & TODAY SPENDABLE
          ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Card 1: รายรับเดือนนี้ */}
        <div 
          onClick={onNavigateTransactions}
          className="bg-white rounded-[22px] p-6 border border-[#EAE6DA] shadow-xs flex flex-col justify-between space-y-3 cursor-pointer hover:border-[#159B78]/50 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CategoryBadge name="เงินเดือน" size="sm" />
              <span className="text-sm font-bold text-gray-500">
                รายรับเดือนนี้
              </span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-[#159B78]/15 text-[#159B78] flex items-center justify-center font-black">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="text-3xl sm:text-4xl font-black text-[#159B78] tracking-tight">
              ฿{monthlyInc.toLocaleString('th-TH', { minimumFractionDigits: 0 })}
            </div>
            <div className="flex items-center justify-between text-xs font-semibold text-gray-400 mt-2">
              <span className={`font-bold ${incGrowthPct >= 0 ? 'text-[#159B78]' : 'text-gray-500'}`}>
                {incGrowthPct >= 0 ? `↑ +${incGrowthPct}%` : `↓ ${incGrowthPct}%`} จากเดือนก่อน
              </span>
              <span>{monthlyIncCount} รายการ</span>
            </div>
          </div>
        </div>

        {/* Card 2: รายจ่ายเดือนนี้ */}
        <div 
          onClick={onNavigateTransactions}
          className="bg-white rounded-[22px] p-6 border border-[#EAE6DA] shadow-xs flex flex-col justify-between space-y-3 cursor-pointer hover:border-[#F36B5B]/50 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CategoryBadge name="ช้อปปิ้ง" size="sm" />
              <span className="text-sm font-bold text-gray-500">
                รายจ่ายเดือนนี้
              </span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-[#F36B5B]/15 text-[#F36B5B] flex items-center justify-center font-black">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="text-3xl sm:text-4xl font-black text-[#F36B5B] tracking-tight">
              ฿{monthlyExp.toLocaleString('th-TH', { minimumFractionDigits: 0 })}
            </div>
            <div className="flex items-center justify-between text-xs font-semibold text-gray-400 mt-2">
              <span className={`font-bold ${expGrowthPct <= 0 ? 'text-[#159B78]' : 'text-[#F36B5B]'}`}>
                {expGrowthPct <= 0 ? `↓ ${Math.abs(expGrowthPct)}%` : `↑ +${expGrowthPct}%`} จากเดือนก่อน
              </span>
              <span>{monthlyExpCount} รายการ</span>
            </div>
          </div>
        </div>

        {/* Card 3: วันนี้ใช้ได้ (Today Spendable) */}
        <div 
          onClick={onNavigateBudgets}
          className="bg-white rounded-[22px] p-6 border border-[#EAE6DA] shadow-xs flex flex-col justify-between space-y-3 cursor-pointer hover:border-amber-400 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#FFFBEB] text-[#D97706] flex items-center justify-center">
                <Sun className="w-4 h-4 stroke-[2.3]" />
              </div>
              <span className="text-sm font-bold text-gray-500">
                วันนี้ใช้ได้
              </span>
            </div>
            
            {/* Status Badge */}
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${todaySpendableData.statusBadgeClass} flex items-center gap-1`}>
              <span>●</span>
              <span>{todaySpendableData.statusText}</span>
              <ChevronRight className="w-3 h-3" />
            </span>
          </div>

          <div>
            <div className="text-3xl sm:text-4xl font-black text-[#17202A] tracking-tight">
              ฿{todaySpendableData.dailyLimit.toLocaleString()} <span className="text-sm font-bold text-gray-400">/ วัน</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 rounded-full bg-[#FAF8F2] border border-[#EAE6DA] overflow-hidden mt-3">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  todaySpendableData.isOverDaily 
                    ? 'bg-[#F36B5B]' 
                    : todaySpendableData.progressPct > 80 
                    ? 'bg-amber-500' 
                    : 'bg-[#159B78]'
                }`}
                style={{ width: `${Math.min(100, todaySpendableData.progressPct)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs font-semibold text-gray-400 mt-2">
              <span>ใช้ไปแล้ววันนี้ ฿{todaySpendableData.todaySpent.toLocaleString()}</span>
              <span className={todaySpendableData.isOverDaily ? 'text-[#F36B5B] font-bold' : 'text-[#159B78] font-bold'}>
                เหลือ ฿{todaySpendableData.remainingToday.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================
          4. ROW 3: CHART (แนวโน้มรายรับ - รายจ่าย) + TODAY CATEGORIES
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left (8 cols): แนวโน้มรายรับ - รายจ่าย */}
        <div className="lg:col-span-8 bg-white rounded-[24px] p-6 border border-[#EAE6DA] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#159B78]/15 text-[#159B78] flex items-center justify-center font-bold">
                <TrendingUp className="w-4 h-4 stroke-[2.3]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-[#17202A]">
                  แนวโน้มรายรับ - รายจ่าย
                </h3>
                <p className="text-xs text-gray-400 font-medium">
                  {chartSubtitle}
                </p>
              </div>
            </div>

            {/* Filter Pills: รายวัน | รายสัปดาห์ | รายเดือน | รายปี (Requirement 9) */}
            <div className="flex items-center gap-1 bg-[#FAF8F2] p-1 rounded-2xl border border-[#EAE6DA] self-start sm:self-auto flex-wrap">
              {[
                { id: 'daily', label: 'รายวัน' },
                { id: 'weekly', label: 'รายสัปดาห์' },
                { id: 'monthly', label: 'รายเดือน' },
                { id: 'yearly', label: 'รายปี' },
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setChartRange(tab.id as ChartGranularity)}
                  className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    chartRange === tab.id
                      ? 'bg-white text-[#17202A] shadow-2xs'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs font-bold pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#159B78]" />
              <span className="text-gray-600">รายรับ</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#FF8F7A]" />
              <span className="text-gray-600">รายจ่าย</span>
            </div>
          </div>

          {/* SVG Chart Graphic */}
          <div className="relative w-full h-[200px] pt-2">
            <svg
              viewBox={`0 0 ${svgChart.width} ${svgChart.height}`}
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              {[0.25, 0.5, 0.75, 1.0].map((ratio, idx) => (
                <line
                  key={idx}
                  x1="30"
                  y1={svgChart.height * (1 - ratio * 0.85)}
                  x2={svgChart.width - 30}
                  y2={svgChart.height * (1 - ratio * 0.85)}
                  stroke="#EAE6DA"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
              ))}

              {svgChart.points.map((pt, idx) => {
                const xInc = pt.x - svgChart.barWidth - 2;
                const xExp = pt.x + 2;
                return (
                  <g key={idx}>
                    {pt.hInc > 0 && (
                      <rect
                        x={xInc}
                        y={pt.yInc}
                        width={svgChart.barWidth}
                        height={Math.max(3, pt.hInc)}
                        rx="4"
                        fill="#159B78"
                        className="opacity-95 hover:opacity-100"
                      />
                    )}
                    {pt.hExp > 0 && (
                      <rect
                        x={xExp}
                        y={pt.yExp}
                        width={svgChart.barWidth}
                        height={Math.max(3, pt.hExp)}
                        rx="4"
                        fill="#FF8F7A"
                        className="opacity-95 hover:opacity-100"
                      />
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip Listener */}
            <div className="absolute inset-0 flex">
              {svgChart.points.map((pt, idx) => (
                <div
                  key={idx}
                  className="flex-1 h-full cursor-pointer"
                  onMouseEnter={() => setHoveredPoint(pt)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              ))}
            </div>

            {/* Floating Tooltip */}
            {hoveredPoint && (
              <div
                className="absolute z-20 pointer-events-none bg-[#17202A] text-white py-1.5 px-3 rounded-2xl shadow-xl text-center border border-white/20 transform -translate-x-1/2 -translate-y-full mb-2 animate-in zoom-in-95 duration-150"
                style={{
                  left: `${(hoveredPoint.x / svgChart.width) * 100}%`,
                  top: `30%`,
                }}
              >
                <div className="text-[10px] text-gray-300 font-medium">{hoveredPoint.date}</div>
                <div className="text-xs font-black text-[#159B78]">
                  เข้า: ฿{hoveredPoint.income.toLocaleString()}
                </div>
                <div className="text-xs font-black text-[#FF8F7A]">
                  ออก: ฿{hoveredPoint.expense.toLocaleString()}
                </div>
              </div>
            )}
          </div>

          {/* Date Axis */}
          <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 pt-1 border-t border-gray-100 overflow-x-auto">
            {chartRange === 'yearly' ? (
              chartData.map((d, i) => (
                <span key={i}>{d.label}</span>
              ))
            ) : chartRange === 'monthly' ? (
              ['ม.ค.', 'เม.ย.', 'ก.ค.', 'ต.ค.', 'ธ.ค.'].map((m, i) => (
                <span key={i}>{m}</span>
              ))
            ) : chartRange === 'weekly' ? (
              chartData.filter((_, i) => i % 2 === 0 || i === chartData.length - 1).map((d, i) => (
                <span key={i}>{d.label}</span>
              ))
            ) : (
              <>
                <span>{chartData[0]?.label || ''}</span>
                <span>{chartData[Math.floor(chartData.length / 2)]?.label || ''}</span>
                <span>{chartData[chartData.length - 1]?.label || ''}</span>
              </>
            )}
          </div>
        </div>

        {/* Right (4 cols): หมวดหมู่ที่ใช้จ่ายวันนี้ (Section 14 from Master Prompt) */}
        <div className="lg:col-span-4 bg-white rounded-[24px] p-6 border border-[#EAE6DA] shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-[#F36B5B] flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 stroke-[2.3]" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-[#17202A]">
                หมวดหมู่ที่ใช้จ่ายวันนี้
              </h3>
            </div>
            
            <button 
              type="button"
              onClick={onNavigateTransactions}
              className="text-xs font-bold text-[#159B78] hover:text-[#0F765C] flex items-center gap-0.5 cursor-pointer"
            >
              <span>ดูทั้งหมด</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Category List */}
          {todayCategorySpending.list.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-6 text-center text-gray-400">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF8F2] border border-[#EAE6DA] flex items-center justify-center text-gray-400 mb-2">
                <Receipt className="w-5 h-5 text-gray-300" />
              </div>
              <span className="text-xs font-bold text-gray-500">วันนี้ยังไม่มีรายจ่าย</span>
              <span className="text-[11px] text-gray-400 mt-0.5">ยอดใช้จ่ายตามหมวดจะแสดงเมื่อเริ่มจดรายการ</span>
            </div>
          ) : (
            <div className="space-y-3 flex-1 justify-center flex flex-col">
              {todayCategorySpending.list.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-[#17202A]">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <CategoryBadge name={item.name} size="sm" />
                      <span className="truncate">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-semibold text-gray-400">{item.pct}%</span>
                      <span className="font-black text-[#17202A]">฿{item.amount.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full h-1.5 rounded-full bg-[#FAF8F2] overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-[#159B78]"
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>

      {/* ========================================================
          5. ROW 4: บัญชีของฉัน | รายการล่าสุด | งบประมาณรายจ่าย
          ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Section 1: บัญชีของฉัน (Strict Privacy) */}
        <div className="bg-white rounded-[24px] p-6 border border-[#EAE6DA] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <Wallet className="w-4 h-4 stroke-[2.3]" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-[#17202A]">
                บัญชีของฉัน
              </h3>
            </div>

            <button 
              type="button"
              onClick={onNavigateAccounts}
              className="text-xs font-bold text-[#159B78] hover:text-[#0F765C] flex items-center gap-0.5 cursor-pointer"
            >
              <span>ดูทั้งหมด</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {accounts.length === 0 ? (
              <div className="col-span-2 py-6 text-center text-gray-400 bg-[#FAF8F2] rounded-2xl border border-[#EAE6DA]/70 flex flex-col items-center justify-center">
                <Wallet className="w-7 h-7 text-gray-300 mb-1" />
                <span className="text-xs font-bold text-gray-500">ยังไม่มีบัญชี</span>
                <span className="text-[11px] text-gray-400 mt-0.5">กด "ดูทั้งหมด" เพื่อเพิ่มบัญชี</span>
              </div>
            ) : (
              accounts.slice(0, 4).map(acc => {
                const bal = acc.balance ?? Number(acc.opening || 0);
                const iconEmoji = getAccountIcon(acc.type, acc.name);

                return (
                  <div
                    key={acc.id}
                    onClick={onNavigateAccounts}
                    className="p-3 rounded-2xl bg-[#FAF8F2] border border-[#EAE6DA]/70 hover:border-[#159B78]/40 transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xl p-1 rounded-xl bg-white shadow-2xs">{iconEmoji}</span>
                      <span className="text-[10px] font-bold text-gray-400 truncate max-w-[60px]">{acc.type}</span>
                    </div>
                    <div className="mt-2">
                      <span className="font-bold text-xs text-[#17202A] block truncate">{acc.name}</span>
                      <span className="font-black text-sm text-[#159B78] block">
                        ฿{bal.toLocaleString('th-TH', { minimumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Section 2: รายการล่าสุด (Recent Transactions) */}
        <div className="bg-white rounded-[24px] p-6 border border-[#EAE6DA] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <Receipt className="w-4 h-4 stroke-[2.3]" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-[#17202A]">
                รายการล่าสุด
              </h3>
            </div>

            <button 
              type="button"
              onClick={onNavigateTransactions}
              className="text-xs font-bold text-[#159B78] hover:text-[#0F765C] flex items-center gap-0.5 cursor-pointer"
            >
              <span>ดูทั้งหมด</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentTransactions.length === 0 ? (
              <div className="py-6 text-center text-gray-400 bg-[#FAF8F2] rounded-2xl border border-[#EAE6DA]/70 flex flex-col items-center justify-center">
                <Receipt className="w-7 h-7 text-gray-300 mb-1" />
                <span className="text-xs font-bold text-gray-500">ยังไม่มีรายการ</span>
                <span className="text-[11px] text-gray-400 mt-0.5">กดปุ่ม "[ + ] จดตังค์" เพื่อบันทึก</span>
              </div>
            ) : (
              recentTransactions.map(tx => {
                const isInc = tx.type === 'income' || tx.type === 'refund';
                return (
                  <div
                    key={tx.id}
                    onClick={() => onEditTransaction(tx)}
                    className="p-2.5 rounded-2xl border border-gray-100 hover:border-gray-200 bg-[#FAF8F2]/60 hover:bg-[#FAF8F2] flex items-center justify-between cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <CategoryBadge name={tx.description || tx.type} size="sm" />
                      <div className="min-w-0">
                        <span className="font-bold text-xs text-[#17202A] block truncate">
                          {tx.description || tx.type}
                        </span>
                        <span className="text-[10px] text-gray-400 block">{tx.date}</span>
                      </div>
                    </div>

                    <span className={`text-xs font-black ${isInc ? 'text-[#159B78]' : 'text-[#F36B5B]'}`}>
                      {isInc ? '+' : '-'}฿{(Number(tx.amount) || 0).toLocaleString()}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Section 3: งบประมาณรายจ่าย (Budget Overview with Ring/Progress) */}
        <div className="bg-white rounded-[24px] p-6 border border-[#EAE6DA] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Target className="w-4 h-4 stroke-[2.3]" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-[#17202A]">
                งบประมาณรายจ่าย
              </h3>
            </div>

            <button 
              type="button"
              onClick={onNavigateBudgets}
              className="text-xs font-bold text-[#159B78] hover:text-[#0F765C] flex items-center gap-0.5 cursor-pointer"
            >
              <span>ดูทั้งหมด</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#EAE6DA]/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-gray-400 block">ใช้ไปแล้ว</span>
                <span className="text-2xl font-black text-[#17202A]">
                  {budgetSummary.spentPct}%
                </span>
              </div>
              
              <div className="text-right">
                <span className="text-[11px] font-semibold text-gray-400 block">งบทั้งหมด</span>
                <span className="text-sm font-black text-[#17202A]">
                  ฿{budgetSummary.totalAllocated.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-3 rounded-full bg-white border border-gray-200 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  budgetSummary.spentPct > 100 ? 'bg-[#F36B5B]' : 'bg-[#159B78]'
                }`}
                style={{ width: `${Math.min(100, budgetSummary.spentPct)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-gray-500">ใช้ไป ฿{budgetSummary.spent.toLocaleString()}</span>
              <span className="text-[#159B78]">เหลือ ฿{budgetSummary.remaining.toLocaleString()}</span>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================
          6. ROW 5: เป้าหมายการออม & หนี้สิน
          ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* เป้าหมายการออม (Savings Goals) */}
        <div className="bg-white rounded-[24px] p-6 border border-[#EAE6DA] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <PiggyBank className="w-4 h-4 stroke-[2.3]" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-[#17202A]">
                เป้าหมายการออม
              </h3>
            </div>

            <button 
              type="button"
              onClick={onNavigateSavings}
              className="text-xs font-bold text-[#159B78] hover:text-[#0F765C] flex items-center gap-0.5 cursor-pointer"
            >
              <span>ดูทั้งหมด</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {goals.length > 0 ? (
              goals.slice(0, 2).map(g => {
                const current = Number(g.current || 0);
                const target = Number(g.target || 1);
                const pct = Math.min(100, Math.round((current / target) * 100));

                const isPaused = g.goalStatus === 'พักเป้าหมาย';

                return (
                  <div 
                    key={g.id} 
                    className={`p-3.5 rounded-2xl border transition-all space-y-2 ${
                      isPaused 
                        ? 'bg-[#F3F4F2] border-[#E2E4E1] opacity-95' 
                        : 'bg-[#FAF8F2] border-[#EAE6DA]/70'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className={`truncate ${isPaused ? 'text-[#66706B]' : 'text-[#17202A]'}`}>
                          {g.name}
                        </span>
                        {isPaused && (
                          <span className="shrink-0 text-[10px] font-bold py-0.5 px-2 rounded-full bg-gray-200 text-[#59625E] flex items-center gap-1">
                            <Pause className="w-2.5 h-2.5" />
                            <span>พักเป้าหมาย</span>
                          </span>
                        )}
                      </div>
                      <span className={isPaused ? 'text-[#929A96]' : 'text-[#159B78]'}>{pct}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white overflow-hidden border border-gray-100">
                      <div 
                        className={`h-full rounded-full transition-all ${isPaused ? 'bg-[#B8BFBC]' : 'bg-[#159B78]'}`} 
                        style={{ width: `${pct}%` }} 
                      />
                    </div>
                    <div className="flex justify-between text-[11px] font-semibold">
                      <span className={isPaused ? 'text-[#59625E]' : 'text-gray-700'}>
                        ฿{current.toLocaleString()}
                      </span>
                      <span className={isPaused ? 'text-[#929A96]' : 'text-gray-400'}>
                        {isPaused ? 'พักชั่วคราว' : `เป้าหมาย ฿${target.toLocaleString()}`}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center text-gray-400 bg-[#FAF8F2] rounded-2xl border border-[#EAE6DA]/70 flex flex-col items-center justify-center">
                <PiggyBank className="w-7 h-7 text-gray-300 mb-1" />
                <span className="text-xs font-bold text-gray-500">ยังไม่มีเป้าหมายการออม</span>
                <span className="text-[11px] text-gray-400 mt-0.5">กด "ดูทั้งหมด" เพื่อสร้างเป้าหมาย</span>
              </div>
            )}
          </div>
        </div>

        {/* หนี้สิน (Debts Summary) */}
        <div className="bg-white rounded-[24px] p-6 border border-[#EAE6DA] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-[#E0533C] flex items-center justify-center">
                <CreditCard className="w-4 h-4 stroke-[2.3]" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-[#17202A]">
                หนี้สิน
              </h3>
            </div>

            <button 
              type="button"
              onClick={onNavigateDebts}
              className="text-xs font-bold text-[#159B78] hover:text-[#0F765C] flex items-center gap-0.5 cursor-pointer"
            >
              <span>ดูทั้งหมด</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-[#FDF2F2] border border-[#FAD2D2] flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#E0533C] block">หนี้คงเหลือทั้งหมด</span>
              <span className="text-2xl font-black text-[#E0533C] tracking-tight">
                ฿{totalDebtRemaining.toLocaleString()}
              </span>
              <span className="text-[11px] font-semibold text-gray-500 block mt-1">
                {debts.filter(d => (d.remaining ?? d.initial) > 0).length} รายการค้างชำระ
              </span>
            </div>

            <button
              type="button"
              onClick={onNavigateDebts}
              className="py-2 px-3.5 rounded-xl bg-white border border-[#FAD2D2] text-[#E0533C] font-bold text-xs shadow-2xs hover:bg-[#FDF2F2] cursor-pointer"
            >
              วางแผนปลดหนี้ →
            </button>
          </div>
        </div>

      </div>

      {/* ========================================================
          7. BOTTOM: “สถานะการเงินรวม” (MOVED TO BOTTOM AS INSTRUCTION)
          Large Featured Card across bottom with Mascot & 4 Metrics
          ======================================================== */}
      <div className="relative overflow-hidden rounded-[26px] bg-linear-to-r from-[#FAF8F2] via-[#F8F6EF] to-[#EDF7F2] p-6 sm:p-8 border border-[#EAE6DA] shadow-xs">
        
        {/* Top Header of Financial Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE6DA]/80 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#159B78] text-white flex items-center justify-center font-bold shadow-xs">
              <Building2 className="w-5 h-5 stroke-[2.3]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#17202A] tracking-tight">
                สถานะการเงินรวม
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-gray-500 mt-0.5">
                ภาพรวมฐานะการเงินทั้งหมดของคุณ
              </p>
            </div>
          </div>

          {/* Net Worth Badge on Top Right */}
          <div className="flex items-center gap-2.5 bg-white py-2 px-4 rounded-2xl border border-[#EAE6DA] shadow-2xs self-start sm:self-auto">
            <Sparkles className="w-4 h-4 text-[#F6B91A]" />
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">มูลค่าสุทธิ (Net Worth)</span>
              <span className={`text-base font-black ${netWorth >= 0 ? 'text-[#159B78]' : 'text-[#F36B5B]'}`}>
                ฿{netWorth.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* 4 Core Financial Metrics + Mascot with Growth Pose */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6 items-center">
          
          {/* 4 Metrics (Desktop: 9 cols, Mobile: full) */}
          <div className="lg:col-span-9 grid grid-cols-2 sm:grid-cols-4 gap-4">
            
            {/* Metric 1: เงินสดและบัญชี */}
            <div 
              onClick={onNavigateAccounts}
              className="p-4 rounded-2xl bg-white border border-[#EAE6DA] hover:border-[#159B78]/40 transition-all cursor-pointer space-y-1"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                <Wallet className="w-3.5 h-3.5 text-[#159B78]" />
                <span>เงินของฉัน</span>
              </div>
              <div className="text-lg sm:text-xl font-black text-[#17202A]">
                ฿{totalBalance.toLocaleString()}
              </div>
              <span className="text-[10px] text-gray-400 font-medium block">
                ในบัญชีและกระเป๋าเงิน
              </span>
            </div>

            {/* Metric 2: เงินออมทั้งหมด */}
            <div 
              onClick={onNavigateSavings}
              className="p-4 rounded-2xl bg-white border border-[#EAE6DA] hover:border-amber-400 transition-all cursor-pointer space-y-1"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700">
                <PiggyBank className="w-3.5 h-3.5 text-amber-600" />
                <span>เงินออมทั้งหมด</span>
              </div>
              <div className="text-lg sm:text-xl font-black text-amber-800">
                ฿{totalSavingsCurrent.toLocaleString()}
              </div>
              <span className="text-[10px] text-gray-400 font-medium block">
                เป้าหมายการออมสะสม
              </span>
            </div>

            {/* Metric 3: หหนี้สินคงเหลือ */}
            <div 
              onClick={onNavigateDebts}
              className="p-4 rounded-2xl bg-white border border-[#EAE6DA] hover:border-[#F36B5B]/40 transition-all cursor-pointer space-y-1"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#F36B5B]">
                <CreditCard className="w-3.5 h-3.5" />
                <span>หนี้สินคงเหลือ</span>
              </div>
              <div className="text-lg sm:text-xl font-black text-[#F36B5B]">
                ฿{totalDebtRemaining.toLocaleString()}
              </div>
              <span className="text-[10px] text-gray-400 font-medium block">
                ภาระหนี้ที่ต้องชำระ
              </span>
            </div>

            {/* Metric 4: สินทรัพย์รวม */}
            <div 
              onClick={onNavigateAssets}
              className="p-4 rounded-2xl bg-white border border-[#EAE6DA] hover:border-[#159B78]/40 transition-all cursor-pointer space-y-1"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#159B78]">
                <Layers className="w-3.5 h-3.5" />
                <span>สินทรัพย์รวม</span>
              </div>
              <div className="text-lg sm:text-xl font-black text-[#159B78]">
                ฿{totalAssetValue.toLocaleString()}
              </div>
              <span className="text-[10px] text-gray-400 font-medium block">
                {assets.filter(a => a.status === 'ใช้งาน').length} รายการถือครอง
              </span>
            </div>

          </div>

          {/* Right Mascot Growth Illustration Anchor */}
          <div className="lg:col-span-3 flex flex-col items-center justify-center text-center p-3">
            <div className="bg-white py-1.5 px-3 rounded-2xl border border-[#EAE6DA] shadow-2xs text-[11px] font-bold text-[#159B78] mb-2">
              จัดการเงินได้ดีขึ้นในทุกวันเลย! 🌱
            </div>
            <NongTangMascot className="w-20 h-20 shrink-0 drop-shadow-md" />
          </div>

        </div>

        {/* Bottom Detail Link */}
        <div className="pt-5 mt-4 border-t border-[#EAE6DA]/80 flex justify-between items-center text-xs font-bold">
          <span className="text-gray-400">JODTANG — จดง่าย รู้เงินทุกวัน</span>
          <button 
            type="button"
            onClick={onNavigateAccounts}
            className="text-[#159B78] hover:text-[#0F765C] flex items-center gap-1 cursor-pointer"
          >
            <span>ดูรายละเอียดสถานะการเงิน</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* ========================================================
          8. MOBILE STICKY FLOATING CTA BUTTON: [ + ] จดตังค์
          ======================================================== */}
      <div className="block md:hidden fixed bottom-20 right-4 z-40">
        <button
          type="button"
          onClick={onOpenAddModal}
          className="flex items-center gap-2 py-3 px-5 rounded-full bg-[#159B78] hover:bg-[#0F765C] text-white font-bold text-sm shadow-xl shadow-[#159B78]/40 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-5 h-5 stroke-[3]" />
          <span>จดตังค์</span>
        </button>
      </div>

    </div>
  );
};
