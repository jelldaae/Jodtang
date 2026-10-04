import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Account, Transaction } from '../types';
import { NongTangMascot } from '../assets/logo';
import { 
  ACCOUNT_TYPES,
  AccountType,
  BANK_PROVIDERS, 
  WALLET_PROVIDERS, 
  CREDIT_CARD_PROVIDERS, 
  INVESTMENT_PLATFORMS,
  PRESET_COLORS,
  PRESET_ICONS,
  maskAccountNumber,
  formatCardNumberDisplay,
  normalizeAccountType,
  getAccountTabGroup,
  AccountTabGroup
} from '../utils/accountUtils';
import { ConfirmModal } from './ConfirmModal';
import { 
  Wallet, 
  Plus, 
  ArrowRightLeft, 
  Edit3, 
  Building2, 
  CreditCard, 
  Coins, 
  TrendingUp, 
  MoreVertical,
  X,
  Check,
  Eye,
  EyeOff,
  Search,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Upload,
  Trash2,
  Power,
  Calendar,
  Layers,
  Sparkles,
  Info,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ReceiptText
} from 'lucide-react';

interface AccountsPageProps {
  onOpenTransferModal: () => void;
  onNavigateSettings?: () => void;
  onOpenAddTransaction?: (accountId?: string) => void;
  onNavigateToAccountTransactions?: (accountId: string) => void;
}

export const AccountsPage: React.FC<AccountsPageProps> = ({ 
  onOpenTransferModal,
  onNavigateSettings,
  onOpenAddTransaction,
  onNavigateToAccountTransactions
}) => {
  const { 
    accounts, 
    transactions, 
    totalBalance, 
    totalAssetValue,
    totalDebtRemaining,
    totalCreditCardDebt,
    netWorth,
    saveAccount, 
    deleteAccount,
    toggleAccountStatus,
    hasAccountTransactions
  } = useApp();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<AccountTabGroup>('all');
  const [showMasked, setShowMasked] = useState<boolean>(true);

  // Modal States: Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAcc, setEditingAcc] = useState<Account | null>(null);

  // Detail Modal State
  const [selectedDetailAccount, setSelectedDetailAccount] = useState<Account | null>(null);
  const [detailShowNumber, setDetailShowNumber] = useState(false);
  const [isConfirmShowOpen, setIsConfirmShowOpen] = useState(false);
  const [chartTimeRange, setChartTimeRange] = useState<'7d' | '30d' | '3m' | '6m' | '1y'>('30d');

  // Delete & Deactivate Modals
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);
  const [accountToDeactivate, setAccountToDeactivate] = useState<Account | null>(null);
  const [hasTxWarning, setHasTxWarning] = useState<Account | null>(null);

  // Form State (Dynamic Form)
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<AccountType>('ธนาคาร');
  const [formOpeningStr, setFormOpeningStr] = useState('0');
  const [formBank, setFormBank] = useState('KBank');
  const [formCustomBank, setFormCustomBank] = useState('');
  const [formWalletProvider, setFormWalletProvider] = useState('TrueMoney');
  const [formCustomWallet, setFormCustomWallet] = useState('');
  const [formCardProvider, setFormCardProvider] = useState('KBank');
  const [formCustomCard, setFormCustomCard] = useState('');
  const [formPlatform, setFormPlatform] = useState('InnovestX');
  const [formCustomPlatform, setFormCustomPlatform] = useState('');
  const [formAccountNumber, setFormAccountNumber] = useState('');
  const [formCreditLimitStr, setFormCreditLimitStr] = useState('0');
  const [formOutstandingStr, setFormOutstandingStr] = useState('0');
  const [formDueDate, setFormDueDate] = useState('');
  const [formInvestorId, setFormInvestorId] = useState('');
  const [formColor, setFormColor] = useState('#3F8F72');
  const [formIcon, setFormIcon] = useState('🏦');
  const [formImage, setFormImage] = useState<string | null>(null);
  const [formNote, setFormNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // File input ref for Logo/Image upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Breakdown metrics for 3 Mini Cards
  const { cashTotal, bankTotal, walletTotal, investmentTotal, creditCardDebtTotal } = useMemo(() => {
    let cash = 0;
    let bank = 0;
    let wallet = 0;
    let investment = 0;
    let cardDebt = 0;

    accounts.forEach(acc => {
      const bal = acc.balance != null ? acc.balance : Number(acc.opening || 0);
      const norm = normalizeAccountType(acc.type);
      if (norm === 'เงินสด') cash += bal;
      else if (norm === 'ธนาคาร') bank += bal;
      else if (norm === 'กระเป๋าเงินออนไลน์') wallet += bal;
      else if (norm === 'บัญชีลงทุน') investment += bal;
      else if (norm === 'บัตรเครดิต') {
        if (bal !== 0) cardDebt += Math.abs(bal);
        else if (acc.outstandingDebt) cardDebt += Number(acc.outstandingDebt);
      }
    });

    return {
      cashTotal: cash,
      bankTotal: bank,
      walletTotal: wallet,
      investmentTotal: investment,
      creditCardDebtTotal: cardDebt,
    };
  }, [accounts]);

  // Tab counts
  const tabCounts = useMemo(() => {
    let cashBank = 0;
    let inv = 0;
    let liab = 0;

    accounts.forEach(acc => {
      const g = getAccountTabGroup(acc.type);
      if (g === 'cash_bank') cashBank++;
      else if (g === 'investments') inv++;
      else if (g === 'liabilities') liab++;
    });

    return {
      all: accounts.length,
      cash_bank: cashBank,
      investments: inv,
      liabilities: liab,
    };
  }, [accounts]);

  // Filtered accounts based on Tab & Search
  const filteredAccounts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return accounts.filter(acc => {
      // Tab filter
      if (activeTab !== 'all') {
        const g = getAccountTabGroup(acc.type);
        if (g !== activeTab) return false;
      }
      // Search filter
      if (!q) return true;
      const matchName = acc.name.toLowerCase().includes(q);
      const matchType = acc.type.toLowerCase().includes(q);
      const matchBank = acc.bank?.toLowerCase().includes(q);
      const matchWallet = acc.walletProvider?.toLowerCase().includes(q);
      const matchPlatform = acc.platform?.toLowerCase().includes(q);
      const matchNumber = acc.accountNumber?.toLowerCase().includes(q);
      const matchNote = acc.note?.toLowerCase().includes(q);
      return matchName || matchType || matchBank || matchWallet || matchPlatform || matchNumber || matchNote;
    });
  }, [accounts, activeTab, searchQuery]);

  // Open Add Modal
  const openAdd = () => {
    setEditingAcc(null);
    setFormName('');
    setFormType('ธนาคาร');
    setFormOpeningStr('0');
    setFormBank('KBank');
    setFormCustomBank('');
    setFormWalletProvider('TrueMoney');
    setFormCustomWallet('');
    setFormCardProvider('KBank');
    setFormCustomCard('');
    setFormPlatform('InnovestX');
    setFormCustomPlatform('');
    setFormAccountNumber('');
    setFormCreditLimitStr('0');
    setFormOutstandingStr('0');
    setFormDueDate('');
    setFormInvestorId('');
    setFormColor('#138F2D');
    setFormIcon('🏦');
    setFormImage(null);
    setFormNote('');
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEdit = (acc: Account) => {
    setEditingAcc(acc);
    setFormName(acc.name);
    const normType = normalizeAccountType(acc.type);
    setFormType(normType);
    setFormOpeningStr(String(acc.opening || 0));

    // Bank
    const bankMatch = BANK_PROVIDERS.find(b => b.id === acc.bank);
    if (bankMatch) {
      setFormBank(acc.bank || 'KBank');
      setFormCustomBank('');
    } else if (acc.bank) {
      setFormBank('other');
      setFormCustomBank(acc.bank);
    } else {
      setFormBank('KBank');
      setFormCustomBank('');
    }

    // Wallet
    const walletMatch = WALLET_PROVIDERS.find(w => w.id === acc.walletProvider);
    if (walletMatch) {
      setFormWalletProvider(acc.walletProvider || 'TrueMoney');
      setFormCustomWallet('');
    } else if (acc.walletProvider) {
      setFormWalletProvider('other');
      setFormCustomWallet(acc.walletProvider);
    } else {
      setFormWalletProvider('TrueMoney');
      setFormCustomWallet('');
    }

    // Credit Card
    const cardMatch = CREDIT_CARD_PROVIDERS.find(c => c.id === acc.creditCardProvider);
    if (cardMatch) {
      setFormCardProvider(acc.creditCardProvider || 'KBank');
      setFormCustomCard('');
    } else if (acc.creditCardProvider) {
      setFormCardProvider('other');
      setFormCustomCard(acc.creditCardProvider);
    } else {
      setFormCardProvider('KBank');
      setFormCustomCard('');
    }

    // Platform
    const platMatch = INVESTMENT_PLATFORMS.find(p => p.id === acc.platform);
    if (platMatch) {
      setFormPlatform(acc.platform || 'InnovestX');
      setFormCustomPlatform('');
    } else if (acc.platform) {
      setFormPlatform('other');
      setFormCustomPlatform(acc.platform);
    } else {
      setFormPlatform('InnovestX');
      setFormCustomPlatform('');
    }

    setFormAccountNumber(acc.accountNumber || '');
    setFormCreditLimitStr(String(acc.creditLimit || 0));
    setFormOutstandingStr(String(acc.outstandingDebt || (acc.balance ? Math.abs(acc.balance) : 0)));
    setFormDueDate(acc.dueDate || '');
    setFormInvestorId(acc.investorId || '');
    setFormColor(acc.color || '#3F8F72');
    setFormIcon(acc.icon || (normType === 'เงินสด' ? '💵' : normType === 'บัตรเครดิต' ? '💳' : '🏦'));
    setFormImage(acc.image || null);
    setFormNote(acc.noteText || (acc.note && !acc.note.startsWith('{"__jodtang"') ? acc.note : ''));
    setFormError(null);
    setIsModalOpen(true);
  };

  // Handle Type Change in Form
  const handleTypeSelect = (newType: AccountType) => {
    setFormType(newType);
    if (newType === 'เงินสด') {
      setFormIcon('💵');
      setFormColor('#F59E0B');
    } else if (newType === 'ธนาคาร') {
      setFormIcon('🏦');
      setFormColor('#138F2D');
      setFormBank('KBank');
    } else if (newType === 'กระเป๋าเงินออนไลน์') {
      setFormIcon('📱');
      setFormColor('#FF6F00');
      setFormWalletProvider('TrueMoney');
    } else if (newType === 'บัตรเครดิต') {
      setFormIcon('💳');
      setFormColor('#E0533C');
      setFormCardProvider('KBank');
    } else if (newType === 'บัญชีลงทุน') {
      setFormIcon('📈');
      setFormColor('#10B981');
      setFormPlatform('InnovestX');
    } else {
      setFormIcon('🏷️');
      setFormColor('#3F8F72');
    }
  };

  // Image Upload handler
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setFormError('ขนาดไฟล์ภาพต้องไม่เกิน 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Form Save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('กรุณาระบุชื่อบัญชี');
      return;
    }

    const openingNum = parseFloat(formOpeningStr) || 0;
    if (formType !== 'บัตรเครดิต' && openingNum < 0) {
      setFormError('ยอดเงินคงเหลือเริ่มต้นต้องไม่ติดลบ');
      return;
    }

    // Determine final provider/bank names
    const finalBank = formType === 'ธนาคาร' ? (formBank === 'other' ? formCustomBank.trim() || 'ธนาคารอื่น ๆ' : formBank) : undefined;
    const finalWallet = formType === 'กระเป๋าเงินออนไลน์' ? (formWalletProvider === 'other' ? formCustomWallet.trim() || 'กระเป๋าเงินอื่น ๆ' : formWalletProvider) : undefined;
    const finalCard = formType === 'บัตรเครดิต' ? (formCardProvider === 'other' ? formCustomCard.trim() || 'ผู้ให้บริการอื่น ๆ' : formCardProvider) : undefined;
    const finalPlatform = formType === 'บัญชีลงทุน' ? (formPlatform === 'other' ? formCustomPlatform.trim() || 'แพลตฟอร์มอื่น ๆ' : formPlatform) : undefined;

    const creditLimitNum = formType === 'บัตรเครดิต' ? Math.max(0, parseFloat(formCreditLimitStr) || 0) : undefined;
    const outstandingNum = formType === 'บัตรเครดิต' ? Math.max(0, parseFloat(formOutstandingStr) || 0) : undefined;

    setIsSaving(true);
    setFormError(null);

    try {
      await saveAccount({
        id: editingAcc?.id,
        name: formName.trim(),
        type: formType,
        opening: formType === 'บัตรเครดิต' ? (outstandingNum ? -outstandingNum : 0) : openingNum,
        bank: finalBank,
        walletProvider: finalWallet,
        creditCardProvider: finalCard,
        platform: finalPlatform,
        accountNumber: formAccountNumber.trim() || undefined,
        investorId: formType === 'บัญชีลงทุน' ? formInvestorId.trim() || undefined : undefined,
        creditLimit: creditLimitNum,
        outstandingDebt: outstandingNum,
        dueDate: formType === 'บัตรเครดิต' ? formDueDate.trim() || undefined : undefined,
        color: formColor,
        icon: formIcon,
        image: formImage || undefined,
        noteText: formNote.trim(),
        status: editingAcc?.status || 'ใช้งาน',
      });
      setIsModalOpen(false);
      // If we are editing the currently viewed detail, update it
      if (selectedDetailAccount && editingAcc?.id === selectedDetailAccount.id) {
        setSelectedDetailAccount(prev => prev ? {
          ...prev,
          name: formName.trim(),
          type: formType,
          color: formColor,
          icon: formIcon,
          accountNumber: formAccountNumber.trim(),
          noteText: formNote.trim(),
        } : null);
      }
    } catch (err: any) {
      setFormError(err.message || 'บันทึกบัญชีไม่สำเร็จ');
    } finally {
      setIsSaving(false);
    }
  };

  // Attempt delete account
  const handleInitiateDelete = (acc: Account) => {
    if (hasAccountTransactions(acc.id)) {
      setHasTxWarning(acc);
    } else {
      setAccountToDelete(acc);
    }
  };

  // Confirm delete (hard delete when safe)
  const confirmDelete = async () => {
    if (!accountToDelete) return;
    try {
      await deleteAccount(accountToDelete.id);
      if (selectedDetailAccount?.id === accountToDelete.id) {
        setSelectedDetailAccount(null);
      }
      setAccountToDelete(null);
    } catch (err: any) {
      alert(`ลบไม่สำเร็จ: ${err.message}`);
    }
  };

  // Deactivate account
  const confirmDeactivate = async (acc: Account) => {
    try {
      await toggleAccountStatus(acc.id);
      setHasTxWarning(null);
      setAccountToDeactivate(null);
      if (selectedDetailAccount?.id === acc.id) {
        setSelectedDetailAccount(prev => prev ? { ...prev, status: prev.status === 'ใช้งาน' ? 'ไม่ใช้งาน' : 'ใช้งาน' } : null);
      }
    } catch (err: any) {
      alert(`อัปเดตสถานะไม่สำเร็จ: ${err.message}`);
    }
  };

  // Transactions belonging to selected detail account
  const accountTransactions = useMemo(() => {
    if (!selectedDetailAccount) return [];
    return transactions.filter(t => 
      t.status !== 'ลบแล้ว' && 
      (t.accountId === selectedDetailAccount.id || t.toAccountId === selectedDetailAccount.id)
    );
  }, [transactions, selectedDetailAccount]);

  // Account Detail Metrics
  const detailMetrics = useMemo(() => {
    if (!selectedDetailAccount) return { mIncome: 0, mExpense: 0, count: 0 };
    const curMonth = new Date().toISOString().slice(0, 7);
    let inc = 0;
    let exp = 0;

    accountTransactions.forEach(tx => {
      const amt = Number(tx.amount) || 0;
      const isThisMonth = tx.date.startsWith(curMonth);
      if (tx.accountId === selectedDetailAccount.id) {
        if (tx.type === 'income' || tx.type === 'refund' || tx.type === 'receivable_receipt') {
          if (isThisMonth) inc += amt;
        } else if (tx.type === 'expense' || tx.type === 'subscription' || tx.type === 'debt_payment') {
          if (isThisMonth) exp += amt;
        } else if (tx.type === 'transfer') {
          if (isThisMonth) exp += amt;
        }
      }
      if (tx.toAccountId === selectedDetailAccount.id && tx.type === 'transfer') {
        if (isThisMonth) inc += amt;
      }
    });

    return {
      mIncome: inc,
      mExpense: exp,
      count: accountTransactions.length,
    };
  }, [selectedDetailAccount, accountTransactions]);

  // Mini Chart data for Account Detail
  const detailChartData = useMemo(() => {
    if (!selectedDetailAccount) return [];
    let numDays = 30;
    if (chartTimeRange === '7d') numDays = 7;
    else if (chartTimeRange === '30d') numDays = 30;
    else if (chartTimeRange === '3m') numDays = 90;
    else if (chartTimeRange === '6m') numDays = 180;
    else if (chartTimeRange === '1y') numDays = 365;

    const dates: string[] = [];
    const now = new Date();
    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().slice(0, 10));
    }

    const startBal = Number(selectedDetailAccount.opening || 0);
    const dailyNetMap: { [date: string]: number } = {};

    accountTransactions.forEach(tx => {
      const amt = Number(tx.amount) || 0;
      let net = 0;
      if (tx.accountId === selectedDetailAccount.id) {
        if (tx.type === 'income' || tx.type === 'refund' || tx.type === 'receivable_receipt') net += amt;
        else net -= amt;
      }
      if (tx.toAccountId === selectedDetailAccount.id && tx.type === 'transfer') {
        net += amt;
      }
      dailyNetMap[tx.date] = (dailyNetMap[tx.date] || 0) + net;
    });

    const windowStartDate = dates[0];
    let runningBalance = startBal;
    accountTransactions.forEach(tx => {
      if (tx.date < windowStartDate) {
        const amt = Number(tx.amount) || 0;
        let net = 0;
        if (tx.accountId === selectedDetailAccount.id) {
          if (tx.type === 'income' || tx.type === 'refund' || tx.type === 'receivable_receipt') net += amt;
          else net -= amt;
        }
        if (tx.toAccountId === selectedDetailAccount.id && tx.type === 'transfer') {
          net += amt;
        }
        runningBalance += net;
      }
    });

    return dates.map(d => {
      runningBalance += (dailyNetMap[d] || 0);
      return {
        date: d,
        balance: runningBalance,
        label: d.slice(5).replace('-', '/'),
      };
    });
  }, [selectedDetailAccount, accountTransactions, chartTimeRange]);

  // Mini Chart SVG Points
  const chartSvg = useMemo(() => {
    if (detailChartData.length < 2) return null;
    const values = detailChartData.map(d => d.balance);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = (maxVal - minVal) || 1;

    const width = 600;
    const height = 150;
    const padX = 16;
    const padY = 20;

    const points = detailChartData.map((d, idx) => {
      const x = padX + (idx / (detailChartData.length - 1)) * (width - padX * 2);
      const y = height - padY - ((d.balance - minVal) / range) * (height - padY * 2);
      return { x, y, date: d.date, balance: d.balance };
    });

    let linePath = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      linePath += ` C ${cpX.toFixed(1)} ${p0.y.toFixed(1)}, ${cpX.toFixed(1)} ${p1.y.toFixed(1)}, ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
    }

    const areaPath = `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;
    return { linePath, areaPath, minVal, maxVal };
  }, [detailChartData]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300 pb-16">
      {/* ========================================================
          SECTION 3: PAGE HEADER
          Title: "บัญชีและกระเป๋าเงิน"
          Subtitle: "จัดการแหล่งเงิน บัญชีธนาคาร และเงินสดของคุณ"
          Right: [↔ โอนเงิน], [+ เพิ่มบัญชี] (Primary CTA Green)
          ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-5 sm:p-6 border border-[#EAE6DA] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-100/80 text-indigo-700 flex items-center justify-center font-bold shrink-0">
            <Wallet className="w-5 h-5 stroke-[2.3]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#17202A] tracking-tight">
              บัญชีและกระเป๋าเงิน
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-gray-500 mt-1">
              จัดการแหล่งเงิน บัญชีธนาคาร และเงินสดของคุณ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={onOpenTransferModal}
            className="flex items-center gap-1.5 py-2.5 px-4 rounded-2xl bg-white border border-[#EAE6DA] hover:border-[#159B78] text-[#159B78] font-bold text-xs sm:text-sm shadow-2xs active:scale-95 transition-all cursor-pointer"
          >
            <ArrowRightLeft className="w-4 h-4 stroke-[2.5]" />
            <span>โอนเงิน</span>
          </button>

          <button
            onClick={openAdd}
            className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-[#159B78] hover:bg-[#0F765C] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#159B78]/25 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>เพิ่มบัญชี</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          SECTION 4: HERO BALANCE CARD
          "ยอดเงินรวมทุกบัญชี"
          Amount: Liquid balance (Cash + Bank + Wallet + Investment)
          Subtitle: "เงินสด + ธนาคาร + Wallet"
          Right Mascot Anchor: Nong Tang
          ======================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-[#FAF6E8] via-[#EDF7F2] to-[#E5F3EC] p-5 sm:p-7 border border-[#EAE6DA] shadow-xs">
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-extrabold text-gray-700">
                ยอดเงินรวมทุกบัญชี
              </span>
              <button 
                type="button"
                onClick={() => setShowMasked(!showMasked)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 transition-colors"
                title={showMasked ? 'ซ่อนตัวเลข' : 'แสดงตัวเลข'}
              >
                {showMasked ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>

            <div className="text-2xl sm:text-4xl font-black text-[#133F2E] tracking-tight">
              ฿{showMasked ? totalBalance.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '••••••••'}
            </div>

            <div className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
              <span>เงินสด + ธนาคาร + Wallet</span>
              <span className="text-gray-300">•</span>
              <span className="text-[#3F8F72] font-bold">ไม่รวมวงเงินบัตรเครดิต</span>
            </div>
          </div>

          {/* Character Anchor */}
          <div className="shrink-0 flex items-center">
            <NongTangMascot className="w-20 h-20 sm:w-28 sm:h-28 drop-shadow-md" />
          </div>
        </div>
      </div>

      {/* ========================================================
          SECTION 5: BALANCE BREAKDOWN (3 Mini Cards)
          เงินสด (Gold/Orange)
          ธนาคาร (Green)
          Wallet (Blue/Purple)
          ======================================================== */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
        {/* Card 1: เงินสด */}
        <div className="p-3.5 sm:p-4 rounded-3xl bg-white border border-[#EAE6DA] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#F59E0B]/15 text-[#D97706] flex items-center justify-center font-bold text-sm shrink-0">
              💵
            </div>
            <span className="text-[11px] sm:text-xs font-extrabold text-gray-700 truncate">เงินสด</span>
          </div>
          <div className="mt-2.5">
            <span className="text-sm sm:text-lg lg:text-xl font-black text-[#252525] block truncate">
              ฿{showMasked ? cashTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 }) : '••••••'}
            </span>
            <span className="text-[10px] text-gray-400 font-medium">เงินในกระเป๋า</span>
          </div>
        </div>

        {/* Card 2: ธนาคาร */}
        <div className="p-3.5 sm:p-4 rounded-3xl bg-white border border-[#EAE6DA] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#3F8F72]/15 text-[#3F8F72] flex items-center justify-center font-bold text-sm shrink-0">
              🏦
            </div>
            <span className="text-[11px] sm:text-xs font-extrabold text-gray-700 truncate">ธนาคาร</span>
          </div>
          <div className="mt-2.5">
            <span className="text-sm sm:text-lg lg:text-xl font-black text-[#133F2E] block truncate">
              ฿{showMasked ? bankTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 }) : '••••••'}
            </span>
            <span className="text-[10px] text-gray-400 font-medium">บัญชีเงินฝาก</span>
          </div>
        </div>

        {/* Card 3: Wallet */}
        <div className="p-3.5 sm:p-4 rounded-3xl bg-white border border-[#EAE6DA] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
              📱
            </div>
            <span className="text-[11px] sm:text-xs font-extrabold text-gray-700 truncate">Wallet</span>
          </div>
          <div className="mt-2.5">
            <span className="text-sm sm:text-lg lg:text-xl font-black text-blue-900 block truncate">
              ฿{showMasked ? walletTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 }) : '••••••'}
            </span>
            <span className="text-[10px] text-gray-400 font-medium">กระเป๋าเงินออนไลน์</span>
          </div>
        </div>
      </div>

      {/* ========================================================
          SECTION 6 & 12: ACCOUNT CATEGORY TABS & SEARCH
          Tabs: [ทั้งหมด] [เงินสด/ธนาคาร] [สินทรัพย์/ลงทุน] [หนี้สิน/บัตรเครดิต]
          ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Horizontal Scrollable Tabs */}
        <div className="flex items-center bg-white p-1 rounded-2xl border border-[#EAE6DA] shadow-2xs gap-1 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('all')}
            className={`py-2 px-3.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
              activeTab === 'all'
                ? 'bg-[#3F8F72] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-[#FAF8F2]'
            }`}
          >
            ทั้งหมด ({tabCounts.all})
          </button>

          <button
            onClick={() => setActiveTab('cash_bank')}
            className={`py-2 px-3.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
              activeTab === 'cash_bank'
                ? 'bg-[#3F8F72] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-[#FAF8F2]'
            }`}
          >
            เงินสด / ธนาคาร ({tabCounts.cash_bank})
          </button>

          <button
            onClick={() => setActiveTab('investments')}
            className={`py-2 px-3.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
              activeTab === 'investments'
                ? 'bg-[#3F8F72] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-[#FAF8F2]'
            }`}
          >
            สินทรัพย์ / บัญชีลงทุน ({tabCounts.investments})
          </button>

          <button
            onClick={() => setActiveTab('liabilities')}
            className={`py-2 px-3.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
              activeTab === 'liabilities'
                ? 'bg-[#E0533C] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-[#FAF8F2]'
            }`}
          >
            หนี้สิน / บัตรเครดิต ({tabCounts.liabilities})
          </button>
        </div>

        {/* Quick Search */}
        <div className="relative min-w-[200px] sm:w-64">
          <input
            type="text"
            placeholder="ค้นหาชื่อบัญชี, ธนาคาร..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-2xl border border-gray-200 bg-white text-xs focus:border-[#3F8F72] focus:outline-hidden shadow-2xs"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ========================================================
          MAIN LAYOUT: 2 COLUMNS ON DESKTOP
          Left Column (~68%): Account List
          Right Column (~32%): Total Net Position & Quick Actions
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2/3): Account List */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-extrabold text-gray-800">
              บัญชีของคุณ ({filteredAccounts.length})
            </h2>
            <span className="text-[11px] text-gray-400">
              แตะเพื่อดูรายละเอียดและกราฟ
            </span>
          </div>

          {filteredAccounts.length === 0 ? (
            /* SECTION 28: EMPTY STATE */
            <div className="bg-white rounded-3xl p-8 border border-dashed border-[#EAE6DA] text-center space-y-3">
              <NongTangMascot className="w-16 h-16 mx-auto" />
              <div>
                <h3 className="font-extrabold text-base text-[#252525]">ยังไม่มีบัญชีที่ค้นหา</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                  {searchQuery 
                    ? 'ไม่พบบัญชีที่ตรงกับคำค้นหา ลองตรวจสอบคำค้นใหม่อีกครั้ง' 
                    : 'เพิ่มบัญชีแรกของคุณ เพื่อเริ่มติดตามเงินทั้งหมดในที่เดียว'}
                </p>
              </div>
              <button
                onClick={openAdd}
                className="py-2.5 px-4 rounded-2xl bg-[#3F8F72] text-white font-bold text-xs shadow-md shadow-[#3F8F72]/20 hover:bg-[#2F7259] transition-all"
              >
                + เพิ่มบัญชีใหม่
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredAccounts.map((acc) => {
                const normType = normalizeAccountType(acc.type);
                const isCard = normType === 'บัตรเครดิต';
                const bal = acc.balance != null ? acc.balance : Number(acc.opening || 0);
                const isInactive = acc.status === 'ไม่ใช้งาน';
                const maskedNum = maskAccountNumber(acc.accountNumber, normType);

                return (
                  <div
                    key={acc.id}
                    onClick={() => {
                      setSelectedDetailAccount(acc);
                      setDetailShowNumber(false);
                    }}
                    className={`group bg-white rounded-2xl p-4 border transition-all cursor-pointer flex items-center justify-between gap-3 shadow-2xs hover:shadow-md hover:-translate-y-0.5 ${
                      isInactive 
                        ? 'border-gray-200 bg-gray-50/70 opacity-60' 
                        : isCard 
                          ? 'border-[#FAD2D2] hover:border-[#E0533C]' 
                          : 'border-[#EAE6DA] hover:border-[#3F8F72]/50'
                    }`}
                  >
                    {/* Left: Icon & Name */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div 
                        style={{ backgroundColor: `${acc.color || '#3F8F72'}15`, color: acc.color || '#3F8F72' }}
                        className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 border border-gray-100/50 shadow-2xs overflow-hidden"
                      >
                        {acc.image ? (
                          <img src={acc.image} alt={acc.name} className="w-full h-full object-cover" />
                        ) : (
                          <span>{acc.icon || (normType === 'เงินสด' ? '💵' : isCard ? '💳' : '🏦')}</span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-sm text-[#252525] truncate">
                            {acc.name}
                          </h3>
                          {isInactive && (
                            <span className="text-[10px] font-bold text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded-md">
                              ปิดใช้งาน
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-500 font-medium">
                          {maskedNum && (
                            <>
                              <span className="font-mono text-gray-400">{maskedNum}</span>
                              <span className="text-gray-300">•</span>
                            </>
                          )}
                          <span className={isCard ? 'text-[#E0533C] font-semibold' : ''}>
                            {isCard ? 'ยอดค้างชำระ' : normType}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Balance & Arrow */}
                    <div className="flex items-center gap-2.5 shrink-0">
                      <div className="text-right">
                        <div className={`text-sm sm:text-base font-black ${
                          isCard 
                            ? 'text-[#E0533C]' 
                            : bal < 0 
                              ? 'text-[#E0533C]' 
                              : 'text-[#133F2E]'
                        }`}>
                          {isCard 
                            ? `-฿${Math.abs(bal || (acc.outstandingDebt || 0)).toLocaleString('th-TH', { minimumFractionDigits: 2 })}` 
                            : `฿${bal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`
                          }
                        </div>
                        {isCard && acc.creditLimit && acc.creditLimit > 0 && (
                          <span className="text-[10px] text-gray-400 block font-medium">
                            วงเงิน ฿{Number(acc.creditLimit).toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Desktop More Menu / Arrow */}
                      <div className="w-7 h-7 rounded-full bg-[#FAF8F2] flex items-center justify-center text-gray-400 group-hover:text-[#3F8F72] transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right (1/3): Total Net Position & Quick Actions */}
        <div className="space-y-4">
          {/* SECTION 16: TOTAL NET POSITION */}
          <div className="bg-white rounded-3xl p-5 border border-[#EAE6DA] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#3F8F72]/15 text-[#3F8F72] flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-sm text-[#252525]">ภาพรวมทรัพย์สินและหนี้สิน</h3>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-600 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#3F8F72]" />
                  เงินในบัญชี
                </span>
                <span className="font-extrabold text-[#3F8F72]">
                  +฿{totalBalance.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-600 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00A2E8]" />
                  สินทรัพย์
                </span>
                <span className="font-extrabold text-[#00A2E8]">
                  +฿{totalAssetValue.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-600 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#E0533C]" />
                  หนี้สิน (รวมบัตรเครดิต)
                </span>
                <span className="font-extrabold text-[#E0533C]">
                  -฿{totalDebtRemaining.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-gray-800 block">มูลค่าสุทธิ (Net Worth)</span>
                  <span className="text-[10px] text-gray-400">ทรัพย์สิน - หนี้สิน</span>
                </div>
                <div className="text-base sm:text-lg font-black text-[#133F2E]">
                  ฿{netWorth.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 31: QUICK ACTIONS */}
          <div className="bg-[#FAF8F2] rounded-3xl p-4 border border-[#EAE6DA] space-y-2">
            <span className="text-xs font-bold text-gray-700 block mb-2 px-1">
              จัดการบัญชีและระบบ
            </span>

            <button
              onClick={openAdd}
              className="w-full flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-[#EAE6DA] hover:border-[#3F8F72] text-xs font-bold text-gray-800 transition-colors shadow-2xs"
            >
              <Plus className="w-4 h-4 text-[#3F8F72]" />
              <span>เพิ่มบัญชีใหม่</span>
            </button>

            <button
              onClick={onOpenTransferModal}
              className="w-full flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-[#EAE6DA] hover:border-[#3F8F72] text-xs font-bold text-gray-800 transition-colors shadow-2xs"
            >
              <ArrowRightLeft className="w-4 h-4 text-[#3F8F72]" />
              <span>โอนเงินระหว่างบัญชี</span>
            </button>

            {onNavigateSettings && (
              <button
                onClick={onNavigateSettings}
                className="w-full flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-[#EAE6DA] hover:border-[#3F8F72] text-xs font-bold text-gray-800 transition-colors shadow-2xs"
              >
                <Layers className="w-4 h-4 text-[#3F8F72]" />
                <span>จัดการหมวดหมู่และตั้งค่า</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================
          ACCOUNT DETAIL MODAL / SHEET (Section 5, 12, 13)
          Masked by default with "แสดงข้อมูล" (Show Data)
          With confirmation dialog
          ======================================================== */}
      {selectedDetailAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-[#EAE6DA] max-h-[90vh] overflow-y-auto space-y-5 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div 
                  style={{ backgroundColor: `${selectedDetailAccount.color || '#3F8F72'}15`, color: selectedDetailAccount.color || '#3F8F72' }}
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border border-gray-100 shadow-2xs overflow-hidden"
                >
                  {selectedDetailAccount.image ? (
                    <img src={selectedDetailAccount.image} alt={selectedDetailAccount.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{selectedDetailAccount.icon || '🏦'}</span>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-black text-[#252525]">{selectedDetailAccount.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-bold text-[#3F8F72] bg-[#3F8F72]/10 px-2 py-0.5 rounded-lg">
                      {selectedDetailAccount.type}
                    </span>
                    {selectedDetailAccount.bank && (
                      <span className="text-xs text-gray-500 font-medium">
                        {selectedDetailAccount.bank}
                      </span>
                    )}
                    {selectedDetailAccount.walletProvider && (
                      <span className="text-xs text-gray-500 font-medium">
                        {selectedDetailAccount.walletProvider}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedDetailAccount(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Balance / Liability */}
            <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#EAE6DA] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gray-500 block">
                  {selectedDetailAccount.type === 'บัตรเครดิต' ? 'ยอดค้างชำระบัตร' : 'ยอดเงินปัจจุบัน'}
                </span>
                <div className={`text-2xl font-black mt-0.5 ${
                  selectedDetailAccount.type === 'บัตรเครดิต' ? 'text-[#E0533C]' : 'text-[#133F2E]'
                }`}>
                  ฿{(selectedDetailAccount.balance ?? selectedDetailAccount.opening).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </div>
              </div>

              {selectedDetailAccount.type === 'บัตรเครดิต' && selectedDetailAccount.creditLimit && (
                <div className="text-right">
                  <span className="text-xs text-gray-400 block font-medium">วงเงินบัตร</span>
                  <span className="text-sm font-bold text-gray-700">
                    ฿{Number(selectedDetailAccount.creditLimit).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* MASKED DATA SECTION (Section 4 & 5) */}
            {selectedDetailAccount.accountNumber && (
              <div className="p-3.5 rounded-2xl border border-gray-200 bg-white flex items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-bold text-gray-400 block">
                    {selectedDetailAccount.type === 'บัตรเครดิต' ? 'หมายเลขบัตร' : selectedDetailAccount.type === 'กระเป๋าเงินออนไลน์' ? 'หมายเลข Wallet / เบอร์โทร' : selectedDetailAccount.type === 'บัญชีลงทุน' ? 'Investor ID' : 'เลขบัญชี'}
                  </span>
                  <span className="font-mono text-sm font-black text-gray-800">
                    {detailShowNumber 
                      ? selectedDetailAccount.accountNumber 
                      : maskAccountNumber(selectedDetailAccount.accountNumber, selectedDetailAccount.type)
                    }
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (detailShowNumber) {
                      setDetailShowNumber(false);
                    } else {
                      setIsConfirmShowOpen(true);
                    }
                  }}
                  className="py-1.5 px-3 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors shrink-0"
                >
                  {detailShowNumber ? 'ซ่อนข้อมูล' : 'แสดงข้อมูล'}
                </button>
              </div>
            )}

            {/* Monthly In/Out Mini Metrics */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-2xl bg-white border border-gray-100 shadow-2xs">
                <span className="text-[10px] text-gray-400 block font-medium">รายรับเดือนนี้</span>
                <span className="text-xs sm:text-sm font-black text-[#3F8F72]">
                  +฿{detailMetrics.mIncome.toLocaleString()}
                </span>
              </div>
              <div className="p-2.5 rounded-2xl bg-white border border-gray-100 shadow-2xs">
                <span className="text-[10px] text-gray-400 block font-medium">รายจ่ายเดือนนี้</span>
                <span className="text-xs sm:text-sm font-black text-[#E0533C]">
                  -฿{detailMetrics.mExpense.toLocaleString()}
                </span>
              </div>
              <div 
                onClick={() => {
                  const targetId = selectedDetailAccount.id;
                  setSelectedDetailAccount(null);
                  if (onNavigateToAccountTransactions) {
                    onNavigateToAccountTransactions(targetId);
                  }
                }}
                className="p-2.5 rounded-2xl bg-white border border-gray-100 shadow-2xs hover:border-[#159B78] hover:bg-[#159B78]/5 transition-all cursor-pointer group"
                title="แตะเพื่อดูรายการทั้งหมดของบัญชีนี้"
              >
                <span className="text-[10px] text-gray-400 block font-medium group-hover:text-[#159B78]">ธุรกรรมทั้งหมด ↗</span>
                <span className="text-xs sm:text-sm font-black text-gray-800 group-hover:text-[#159B78]">
                  {detailMetrics.count} รายการ
                </span>
              </div>
            </div>

            {/* MINI LINE CHART (Section 13) */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700">กราฟยอดคงเหลือ</span>
                <div className="flex gap-1 text-[10px] font-bold">
                  {(['7d', '30d', '3m', '6m', '1y'] as const).map(tr => (
                    <button
                      key={tr}
                      type="button"
                      onClick={() => setChartTimeRange(tr)}
                      className={`px-2 py-0.5 rounded-lg transition-colors ${
                        chartTimeRange === tr ? 'bg-[#3F8F72] text-white' : 'text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      {tr}
                    </button>
                  ))}
                </div>
              </div>

              {chartSvg ? (
                <div className="w-full h-32 bg-[#FAF8F2] rounded-2xl p-2 relative overflow-hidden border border-[#EAE6DA]">
                  <svg viewBox="0 0 600 150" className="w-full h-full preserve-3d" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="detailGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3F8F72" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#3F8F72" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path d={chartSvg.areaPath} fill="url(#detailGradient)" />
                    <path d={chartSvg.linePath} fill="none" stroke="#3F8F72" strokeWidth="2.5" />
                  </svg>
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-gray-400 bg-[#FAF8F2] rounded-2xl">
                  ยังไม่มีข้อมูลเพียงพอสำหรับสร้างกราฟ
                </div>
              )}
            </div>

            {/* Action Button: แสดงรายการของบัญชีนี้ */}
            <button
              type="button"
              onClick={() => {
                const targetId = selectedDetailAccount.id;
                setSelectedDetailAccount(null);
                if (onNavigateToAccountTransactions) {
                  onNavigateToAccountTransactions(targetId);
                }
              }}
              className="w-full py-3 px-4 rounded-2xl bg-[#159B78] hover:bg-[#0F765C] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md shadow-[#159B78]/25 active:scale-98 transition-all cursor-pointer"
            >
              <ReceiptText className="w-4 h-4 stroke-[2.5]" />
              <span>แสดงรายการของบัญชีนี้</span>
              <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full font-bold ml-1">
                {detailMetrics.count} รายการ
              </span>
            </button>

            {/* Actions Toolbar */}
            <div className="pt-1 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  const target = selectedDetailAccount;
                  setSelectedDetailAccount(null);
                  openEdit(target);
                }}
                className="flex-1 min-w-[120px] py-2.5 px-3 rounded-xl bg-white border border-gray-300 font-bold text-xs text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>แก้ไขบัญชี</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedDetailAccount(null);
                  onOpenTransferModal();
                }}
                className="flex-1 min-w-[120px] py-2.5 px-3 rounded-xl bg-white border border-[#3F8F72] font-bold text-xs text-[#3F8F72] hover:bg-[#3F8F72]/10 flex items-center justify-center gap-1.5 transition-colors"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>โอนเงิน</span>
              </button>

              <button
                type="button"
                onClick={() => handleInitiateDelete(selectedDetailAccount)}
                className="py-2.5 px-3 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors"
                title="ลบหรือปิดใช้งานบัญชี"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL TO REVEAL MASKED NUMBER (Section 5) */}
      <ConfirmModal
        isOpen={isConfirmShowOpen}
        title="ต้องการแสดงข้อมูลบัญชีหรือไม่?"
        message="หมายเลขบัญชีหรือหมายเลขบัตรเป็นข้อมูลสำคัญ ข้อมูลจะแสดงผลชั่วคราวบนหน้าจอของคุณ"
        confirmLabel="แสดงข้อมูล"
        cancelLabel="ยกเลิก"
        isDestructive={false}
        onConfirm={() => {
          setDetailShowNumber(true);
          setIsConfirmShowOpen(false);
        }}
        onCancel={() => setIsConfirmShowOpen(false)}
      />

      {/* DELETE WARNING: WHEN ACCOUNT HAS TRANSACTIONS (Section 17 & 40) */}
      <ConfirmModal
        isOpen={Boolean(hasTxWarning)}
        title="บัญชีนี้มีรายการธุรกรรมอยู่"
        message={`บัญชี "${hasTxWarning?.name}" มีประวัติรายการธุรกรรมในระบบ คุณไม่สามารถลบบัญชีนี้แบบถาวรได้โดยตรงเพื่อรักษาประวัติบัญชี แนะนำให้ "ปิดใช้งานบัญชี" แทน`}
        confirmLabel="ปิดใช้งานบัญชี"
        cancelLabel="ยกเลิก"
        isDestructive={false}
        onConfirm={() => hasTxWarning && confirmDeactivate(hasTxWarning)}
        onCancel={() => setHasTxWarning(null)}
      />

      {/* DELETE CONFIRMATION: HARD DELETE WHEN SAFE */}
      <ConfirmModal
        isOpen={Boolean(accountToDelete)}
        title="ยืนยันการลบบัญชี"
        message={`คุณต้องการลบบัญชี "${accountToDelete?.name}" ใช่หรือไม่? ข้อมูลนี้ยังไม่มีรายการธุรกรรม จึงสามารถลบได้อย่างปลอดภัย`}
        confirmLabel="ยืนยันการลบ"
        cancelLabel="ยกเลิก"
        isDestructive={true}
        onConfirm={confirmDelete}
        onCancel={() => setAccountToDelete(null)}
      />

      {/* ========================================================
          ADD / EDIT ACCOUNT MODAL (Section 2, 6, 7, 8, 9, 10, 18, 20, 37)
          Modern Fintech Form + Dynamic Fields per Account Type
          ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#EAE6DA] max-h-[92vh] overflow-y-auto space-y-4 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 safe-area-pb">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <NongTangMascot className="w-10 h-10 shrink-0" />
                <div>
                  <h3 className="text-lg font-black text-[#252525]">
                    {editingAcc ? 'แก้ไขบัญชี' : 'เพิ่มบัญชีใหม่'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    เพิ่มแหล่งเงินที่คุณต้องการติดตาม
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-2xl bg-rose-50 text-[#E0533C] text-xs font-bold border border-rose-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              {/* 1. Account Image / Icon / Logo (Section 7) */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">
                  รูปภาพ / Logo / Icon บัญชี
                </label>
                <div className="flex items-center gap-3">
                  {/* Preview Box */}
                  <div 
                    style={{ backgroundColor: `${formColor}20`, borderColor: formColor }}
                    className="w-14 h-14 rounded-2xl border-2 flex items-center justify-center text-2xl shrink-0 overflow-hidden shadow-2xs relative group"
                  >
                    {formImage ? (
                      <img src={formImage} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span>{formIcon}</span>
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="py-1.5 px-3 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-1 transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{formImage ? 'เปลี่ยนรูปภาพ' : 'อัปโหลดรูปภาพ / Logo'}</span>
                      </button>

                      {formImage && (
                        <button
                          type="button"
                          onClick={() => setFormImage(null)}
                          className="py-1.5 px-2.5 rounded-xl border border-rose-200 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          ลบรูป
                        </button>
                      )}
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleImageFileChange} 
                      accept="image/*" 
                      className="hidden" 
                    />
                    <p className="text-[10px] text-gray-400">
                      รองรับไฟล์ภาพ JPG, PNG หรือเลือก Icon ด้านล่าง
                    </p>
                  </div>
                </div>

                {/* Preset Icon Suggestions */}
                <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1 scrollbar-none">
                  {PRESET_ICONS.map(ic => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => {
                        setFormIcon(ic);
                        setFormImage(null);
                      }}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-all ${
                        formIcon === ic && !formImage ? 'bg-[#3F8F72] text-white shadow-xs' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Account Name (Required) */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  ชื่อบัญชี <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="เช่น KBank - ออมทรัพย์, TrueMoney, เงินสด"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full p-2.5 rounded-2xl border border-gray-300 text-sm focus:border-[#3F8F72] focus:outline-hidden"
                  required
                />
              </div>

              {/* 3. Account Type (Section 1) */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  ประเภทบัญชี <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {ACCOUNT_TYPES.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleTypeSelect(t)}
                      className={`py-2 px-2.5 rounded-xl font-bold text-xs border text-center transition-all ${
                        formType === t
                          ? 'bg-[#3F8F72] text-white border-[#3F8F72] shadow-xs'
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* ========================================================
                  DYNAMIC FIELDS PER ACCOUNT TYPE (Section 2)
                  ======================================================== */}
              
              {/* Type B: ธนาคาร */}
              {formType === 'ธนาคาร' && (
                <div className="space-y-3 p-3.5 rounded-2xl bg-[#FAF8F2] border border-[#EAE6DA]">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">ธนาคาร</label>
                    <select
                      value={formBank}
                      onChange={(e) => {
                        const bId = e.target.value;
                        setFormBank(bId);
                        const found = BANK_PROVIDERS.find(b => b.id === bId);
                        if (found) {
                          setFormColor(found.color);
                          setFormIcon(found.icon);
                        }
                      }}
                      className="w-full p-2.5 rounded-xl border border-gray-300 bg-white text-sm font-medium focus:border-[#3F8F72] focus:outline-hidden"
                    >
                      {BANK_PROVIDERS.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  {formBank === 'other' && (
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">ระบุชื่อธนาคาร</label>
                      <input
                        type="text"
                        placeholder="พิมพ์ชื่อธนาคารของคุณ"
                        value={formCustomBank}
                        onChange={(e) => setFormCustomBank(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-gray-300 bg-white text-sm"
                        required
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">เลขบัญชี</label>
                    <input
                      type="text"
                      placeholder="เช่น 123-4-56789-0"
                      value={formAccountNumber}
                      onChange={(e) => setFormAccountNumber(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-300 bg-white text-sm font-mono"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">
                      รองรับเลขบัญชีทุกธนาคาร และจะถูก Mask บนหน้าจอเพื่อความปลอดภัย
                    </p>
                  </div>
                </div>
              )}

              {/* Type C: กระเป๋าเงินออนไลน์ */}
              {formType === 'กระเป๋าเงินออนไลน์' && (
                <div className="space-y-3 p-3.5 rounded-2xl bg-[#FAF8F2] border border-[#EAE6DA]">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">ผู้ให้บริการ</label>
                    <select
                      value={formWalletProvider}
                      onChange={(e) => {
                        const wId = e.target.value;
                        setFormWalletProvider(wId);
                        const found = WALLET_PROVIDERS.find(w => w.id === wId);
                        if (found) {
                          setFormColor(found.color);
                          setFormIcon(found.icon);
                        }
                      }}
                      className="w-full p-2.5 rounded-xl border border-gray-300 bg-white text-sm font-medium focus:border-[#3F8F72] focus:outline-hidden"
                    >
                      {WALLET_PROVIDERS.map(w => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>
                  </div>

                  {formWalletProvider === 'other' && (
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">ระบุชื่อผู้ให้บริการ</label>
                      <input
                        type="text"
                        placeholder="พิมพ์ชื่อกระเป๋าเงิน"
                        value={formCustomWallet}
                        onChange={(e) => setFormCustomWallet(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-gray-300 bg-white text-sm"
                        required
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      หมายเลข Wallet / เบอร์โทร / ID
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น 081-234-5678 หรือ Wallet ID"
                      value={formAccountNumber}
                      onChange={(e) => setFormAccountNumber(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-300 bg-white text-sm font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Type D: บัตรเครดิต */}
              {formType === 'บัตรเครดิต' && (
                <div className="space-y-3 p-3.5 rounded-2xl bg-rose-50/60 border border-rose-200">
                  <div className="flex items-center gap-1.5 text-xs text-[#E0533C] font-bold">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>บัตรเครดิตถือเป็นหนี้สิน วงเงินจะไม่ถูกนับรวมเป็นเงินที่มี</span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">ธนาคาร / ผู้ให้บริการ</label>
                    <select
                      value={formCardProvider}
                      onChange={(e) => {
                        const cId = e.target.value;
                        setFormCardProvider(cId);
                        const found = CREDIT_CARD_PROVIDERS.find(c => c.id === cId);
                        if (found) {
                          setFormColor(found.color);
                          setFormIcon(found.icon);
                        }
                      }}
                      className="w-full p-2.5 rounded-xl border border-gray-300 bg-white text-sm font-medium focus:border-[#E0533C] focus:outline-hidden"
                    >
                      {CREDIT_CARD_PROVIDERS.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">หมายเลขบัตร</label>
                    <input
                      type="text"
                      placeholder="4111 1111 1111 1234"
                      value={formAccountNumber}
                      onChange={(e) => setFormAccountNumber(formatCardNumberDisplay(e.target.value))}
                      maxLength={19}
                      className="w-full p-2.5 rounded-xl border border-gray-300 bg-white text-sm font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">วงเงินบัตร (฿)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="80000"
                        value={formCreditLimitStr}
                        onChange={(e) => setFormCreditLimitStr(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-gray-300 bg-white text-sm font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">ยอดค้างชำระ (฿)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="45000"
                        value={formOutstandingStr}
                        onChange={(e) => setFormOutstandingStr(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-gray-300 bg-white text-sm font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">วันครบกำหนดชำระ</label>
                    <input
                      type="text"
                      placeholder="เช่น วันที่ 25 หรือ 25/10/2026"
                      value={formDueDate}
                      onChange={(e) => setFormDueDate(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-300 bg-white text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Type E: บัญชีลงทุน */}
              {formType === 'บัญชีลงทุน' && (
                <div className="space-y-3 p-3.5 rounded-2xl bg-[#FAF8F2] border border-[#EAE6DA]">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Platform / Broker</label>
                    <select
                      value={formPlatform}
                      onChange={(e) => {
                        const pId = e.target.value;
                        setFormPlatform(pId);
                        const found = INVESTMENT_PLATFORMS.find(p => p.id === pId);
                        if (found) {
                          setFormColor(found.color);
                          setFormIcon(found.icon);
                        }
                      }}
                      className="w-full p-2.5 rounded-xl border border-gray-300 bg-white text-sm font-medium focus:border-[#3F8F72] focus:outline-hidden"
                    >
                      {INVESTMENT_PLATFORMS.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Investor ID / เลขบัญชีลงทุน</label>
                    <input
                      type="text"
                      placeholder="เช่น INV-123456"
                      value={formInvestorId}
                      onChange={(e) => setFormInvestorId(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-300 bg-white text-sm font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Type F: อื่น ๆ */}
              {formType === 'อื่น ๆ' && (
                <div className="space-y-3 p-3.5 rounded-2xl bg-[#FAF8F2] border border-[#EAE6DA]">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">หมายเลขบัญชี / ID (ถ้ามี)</label>
                    <input
                      type="text"
                      placeholder="หมายเลขอ้างอิง"
                      value={formAccountNumber}
                      onChange={(e) => setFormAccountNumber(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-300 bg-white text-sm font-mono"
                    />
                  </div>
                </div>
              )}

              {/* 5. Balance / Value Input (except credit card which has outstandingDebt) */}
              {formType !== 'บัตรเครดิต' && (
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    {formType === 'บัญชีลงทุน' ? 'มูลค่าปัจจุบัน (฿)' : 'ยอดเงินคงเหลือ (฿)'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formOpeningStr}
                    onChange={(e) => setFormOpeningStr(e.target.value)}
                    className="w-full p-2.5 rounded-2xl border border-gray-300 text-sm font-mono focus:border-[#3F8F72] focus:outline-hidden"
                    required
                  />
                </div>
              )}

              {/* 6. Details / Note */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">รายละเอียด / หมายเหตุ</label>
                <textarea
                  rows={2}
                  placeholder="เช่น บัญชีเงินเดือน, เงินเก็บฉุกเฉิน"
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  className="w-full p-2.5 rounded-2xl border border-gray-300 text-sm focus:border-[#3F8F72] focus:outline-hidden"
                />
              </div>

              {/* 7. Color Swatches (Section 10) */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">สีประจำบัญชี</label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormColor(c)}
                      style={{ backgroundColor: c }}
                      className={`w-7 h-7 rounded-full shrink-0 transition-transform flex items-center justify-center text-white ${
                        formColor === c ? 'scale-110 ring-2 ring-offset-2 ring-gray-400' : 'hover:scale-105'
                      }`}
                    >
                      {formColor === c && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-2xl border border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-50 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-3 rounded-2xl bg-[#3F8F72] hover:bg-[#2F7259] text-white font-bold text-xs shadow-md shadow-[#3F8F72]/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isSaving ? 'กำลังบันทึก...' : 'บันทึกบัญชี'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
