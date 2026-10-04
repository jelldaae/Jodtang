export type TransactionType = 
  | 'income'             // รายรับ
  | 'expense'            // รายจ่าย
  | 'transfer'           // โอนเงินระหว่างบัญชี
  | 'debt_payment'       // ชำระหนี้
  | 'receivable_receipt' // รับชำระจากลูกหนี้
  | 'saving'             // ออมเงิน
  | 'refund'             // คืนเงิน
  | 'subscription';      // สมาชิกรายงวด

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  accountId: string;
  toAccountId?: string;
  projectId?: string;
  categoryId?: string;
  description: string;
  amount: number;
  currency: string;
  debtId?: string;
  principal?: number;
  interest?: number;
  fee?: number;
  receivableId?: string;
  goalId?: string;
  subscriptionId?: string;
  recurringId?: string;
  status: 'ใช้งาน' | 'ไม่ใช้งาน' | 'ลบแล้ว';
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface Account {
  id: string;
  name: string;
  type: string; // 'เงินสด' | 'ธนาคาร' | 'กระเป๋าเงินออนไลน์' | 'บัตรเครดิต' | 'บัญชีลงทุน' | 'อื่น ๆ'
  opening: number;
  note?: string;
  status: 'ใช้งาน' | 'ไม่ใช้งาน';
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
  balance?: number; // dynamically computed

  // Dynamic identification and styling fields (ข้อกำหนด 1-10)
  accountNumber?: string;       // เลขบัญชี / หมายเลขบัตร / Wallet ID / Investor ID
  bank?: string;                // ธนาคาร (KBank, SCB, Krungsri, etc.)
  walletProvider?: string;      // ผู้ให้บริการกระเป๋าเงิน (TrueMoney, ShopeePay, etc.)
  creditCardProvider?: string;  // ธนาคาร / ผู้ออกบัตรเครดิต
  creditLimit?: number;         // วงเงินบัตรเครดิต (ไม่นับเป็นเงินที่มี)
  outstandingDebt?: number;     // ยอดค้างชำระ (นับเป็นหนี้สิน)
  dueDate?: string;             // วันครบกำหนดชำระ
  platform?: string;            // Platform / Broker ลงทุน (InnovestX, Streaming, etc.)
  investorId?: string;          // Investor ID / เลขบัญชีลงทุน
  color?: string;               // สีประจำบัญชี (#Hex หรือ Accent)
  icon?: string;                // Emoji หรือ Icon
  image?: string;               // รูปภาพ / Logo Base64 หรือ URL
  noteText?: string;            // รายละเอียดเพิ่มเติม
}

export interface Project {
  id: string;
  name: string;
  type: string;
  budget: number;
  startDate?: string;
  endDate?: string;
  note?: string;
  status: 'ใช้งาน' | 'ไม่ใช้งาน';
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  group: string; // e.g. กลุ่มรายได้จากงานประจำ, กลุ่มอาหารและเครื่องดื่ม, etc.
  icon?: string;
  note?: string;
  status: 'ใช้งาน' | 'ไม่ใช้งาน';
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AssetCategory {
  id: string;
  name: string;
  icon?: string;
  status: 'ใช้งาน' | 'ไม่ใช้งาน';
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Asset {
  id: string;
  name: string;
  category: string;
  cost: number;        // มูลค่าซื้อ
  value: number;       // มูลค่าปัจจุบัน
  buyDate?: string;    // วันที่ซื้อ
  accountId?: string;  // บัญชี (เว้นว่างได้)
  note?: string;       // หมายเหตุ
  status: 'ใช้งาน' | 'ไม่ใช้งาน';
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  month: string; // YYYY-MM
  categoryId: string;
  amount: number;
  alertThreshold?: number; // e.g. 80 (%)
  isRecurring?: boolean;   // ใช้งบนี้ซ้ำทุกเดือน
  note?: string;
  status: 'ใช้งาน' | 'ไม่ใช้งาน';
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
  actual?: number;
  remaining?: number;
  pct?: number;
  state?: 'อยู่ในงบ' | 'ใกล้เต็มงบ' | 'เกินงบ';
}

export interface Debt {
  id: string;
  name: string;
  category: string; // 'บัตรเครดิต' | 'สินเชื่อส่วนบุคคล' | 'สินเชื่อรถยนต์' | 'สินเชื่อบ้าน' | 'เงินกู้' | 'หนี้บุคคล' | 'ผ่อนสินค้า' | 'Buy Now Pay Later' | 'อื่น ๆ'
  creditor: string;
  initial: number;
  interest: number;
  minPay: number;
  dueDate?: string;
  note?: string;
  accountId?: string; // บัญชีที่ใช้ชำระ
  status: 'ใช้งาน' | 'ไม่ใช้งาน';
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
  paid?: number;
  remaining?: number;

  // Specific fields for Loans & Credit Cards
  creditLimit?: number;       // วงเงินบัตร
  cycleCutDate?: string;      // วันตัดรอบ
  minPayment?: number;        // ยอดขั้นต่ำ
  fullPayment?: number;       // ยอดเต็มจำนวน
  totalTenor?: number;        // จำนวนงวดทั้งหมด เช่น 60
  paidTenor?: number;         // งวดที่ชำระแล้ว เช่น 12
  monthlyPayment?: number;    // ค่างวดต่อเดือน
  debtStatus?: 'ปกติ' | 'ใกล้ถึงกำหนด' | 'เกินกำหนด' | 'ชำระครบแล้ว';
}

export interface Receivable {
  id: string;
  name: string;
  category: string;
  initial: number;
  dueDate?: string;
  note?: string;
  status: 'ใช้งาน' | 'ไม่ใช้งาน';
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
  received?: number;
  remaining?: number;
}

export interface Goal {
  id: string;
  name: string;
  category: string;
  icon?: string;
  target: number;
  startDate?: string;
  deadline?: string;
  accountId?: string; // บัญชีที่เชื่อมโยง
  note?: string;
  goalStatus?: 'กำลังออม' | 'ใกล้ถึงเป้าหมาย' | 'บรรลุเป้าหมาย' | 'เลยกำหนด' | 'พักเป้าหมาย';
  status: 'ใช้งาน' | 'ไม่ใช้งาน';
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
  current?: number;
  remaining?: number;
  progress?: number;
}

export interface Recurring {
  id: string;
  name: string;
  type: 'รายรับ' | 'รายจ่าย';
  amount: number;
  freq: 'รายวัน' | 'รายสัปดาห์' | 'รายเดือน' | 'รายปี';
  nextDate: string;
  startDate?: string;
  endDate?: string;
  accountId?: string;
  projectId?: string;
  categoryId?: string;
  note?: string;
  status: 'ใช้งาน' | 'ไม่ใช้งาน';
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface SheetMetadata {
  id: string;
  name: string;
  webViewLink: string;
  createdTime?: string;
  modifiedTime?: string;
}

// 9 กลุ่มรายรับหลัก
export const INCOME_GROUPS = [
  'กลุ่มรายได้จากงานประจำ',
  'กลุ่มรายได้จาก Freelance / งานบริการ',
  'กลุ่มรายได้จากธุรกิจ / การขาย',
  'กลุ่มรายได้จาก Content / Creator',
  'กลุ่มรายได้จาก Affiliate / Commission',
  'กลุ่มรายได้จากการลงทุน',
  'กลุ่มรายได้จากทรัพย์สิน',
  'กลุ่มเงินโอน / เงินช่วยเหลือ',
  'กลุ่มรายได้อื่น ๆ',
] as const;

// 15 กลุ่มรายจ่ายหลัก
export const EXPENSE_GROUPS = [
  'กลุ่มบ้านและที่อยู่อาศัย',
  'กลุ่มอาหารและเครื่องดื่ม',
  'กลุ่มเดินทางและยานพาหนะ',
  'กลุ่มสาธารณูปโภค',
  'กลุ่มโทรศัพท์และอินเทอร์เน็ต',
  'กลุ่มสุขภาพและการแพทย์',
  'กลุ่มประกันภัย',
  'กลุ่มช้อปปิ้งและของใช้ส่วนตัว',
  'กลุ่มบันเทิงและไลฟ์สไตล์',
  'กลุ่มการศึกษาและพัฒนาตัวเอง',
  'กลุ่มธุรกิจ / การทำงาน',
  'กลุ่มภาษีและค่าธรรมเนียม',
  'กลุ่มสมาชิกและ Subscription',
  'กลุ่มของขวัญ / บริจาค',
  'กลุ่มรายจ่ายอื่น ๆ',
] as const;

// หมวดหมู่สินทรัพย์เริ่มต้น (ตามข้อกำหนด 2.2)
export const DEFAULT_ASSET_CATEGORIES = [
  { name: 'เงินสด', icon: '💵' },
  { name: 'เงินฝาก', icon: '🏦' },
  { name: 'ทองคำ', icon: '🥇' },
  { name: 'หุ้น', icon: '📊' },
  { name: 'กองทุน', icon: '📑' },
  { name: 'Cryptocurrency', icon: '🪙' },
  { name: 'อสังหาริมทรัพย์', icon: '🏢' },
  { name: 'ยานพาหนะ', icon: '🚗' },
  { name: 'Electronics', icon: '📱' },
  { name: 'อุปกรณ์', icon: '💻' },
  { name: 'ของมีค่า', icon: '💎' },
  { name: 'สินทรัพย์อื่น ๆ', icon: '📦' },
];

// หมวดหมู่เป้าหมายการออมเริ่มต้น (ตามข้อกำหนด 8)
export const DEFAULT_GOAL_CATEGORIES = [
  { name: 'บ้านและที่อยู่อาศัย', icon: '🏠', color: '#3F8F72' },
  { name: 'รถยนต์', icon: '🚗', color: '#F97316' },
  { name: 'การเดินทาง', icon: '✈️', color: '#3B82F6' },
  { name: 'สุขภาพ', icon: '🩺', color: '#10B981' },
  { name: 'การศึกษา', icon: '🎓', color: '#8B5CF6' },
  { name: 'ของที่อยากได้', icon: '🎁', color: '#EC4899' },
  { name: 'เงินสำรองฉุกเฉิน', icon: '🛡️', color: '#F59E0B' },
  { name: 'การลงทุน', icon: '📈', color: '#133F2E' },
  { name: 'ครอบครัว', icon: '👨‍👩‍👧', color: '#F43F5E' },
  { name: 'งานแต่งงาน', icon: '💍', color: '#D946EF' },
  { name: 'เกษียณ', icon: '🌴', color: '#059669' },
  { name: 'อื่น ๆ', icon: '🎯', color: '#6B7280' },
];
