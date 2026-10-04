import { 
  Account, 
  Budget, 
  Debt, 
  Goal, 
  Asset, 
  Recurring, 
  Transaction, 
  Category 
} from '../types';

/**
 * JODTANG — DEMO DATA SPECIFICATION (301 Records Total)
 * Fully compliant with Master Prompt Sections 1 - 50:
 * - 9 Accounts
 * - 15 Budgets
 * - 6 Debts
 * - 4 Savings Goals
 * - 10 Assets
 * - 7 Recurring Items
 * - 250 Transactions (45 Income, 190 Expense, 15 Transfer)
 */

// ========================================================
// 1. DEMO ACCOUNTS (9 Accounts - Section 4)
// ========================================================
export const DEMO_ACCOUNTS: Account[] = [
  {
    id: 'ACC-DEMO-01',
    name: 'เงินสด',
    type: 'เงินสด',
    opening: 3500,
    status: 'ใช้งาน',
    isDemo: true,
    color: '#159B78',
    icon: '💵',
    createdAt: '2026-01-01 08:00:00',
    updatedAt: '2026-10-01 08:00:00',
  },
  {
    id: 'ACC-DEMO-02',
    name: 'KBank',
    type: 'ธนาคาร',
    bank: 'KBank',
    accountNumber: 'xxx-x-12345-x',
    opening: 12850,
    status: 'ใช้งาน',
    isDemo: true,
    color: '#138F46',
    icon: '🟢',
    createdAt: '2026-01-01 08:00:00',
    updatedAt: '2026-10-01 08:00:00',
  },
  {
    id: 'ACC-DEMO-03',
    name: 'SCB',
    type: 'ธนาคาร',
    bank: 'SCB',
    accountNumber: 'xxx-x-67890-x',
    opening: 10500,
    status: 'ใช้งาน',
    isDemo: true,
    color: '#4E2A84',
    icon: '🟣',
    createdAt: '2026-01-01 08:00:00',
    updatedAt: '2026-10-01 08:00:00',
  },
  {
    id: 'ACC-DEMO-04',
    name: 'TrueMoney',
    type: 'กระเป๋าเงินออนไลน์',
    walletProvider: 'TrueMoney',
    accountNumber: '08x-xxx-1234',
    opening: 2000,
    status: 'ใช้งาน',
    isDemo: true,
    color: '#F97316',
    icon: '📱',
    createdAt: '2026-01-01 08:00:00',
    updatedAt: '2026-10-01 08:00:00',
  },
  {
    id: 'ACC-DEMO-05',
    name: 'KBank Savings',
    type: 'ธนาคาร',
    bank: 'KBank',
    accountNumber: 'xxx-x-24680-x',
    opening: 35000,
    status: 'ใช้งาน',
    isDemo: true,
    color: '#159B78',
    icon: '🏦',
    createdAt: '2026-01-01 08:00:00',
    updatedAt: '2026-10-01 08:00:00',
  },
  {
    id: 'ACC-DEMO-06',
    name: 'KBank Credit Card',
    type: 'บัตรเครดิต',
    bank: 'KBank',
    creditCardProvider: 'KBank',
    accountNumber: '**** **** **** 1234',
    creditLimit: 80000,
    outstandingDebt: 42500,
    opening: 0,
    status: 'ใช้งาน',
    isDemo: true,
    color: '#1E293B',
    icon: '💳',
    createdAt: '2026-01-01 08:00:00',
    updatedAt: '2026-10-01 08:00:00',
  },
  {
    id: 'ACC-DEMO-07',
    name: 'SCB Easy Wallet',
    type: 'กระเป๋าเงินออนไลน์',
    walletProvider: 'SCB Easy',
    accountNumber: 'xxx-4567',
    opening: 4500,
    status: 'ใช้งาน',
    isDemo: true,
    color: '#6D28D9',
    icon: '👛',
    createdAt: '2026-01-01 08:00:00',
    updatedAt: '2026-10-01 08:00:00',
  },
  {
    id: 'ACC-DEMO-08',
    name: 'บัญชีลงทุน KBank',
    type: 'บัญชีลงทุน',
    platform: 'KBank',
    investorId: 'INV-XXXXXX',
    opening: 75000,
    status: 'ใช้งาน',
    isDemo: true,
    color: '#0284C7',
    icon: '📈',
    createdAt: '2026-01-01 08:00:00',
    updatedAt: '2026-10-01 08:00:00',
  },
  {
    id: 'ACC-DEMO-09',
    name: 'เงินเก็บที่บ้าน',
    type: 'เงินสด',
    opening: 8000,
    status: 'ใช้งาน',
    isDemo: true,
    color: '#B45309',
    icon: '🪙',
    createdAt: '2026-01-01 08:00:00',
    updatedAt: '2026-10-01 08:00:00',
  },
];

// ========================================================
// 2. DEMO BUDGET (15 Categories - Sections 5, 6, 7, 30)
// ========================================================
export const DEMO_BUDGET_SPECS = [
  { name: 'บ้านและที่อยู่อาศัย', amount: 8000 },
  { name: 'อาหารและเครื่องดื่ม', amount: 8000 },
  { name: 'เดินทางและยานพาหนะ', amount: 5000 },
  { name: 'สาธารณูปโภค', amount: 2500 },
  { name: 'โทรศัพท์และอินเทอร์เน็ต', amount: 1500 },
  { name: 'สุขภาพและการแพทย์', amount: 2000 },
  { name: 'ประกันภัย', amount: 3000 },
  { name: 'ช้อปปิ้งและของใช้ส่วนตัว', amount: 4000 },
  { name: 'บันเทิงและไลฟ์สไตล์', amount: 3000 },
  { name: 'การศึกษาและพัฒนาตัวเอง', amount: 2500 },
  { name: 'ธุรกิจ / การทำงาน', amount: 5000 },
  { name: 'ภาษีและค่าธรรมเนียม', amount: 2000 },
  { name: 'สมาชิกและ Subscription', amount: 2500 },
  { name: 'ของขวัญ / บริจาค', amount: 1500 },
  { name: 'รายจ่ายอื่น ๆ', amount: 2000 },
];

export const getDemoBudgets = (monthStr: string, expenseCategories: Category[]): Budget[] => {
  return DEMO_BUDGET_SPECS.map((spec, idx) => {
    // Strict Match with Category Master (Section 6 & 7)
    const matched = expenseCategories.find(c => c.name === spec.name) || 
      expenseCategories.find(c => c.name.includes(spec.name) || spec.name.includes(c.name));
    const categoryId = matched ? matched.id : `CAT-EXP-${String(idx + 1).padStart(3, '0')}`;

    return {
      id: `BDG-DEMO-${String(idx + 1).padStart(2, '0')}`,
      month: monthStr,
      categoryId,
      amount: spec.amount,
      status: 'ใช้งาน',
      isDemo: true,
      createdAt: '2026-10-01 08:00:00',
      updatedAt: '2026-10-01 08:00:00',
    };
  });
};

// ========================================================
// 3. DEMO DEBTS (6 Items - Section 8)
// ========================================================
export const DEMO_DEBTS: Debt[] = [
  {
    id: 'DEBT-DEMO-01',
    name: 'KBank Credit Card',
    category: 'บัตรเครดิต',
    creditor: 'KBank',
    initial: 120000,
    remaining: 42500,
    interest: 16,
    minPay: 5000,
    monthlyPayment: 5000,
    dueDate: 'วันที่ 5',
    accountId: 'ACC-DEMO-06',
    status: 'ใช้งาน',
    isDemo: true,
    createdAt: '2026-01-01 08:00:00',
    updatedAt: '2026-10-01 08:00:00',
  },
  {
    id: 'DEBT-DEMO-02',
    name: 'SCB Credit Card',
    category: 'บัตรเครดิต',
    creditor: 'SCB',
    initial: 40000,
    remaining: 8500,
    interest: 15,
    minPay: 2500,
    monthlyPayment: 2500,
    dueDate: 'วันที่ 15',
    accountId: 'ACC-DEMO-03',
    status: 'ใช้งาน',
    isDemo: true,
    createdAt: '2026-01-01 08:00:00',
    updatedAt: '2026-10-01 08:00:00',
  },
  {
    id: 'DEBT-DEMO-03',
    name: 'สินเชื่อรถยนต์',
    category: 'สินเชื่อรถยนต์',
    creditor: 'KBank',
    initial: 450000,
    remaining: 285000,
    interest: 5.5,
    minPay: 7200,
    monthlyPayment: 7200,
    dueDate: 'วันที่ 25',
    accountId: 'ACC-DEMO-02',
    status: 'ใช้งาน',
    isDemo: true,
    createdAt: '2026-01-01 08:00:00',
    updatedAt: '2026-10-01 08:00:00',
  },
  {
    id: 'DEBT-DEMO-04',
    name: 'สินเชื่อบ้าน',
    category: 'สินเชื่อบ้าน',
    creditor: 'KBank',
    initial: 1200000,
    remaining: 780000,
    interest: 3.5,
    minPay: 15000,
    monthlyPayment: 15000,
    dueDate: 'วันที่ 28',
    accountId: 'ACC-DEMO-02',
    status: 'ใช้งาน',
    isDemo: true,
    createdAt: '2026-01-01 08:00:00',
    updatedAt: '2026-10-01 08:00:00',
  },
  {
    id: 'DEBT-DEMO-05',
    name: 'สินเชื่อส่วนบุคคล',
    category: 'สินเชื่อส่วนบุคคล',
    creditor: 'KBank',
    initial: 100000,
    remaining: 58000,
    interest: 12,
    minPay: 3500,
    monthlyPayment: 3500,
    dueDate: 'วันที่ 10',
    accountId: 'ACC-DEMO-02',
    status: 'ใช้งาน',
    isDemo: true,
    createdAt: '2026-01-01 08:00:00',
    updatedAt: '2026-10-01 08:00:00',
  },
  {
    id: 'DEBT-DEMO-06',
    name: 'ผ่อนโทรศัพท์',
    category: 'ผ่อนสินค้า',
    creditor: 'SCB',
    initial: 36000,
    remaining: 12000,
    interest: 0,
    minPay: 2000,
    monthlyPayment: 2000,
    dueDate: 'วันที่ 20',
    accountId: 'ACC-DEMO-03',
    status: 'ใช้งาน',
    isDemo: true,
    createdAt: '2026-01-01 08:00:00',
    updatedAt: '2026-10-01 08:00:00',
  },
];

// ========================================================
// 4. DEMO GOALS (4 Items - Section 9)
// ========================================================
export const DEMO_GOALS: Goal[] = [
  {
    id: 'GOAL-DEMO-01',
    name: 'เงินสำรองฉุกเฉิน',
    category: 'เงินสำรองฉุกเฉิน',
    target: 100000,
    current: 35000,
    startDate: '2026-01-01',
    deadline: '2026-12-31',
    accountId: 'ACC-DEMO-05', // KBank Savings
    status: 'ใช้งาน',
    isDemo: true,
    createdAt: '2026-01-01 08:00:00',
    updatedAt: '2026-10-01 08:00:00',
  },
  {
    id: 'GOAL-DEMO-02',
    name: 'เที่ยวญี่ปุ่น',
    category: 'ท่องเที่ยว',
    target: 60000,
    current: 22000,
    startDate: '2026-07-01',
    deadline: '2027-06-30',
    accountId: 'ACC-DEMO-05', // KBank Savings
    status: 'ใช้งาน',
    isDemo: true,
    createdAt: '2026-07-01 08:00:00',
    updatedAt: '2026-10-01 08:00:00',
  },
  {
    id: 'GOAL-DEMO-03',
    name: 'ซื้อ MacBook',
    category: 'ของที่อยากได้',
    target: 70000,
    current: 25000,
    startDate: '2026-04-01',
    deadline: '2027-03-31',
    accountId: 'ACC-DEMO-05', // KBank Savings
    status: 'ใช้งาน',
    isDemo: true,
    createdAt: '2026-04-01 08:00:00',
    updatedAt: '2026-10-01 08:00:00',
  },
  {
    id: 'GOAL-DEMO-04',
    name: 'เงินลงทุน',
    category: 'การลงทุน',
    target: 200000,
    current: 50000,
    startDate: '2026-01-01',
    deadline: '2027-12-31',
    accountId: 'ACC-DEMO-08', // บัญชีลงทุน KBank
    status: 'ใช้งาน',
    isDemo: true,
    createdAt: '2026-01-01 08:00:00',
    updatedAt: '2026-10-01 08:00:00',
  },
];

// ========================================================
// 5. DEMO ASSETS (10 Items - Section 10)
// ========================================================
export const DEMO_ASSETS: Asset[] = [
  {
    id: 'ASSET-DEMO-01',
    name: 'ทองคำ',
    category: 'ทองคำ',
    cost: 45000,
    value: 50000,
    buyDate: '2026-06-15',
    accountId: 'ACC-DEMO-02',
    note: 'ทองคำแท่ง 1 บาท',
    status: 'ใช้งาน',
    isDemo: true,
    createdAt: '2026-06-15 08:00:00',
    updatedAt: '2026-10-01 08:00:00',
  },
  {
    id: 'ASSET-DEMO-02',
    name: 'กองทุนรวม',
    category: 'การลงทุน',
    cost: 20000,
    value: 25000,
    buyDate: '2026-04-10',
    accountId: 'ACC-DEMO-02',
    status: 'ใช้งาน',
    isDemo: true,
    createdAt: '2026-04-10 08:00:00',
    updatedAt: '2026-10-01 08:00:00',
  },
  {
    id: 'ASSET-DEMO-03',
    name: 'MacBook',
    category: 'อุปกรณ์อิเล็กทรอนิกส์',
    cost: 55000,
    value: 38000,
    buyDate: '2026-01-20',
    accountId: 'ACC-DEMO-06',
    status: 'ใช้งาน',
    isDemo: true,
    createdAt: '2026-01-20 08:00:00',
    updatedAt: '2026-10-01 08:00:00',
  },
  {
    id: 'ASSET-DEMO-04',
    name: 'กล้องถ่ายรูป',
    category: 'อุปกรณ์อิเล็กทรอนิกส์',
    cost: 35000,
    value: 28000,
    buyDate: '2026-02-05',
    accountId: 'ACC-DEMO-03',
    status: 'ใช้งาน',
    isDemo: true,
    createdAt: '2026-02-05 08:00:00',
    updatedAt: '2026-10-01 08:00:00',
  },
  {
    id: 'ASSET-DEMO-05',
    name: 'เงินลงทุนหุ้น',
    category: 'การลงทุน',
    cost: 30000,
    value: 32000,
    buyDate: '2026-05-12',
    accountId: 'ACC-DEMO-08',
    status: 'ใช้งาน',
    isDemo: true,
    createdAt: '2026-05-12 08:00:00',
    updatedAt: '2026-10-01 08:00:00',
  },
  {
    id: 'ASSET-DEMO-06',
    name: 'iPad',
    category: 'อุปกรณ์อิเล็กทรอนิกส์',
    cost: 25000,
    value: 18000,
    buyDate: '2026-03-15',
    accountId: 'ACC-DEMO-06',
    status: 'ใช้งาน',
    isDemo: true,
    createdAt: '2026-03-15 08:00:00',
    updatedAt: '2026-10-01 08:00:00',
  },
  {
    id: 'ASSET-DEMO-07',
    name: 'โทรศัพท์มือถือ',
    category: 'อุปกรณ์อิเล็กทรอนิกส์',
    cost: 32000,
    value: 20000,
    buyDate: '2026-01-10',
    accountId: 'ACC-DEMO-02',
    status: 'ใช้งาน',
    isDemo: true,
    createdAt: '2026-01-10 08:00:00',
    updatedAt: '2026-10-01 08:00:00',
  },
  {
    id: 'ASSET-DEMO-08',
    name: 'เฟอร์นิเจอร์',
    category: 'ของใช้ในบ้าน',
    cost: 40000,
    value: 28000,
    buyDate: '2026-02-18',
    accountId: 'ACC-DEMO-02',
    status: 'ใช้งาน',
    isDemo: true,
    createdAt: '2026-02-18 08:00:00',
    updatedAt: '2026-10-01 08:00:00',
  },
  {
    id: 'ASSET-DEMO-09',
    name: 'จักรยาน',
    category: 'กีฬาและกิจกรรม',
    cost: 18000,
    value: 12000,
    buyDate: '2026-04-22',
    accountId: 'ACC-DEMO-03',
    status: 'ใช้งาน',
    isDemo: true,
    createdAt: '2026-04-22 08:00:00',
    updatedAt: '2026-10-01 08:00:00',
  },
  {
    id: 'ASSET-DEMO-10',
    name: 'เครื่องประดับ',
    category: 'ของใช้ส่วนตัว',
    cost: 25000,
    value: 22000,
    buyDate: '2026-06-01',
    accountId: 'ACC-DEMO-02',
    status: 'ใช้งาน',
    isDemo: true,
    createdAt: '2026-06-01 08:00:00',
    updatedAt: '2026-10-01 08:00:00',
  },
];

// ========================================================
// 6. DEMO RECURRING (7 Items - Section 11)
// ========================================================
export const DEMO_RECURRING: Recurring[] = [
  {
    id: 'REC-DEMO-01',
    name: 'Netflix',
    type: 'รายจ่าย',
    amount: 419,
    freq: 'รายเดือน',
    nextDate: '2026-10-05',
    note: 'สมาชิกและ Subscription (วันที่ 5)',
    accountId: 'ACC-DEMO-02',
    status: 'ใช้งาน',
    isDemo: true,
    createdAt: '2026-01-01 08:00:00',
    updatedAt: '2026-10-01 08:00:00',
  },
  {
    id: 'REC-DEMO-02',
    name: 'Spotify',
    type: 'รายจ่าย',
    amount: 199,
    freq: 'รายเดือน',
    nextDate: '2026-10-10',
    note: 'สมาชิกและ Subscription (วันที่ 10)',
    accountId: 'ACC-DEMO-02',
    status: 'ใช้งาน',
    isDemo: true,
    createdAt: '2026-01-01 08:00:00',
    updatedAt: '2026-10-01 08:00:00',
  },
  {
    id: 'REC-DEMO-03',
    name: 'ค่าอินเทอร์เน็ต',
    type: 'รายจ่าย',
    amount: 699,
    freq: 'รายเดือน',
    nextDate: '2026-10-15',
    note: 'โทรศัพท์และอินเทอร์เน็ต (วันที่ 15)',
    accountId: 'ACC-DEMO-02',
    status: 'ใช้งาน',
    isDemo: true,
    createdAt: '2026-01-01 08:00:00',
    updatedAt: '2026-10-01 08:00:00',
  },
  {
    id: 'REC-DEMO-04',
    name: 'ค่าโทรศัพท์',
    type: 'รายจ่าย',
    amount: 599,
    freq: 'รายเดือน',
    nextDate: '2026-10-20',
    note: 'โทรศัพท์และอินเทอร์เน็ต (วันที่ 20)',
    accountId: 'ACC-DEMO-02',
    status: 'ใช้งาน',
    isDemo: true,
    createdAt: '2026-01-01 08:00:00',
    updatedAt: '2026-10-01 08:00:00',
  },
  {
    id: 'REC-DEMO-05',
    name: 'ค่างวดรถยนต์',
    type: 'รายจ่าย',
    amount: 7200,
    freq: 'รายเดือน',
    nextDate: '2026-10-25',
    note: 'เดินทางและยานพาหนะ (วันที่ 25)',
    accountId: 'ACC-DEMO-02',
    status: 'ใช้งาน',
    isDemo: true,
    createdAt: '2026-01-01 08:00:00',
    updatedAt: '2026-10-01 08:00:00',
  },
  {
    id: 'REC-DEMO-06',
    name: 'ค่างวดบ้าน',
    type: 'รายจ่าย',
    amount: 15000,
    freq: 'รายเดือน',
    nextDate: '2026-10-28',
    note: 'บ้านและที่อยู่อาศัย (วันที่ 28)',
    accountId: 'ACC-DEMO-02',
    status: 'ใช้งาน',
    isDemo: true,
    createdAt: '2026-01-01 08:00:00',
    updatedAt: '2026-10-01 08:00:00',
  },
  {
    id: 'REC-DEMO-07',
    name: 'เงินเดือน',
    type: 'รายรับ',
    amount: 42000,
    freq: 'รายเดือน',
    nextDate: '2026-10-25',
    note: 'รายได้จากงานประจำ (วันที่ 25)',
    accountId: 'ACC-DEMO-02',
    status: 'ใช้งาน',
    isDemo: true,
    createdAt: '2026-01-01 08:00:00',
    updatedAt: '2026-10-01 08:00:00',
  },
];

// ========================================================
// 7. DEMO TRANSACTIONS (250 Items - Sections 12 - 22)
// 45 Income, 190 Expense, 15 Transfer = 250 Total
// Date range: 2026-01-01 to 2026-10-04
// ========================================================

interface RawTxDef {
  date: string;
  time: string;
  type: 'income' | 'expense' | 'transfer';
  desc: string;
  amount: number;
  catName?: string;
  accId: string;
  toAccId?: string;
}

export const getDemoTransactions = (
  incomeCats: Category[], 
  expenseCats: Category[]
): Transaction[] => {
  const findCatId = (name: string, isIncome: boolean): string | undefined => {
    const list = isIncome ? incomeCats : expenseCats;
    const exact = list.find(c => c.name === name);
    if (exact) return exact.id;
    const partial = list.find(c => c.name.includes(name) || name.includes(c.name));
    return partial?.id;
  };

  const rawList: RawTxDef[] = [];

  // ----------------------------------------------------
  // A. 45 INCOME TRANSACTIONS
  // ----------------------------------------------------
  // 10 Monthly Salaries (Jan - Oct 25th)
  const salaryMonths = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10'];
  salaryMonths.forEach((m, idx) => {
    rawList.push({
      date: `2026-${m}-${idx === 9 ? '01' : '25'}`,
      time: '09:00',
      type: 'income',
      desc: `เงินเดือนประจำเดือน ${m}/2026`,
      amount: 42000,
      catName: 'เงินเดือน',
      accId: 'ACC-DEMO-02',
    });
  });

  // 10 Freelance / Services
  const freelanceItems = [
    { m: '01', d: '15', t: '14:30', desc: 'ออกแบบโลโก้แบรนด์', amount: 8500, cat: 'ค่าจ้าง Freelance', acc: 'ACC-DEMO-02' },
    { m: '02', d: '12', t: '17:15', desc: 'พัฒนาเว็บไซต์ WordPress', amount: 15000, cat: 'ค่าจ้าง Freelance', acc: 'ACC-DEMO-02' },
    { m: '03', d: '18', t: '11:20', desc: 'ที่ปรึกษาการตลาดออนไลน์', amount: 6500, cat: 'ค่าที่ปรึกษา', acc: 'ACC-DEMO-03' },
    { m: '04', d: '08', t: '16:45', desc: 'งานเขียนบทความ SEO', amount: 4500, cat: 'ค่าจ้าง Freelance', acc: 'ACC-DEMO-02' },
    { m: '05', d: '20', t: '13:00', desc: 'ถ่ายภาพสินค้าสตูดิโอ', amount: 7500, cat: 'ค่าบริการ / งานช่าง', acc: 'ACC-DEMO-03' },
    { m: '06', d: '14', t: '15:30', desc: 'งานออกแบบ Packaging', amount: 9000, cat: 'ค่าจ้าง Freelance', acc: 'ACC-DEMO-02' },
    { m: '07', d: '10', t: '10:45', desc: 'เขียนคอนเทนต์แคมเปญ', amount: 5500, cat: 'ค่าจ้างงานพิเศษ', acc: 'ACC-DEMO-04' },
    { m: '08', d: '19', t: '16:00', desc: 'ที่ปรึกษา SEO รายเดือน', amount: 12000, cat: 'ค่าที่ปรึกษา', acc: 'ACC-DEMO-02' },
    { m: '09', d: '15', t: '11:15', desc: 'พัฒนา Landing Page', amount: 14000, cat: 'ค่าจ้าง Freelance', acc: 'ACC-DEMO-02' },
    { m: '10', d: '02', t: '14:00', desc: 'งานออกแบบกราฟิกด่วน', amount: 3500, cat: 'ค่าจ้าง Freelance', acc: 'ACC-DEMO-02' },
  ];
  freelanceItems.forEach(item => {
    rawList.push({
      date: `2026-${item.m}-${item.d}`,
      time: item.t,
      type: 'income',
      desc: item.desc,
      amount: item.amount,
      catName: item.cat,
      accId: item.acc,
    });
  });

  // 8 E-commerce / Sales
  const salesItems = [
    { m: '01', d: '28', t: '20:15', desc: 'ขายของมือสอง', amount: 2400, cat: 'กำไรจากการขายสินค้า', acc: 'ACC-DEMO-03' },
    { m: '02', d: '26', t: '19:40', desc: 'ขายเสื้อผ้าออนไลน์', amount: 3800, cat: 'รายได้ร้านค้า', acc: 'ACC-DEMO-07' },
    { m: '03', d: '22', t: '21:00', desc: 'ขายขนมโฮมเมด', amount: 5200, cat: 'รายได้ธุรกิจส่วนตัว', acc: 'ACC-DEMO-03' },
    { m: '04', d: '25', t: '18:30', desc: 'ยอดขาย Shopee สินค้าไอที', amount: 8900, cat: 'กำไรจากการขายสินค้า', acc: 'ACC-DEMO-04' },
    { m: '05', d: '29', t: '20:00', desc: 'ขายหนังสือและของสะสม', amount: 1850, cat: 'กำไรจากการขายสินค้า', acc: 'ACC-DEMO-03' },
    { m: '06', d: '27', t: '17:50', desc: 'ขายสินค้าแฮนด์เมด', amount: 4600, cat: 'รายได้ร้านค้า', acc: 'ACC-DEMO-07' },
    { m: '08', d: '28', t: '19:10', desc: 'ขายหูฟังมือสอง', amount: 2800, cat: 'กำไรจากการขายสินค้า', acc: 'ACC-DEMO-03' },
    { m: '09', d: '30', t: '20:45', desc: 'ยอดขาย Marketplace', amount: 6400, cat: 'รายได้ธุรกิจส่วนตัว', acc: 'ACC-DEMO-04' },
  ];
  salesItems.forEach(item => {
    rawList.push({
      date: `2026-${item.m}-${item.d}`,
      time: item.t,
      type: 'income',
      desc: item.desc,
      amount: item.amount,
      catName: item.cat,
      accId: item.acc,
    });
  });

  // 7 Content Creator
  const creatorItems = [
    { m: '02', d: '20', t: '10:00', desc: 'รายได้ YouTube AdSense', amount: 4200, cat: 'YouTube / TikTok', acc: 'ACC-DEMO-02' },
    { m: '03', d: '25', t: '11:30', desc: 'สปอนเซอร์รีวิวแอปพลิเคชัน', amount: 8000, cat: 'ค่าสปอนเซอร์', acc: 'ACC-DEMO-02' },
    { m: '04', d: '18', t: '15:00', desc: 'TikTok Creator Rewards', amount: 3500, cat: 'YouTube / TikTok', acc: 'ACC-DEMO-04' },
    { m: '06', d: '22', t: '14:20', desc: 'Super Chat สตรีมเกม', amount: 1800, cat: 'Super Chat / ทิป', acc: 'ACC-DEMO-04' },
    { m: '07', d: '28', t: '16:00', desc: 'สปอนเซอร์โพสต์ Facebook', amount: 6000, cat: 'ค่าโฆษณา / รีวิว', acc: 'ACC-DEMO-02' },
    { m: '09', d: '22', t: '17:30', desc: 'YouTube Partner Earnings', amount: 5100, cat: 'YouTube / TikTok', acc: 'ACC-DEMO-02' },
    { m: '10', d: '04', t: '09:15', desc: 'Super Chat สตรีมเช้า', amount: 1500, cat: 'Super Chat / ทิป', acc: 'ACC-DEMO-04' },
  ];
  creatorItems.forEach(item => {
    rawList.push({
      date: `2026-${item.m}-${item.d}`,
      time: item.t,
      type: 'income',
      desc: item.desc,
      amount: item.amount,
      catName: item.cat,
      accId: item.acc,
    });
  });

  // 5 Affiliate Commissions
  const affiliateItems = [
    { m: '02', d: '15', t: '10:15', desc: 'Shopee Affiliate ม.ค.', amount: 1250, cat: 'Affiliate / Commission', acc: 'ACC-DEMO-04' },
    { m: '04', d: '12', t: '11:00', desc: 'Lazada Affiliate ก.พ.', amount: 2100, cat: 'Affiliate / Commission', acc: 'ACC-DEMO-04' },
    { m: '06', d: '10', t: '14:30', desc: 'TikTok Shop Affiliate', amount: 3800, cat: 'Affiliate / Commission', acc: 'ACC-DEMO-04' },
    { m: '08', d: '14', t: '13:45', desc: 'Commission ขายคอร์ส', amount: 4500, cat: 'Affiliate / Commission', acc: 'ACC-DEMO-02' },
    { m: '10', d: '03', t: '10:30', desc: 'Affiliate Commission ต.ค.', amount: 2800, cat: 'Affiliate / Commission', acc: 'ACC-DEMO-04' },
  ];
  affiliateItems.forEach(item => {
    rawList.push({
      date: `2026-${item.m}-${item.d}`,
      time: item.t,
      type: 'income',
      desc: item.desc,
      amount: item.amount,
      catName: item.cat,
      accId: item.acc,
    });
  });

  // 3 Investment returns & Dividends
  const investItems = [
    { m: '03', d: '31', t: '12:00', desc: 'เงินปันผลกองทุนรวม', amount: 1450, cat: 'รายได้จากการลงทุน', acc: 'ACC-DEMO-08' },
    { m: '06', d: '30', t: '12:00', desc: 'ดอกเบี้ยเงินฝากออมทรัพย์', amount: 320, cat: 'รายได้จากการลงทุน', acc: 'ACC-DEMO-05' },
    { m: '09', d: '25', t: '15:10', desc: 'เงินปันผลหุ้นไทย', amount: 2200, cat: 'รายได้จากการลงทุน', acc: 'ACC-DEMO-08' },
  ];
  investItems.forEach(item => {
    rawList.push({
      date: `2026-${item.m}-${item.d}`,
      time: item.t,
      type: 'income',
      desc: item.desc,
      amount: item.amount,
      catName: item.cat,
      accId: item.acc,
    });
  });

  // 2 Refunds & Other Income (including Today 04/10)
  const otherIncItems = [
    { m: '05', d: '16', t: '18:20', desc: 'เงินคืนภาษีบุคคลธรรมดา', amount: 3500, cat: 'รายรับเบ็ดเตล็ด', acc: 'ACC-DEMO-02' },
    { m: '10', d: '04', t: '11:45', desc: 'เงินคืนค่าสินค้าชำรุด', amount: 1200, cat: 'รายรับเบ็ดเตล็ด', acc: 'ACC-DEMO-03' },
  ];
  otherIncItems.forEach(item => {
    rawList.push({
      date: `2026-${item.m}-${item.d}`,
      time: item.t,
      type: 'income',
      desc: item.desc,
      amount: item.amount,
      catName: item.cat,
      accId: item.acc,
    });
  });

  // ----------------------------------------------------
  // B. 15 TRANSFER TRANSACTIONS (Section 20)
  // ----------------------------------------------------
  const transfers: Array<{ m: string; d: string; t: string; desc: string; amount: number; from: string; to: string }> = [
    { m: '01', d: '05', t: '10:00', desc: 'โอนเข้าออมทรัพย์สำรอง', amount: 5000, from: 'ACC-DEMO-02', to: 'ACC-DEMO-05' },
    { m: '01', d: '26', t: '12:30', desc: 'ถอนเงินสดใช้จ่าย', amount: 2000, from: 'ACC-DEMO-02', to: 'ACC-DEMO-01' },
    { m: '02', d: '03', t: '14:00', desc: 'เติมเงิน TrueMoney Wallet', amount: 1500, from: 'ACC-DEMO-03', to: 'ACC-DEMO-04' },
    { m: '02', d: '26', t: '09:30', desc: 'จัดสรรเงินออมเที่ยวญี่ปุ่น', amount: 4000, from: 'ACC-DEMO-02', to: 'ACC-DEMO-05' },
    { m: '03', d: '08', t: '16:00', desc: 'เติมเงินเข้า SCB Easy Wallet', amount: 2000, from: 'ACC-DEMO-03', to: 'ACC-DEMO-07' },
    { m: '03', d: '27', t: '11:00', desc: 'โอนเข้าพอร์ตลงทุน KBank', amount: 5000, from: 'ACC-DEMO-02', to: 'ACC-DEMO-08' },
    { m: '04', d: '10', t: '13:20', desc: 'ถอนเงินสดเก็บที่บ้าน', amount: 3000, from: 'ACC-DEMO-02', to: 'ACC-DEMO-09' },
    { m: '05', d: '04', t: '15:45', desc: 'โอนออมเงินซื้อ MacBook', amount: 3500, from: 'ACC-DEMO-02', to: 'ACC-DEMO-05' },
    { m: '05', d: '28', t: '10:15', desc: 'เติม TrueMoney จ่ายบิล', amount: 1200, from: 'ACC-DEMO-02', to: 'ACC-DEMO-04' },
    { m: '06', d: '18', t: '17:00', desc: 'โอนระหว่างธนาคาร KBank → SCB', amount: 4000, from: 'ACC-DEMO-02', to: 'ACC-DEMO-03' },
    { m: '07', d: '15', t: '12:00', desc: 'โอนเข้าออมทรัพย์ KBank', amount: 3000, from: 'ACC-DEMO-02', to: 'ACC-DEMO-05' },
    { m: '08', d: '05', t: '14:30', desc: 'ถอนเงินสดติดกระเป๋า', amount: 1500, from: 'ACC-DEMO-03', to: 'ACC-DEMO-01' },
    { m: '08', d: '27', t: '16:40', desc: 'โอนเงินลงทุน DCA รายเดือน', amount: 5000, from: 'ACC-DEMO-02', to: 'ACC-DEMO-08' },
    { m: '09', d: '12', t: '09:50', desc: 'เติมเงิน SCB Easy Wallet', amount: 1500, from: 'ACC-DEMO-03', to: 'ACC-DEMO-07' },
    { m: '10', d: '04', t: '08:30', desc: 'KBank → TrueMoney ค่ากินวันนี้', amount: 1000, from: 'ACC-DEMO-02', to: 'ACC-DEMO-04' },
  ];
  transfers.forEach(tr => {
    rawList.push({
      date: `2026-${tr.m}-${tr.d}`,
      time: tr.t,
      type: 'transfer',
      desc: tr.desc,
      amount: tr.amount,
      accId: tr.from,
      toAccId: tr.to,
    });
  });

  // ----------------------------------------------------
  // C. 190 EXPENSE TRANSACTIONS (Sections 17 - 19)
  // Balanced across 15 categories, Jan - Oct 2026
  // ----------------------------------------------------
  const baseExpenses: Array<{
    m: string;
    d: string;
    t: string;
    desc: string;
    amount: number;
    cat: string;
    acc: string;
  }> = [];

  // Monthly Recurring Bills (9 months x multiple categories = ~70 items)
  const pastMonths = ['01', '02', '03', '04', '05', '06', '07', '08', '09'];
  pastMonths.forEach(m => {
    baseExpenses.push({ m, d: '05', t: '08:30', desc: 'ค่าเช่าบ้าน / คอนโด', amount: 7000, cat: 'บ้านและที่อยู่อาศัย', acc: 'ACC-DEMO-02' });
    baseExpenses.push({ m, d: '05', t: '20:00', desc: 'Netflix รายเดือน', amount: 419, cat: 'สมาชิกและ Subscription', acc: 'ACC-DEMO-02' });
    baseExpenses.push({ m, d: '10', t: '19:30', desc: 'Spotify Premium', amount: 199, cat: 'สมาชิกและ Subscription', acc: 'ACC-DEMO-02' });
    baseExpenses.push({ m, d: '15', t: '14:00', desc: 'ค่าเน็ตบ้านไฟเบอร์', amount: 699, cat: 'โทรศัพท์และอินเทอร์เน็ต', acc: 'ACC-DEMO-02' });
    baseExpenses.push({ m, d: '18', t: '11:15', desc: 'ค่าไฟฟ้าประจำเดือน', amount: 1450, cat: 'สาธารณูปโภค', acc: 'ACC-DEMO-02' });
    baseExpenses.push({ m, d: '19', t: '16:00', desc: 'ค่าน้ำประปา', amount: 220, cat: 'สาธารณูปโภค', acc: 'ACC-DEMO-02' });
    baseExpenses.push({ m, d: '20', t: '10:00', desc: 'ค่าโทรศัพท์รายเดือน', amount: 599, cat: 'โทรศัพท์และอินเทอร์เน็ต', acc: 'ACC-DEMO-02' });
    baseExpenses.push({ m, d: '25', t: '09:30', desc: 'ผ่อนค่างวดรถยนต์', amount: 7200, cat: 'เดินทางและยานพาหนะ', acc: 'ACC-DEMO-02' });
  });

  // Daily living items across Jan - Sep (Food, Transport, Shopping, Health, Lifestyle)
  const livingItems = [
    // Jan
    { m: '01', d: '02', t: '12:15', desc: 'ข้าวราดแกงมื้อเที่ยง', amount: 65, cat: 'อาหารและเครื่องดื่ม', acc: 'ACC-DEMO-01' },
    { m: '01', d: '03', t: '08:45', desc: 'กาแฟอเมซอนยามเช้า', amount: 65, cat: 'อาหารและเครื่องดื่ม', acc: 'ACC-DEMO-04' },
    { m: '01', d: '04', t: '18:30', desc: 'เติมน้ำมันเต็มถัง', amount: 1200, cat: 'เดินทางและยานพาหนะ', acc: 'ACC-DEMO-06' },
    { m: '01', d: '07', t: '19:15', desc: 'ซื้อของซูเปอร์มาร์เก็ต', amount: 1450, cat: 'ช้อปปิ้งและของใช้ส่วนตัว', acc: 'ACC-DEMO-03' },
    { m: '01', d: '09', t: '13:00', desc: 'ยาแก้แพ้และยาแก้หวัด', amount: 240, cat: 'สุขภาพและการแพทย์', acc: 'ACC-DEMO-01' },
    { m: '01', d: '11', t: '17:45', desc: 'ตั๋วชมภาพยนตร์ IMAX', amount: 350, cat: 'บันเทิงและไลฟ์สไตล์', acc: 'ACC-DEMO-06' },
    { m: '01', d: '14', t: '10:30', desc: 'ซื้อสมุดโน้ตและปากกาทำงาน', amount: 290, cat: 'ธุรกิจ / การทำงาน', acc: 'ACC-DEMO-01' },
    { m: '01', d: '17', t: '15:20', desc: 'ทำบุญปล่อยปลาเทศกาล', amount: 300, cat: 'ของขวัญ / บริจาค', acc: 'ACC-DEMO-02' },
    { m: '01', d: '21', t: '12:40', desc: 'ก๋วยเตี๋ยวเรือและชานม', amount: 120, cat: 'อาหารและเครื่องดื่ม', acc: 'ACC-DEMO-04' },
    { m: '01', d: '23', t: '08:15', desc: 'ค่าทางด่วนด่านประชาชื่น', amount: 60, cat: 'เดินทางและยานพาหนะ', acc: 'ACC-DEMO-04' },
    { m: '01', d: '27', t: '16:50', desc: 'ซื้อเสื้อเชิ้ตใส่ทำงาน', amount: 890, cat: 'ช้อปปิ้งและของใช้ส่วนตัว', acc: 'ACC-DEMO-03' },
    { m: '01', d: '30', t: '19:00', desc: 'ชาบูปิ้งย่างฉลองสิ้นเดือน', amount: 680, cat: 'อาหารและเครื่องดื่ม', acc: 'ACC-DEMO-03' },

    // Feb
    { m: '02', d: '02', t: '12:30', desc: 'ข้าวมันไก่พิเศษ', amount: 70, cat: 'อาหารและเครื่องดื่ม', acc: 'ACC-DEMO-01' },
    { m: '02', d: '04', t: '09:00', desc: 'ค่าทางด่วนและที่จอดรถ', amount: 140, cat: 'เดินทางและยานพาหนะ', acc: 'ACC-DEMO-02' },
    { m: '02', d: '08', t: '14:20', desc: 'ตรวจฟันและขูดหินปูน', amount: 900, cat: 'สุขภาพและการแพทย์', acc: 'ACC-DEMO-03' },
    { m: '02', d: '11', t: '18:00', desc: 'ของขวัญวันเกิดเพื่อน', amount: 850, cat: 'ของขวัญ / บริจาค', acc: 'ACC-DEMO-02' },
    { m: '02', d: '13', t: '16:15', desc: 'คอร์สเรียนออนไลน์ Data Analysis', amount: 1500, cat: 'การศึกษาและพัฒนาตัวเอง', acc: 'ACC-DEMO-02' },
    { m: '02', d: '14', t: '19:30', desc: 'ดินเนอร์วาเลนไทน์', amount: 1850, cat: 'อาหารและเครื่องดื่ม', acc: 'ACC-DEMO-06' },
    { m: '02', d: '17', t: '11:40', desc: 'ซื้อเครื่องเขียนสำนักงาน', amount: 320, cat: 'ธุรกิจ / การทำงาน', acc: 'ACC-DEMO-01' },
    { m: '02', d: '21', t: '13:10', desc: 'สกินแคร์และครีมกันแดด', amount: 1200, cat: 'ช้อปปิ้งและของใช้ส่วนตัว', acc: 'ACC-DEMO-06' },
    { m: '02', d: '24', t: '08:30', desc: 'เติมน้ำมันแก๊สโซฮอล์ 95', amount: 1000, cat: 'เดินทางและยานพาหนะ', acc: 'ACC-DEMO-02' },
    { m: '02', d: '27', t: '20:15', desc: 'ค่าซอฟต์แวร์ Notion Plus', amount: 350, cat: 'ธุรกิจ / การทำงาน', acc: 'ACC-DEMO-06' },

    // Mar
    { m: '03', d: '02', t: '12:00', desc: 'อาหารกลางวันศูนย์อาหาร', amount: 85, cat: 'อาหารและเครื่องดื่ม', acc: 'ACC-DEMO-01' },
    { m: '03', d: '04', t: '15:30', desc: 'ชำระภาษีป้ายทะเบียนรถ', amount: 1650, cat: 'ภาษีและค่าธรรมเนียม', acc: 'ACC-DEMO-02' },
    { m: '03', d: '06', t: '18:45', desc: 'ซื้อของสดทำกับข้าว', amount: 620, cat: 'อาหารและเครื่องดื่ม', acc: 'ACC-DEMO-04' },
    { m: '03', d: '09', t: '14:10', desc: 'หนังสือพัฒนาตนเอง 2 เล่ม', amount: 560, cat: 'การศึกษาและพัฒนาตัวเอง', acc: 'ACC-DEMO-03' },
    { m: '03', d: '12', t: '09:20', desc: 'ค่าเปลี่ยนถ่ายน้ำมันเครื่อง', amount: 1800, cat: 'เดินทางและยานพาหนะ', acc: 'ACC-DEMO-02' },
    { m: '03', d: '14', t: '17:00', desc: 'ซื้อหูฟังบลูทูธสำรอง', amount: 990, cat: 'ช้อปปิ้งและของใช้ส่วนตัว', acc: 'ACC-DEMO-06' },
    { m: '03', d: '16', t: '19:40', desc: 'กินส้มตำไก่ย่างกับครอบครัว', amount: 480, cat: 'อาหารและเครื่องดื่ม', acc: 'ACC-DEMO-01' },
    { m: '03', d: '20', t: '11:15', desc: 'เบี้ยประกันอุบัติเหตุ PA', amount: 1200, cat: 'ประกันภัย', acc: 'ACC-DEMO-02' },
    { m: '03', d: '23', t: '13:50', desc: 'ค่ารักษาคลินิกโรคผิวหนัง', amount: 750, cat: 'สุขภาพและการแพทย์', acc: 'ACC-DEMO-03' },
    { m: '03', d: '28', t: '16:30', desc: 'ซองงานแต่งงานเพื่อนร่วมงาน', amount: 1000, cat: 'ของขวัญ / บริจาค', acc: 'ACC-DEMO-01' },

    // Apr
    { m: '04', d: '02', t: '11:45', desc: 'ก๋วยจั๊บและกาแฟโบราณ', amount: 90, cat: 'อาหารและเครื่องดื่ม', acc: 'ACC-DEMO-01' },
    { m: '04', d: '05', t: '15:20', desc: 'ซ่อมแซมก๊อกน้ำและท่อประปา', amount: 650, cat: 'บ้านและที่อยู่อาศัย', acc: 'ACC-DEMO-01' },
    { m: '04', d: '07', t: '18:10', desc: 'เติมน้ำมันก่อนเดินทางสงกรานต์', amount: 1400, cat: 'เดินทางและยานพาหนะ', acc: 'ACC-DEMO-02' },
    { m: '04', d: '11', t: '14:00', desc: 'ซื้อของฝากกลับบ้านต่างจังหวัด', amount: 1200, cat: 'ของขวัญ / บริจาค', acc: 'ACC-DEMO-03' },
    { m: '04', d: '14', t: '19:00', desc: 'มื้อพิเศษครอบครัวช่วงวันหยุด', amount: 2200, cat: 'อาหารและเครื่องดื่ม', acc: 'ACC-DEMO-06' },
    { m: '04', d: '17', t: '16:40', desc: 'ค่าล้างรถเคลือบสี', amount: 350, cat: 'เดินทางและยานพาหนะ', acc: 'ACC-DEMO-01' },
    { m: '04', d: '21', t: '10:30', desc: 'ค่าธรรมเนียมโอนเงินต่างประเทศ', amount: 250, cat: 'ภาษีและค่าธรรมเนียม', acc: 'ACC-DEMO-02' },
    { m: '04', d: '24', t: '13:15', desc: 'วิตามินซีและอาหารเสริม', amount: 590, cat: 'สุขภาพและการแพทย์', acc: 'ACC-DEMO-04' },
    { m: '04', d: '26', t: '20:30', desc: 'เกม Steam ในช่วงลดราคา', amount: 720, cat: 'บันเทิงและไลฟ์สไตล์', acc: 'ACC-DEMO-06' },
    { m: '04', d: '29', t: '17:15', desc: 'ซื้อรองเท้าผ้าใบวิ่ง', amount: 2450, cat: 'ช้อปปิ้งและของใช้ส่วนตัว', acc: 'ACC-DEMO-06' },

    // May
    { m: '05', d: '02', t: '12:10', desc: 'ข้าวราดแกงกะหรี่ญี่ปุ่น', amount: 160, cat: 'อาหารและเครื่องดื่ม', acc: 'ACC-DEMO-04' },
    { m: '05', d: '06', t: '09:45', desc: 'ค่า MRT ไปกลับสยาม', amount: 86, cat: 'เดินทางและยานพาหนะ', acc: 'ACC-DEMO-04' },
    { m: '05', d: '09', t: '16:00', desc: 'ค่าโฆษณา Facebook ยิงแอด', amount: 1200, cat: 'ธุรกิจ / การทำงาน', acc: 'ACC-DEMO-06' },
    { m: '05', d: '11', t: '14:30', desc: 'ตัดแว่นสายตาใหม่', amount: 3200, cat: 'สุขภาพและการแพทย์', acc: 'ACC-DEMO-06' },
    { m: '05', d: '15', t: '19:20', desc: 'ซื้อของเข้าตู้เย็น Lotus', amount: 980, cat: 'อาหารและเครื่องดื่ม', acc: 'ACC-DEMO-03' },
    { m: '05', d: '18', t: '11:00', desc: 'กระดาษปริ้นท์และหมึกพิมพ์', amount: 680, cat: 'ธุรกิจ / การทำงาน', acc: 'ACC-DEMO-02' },
    { m: '05', d: '22', t: '18:50', desc: 'บุฟเฟต์ปิ้งย่างเกาหลี', amount: 550, cat: 'อาหารและเครื่องดื่ม', acc: 'ACC-DEMO-03' },
    { m: '05', d: '24', t: '15:15', desc: 'บริจาคช่วยมูลนิธิสัตว์พิการ', amount: 500, cat: 'ของขวัญ / บริจาค', acc: 'ACC-DEMO-04' },
    { m: '05', d: '27', t: '10:40', desc: 'ค่าแก๊สหุงต้ม ปตท.', amount: 430, cat: 'สาธารณูปโภค', acc: 'ACC-DEMO-01' },
    { m: '05', d: '30', t: '17:30', desc: 'ซองงานบวชญาติ', amount: 500, cat: 'ของขวัญ / บริจาค', acc: 'ACC-DEMO-01' },

    // Jun
    { m: '06', d: '02', t: '12:30', desc: 'ก๋วยเตี๋ยวต้มยำและเกี๊ยว', amount: 85, cat: 'อาหารและเครื่องดื่ม', acc: 'ACC-DEMO-01' },
    { m: '06', d: '05', t: '08:50', desc: 'เติมน้ำมัน PTT Station', amount: 1100, cat: 'เดินทางและยานพาหนะ', acc: 'ACC-DEMO-02' },
    { m: '06', d: '08', t: '14:15', desc: 'หนังสือคู่มือการลงทุนหุ้น', amount: 395, cat: 'การศึกษาและพัฒนาตัวเอง', acc: 'ACC-DEMO-03' },
    { m: '06', d: '12', t: '19:00', desc: 'ดินเนอร์ร้านอาหารญี่ปุ่น', amount: 1250, cat: 'อาหารและเครื่องดื่ม', acc: 'ACC-DEMO-06' },
    { m: '06', d: '15', t: '16:40', desc: 'ซื้อหลอดไฟ LED เปลี่ยนในบ้าน', amount: 280, cat: 'บ้านและที่อยู่อาศัย', acc: 'ACC-DEMO-01' },
    { m: '06', d: '19', t: '11:20', desc: 'ค่าสมาชิก YouTube Premium', amount: 179, cat: 'สมาชิกและ Subscription', acc: 'ACC-DEMO-02' },
    { m: '06', d: '21', t: '15:50', desc: 'ยารักษาไมเกรนและยาหยอดตา', amount: 380, cat: 'สุขภาพและการแพทย์', acc: 'ACC-DEMO-01' },
    { m: '06', d: '24', t: '18:15', desc: 'ช้อปปิ้งเสื้อผ้าแบรนด์ Uniqlo', amount: 1590, cat: 'ช้อปปิ้งและของใช้ส่วนตัว', acc: 'ACC-DEMO-06' },
    { m: '06', d: '26', t: '13:00', desc: 'ค่าซอฟต์แวร์ Canva Pro', amount: 229, cat: 'ธุรกิจ / การทำงาน', acc: 'ACC-DEMO-02' },
    { m: '06', d: '29', t: '17:45', desc: 'ค่าต่อประกัน พ.ร.บ. รถยนต์', amount: 645, cat: 'ประกันภัย', acc: 'ACC-DEMO-02' },

    // Jul
    { m: '07', d: '03', t: '12:15', desc: 'สเต็กและสลัดบาร์มื้อกลางวัน', amount: 220, cat: 'อาหารและเครื่องดื่ม', acc: 'ACC-DEMO-03' },
    { m: '07', d: '06', t: '08:30', desc: 'เติมน้ำมัน Shell V-Power', amount: 1300, cat: 'เดินทางและยานพาหนะ', acc: 'ACC-DEMO-02' },
    { m: '07', d: '09', t: '16:20', desc: 'ค่าตรวจสุขภาพประจำปี', amount: 2800, cat: 'สุขภาพและการแพทย์', acc: 'ACC-DEMO-06' },
    { m: '07', d: '12', t: '19:40', desc: 'ซื้อของใช้ในห้องน้ำและสบู่', amount: 450, cat: 'ช้อปปิ้งและของใช้ส่วนตัว', acc: 'ACC-DEMO-04' },
    { m: '07', d: '14', t: '15:10', desc: 'ทำบุญวันอาสาฬหบูชา', amount: 500, cat: 'ของขวัญ / บริจาค', acc: 'ACC-DEMO-02' },
    { m: '07', d: '18', t: '11:00', desc: 'ค่า Hosting เว็บไซต์รายปี', amount: 2400, cat: 'ธุรกิจ / การทำงาน', acc: 'ACC-DEMO-06' },
    { m: '07', d: '21', t: '14:45', desc: 'บัตรคอนเสิร์ตวงโปรด', amount: 2500, cat: 'บันเทิงและไลฟ์สไตล์', acc: 'ACC-DEMO-06' },
    { m: '07', d: '25', t: '18:30', desc: 'กินอาหารอีสานและคอหมูย่าง', amount: 380, cat: 'อาหารและเครื่องดื่ม', acc: 'ACC-DEMO-01' },
    { m: '07', d: '29', t: '16:00', desc: 'ซ่อมพัดลมและเครื่องใช้ไฟฟ้า', amount: 450, cat: 'บ้านและที่อยู่อาศัย', acc: 'ACC-DEMO-01' },

    // Aug
    { m: '08', d: '02', t: '12:00', desc: 'ข้าวกะเพราหมูกรอบไข่ดาว', amount: 75, cat: 'อาหารและเครื่องดื่ม', acc: 'ACC-DEMO-01' },
    { m: '08', d: '04', t: '09:15', desc: 'กาแฟสตาร์บัคส์นัดคุยงาน', amount: 165, cat: 'อาหารและเครื่องดื่ม', acc: 'ACC-DEMO-06' },
    { m: '08', d: '07', t: '17:30', desc: 'ค่าเปลี่ยนยางปัดน้ำฝนรถ', amount: 490, cat: 'เดินทางและยานพาหนะ', acc: 'ACC-DEMO-02' },
    { m: '08', d: '10', t: '15:00', desc: 'ของขวัญวันแม่', amount: 1500, cat: 'ของขวัญ / บริจาค', acc: 'ACC-DEMO-02' },
    { m: '08', d: '12', t: '19:15', desc: 'พาคุณแม่ทานอาหารมื้อพิเศษ', amount: 2600, cat: 'อาหารและเครื่องดื่ม', acc: 'ACC-DEMO-06' },
    { m: '08', d: '16', t: '14:20', desc: 'ซื้อเคสโทรศัพท์และฟิล์มกระจก', amount: 450, cat: 'ช้อปปิ้งและของใช้ส่วนตัว', acc: 'ACC-DEMO-04' },
    { m: '08', d: '20', t: '11:45', desc: 'ค่าสมาชิกรายเดือน iCloud', amount: 99, cat: 'สมาชิกและ Subscription', acc: 'ACC-DEMO-02' },
    { m: '08', d: '23', t: '18:00', desc: 'คอร์สฟิตเนสรายเดือน', amount: 1500, cat: 'สุขภาพและการแพทย์', acc: 'ACC-DEMO-06' },
    { m: '08', d: '26', t: '13:40', desc: 'ซื้อหนังสือเตรียมสอบ TOEIC', amount: 480, cat: 'การศึกษาและพัฒนาตัวเอง', acc: 'ACC-DEMO-03' },
    { m: '08', d: '30', t: '19:45', desc: 'พิซซ่าถาดใหญ่ปาร์ตี้เพื่อน', amount: 620, cat: 'อาหารและเครื่องดื่ม', acc: 'ACC-DEMO-03' },

    // Sep
    { m: '09', d: '01', t: '12:30', desc: 'ข้าวผัดต้มยำทะเล', amount: 90, cat: 'อาหารและเครื่องดื่ม', acc: 'ACC-DEMO-01' },
    { m: '09', d: '03', t: '08:40', desc: 'เติมน้ำมัน Caltex', amount: 1150, cat: 'เดินทางและยานพาหนะ', acc: 'ACC-DEMO-02' },
    { m: '09', d: '06', t: '15:10', desc: 'ค่าสมุดบัญชีและเอกสาร', amount: 150, cat: 'ธุรกิจ / การทำงาน', acc: 'ACC-DEMO-01' },
    { m: '09', d: '09', t: '18:20', desc: 'ช้อปปิ้ง 9.9 เครื่องใช้ในบ้าน', amount: 1450, cat: 'ช้อปปิ้งและของใช้ส่วนตัว', acc: 'ACC-DEMO-06' },
    { m: '09', d: '11', t: '11:00', desc: 'ชำระค่าธรรมเนียมบัตรเครดิต', amount: 500, cat: 'ภาษีและค่าธรรมเนียม', acc: 'ACC-DEMO-06' },
    { m: '09', d: '14', t: '14:40', desc: 'คอร์สเรียน AI Tools ทำงานเร็วขึ้น', amount: 1800, cat: 'การศึกษาและพัฒนาตัวเอง', acc: 'ACC-DEMO-02' },
    { m: '09', d: '17', t: '19:30', desc: 'ราเมงและเกี๊ยวซ่า', amount: 320, cat: 'อาหารและเครื่องดื่ม', acc: 'ACC-DEMO-03' },
    { m: '09', d: '21', t: '16:15', desc: 'ซื้อแผ่นกรองอากาศ PM2.5', amount: 890, cat: 'สุขภาพและการแพทย์', acc: 'ACC-DEMO-03' },
    { m: '09', d: '24', t: '10:30', desc: 'ค่าบริการล้างแอร์ห้องนอน', amount: 600, cat: 'บ้านและที่อยู่อาศัย', acc: 'ACC-DEMO-01' },
    { m: '09', d: '27', t: '17:50', desc: 'ซื้อเกมบอร์ดและของเล่นเสริมทักษะ', amount: 790, cat: 'บันเทิงและไลฟ์สไตล์', acc: 'ACC-DEMO-03' },
    { m: '09', d: '29', t: '13:20', desc: 'ค่าจัดส่งพัสดุและกล่องพัสดุ', amount: 240, cat: 'ธุรกิจ / การทำงาน', acc: 'ACC-DEMO-04' },

    // OCTOBER 2026 (ต.ค. 2569) - Month Current Data (Sections 21 & 22)
    { m: '10', d: '01', t: '08:30', desc: 'ค่าเช่าบ้านประจำเดือน', amount: 7000, cat: 'บ้านและที่อยู่อาศัย', acc: 'ACC-DEMO-02' },
    { m: '10', d: '01', t: '12:15', desc: 'ข้าวผัดกุ้งและชาเย็น', amount: 120, cat: 'อาหารและเครื่องดื่ม', acc: 'ACC-DEMO-01' },
    { m: '10', d: '01', t: '15:40', desc: 'เติมน้ำมันเต็มถังรับเดือนใหม่', amount: 1200, cat: 'เดินทางและยานพาหนะ', acc: 'ACC-DEMO-02' },
    { m: '10', d: '01', t: '19:00', desc: 'Netflix ประจำเดือน ต.ค.', amount: 419, cat: 'สมาชิกและ Subscription', acc: 'ACC-DEMO-02' },
    { m: '10', d: '02', t: '08:15', desc: 'แซนด์วิชและกาแฟ 7-Eleven', amount: 65, cat: 'อาหารและเครื่องดื่ม', acc: 'ACC-DEMO-04' },
    { m: '10', d: '02', t: '11:30', desc: 'ซื้อของใช้ในบ้านและผงซักฟอก', amount: 650, cat: 'ช้อปปิ้งและของใช้ส่วนตัว', acc: 'ACC-DEMO-03' },
    { m: '10', d: '02', t: '14:20', desc: 'ค่าส่งเอกสารด่วน Grab Express', amount: 140, cat: 'ธุรกิจ / การทำงาน', acc: 'ACC-DEMO-04' },
    { m: '10', d: '02', t: '18:50', desc: 'ค่าไฟฟ้าเดือนกันยายน', amount: 1380, cat: 'สาธารณูปโภค', acc: 'ACC-DEMO-02' },
    { m: '10', d: '03', t: '09:00', desc: 'กาแฟอเมซอนปั่น', amount: 70, cat: 'อาหารและเครื่องดื่ม', acc: 'ACC-DEMO-04' },
    { m: '10', d: '03', t: '12:30', desc: 'อาหารกลางวันกับเพื่อนร่วมงาน', amount: 280, cat: 'อาหารและเครื่องดื่ม', acc: 'ACC-DEMO-03' },
    { m: '10', d: '03', t: '16:00', desc: 'ซื้อเสื้อยืดใส่เที่ยว', amount: 590, cat: 'ช้อปปิ้งและของใช้ส่วนตัว', acc: 'ACC-DEMO-03' },
    { m: '10', d: '03', t: '19:15', desc: 'Spotify Premium Family', amount: 199, cat: 'สมาชิกและ Subscription', acc: 'ACC-DEMO-02' },
    { m: '10', d: '03', t: '20:30', desc: 'ดูหนังรอบค่ำ Major Cineplex', amount: 320, cat: 'บันเทิงและไลฟ์สไตล์', acc: 'ACC-DEMO-06' },

    // TODAY (04/10/2026 - Section 21: 8 Real Expenses for Today)
    { m: '10', d: '04', t: '08:00', desc: 'ค่าโทรศัพท์รายเดือน AIS', amount: 599, cat: 'โทรศัพท์และอินเทอร์เน็ต', acc: 'ACC-DEMO-02' },
    { m: '10', d: '04', t: '09:30', desc: 'ซื้อยาและพลาสเตอร์ยา', amount: 180, cat: 'สุขภาพและการแพทย์', acc: 'ACC-DEMO-02' },
    { m: '10', d: '04', t: '12:00', desc: 'อาหารกลางวันส้มตำไก่ย่าง', amount: 240, cat: 'อาหารและเครื่องดื่ม', acc: 'ACC-DEMO-04' },
    { m: '10', d: '04', t: '14:15', desc: 'ค่าทางด่วนและที่จอดรถ', amount: 110, cat: 'เดินทางและยานพาหนะ', acc: 'ACC-DEMO-02' },
    { m: '10', d: '04', t: '15:30', desc: 'กาแฟและขนมเค้กยามบ่าย', amount: 165, cat: 'อาหารและเครื่องดื่ม', acc: 'ACC-DEMO-03' },
    { m: '10', d: '04', t: '16:45', desc: 'ซื้ออุปกรณ์ทำงานและเมาส์', amount: 890, cat: 'ธุรกิจ / การทำงาน', acc: 'ACC-DEMO-06' },
    { m: '10', d: '04', t: '18:15', desc: 'ช้อปปิ้งของใช้ส่วนตัว Watsons', amount: 480, cat: 'ช้อปปิ้งและของใช้ส่วนตัว', acc: 'ACC-DEMO-03' },
    { m: '10', d: '04', t: '19:30', desc: 'มื้อเย็นร้านอาหารญี่ปุ่น', amount: 650, cat: 'อาหารและเครื่องดื่ม', acc: 'ACC-DEMO-03' },
  ];

  livingItems.forEach(item => {
    baseExpenses.push(item);
  });

  // Calculate remaining expense count needed to reach exactly 190 items
  const currentExpCount = baseExpenses.length;
  const targetExpCount = 190;
  const diff = targetExpCount - currentExpCount;

  // Distribute additional realistic expenses to reach exactly 190
  const fillerTemplates = [
    { desc: 'ค่ารถไฟฟ้า BTS ไปกลับ', amount: 88, cat: 'เดินทางและยานพาหนะ', acc: 'ACC-DEMO-04', t: '08:45' },
    { desc: 'ข้าวกล่องและน้ำดื่ม', amount: 75, cat: 'อาหารและเครื่องดื่ม', acc: 'ACC-DEMO-01', t: '12:10' },
    { desc: 'ค่าชาร์จรถยนต์ไฟฟ้า / เติมน้ำมัน', amount: 450, cat: 'เดินทางและยานพาหนะ', acc: 'ACC-DEMO-02', t: '17:20' },
    { desc: 'กาแฟสดและครัวซองต์', amount: 135, cat: 'อาหารและเครื่องดื่ม', acc: 'ACC-DEMO-03', t: '09:15' },
    { desc: 'ซื้อของซูเปอร์มาร์เก็ต Big C', amount: 890, cat: 'ช้อปปิ้งและของใช้ส่วนตัว', acc: 'ACC-DEMO-03', t: '18:40' },
    { desc: 'ค่าน้ำดื่มแบบแพ็คส่งบ้าน', amount: 210, cat: 'สาธารณูปโภค', acc: 'ACC-DEMO-01', t: '15:00' },
    { desc: 'ค่าบริการอินเทอร์เน็ตสำรอง', amount: 350, cat: 'โทรศัพท์และอินเทอร์เน็ต', acc: 'ACC-DEMO-02', t: '11:30' },
    { desc: 'ซื้อวิตามินและยาบำรุง', amount: 420, cat: 'สุขภาพและการแพทย์', acc: 'ACC-DEMO-04', t: '14:20' },
    { desc: 'หนังสือและบทความพรีเมียม', amount: 280, cat: 'การศึกษาและพัฒนาตัวเอง', acc: 'ACC-DEMO-02', t: '16:10' },
    { desc: 'ค่าทำบุญใส่บาตรเช้า', amount: 100, cat: 'ของขวัญ / บริจาค', acc: 'ACC-DEMO-01', t: '06:45' },
    { desc: 'อาหารว่างและเครื่องดื่ม', amount: 95, cat: 'อาหารและเครื่องดื่ม', acc: 'ACC-DEMO-04', t: '15:45' },
    { desc: 'ค่าซอฟต์แวร์เครื่องมือ AI', amount: 450, cat: 'ธุรกิจ / การทำงาน', acc: 'ACC-DEMO-06', t: '20:15' },
    { desc: 'ของใช้ในครัวและถุงขยะ', amount: 190, cat: 'บ้านและที่อยู่อาศัย', acc: 'ACC-DEMO-01', t: '13:30' },
    { desc: 'ค่าตัดผมและดูแลตัวเอง', amount: 350, cat: 'ช้อปปิ้งและของใช้ส่วนตัว', acc: 'ACC-DEMO-01', t: '17:00' },
    { desc: 'บัตรเข้าชมพิพิธภัณฑ์ / นิทรรศการ', amount: 250, cat: 'บันเทิงและไลฟ์สไตล์', acc: 'ACC-DEMO-03', t: '14:00' },
  ];

  for (let i = 0; i < diff; i++) {
    const tmpl = fillerTemplates[i % fillerTemplates.length];
    const monthNum = (i % 9) + 1; // Months 01 to 09
    const mStr = String(monthNum).padStart(2, '0');
    const dayNum = ((i * 3) % 27) + 1;
    const dStr = String(dayNum).padStart(2, '0');

    baseExpenses.push({
      m: mStr,
      d: dStr,
      t: tmpl.t,
      desc: tmpl.desc,
      amount: tmpl.amount + (i % 5) * 20,
      cat: tmpl.cat,
      acc: tmpl.acc,
    });
  }

  // Push all expenses to rawList
  baseExpenses.forEach(item => {
    rawList.push({
      date: `2026-${item.m}-${item.d}`,
      time: item.t,
      type: 'expense',
      desc: item.desc,
      amount: item.amount,
      catName: item.cat,
      accId: item.acc,
    });
  });

  // Sort rawList chronologically (from 2026-01-01 to 2026-10-04)
  rawList.sort((a, b) => {
    const d = a.date.localeCompare(b.date);
    if (d !== 0) return d;
    return a.time.localeCompare(b.time);
  });

  // Exactly 250 Transactions with Unique IDs: TX-Year-Month-Day-Time-Num000xx (Section 19)
  return rawList.map((t, idx) => {
    const num = String(idx + 1).padStart(5, '0');
    const timeFormatted = t.time.replace(':', '');
    const id = `TX-${t.date}-${timeFormatted}-Num${num}`;
    const isInc = t.type === 'income';
    const catId = t.catName ? findCatId(t.catName, isInc) : undefined;

    return {
      id,
      date: t.date,
      type: t.type,
      accountId: t.accId,
      toAccountId: t.toAccId,
      categoryId: catId,
      description: t.desc,
      amount: t.amount,
      currency: 'THB',
      status: 'ใช้งาน' as const,
      isDemo: true,
      createdAt: `${t.date} ${t.time}:00`,
      updatedAt: `${t.date} ${t.time}:00`,
    };
  });
};
