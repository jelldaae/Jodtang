import { Account } from '../types';

export const ACCOUNT_TYPES = [
  'เงินสด',
  'ธนาคาร',
  'กระเป๋าเงินออนไลน์',
  'บัตรเครดิต',
  'บัญชีลงทุน',
  'อื่น ๆ'
] as const;

export type AccountType = typeof ACCOUNT_TYPES[number];

export interface ProviderItem {
  id: string;
  name: string;
  color: string;
  icon: string;
  shortLabel: string;
}

export const BANK_PROVIDERS: ProviderItem[] = [
  { id: 'KBank', name: 'ธนาคารกสิกรไทย (KBank)', shortLabel: 'KBank', color: '#138F2D', icon: '🏦' },
  { id: 'SCB', name: 'ธนาคารไทยพาณิชย์ (SCB)', shortLabel: 'SCB', color: '#4E2A84', icon: '🏦' },
  { id: 'Krungsri', name: 'ธนาคารกรุงศรีอยุธยา (BAY)', shortLabel: 'BAY', color: '#FDB813', icon: '🏦' },
  { id: 'Bangkok Bank', name: 'ธนาคารกรุงเทพ (BBL)', shortLabel: 'BBL', color: '#1E3A8A', icon: '🏦' },
  { id: 'Krungthai', name: 'ธนาคารกรุงไทย (KTB)', shortLabel: 'KTB', color: '#00A2E8', icon: '🏦' },
  { id: 'TTB', name: 'ธนาคารทหารไทยธนชาต (TTB)', shortLabel: 'TTB', color: '#0050F0', icon: '🏦' },
  { id: 'UOB', name: 'ธนาคารยูโอบี (UOB)', shortLabel: 'UOB', color: '#002F6C', icon: '🏦' },
  { id: 'CIMB', name: 'ธนาคารซีไอเอ็มบีไทย (CIMB)', shortLabel: 'CIMB', color: '#7B1113', icon: '🏦' },
  { id: 'GSB', name: 'ธนาคารออมสิน (GSB)', shortLabel: 'GSB', color: '#EB008B', icon: '🏦' },
  { id: 'BAAC', name: 'ธนาคารเพื่อการเกษตรและสหกรณ์ (ธ.ก.ส.)', shortLabel: 'BAAC', color: '#006837', icon: '🏦' },
  { id: 'other', name: 'ธนาคารอื่น ๆ', shortLabel: 'ธนาคาร', color: '#3F8F72', icon: '🏦' },
];

export const WALLET_PROVIDERS: ProviderItem[] = [
  { id: 'TrueMoney', name: 'TrueMoney Wallet', shortLabel: 'TrueMoney', color: '#FF6F00', icon: '📱' },
  { id: 'ShopeePay', name: 'ShopeePay', shortLabel: 'ShopeePay', color: '#EE4D2D', icon: '🛍️' },
  { id: 'PayPal', name: 'PayPal', shortLabel: 'PayPal', color: '#003087', icon: '🌐' },
  { id: 'LINE Pay', name: 'LINE Pay / Rabbit LINE Pay', shortLabel: 'LINE Pay', color: '#06C755', icon: '💬' },
  { id: 'AirPay / ShopeePay', name: 'AirPay', shortLabel: 'AirPay', color: '#FF5722', icon: '✈️' },
  { id: 'other', name: 'กระเป๋าเงินอื่น ๆ', shortLabel: 'Wallet', color: '#2563EB', icon: '👛' },
];

export const CREDIT_CARD_PROVIDERS: ProviderItem[] = [
  { id: 'KBank', name: 'กสิกรไทย (KBank)', shortLabel: 'KBank', color: '#138F2D', icon: '💳' },
  { id: 'SCB', name: 'ไทยพาณิชย์ (SCB / CardX)', shortLabel: 'SCB', color: '#4E2A84', icon: '💳' },
  { id: 'Krungsri', name: 'กรุงศรีอยุธยา (Krungsri)', shortLabel: 'Krungsri', color: '#FDB813', icon: '💳' },
  { id: 'Bangkok Bank', name: 'กรุงเทพ (Bangkok Bank)', shortLabel: 'BBL', color: '#1E3A8A', icon: '💳' },
  { id: 'Krungthai', name: 'เคทีซี (KTC / Krungthai)', shortLabel: 'KTC', color: '#00A2E8', icon: '💳' },
  { id: 'TTB', name: 'ทีทีบี (TTB)', shortLabel: 'TTB', color: '#0050F0', icon: '💳' },
  { id: 'UOB', name: 'ยูโอบี (UOB)', shortLabel: 'UOB', color: '#002F6C', icon: '💳' },
  { id: 'Citi', name: 'ซิตี้ (Citi)', shortLabel: 'Citi', color: '#003B70', icon: '💳' },
  { id: 'Amex', name: 'อเมริกัน เอ็กซ์เพรส (Amex)', shortLabel: 'Amex', color: '#002663', icon: '💳' },
  { id: 'other', name: 'ผู้ให้บริการอื่น ๆ', shortLabel: 'บัตรเครดิต', color: '#E0533C', icon: '💳' },
];

export const INVESTMENT_PLATFORMS: ProviderItem[] = [
  { id: 'InnovestX', name: 'InnovestX', shortLabel: 'InnovestX', color: '#0050F0', icon: '📈' },
  { id: 'Streaming', name: 'Settrade Streaming', shortLabel: 'Streaming', color: '#FF9900', icon: '📊' },
  { id: 'Dime', name: 'Dime!', shortLabel: 'Dime!', color: '#10B981', icon: '🌱' },
  { id: 'Bitkub', name: 'Bitkub', shortLabel: 'Bitkub', color: '#00CC66', icon: '🪙' },
  { id: 'Jitta Wealth', name: 'Jitta Wealth', shortLabel: 'Jitta', color: '#6366F1', icon: '🤖' },
  { id: 'SCB Easy Invest', name: 'SCB Easy Invest', shortLabel: 'SCB Invest', color: '#4E2A84', icon: '💼' },
  { id: 'K-Cyber Invest', name: 'K-My Funds / KBank', shortLabel: 'K-Invest', color: '#138F2D', icon: '📈' },
  { id: 'other', name: 'แพลตฟอร์มอื่น ๆ', shortLabel: 'ลงทุน', color: '#8B5CF6', icon: '📈' },
];

export const PRESET_COLORS = [
  '#3F8F72', // JODTANG Green
  '#138F2D', // KBank Green
  '#4E2A84', // SCB Purple
  '#00A2E8', // KTB Blue
  '#1E3A8A', // BBL Navy
  '#0050F0', // TTB Blue
  '#FDB813', // Krungsri Gold
  '#FF6F00', // TrueMoney Orange
  '#EB008B', // GSB Pink
  '#E0533C', // Coral Red
  '#8B5CF6', // Purple
  '#06C755', // LINE Green
  '#64748B', // Slate Gray
];

export const PRESET_ICONS = [
  '💵', '🏦', '💳', '👛', '📱', '📈', '🪙', '💰', '💎', '🏷️', '📦', '🏛️', '🛡️', '⚡'
];

/**
 * Mask account number, credit card number, wallet ID, or investor ID
 * Requirement 4:
 * Bank: 123-4-56789-0 -> xxx-x-56789-x
 * Credit Card: 4111 1111 1111 1234 -> •••• •••• •••• 1234
 * Wallet: 081-234-5678 -> •••-•••-5678
 * Investor ID: INV-123456 -> INV-••••56
 */
export const maskAccountNumber = (
  raw?: string, 
  accType: string = 'ธนาคาร'
): string => {
  if (!raw || !raw.trim()) return '';
  const val = raw.trim();

  // Credit Card: 16 digits or 4 groups
  if (accType === 'บัตรเครดิต' || val.replace(/\s|-/g, '').length >= 15) {
    const digitsOnly = val.replace(/\D/g, '');
    if (digitsOnly.length >= 4) {
      const last4 = digitsOnly.slice(-4);
      return `•••• •••• •••• ${last4}`;
    }
    return '•••• •••• •••• ••••';
  }

  // Wallet / Phone number: 081-234-5678
  if (accType === 'กระเป๋าเงินออนไลน์' || accType === 'กระเป๋าเงิน') {
    const digits = val.replace(/\D/g, '');
    if (digits.length >= 8) {
      const last4 = digits.slice(-4);
      return `•••-•••-${last4}`;
    }
    if (val.length > 4) {
      return `•••-${val.slice(-4)}`;
    }
    return '•••-••••';
  }

  // Investor ID: INV-123456 -> INV-••••56
  if (accType === 'บัญชีลงทุน' || accType === 'เงินลงทุน') {
    if (val.includes('-')) {
      const parts = val.split('-');
      const prefix = parts[0];
      const rest = parts.slice(1).join('-');
      if (rest.length > 2) {
        return `${prefix}-••••${rest.slice(-2)}`;
      }
      return `${prefix}-••••`;
    }
    if (val.length > 4) {
      return `${val.slice(0, 3)}-••••${val.slice(-2)}`;
    }
    return `INV-••••`;
  }

  // Bank Account: 123-4-56789-0 -> xxx-x-56789-x
  // Keep the distinctive middle digits, mask first and last
  const digits = val.replace(/\D/g, '');
  if (digits.length >= 9) {
    // Format typical Thai bank account (10 digits)
    const mid5 = digits.slice(4, 9);
    return `xxx-x-${mid5}-x`;
  }

  // Generic format
  if (val.length > 4) {
    const last3 = val.slice(-3);
    return `xxx-xxx-${last3}`;
  }

  return 'xxx-xxxx';
};

/**
 * Format account numbers during typing (friendly masks)
 */
export const formatCardNumberDisplay = (val: string): string => {
  const digits = val.replace(/\D/g, '').slice(0, 16);
  const parts = [];
  for (let i = 0; i < digits.length; i += 4) {
    parts.push(digits.slice(i, i + 4));
  }
  return parts.join(' ');
};

/**
 * Safe metadata envelope stored inside the Google Sheet "note" column
 * Preserves 100% backward and forward compatibility without changing sheet headers.
 */
interface SerializedAccountMeta {
  __jodtang: true;
  accountNumber?: string;
  bank?: string;
  walletProvider?: string;
  creditCardProvider?: string;
  creditLimit?: number;
  dueDate?: string;
  platform?: string;
  investorId?: string;
  color?: string;
  icon?: string;
  image?: string;
  noteText?: string;
}

export const serializeAccountNote = (acc: Partial<Account>): string => {
  const meta: SerializedAccountMeta = {
    __jodtang: true,
    accountNumber: acc.accountNumber || undefined,
    bank: acc.bank || undefined,
    walletProvider: acc.walletProvider || undefined,
    creditCardProvider: acc.creditCardProvider || undefined,
    creditLimit: acc.creditLimit != null ? Number(acc.creditLimit) : undefined,
    dueDate: acc.dueDate || undefined,
    platform: acc.platform || undefined,
    investorId: acc.investorId || undefined,
    color: acc.color || undefined,
    icon: acc.icon || undefined,
    image: acc.image || undefined,
    noteText: acc.noteText || (acc.note && !acc.note.startsWith('{"__jodtang"') ? acc.note : undefined),
  };

  try {
    return JSON.stringify(meta);
  } catch {
    return acc.note || '';
  }
};

export const parseAccountNote = (
  rawNote?: string,
  accountName: string = '',
  accountType: string = 'ธนาคาร'
): {
  accountNumber?: string;
  bank?: string;
  walletProvider?: string;
  creditCardProvider?: string;
  creditLimit?: number;
  dueDate?: string;
  platform?: string;
  investorId?: string;
  color?: string;
  icon?: string;
  image?: string;
  noteText?: string;
} => {
  if (rawNote && rawNote.startsWith('{"__jodtang"')) {
    try {
      const parsed: SerializedAccountMeta = JSON.parse(rawNote);
      return {
        accountNumber: parsed.accountNumber,
        bank: parsed.bank,
        walletProvider: parsed.walletProvider,
        creditCardProvider: parsed.creditCardProvider,
        creditLimit: parsed.creditLimit,
        dueDate: parsed.dueDate,
        platform: parsed.platform,
        investorId: parsed.investorId,
        color: parsed.color,
        icon: parsed.icon,
        image: parsed.image,
        noteText: parsed.noteText,
      };
    } catch {
      // Fall through
    }
  }

  // Automatic Migration for legacy accounts:
  const n = accountName.toLowerCase();
  let detectedBank: string | undefined;
  let detectedWallet: string | undefined;
  let detectedColor: string | undefined;
  let detectedIcon = '🏦';

  if (accountType === 'เงินสด') {
    detectedIcon = '💵';
    detectedColor = '#F59E0B';
  } else if (accountType === 'บัตรเครดิต') {
    detectedIcon = '💳';
    detectedColor = '#E0533C';
  } else if (accountType === 'กระเป๋าเงิน' || accountType === 'กระเป๋าเงินออนไลน์') {
    detectedIcon = '📱';
    detectedColor = '#FF6F00';
    if (n.includes('truemoney') || n.includes('true')) detectedWallet = 'TrueMoney';
    else if (n.includes('shopee')) detectedWallet = 'ShopeePay';
    else if (n.includes('line')) detectedWallet = 'LINE Pay';
  } else if (accountType === 'เงินลงทุน' || accountType === 'บัญชีลงทุน') {
    detectedIcon = '📈';
    detectedColor = '#10B981';
  } else {
    // Bank
    if (n.includes('kbank') || n.includes('กสิกร')) {
      detectedBank = 'KBank';
      detectedColor = '#138F2D';
    } else if (n.includes('scb') || n.includes('ไทยพาณิชย์')) {
      detectedBank = 'SCB';
      detectedColor = '#4E2A84';
    } else if (n.includes('krungsri') || n.includes('กรุงศรี') || n.includes('bay')) {
      detectedBank = 'Krungsri';
      detectedColor = '#FDB813';
    } else if (n.includes('bbl') || n.includes('กรุงเทพ')) {
      detectedBank = 'Bangkok Bank';
      detectedColor = '#1E3A8A';
    } else if (n.includes('ktb') || n.includes('กรุงไทย')) {
      detectedBank = 'Krungthai';
      detectedColor = '#00A2E8';
    } else if (n.includes('ttb') || n.includes('ทหารไทย')) {
      detectedBank = 'TTB';
      detectedColor = '#0050F0';
    } else if (n.includes('uob')) {
      detectedBank = 'UOB';
      detectedColor = '#002F6C';
    } else if (n.includes('gsb') || n.includes('ออมสิน')) {
      detectedBank = 'GSB';
      detectedColor = '#EB008B';
    } else {
      detectedColor = '#3F8F72';
    }
  }

  return {
    bank: detectedBank,
    walletProvider: detectedWallet,
    color: detectedColor,
    icon: detectedIcon,
    noteText: rawNote || '',
  };
};

/**
 * Standardize legacy account types
 */
export const normalizeAccountType = (type: string): AccountType => {
  if (type === 'กระเป๋าเงิน') return 'กระเป๋าเงินออนไลน์';
  if (type === 'เงินลงทุน') return 'บัญชีลงทุน';
  if (ACCOUNT_TYPES.includes(type as any)) return type as AccountType;
  return 'อื่น ๆ';
};

/**
 * Categorize into 3 visual groups for tabs:
 * 1. cash_bank: เงินสด / ธนาคาร
 * 2. investments: สินทรัพย์ / บัญชีลงทุน
 * 3. liabilities: หนี้สิน / บัตรเครดิต
 */
export type AccountTabGroup = 'all' | 'cash_bank' | 'investments' | 'liabilities';

export const getAccountTabGroup = (type: string): 'cash_bank' | 'investments' | 'liabilities' => {
  const norm = normalizeAccountType(type);
  if (norm === 'บัตรเครดิต') return 'liabilities';
  if (norm === 'บัญชีลงทุน') return 'investments';
  return 'cash_bank'; // เงินสด, ธนาคาร, กระเป๋าเงินออนไลน์, อื่น ๆ
};
