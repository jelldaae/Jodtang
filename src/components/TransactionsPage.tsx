import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Transaction, TransactionType } from '../types';
import { 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  ArrowUpRight, 
  ArrowDownRight, 
  ArrowRightLeft, 
  CreditCard, 
  PiggyBank, 
  HandCoins,
  FileSpreadsheet,
  ReceiptText,
  Plus,
  Calendar,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

interface TransactionsPageProps {
  onOpenAddModal: () => void;
  onEditTransaction: (tx: Transaction) => void;
  initialFilterAccount?: string | null;
  onClearFilterAccount?: () => void;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({
  onOpenAddModal,
  onEditTransaction,
  initialFilterAccount,
  onClearFilterAccount,
}) => {
  const { 
    transactions, 
    accounts, 
    incomeCats, 
    expenseCats, 
    deleteTransaction, 
    spreadsheet 
  } = useApp();

  const [period, setPeriod] = useState<string>(initialFilterAccount ? 'all' : 'month');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterAccount, setFilterAccount] = useState<string>(initialFilterAccount || 'all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Custom date range
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');

  // Delete modal confirmation state
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);

  // Pagination state (Section 7: Support Pagination when transactions > 100)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(50);

  // Sync with initialFilterAccount when it changes
  React.useEffect(() => {
    if (initialFilterAccount) {
      setFilterAccount(initialFilterAccount);
      setPeriod('all');
    }
  }, [initialFilterAccount]);

  // Reset to first page whenever any filter or page size changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [period, filterType, filterAccount, searchQuery, customStart, customEnd, pageSize]);

  const currentFilteredAccount = useMemo(() => {
    if (filterAccount === 'all') return null;
    return accounts.find(a => a.id === filterAccount);
  }, [filterAccount, accounts]);

  // Filter calculations
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const thisMonth = today.slice(0, 7);

    // Compute current week (Monday to Sunday)
    const dayOfWeek = now.getDay();
    const diffToMonday = (dayOfWeek + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - diffToMonday);
    const startOfWeek = monday.toISOString().slice(0, 10);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const endOfWeek = sunday.toISOString().slice(0, 10);

    // Compute previous month
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    const lastMonth = d.toISOString().slice(0, 7);
    const thisYear = today.slice(0, 4);

    return transactions.filter((tx) => {
      if (tx.status === 'ลบแล้ว') return false;

      // Period filter
      if (period === 'day') {
        if (tx.date !== today) return false;
      } else if (period === 'week') {
        if (tx.date < startOfWeek || tx.date > endOfWeek) return false;
      } else if (period === 'month') {
        if (!tx.date.startsWith(thisMonth)) return false;
      } else if (period === 'lastMonth') {
        if (!tx.date.startsWith(lastMonth)) return false;
      } else if (period === 'year') {
        if (!tx.date.startsWith(thisYear)) return false;
      } else if (period === 'custom') {
        if (customStart && tx.date < customStart) return false;
        if (customEnd && tx.date > customEnd) return false;
      }

      // Type filter
      if (filterType !== 'all' && tx.type !== filterType) {
        return false;
      }

      // Account filter
      if (filterAccount !== 'all') {
        if (tx.accountId !== filterAccount && tx.toAccountId !== filterAccount) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const descMatch = (tx.description || '').toLowerCase().includes(q);
        const cat = (tx.type === 'income' ? incomeCats : expenseCats).find(c => c.id === tx.categoryId);
        const catMatch = (cat?.name || '').toLowerCase().includes(q);
        const acc = accounts.find(a => a.id === tx.accountId);
        const accMatch = (acc?.name || '').toLowerCase().includes(q);
        if (!descMatch && !catMatch && !accMatch) return false;
      }

      return true;
    });
  }, [transactions, period, filterType, filterAccount, searchQuery, customStart, customEnd, incomeCats, expenseCats, accounts]);

  // Pagination calculations (Section 7)
  const totalCount = filteredTransactions.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalCount);

  const paginatedTransactions = useMemo(() => {
    return filteredTransactions.slice(startIndex, endIndex);
  }, [filteredTransactions, startIndex, endIndex]);

  // Group by date for currently displayed page
  const groupedByDate = useMemo(() => {
    const groups: { [date: string]: Transaction[] } = {};
    paginatedTransactions.forEach((tx) => {
      if (!groups[tx.date]) groups[tx.date] = [];
      groups[tx.date].push(tx);
    });

    // Sort dates descending
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [paginatedTransactions]);

  // Overall totals for filtered set
  const { filteredIncome, filteredExpense } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    filteredTransactions.forEach((tx) => {
      const amt = Number(tx.amount) || 0;
      if (tx.type === 'income' || tx.type === 'refund' || tx.type === 'receivable_receipt') {
        inc += amt;
      } else if (tx.type === 'expense' || tx.type === 'subscription') {
        exp += amt;
      } else if (tx.type === 'debt_payment') {
        exp += (Number(tx.interest) || 0);
      }
    });
    return { filteredIncome: inc, filteredExpense: exp };
  }, [filteredTransactions]);

  const getAccountName = (accId?: string) => {
    if (!accId) return '';
    return accounts.find(a => a.id === accId)?.name || '';
  };

  const getCategoryName = (tx: Transaction) => {
    if (tx.type === 'transfer') return 'โอนเงิน';
    if (tx.type === 'debt_payment') return 'ชำระหนี้';
    if (tx.type === 'saving') return 'ออมเงิน';
    if (tx.type === 'receivable_receipt') return 'รับเงินลูกหนี้';

    const cats = tx.type === 'income' ? incomeCats : expenseCats;
    const cat = cats.find(c => c.id === tx.categoryId);
    return cat?.name || (tx.type === 'income' ? 'รายรับ' : 'รายจ่าย');
  };

  const getCategoryIcon = (tx: Transaction) => {
    if (tx.type === 'transfer') return <ArrowRightLeft className="w-4 h-4 text-blue-600" />;
    if (tx.type === 'debt_payment') return <CreditCard className="w-4 h-4 text-rose-600" />;
    if (tx.type === 'saving') return <PiggyBank className="w-4 h-4 text-amber-600" />;
    if (tx.type === 'receivable_receipt') return <HandCoins className="w-4 h-4 text-emerald-600" />;

    const cats = tx.type === 'income' ? incomeCats : expenseCats;
    const cat = cats.find(c => c.id === tx.categoryId);
    return <span className="text-lg">{cat?.icon || '🏷️'}</span>;
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteTransaction(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in duration-300">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-5 sm:p-6 border border-[#EAE6DA] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-100/80 text-blue-700 flex items-center justify-center font-bold shrink-0">
            <ReceiptText className="w-5 h-5 stroke-[2.3]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#17202A] tracking-tight">
              รายการทั้งหมด
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-gray-500 mt-1">
              บันทึกและซิงค์ข้อมูลแบบเรียลไทม์กับ Google Sheets
            </p>
          </div>
        </div>

        <button
          onClick={onOpenAddModal}
          className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-[#159B78] hover:bg-[#0F765C] text-white font-bold text-sm shadow-md shadow-[#159B78]/25 active:scale-95 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>เพิ่มรายการ</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#EAE6DA] shadow-xs space-y-3">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="ค้นหาตามรายละเอียด, หมวดหมู่, บัญชี..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 bg-[#FAF8F2]/60 text-sm focus:border-[#3F8F72] focus:bg-white focus:outline-hidden"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Period Chips (วันนี้ สัปดาห์นี้ เดือนนี้ เดือนที่แล้ว ปีนี้ ทั้งหมด และ กำหนดเอง) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'day', label: 'วันนี้' },
            { id: 'week', label: 'สัปดาห์นี้' },
            { id: 'month', label: 'เดือนนี้' },
            { id: 'lastMonth', label: 'เดือนที่แล้ว' },
            { id: 'year', label: 'ปีนี้' },
            { id: 'all', label: 'ทั้งหมด' },
            { id: 'custom', label: 'กำหนดเอง' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setPeriod(item.id)}
              className={`py-1.5 px-3 rounded-full font-semibold whitespace-nowrap transition-all ${
                period === item.id
                  ? 'bg-[#3F8F72] text-white shadow-2xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Custom Date Range Picker */}
        {period === 'custom' && (
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-xs text-gray-500 block mb-1">วันที่เริ่มต้น</label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="w-full p-2 text-xs rounded-xl border border-gray-200 bg-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">วันที่สิ้นสุด</label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="w-full p-2 text-xs rounded-xl border border-gray-200 bg-white"
              />
            </div>
          </div>
        )}

        {/* Filter Dropdowns (Type & Account) */}
        <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
          <div>
            <label className="text-xs text-gray-500 block mb-1">ประเภท</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full p-2 rounded-xl border border-gray-200 bg-white font-medium focus:border-[#3F8F72] focus:outline-hidden"
            >
              <option value="all">ทุกประเภท</option>
              <option value="expense">รายจ่าย</option>
              <option value="income">รายรับ</option>
              <option value="transfer">โอนเงิน</option>
              <option value="debt_payment">ชำระหนี้</option>
              <option value="saving">ออมเงิน</option>
              <option value="receivable_receipt">รับเงินลูกหนี้</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">บัญชี</label>
            <select
              value={filterAccount}
              onChange={(e) => setFilterAccount(e.target.value)}
              className="w-full p-2 rounded-xl border border-gray-200 bg-white font-medium focus:border-[#3F8F72] focus:outline-hidden"
            >
              <option value="all">ทุกบัญชี</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Active Account Filter Banner */}
      {currentFilteredAccount && (
        <div className="bg-[#159B78]/10 border border-[#159B78]/30 rounded-2xl p-3 sm:p-3.5 px-4 flex items-center justify-between gap-3 text-xs sm:text-sm animate-in fade-in">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-xl shrink-0">{currentFilteredAccount.icon || '🏦'}</span>
            <div className="truncate">
              <span className="text-gray-500 font-medium">กำลังแสดงเฉพาะรายการของบัญชี: </span>
              <strong className="text-[#159B78] font-black">{currentFilteredAccount.name}</strong>
              <span className="text-xs text-gray-400 font-semibold ml-2">
                (พบ {filteredTransactions.length} รายการ)
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              setFilterAccount('all');
              if (onClearFilterAccount) onClearFilterAccount();
            }}
            className="text-xs font-bold text-gray-600 hover:text-rose-600 bg-white px-3 py-1.5 rounded-xl border border-gray-200 flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs shrink-0"
          >
            <span>ดูทุกบัญชี</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Summary of current filtered view & Page Size Selector (Section 7) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-2 text-xs sm:text-sm font-semibold text-gray-600">
        <div className="flex items-center gap-3">
          <span>พบ {totalCount} รายการ</span>
          {totalCount > pageSize && (
            <span className="text-gray-400 font-normal">
              (แสดง {startIndex + 1} - {endIndex})
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-gray-400 font-normal hidden sm:inline">ต่อหน้า:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="py-1 px-2 text-xs font-bold rounded-xl border border-gray-200 bg-white cursor-pointer hover:border-gray-300"
            >
              <option value={25}>25 รายการ</option>
              <option value={50}>50 รายการ</option>
              <option value={100}>100 รายการ</option>
              <option value={200}>200 รายการ</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#3F8F72]">
              +฿{filteredIncome.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[#FF8F7A]">
              -฿{filteredExpense.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Grouped Transaction List */}
      {groupedByDate.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#EAE6DA] shadow-xs space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto text-2xl">
            🧾
          </div>
          <h4 className="text-base font-bold text-gray-800">ไม่พบรายการตามเงื่อนไข</h4>
          <p className="text-xs text-gray-500">ลองปรับเปลี่ยนตัวกรอง หรือกด "+ เพิ่มรายการ"</p>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedByDate.map(([dateStr, items]) => {
            // Compute daily income & expense
            let dayIncome = 0;
            let dayExpense = 0;
            items.forEach(it => {
              const amt = Number(it.amount) || 0;
              if (it.type === 'income' || it.type === 'refund' || it.type === 'receivable_receipt') {
                dayIncome += amt;
              } else if (it.type === 'expense' || it.type === 'subscription' || it.type === 'debt_payment') {
                dayExpense += amt;
              }
            });

            return (
              <div key={dateStr} className="bg-white rounded-3xl p-4 sm:p-5 border border-[#EAE6DA] shadow-xs space-y-3">
                {/* Date Header */}
                <div className="flex items-center justify-between pb-2 border-b border-gray-100 text-xs font-bold">
                  <div className="flex items-center gap-2 text-gray-800">
                    <Calendar className="w-4 h-4 text-[#3F8F72]" />
                    <span>{dateStr}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {dayIncome > 0 && (
                      <span className="text-[#3F8F72]">+฿{dayIncome.toLocaleString()}</span>
                    )}
                    {dayExpense > 0 && (
                      <span className="text-gray-500">-฿{dayExpense.toLocaleString()}</span>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div className="divide-y divide-gray-50">
                  {items.map((tx) => {
                    const isIncome = tx.type === 'income' || tx.type === 'refund' || tx.type === 'receivable_receipt';
                    const sign = isIncome ? '+' : '-';
                    const amountColor = isIncome ? 'text-[#3F8F72]' : 'text-[#252525]';

                    return (
                      <div
                        key={tx.id}
                        className="py-3 flex items-center justify-between gap-3 hover:bg-[#FAF8F2] -mx-2 px-2 rounded-2xl group transition-colors"
                      >
                        <div 
                          onClick={() => onEditTransaction(tx)}
                          className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                        >
                          <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center shrink-0">
                            {getCategoryIcon(tx)}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-gray-900 truncate">
                              {tx.description || 'ไม่มีรายละเอียด'}
                            </div>
                            <div className="text-[11px] text-gray-400 flex items-center gap-1.5 mt-0.5 flex-wrap">
                              <span className="font-medium text-gray-600">{getCategoryName(tx)}</span>
                              <span>•</span>
                              <span>{getAccountName(tx.accountId)}</span>
                              {tx.toAccountId && (
                                <span>→ {getAccountName(tx.toAccountId)}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Amount & Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-sm sm:text-base font-extrabold ${amountColor}`}>
                            {sign}฿{tx.amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>

                          <button
                            onClick={() => onEditTransaction(tx)}
                            title="แก้ไข"
                            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setDeleteTarget(tx)}
                            title="ลบรายการ"
                            className="p-1.5 text-gray-400 hover:text-[#E0533C] rounded-lg hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls (Requirement 7: support pagination when transactions > 100) */}
      {totalPages > 1 && (
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#EAE6DA] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs animate-in fade-in">
          <div className="text-gray-500 font-medium text-center sm:text-left">
            แสดงรายการที่ <b className="text-gray-900">{startIndex + 1}</b> - <b className="text-gray-900">{endIndex}</b> จากทั้งหมด <b className="text-gray-900">{totalCount}</b> รายการ (หน้า {safeCurrentPage} / {totalPages})
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            {/* First Page */}
            <button
              type="button"
              onClick={() => setCurrentPage(1)}
              disabled={safeCurrentPage === 1}
              className="p-2 rounded-xl border border-gray-200 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="หน้าแรก"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>

            {/* Prev Page */}
            <button
              type="button"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={safeCurrentPage === 1}
              className="p-2 rounded-xl border border-gray-200 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="หน้าก่อนหน้า"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page number buttons */}
            <div className="flex items-center gap-1">
              {(() => {
                const pages: (number | string)[] = [];
                if (totalPages <= 7) {
                  for (let i = 1; i <= totalPages; i++) pages.push(i);
                } else {
                  pages.push(1);
                  if (safeCurrentPage > 3) pages.push('...');
                  const start = Math.max(2, safeCurrentPage - 1);
                  const end = Math.min(totalPages - 1, safeCurrentPage + 1);
                  for (let i = start; i <= end; i++) {
                    if (!pages.includes(i)) pages.push(i);
                  }
                  if (safeCurrentPage < totalPages - 2) pages.push('... ');
                  if (!pages.includes(totalPages)) pages.push(totalPages);
                }

                return pages.map((p, idx) => {
                  if (typeof p === 'string') {
                    return (
                      <span key={`dots-${idx}`} className="px-1 text-gray-400 font-bold">
                        ...
                      </span>
                    );
                  }
                  const isCurrent = p === safeCurrentPage;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setCurrentPage(p)}
                      className={`min-w-8 h-8 px-2.5 rounded-xl font-bold transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-[#159B78] text-white shadow-2xs'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {p}
                    </button>
                  );
                });
              })()}
            </div>

            {/* Next Page */}
            <button
              type="button"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage === totalPages}
              className="p-2 rounded-xl border border-gray-200 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="หน้าถัดไป"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Last Page */}
            <button
              type="button"
              onClick={() => setCurrentPage(totalPages)}
              disabled={safeCurrentPage === totalPages}
              className="p-2 rounded-xl border border-gray-200 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="หน้าสุดท้าย"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Destructive Delete */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="ลบรายการนี้ใช่หรือไม่?"
        message={`ต้องการลบรายการ "${deleteTarget?.description || 'รายการ'}" จำนวน ฿${deleteTarget?.amount.toLocaleString()} จาก Google Sheets หรือไม่? รายการนี้จะถูกบันทึกเป็น 'ลบแล้ว' ในชีต`}
        confirmLabel="ลบรายการ"
        cancelLabel="ยกเลิก"
        isDestructive={true}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
