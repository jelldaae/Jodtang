import { 
  Transaction, 
  Account, 
  Category, 
  Project, 
  Asset, 
  AssetCategory,
  Budget, 
  Debt, 
  Receivable, 
  Goal, 
  Recurring, 
  SheetMetadata,
  INCOME_GROUPS,
  EXPENSE_GROUPS,
  DEFAULT_ASSET_CATEGORIES
} from '../types';
import { parseAccountNote } from '../utils/accountUtils';

export const SHEET_NAME_PREFIX = 'จดตังค์ (JODTANG) Database';

export const SHEET_TABS = {
  TRANSACTIONS: 'รายการ',
  ACCOUNTS: 'บัญชี',
  PROJECTS: 'โครงการ',
  INCOME_CATS: 'รายรับ',
  EXPENSE_CATS: 'รายจ่าย',
  ASSETS: 'สินทรัพย์',
  ASSET_CATS: 'หมวดหมู่สินทรัพย์',
  BUDGETS: 'งบประมาณ',
  DEBTS: 'หนี้',
  RECEIVABLES: 'ลูกหนี้',
  GOALS: 'เป้าหมายการออม',
  RECURRING: 'รายการประจำ',
  SETTINGS: 'ตั้งค่า',
};

export const TX_COLUMNS = [
  'id', 'date', 'type', 'accountId', 'toAccountId', 'projectId', 
  'categoryId', 'description', 'amount', 'currency', 'debtId', 
  'principal', 'interest', 'receivableId', 'goalId', 'subscriptionId', 
  'recurringId', 'status', 'createdAt', 'updatedAt', 'deletedAt'
];

export const ACCOUNT_COLUMNS = ['id', 'name', 'type', 'opening', 'note', 'status', 'createdAt', 'updatedAt'];
export const PROJECT_COLUMNS = ['id', 'name', 'type', 'budget', 'startDate', 'endDate', 'note', 'status', 'createdAt', 'updatedAt'];
export const CAT_COLUMNS = ['id', 'name', 'group', 'icon', 'note', 'status', 'createdAt', 'updatedAt'];
export const ASSET_COLUMNS = ['id', 'name', 'category', 'cost', 'value', 'buyDate', 'accountId', 'note', 'status', 'createdAt', 'updatedAt'];
export const ASSET_CAT_COLUMNS = ['id', 'name', 'icon', 'status', 'createdAt', 'updatedAt'];
export const BUDGET_COLUMNS = ['id', 'month', 'categoryId', 'amount', 'status', 'createdAt', 'updatedAt'];
export const DEBT_COLUMNS = ['id', 'name', 'category', 'creditor', 'initial', 'interest', 'minPay', 'dueDate', 'note', 'accountId', 'status', 'createdAt', 'updatedAt'];
export const RECEIVABLE_COLUMNS = ['id', 'name', 'category', 'initial', 'dueDate', 'note', 'status', 'createdAt', 'updatedAt'];
export const GOAL_COLUMNS = ['id', 'name', 'category', 'target', 'deadline', 'accountId', 'note', 'status', 'createdAt', 'updatedAt'];
export const RECURRING_COLUMNS = ['id', 'name', 'type', 'amount', 'freq', 'nextDate', 'startDate', 'endDate', 'accountId', 'projectId', 'categoryId', 'note', 'status', 'createdAt', 'updatedAt'];

const now = () => {
  const d = new Date();
  return d.toISOString().replace('T', ' ').substring(0, 19);
};

// Generate transaction ID matching requirement 13: TX-Year-Month-Day-Time-Num000xx
export const generateTransactionId = (existingTransactions: Transaction[] = []): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  const secs = String(d.getSeconds()).padStart(2, '0');
  const timeStr = `${hours}${mins}${secs}`;

  let maxNum = 0;
  existingTransactions.forEach(t => {
    const match = t.id?.match(/Num(\d+)$/i);
    if (match) {
      const n = parseInt(match[1], 10);
      if (n > maxNum) maxNum = n;
    }
  });

  const nextNum = String(maxNum + 1).padStart(5, '0');
  return `TX-${year}-${month}-${day}-${timeStr}-Num${nextNum}`;
};

// 1. Search existing Google Sheet database in User's Drive
export const findExistingDatabaseSheet = async (accessToken: string): Promise<SheetMetadata | null> => {
  try {
    const q = `name contains 'จดตังค์' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`;
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name,webViewLink,createdTime,modifiedTime)&orderBy=modifiedTime desc`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!res.ok) {
      console.warn('Drive search returned status:', res.status);
      return null;
    }

    const data = await res.json();
    if (data.files && data.files.length > 0) {
      const file = data.files[0];
      return {
        id: file.id,
        name: file.name,
        webViewLink: file.webViewLink || `https://docs.google.com/spreadsheets/d/${file.id}`,
        createdTime: file.createdTime,
        modifiedTime: file.modifiedTime,
      };
    }
    return null;
  } catch (error) {
    console.error('Error finding sheet in Drive:', error);
    return null;
  }
};

// 2. Default Seed Generation for 9 Income Groups and 15 Expense Groups
export const getDefaultIncomeCategories = (ts: string) => [
  // 1. กลุ่มรายได้จากงานประจำ
  ['INC-001', 'เงินเดือน', 'กลุ่มรายได้จากงานประจำ', '💼', '', 'ใช้งาน', ts, ts],
  ['INC-002', 'โบนัส', 'กลุ่มรายได้จากงานประจำ', '🎁', '', 'ใช้งาน', ts, ts],
  ['INC-003', 'OT / ล่วงเวลา', 'กลุ่มรายได้จากงานประจำ', '⏰', '', 'ใช้งาน', ts, ts],
  ['INC-004', 'คอมมิชชั่นงานประจำ', 'กลุ่มรายได้จากงานประจำ', '💸', '', 'ใช้งาน', ts, ts],
  // 2. กลุ่มรายได้จาก Freelance / งานบริการ
  ['INC-005', 'ค่าจ้าง Freelance', 'กลุ่มรายได้จาก Freelance / งานบริการ', '💻', '', 'ใช้งาน', ts, ts],
  ['INC-006', 'ค่าที่ปรึกษา', 'กลุ่มรายได้จาก Freelance / งานบริการ', '🧑‍🏫', '', 'ใช้งาน', ts, ts],
  ['INC-007', 'ค่าบริการ / งานช่าง', 'กลุ่มรายได้จาก Freelance / งานบริการ', '🛠️', '', 'ใช้งาน', ts, ts],
  ['INC-008', 'ค่าจ้างงานพิเศษ', 'กลุ่มรายได้จาก Freelance / งานบริการ', '🌟', '', 'ใช้งาน', ts, ts],
  // 3. กลุ่มรายได้จากธุรกิจ / การขาย
  ['INC-009', 'กำไรจากการขายสินค้า', 'กลุ่มรายได้จากธุรกิจ / การขาย', '🛍️', '', 'ใช้งาน', ts, ts],
  ['INC-010', 'รายได้ร้านค้า', 'กลุ่มรายได้จากธุรกิจ / การขาย', '🏪', '', 'ใช้งาน', ts, ts],
  ['INC-011', 'รายได้ธุรกิจส่วนตัว', 'กลุ่มรายได้จากธุรกิจ / การขาย', '🏢', '', 'ใช้งาน', ts, ts],
  // 4. กลุ่มรายได้จาก Content / Creator
  ['INC-012', 'YouTube / TikTok', 'กลุ่มรายได้จาก Content / Creator', '📹', '', 'ใช้งาน', ts, ts],
  ['INC-013', 'ค่าโฆษณา / รีวิว', 'กลุ่มรายได้จาก Content / Creator', '📢', '', 'ใช้งาน', ts, ts],
  ['INC-014', 'ค่าสปอนเซอร์', 'กลุ่มรายได้จาก Content / Creator', '🤝', '', 'ใช้งาน', ts, ts],
  ['INC-015', 'Super Chat / ทิป', 'กลุ่มรายได้จาก Content / Creator', '💖', '', 'ใช้งาน', ts, ts],
  // 5. กลุ่มรายได้จาก Affiliate / Commission
  ['INC-016', 'นายหน้าออนไลน์ Shopee/Lazada', 'กลุ่มรายได้จาก Affiliate / Commission', '🔗', '', 'ใช้งาน', ts, ts],
  ['INC-017', 'ค่านายหน้าอสังหาฯ', 'กลุ่มรายได้จาก Affiliate / Commission', '📑', '', 'ใช้งาน', ts, ts],
  ['INC-018', 'คอมมิชชั่นตัวแทน', 'กลุ่มรายได้จาก Affiliate / Commission', '🏷️', '', 'ใช้งาน', ts, ts],
  // 6. กลุ่มรายได้จากการลงทุน
  ['INC-019', 'เงินปันผลหุ้น', 'กลุ่มรายได้จากการลงทุน', '📈', '', 'ใช้งาน', ts, ts],
  ['INC-020', 'กำไรขายหุ้น / กองทุน', 'กลุ่มรายได้จากการลงทุน', '💹', '', 'ใช้งาน', ts, ts],
  ['INC-021', 'ดอกเบี้ยเงินฝาก / หุ้นกู้', 'กลุ่มรายได้จากการลงทุน', '🏦', '', 'ใช้งาน', ts, ts],
  ['INC-022', 'ผลตอบแทนคริปโต', 'กลุ่มรายได้จากการลงทุน', '🪙', '', 'ใช้งาน', ts, ts],
  // 7. กลุ่มรายได้จากทรัพย์สิน
  ['INC-023', 'ค่าเช่าบ้าน / คอนโด', 'กลุ่มรายได้จากทรัพย์สิน', '🏠', '', 'ใช้งาน', ts, ts],
  ['INC-024', 'ค่าเช่าที่ดิน / อาคาร', 'กลุ่มรายได้จากทรัพย์สิน', '🗺️', '', 'ใช้งาน', ts, ts],
  ['INC-025', 'ค่าลิขสิทธิ์ / สิทธิบัตร', 'กลุ่มรายได้จากทรัพย์สิน', '📜', '', 'ใช้งาน', ts, ts],
  // 8. กลุ่มเงินโอน / เงินช่วยเหลือ
  ['INC-026', 'เงินจากครอบครัว', 'กลุ่มเงินโอน / เงินช่วยเหลือ', '👨‍👩‍👧', '', 'ใช้งาน', ts, ts],
  ['INC-027', 'เงินช่วยเหลือ / สวัสดิการ', 'กลุ่มเงินโอน / เงินช่วยเหลือ', '🛡️', '', 'ใช้งาน', ts, ts],
  ['INC-028', 'เงินแต๊ะเอีย / อั่งเปา', 'กลุ่มเงินโอน / เงินช่วยเหลือ', '🧧', '', 'ใช้งาน', ts, ts],
  ['INC-029', 'เงินรางวัล / ถูกสลาก', 'กลุ่มเงินโอน / เงินช่วยเหลือ', '🎟️', '', 'ใช้งาน', ts, ts],
  // 9. กลุ่มรายได้อื่น ๆ
  ['INC-030', 'ขายของมือสอง', 'กลุ่มรายได้อื่น ๆ', '📦', '', 'ใช้งาน', ts, ts],
  ['INC-031', 'รายรับเบ็ดเตล็ด', 'กลุ่มรายได้อื่น ๆ', '✨', '', 'ใช้งาน', ts, ts],
];

export const getDefaultExpenseCategories = (ts: string) => [
  // 15 หมวดหมู่รายจ่ายหลัก (Category Master ตาม Master Prompt Sections 5, 6, 30)
  ['CAT-EXP-001', 'บ้านและที่อยู่อาศัย', 'กลุ่มบ้านและที่อยู่อาศัย', '🏠', '', 'ใช้งาน', ts, ts],
  ['CAT-EXP-002', 'อาหารและเครื่องดื่ม', 'กลุ่มอาหารและเครื่องดื่ม', '🍛', '', 'ใช้งาน', ts, ts],
  ['CAT-EXP-003', 'เดินทางและยานพาหนะ', 'กลุ่มเดินทางและยานพาหนะ', '🚗', '', 'ใช้งาน', ts, ts],
  ['CAT-EXP-004', 'สาธารณูปโภค', 'กลุ่มสาธารณูปโภค', '💡', '', 'ใช้งาน', ts, ts],
  ['CAT-EXP-005', 'โทรศัพท์และอินเทอร์เน็ต', 'กลุ่มโทรศัพท์และอินเทอร์เน็ต', '📱', '', 'ใช้งาน', ts, ts],
  ['CAT-EXP-006', 'สุขภาพและการแพทย์', 'กลุ่มสุขภาพและการแพทย์', '💊', '', 'ใช้งาน', ts, ts],
  ['CAT-EXP-007', 'ประกันภัย', 'กลุ่มประกันภัย', '🛡️', '', 'ใช้งาน', ts, ts],
  ['CAT-EXP-008', 'ช้อปปิ้งและของใช้ส่วนตัว', 'กลุ่มช้อปปิ้งและของใช้ส่วนตัว', '🛍️', '', 'ใช้งาน', ts, ts],
  ['CAT-EXP-009', 'บันเทิงและไลฟ์สไตล์', 'กลุ่มบันเทิงและไลฟ์สไตล์', '🎟️', '', 'ใช้งาน', ts, ts],
  ['CAT-EXP-010', 'การศึกษาและพัฒนาตัวเอง', 'กลุ่มการศึกษาและพัฒนาตัวเอง', '🎓', '', 'ใช้งาน', ts, ts],
  ['CAT-EXP-011', 'ธุรกิจ / การทำงาน', 'กลุ่มธุรกิจ / การทำงาน', '💼', '', 'ใช้งาน', ts, ts],
  ['CAT-EXP-012', 'ภาษีและค่าธรรมเนียม', 'กลุ่มภาษีและค่าธรรมเนียม', '🧾', '', 'ใช้งาน', ts, ts],
  ['CAT-EXP-013', 'สมาชิกและ Subscription', 'กลุ่มสมาชิกและ Subscription', '🎬', '', 'ใช้งาน', ts, ts],
  ['CAT-EXP-014', 'ของขวัญ / บริจาค', 'กลุ่มของขวัญ / บริจาค', '🕊️', '', 'ใช้งาน', ts, ts],
  ['CAT-EXP-015', 'รายจ่ายอื่น ๆ', 'กลุ่มรายจ่ายอื่น ๆ', '📦', '', 'ใช้งาน', ts, ts],

  // 1. กลุ่มบ้านและที่อยู่อาศัย (หมวดหมู่ย่อย)
  ['EXP-001', 'ค่าเช่าบ้าน / คอนโด', 'กลุ่มบ้านและที่อยู่อาศัย', '🏠', '', 'ใช้งาน', ts, ts],
  ['EXP-002', 'ผ่อนบ้าน', 'กลุ่มบ้านและที่อยู่อาศัย', '🏦', '', 'ใช้งาน', ts, ts],
  ['EXP-003', 'ค่าส่วนกลาง', 'กลุ่มบ้านและที่อยู่อาศัย', '🏢', '', 'ใช้งาน', ts, ts],
  ['EXP-004', 'ซ่อมแซมบ้าน', 'กลุ่มบ้านและที่อยู่อาศัย', '🔨', '', 'ใช้งาน', ts, ts],
  ['EXP-005', 'เฟอร์นิเจอร์และของตกแต่ง', 'กลุ่มบ้านและที่อยู่อาศัย', '🛋️', '', 'ใช้งาน', ts, ts],
  // 2. กลุ่มอาหารและเครื่องดื่ม
  ['EXP-006', 'อาหารมื้อหลัก', 'กลุ่มอาหารและเครื่องดื่ม', '🍛', '', 'ใช้งาน', ts, ts],
  ['EXP-007', 'กาแฟและเครื่องดื่ม', 'กลุ่มอาหารและเครื่องดื่ม', '☕', '', 'ใช้งาน', ts, ts],
  ['EXP-008', 'ขนมและของว่าง', 'กลุ่มอาหารและเครื่องดื่ม', '🍰', '', 'ใช้งาน', ts, ts],
  ['EXP-009', 'บุฟเฟต์ / มื้อพิเศษ', 'กลุ่มอาหารและเครื่องดื่ม', '🍻', '', 'ใช้งาน', ts, ts],
  ['EXP-010', 'ของสดและวัตถุดิบ', 'กลุ่มอาหารและเครื่องดื่ม', '🥦', '', 'ใช้งาน', ts, ts],
  // 3. กลุ่มเดินทางและยานพาหนะ
  ['EXP-011', 'ค่าน้ำมัน / ชาร์จไฟ', 'กลุ่มเดินทางและยานพาหนะ', '⛽', '', 'ใช้งาน', ts, ts],
  ['EXP-012', 'ค่ารถไฟฟ้า / รถเมล์', 'กลุ่มเดินทางและยานพาหนะ', '🚆', '', 'ใช้งาน', ts, ts],
  ['EXP-013', 'ค่าแท็กซี่ / Grab / วิน', 'กลุ่มเดินทางและยานพาหนะ', '🚕', '', 'ใช้งาน', ts, ts],
  ['EXP-014', 'ค่าทางด่วนและที่จอดรถ', 'กลุ่มเดินทางและยานพาหนะ', '🛣️', '', 'ใช้งาน', ts, ts],
  ['EXP-015', 'ซ่อมบำรุงรถ', 'กลุ่มเดินทางและยานพาหนะ', '🔧', '', 'ใช้งาน', ts, ts],
  ['EXP-016', 'ผ่อนรถ', 'กลุ่มเดินทางและยานพาหนะ', '🚗', '', 'ใช้งาน', ts, ts],
  // 4. กลุ่มสาธารณูปโภค
  ['EXP-017', 'ค่าไฟฟ้า', 'กลุ่มสาธารณูปโภค', '💡', '', 'ใช้งาน', ts, ts],
  ['EXP-018', 'ค่าน้ำประปา', 'กลุ่มสาธารณูปโภค', '🚰', '', 'ใช้งาน', ts, ts],
  ['EXP-019', 'ค่าแก๊สหุงต้ม', 'กลุ่มสาธารณูปโภค', '🍳', '', 'ใช้งาน', ts, ts],
  // 5. กลุ่มโทรศัพท์และอินเทอร์เน็ต
  ['EXP-020', 'ค่าโทรศัพท์มือถือ', 'กลุ่มโทรศัพท์และอินเทอร์เน็ต', '📱', '', 'ใช้งาน', ts, ts],
  ['EXP-021', 'ค่าอินเทอร์เน็ตบ้าน', 'กลุ่มโทรศัพท์และอินเทอร์เน็ต', '🌐', '', 'ใช้งาน', ts, ts],
  // 6. กลุ่มสุขภาพและการแพทย์
  ['EXP-022', 'ค่ายาและเวชภัณฑ์', 'กลุ่มสุขภาพและการแพทย์', '💊', '', 'ใช้งาน', ts, ts],
  ['EXP-023', 'ค่ารักษาพยาบาล / คลินิก', 'กลุ่มสุขภาพและการแพทย์', '🏥', '', 'ใช้งาน', ts, ts],
  ['EXP-024', 'ค่าทำฟัน', 'กลุ่มสุขภาพและการแพทย์', '🦷', '', 'ใช้งาน', ts, ts],
  ['EXP-025', 'อาหารเสริมและวิตามิน', 'กลุ่มสุขภาพและการแพทย์', '🌿', '', 'ใช้งาน', ts, ts],
  ['EXP-026', 'ฟิตเนสและกีฬา', 'กลุ่มสุขภาพและการแพทย์', '🏋️‍♂️', '', 'ใช้งาน', ts, ts],
  // 7. กลุ่มประกันภัย
  ['EXP-027', 'ประกันสุขภาพ', 'กลุ่มประกันภัย', '🩺', '', 'ใช้งาน', ts, ts],
  ['EXP-028', 'ประกันชีวิต', 'กลุ่มประกันภัย', '🛡️', '', 'ใช้งาน', ts, ts],
  ['EXP-029', 'ประกันอุบัติเหตุ', 'กลุ่มประกันภัย', '🩹', '', 'ใช้งาน', ts, ts],
  ['EXP-030', 'ประกันรถยนต์', 'กลุ่มประกันภัย', '🚙', '', 'ใช้งาน', ts, ts],
  // 8. กลุ่มช้อปปิ้งและของใช้ส่วนตัว
  ['EXP-031', 'เสื้อผ้าและแฟชั่น', 'กลุ่มช้อปปิ้งและของใช้ส่วนตัว', '👗', '', 'ใช้งาน', ts, ts],
  ['EXP-032', 'รองเท้าและกระเป๋า', 'กลุ่มช้อปปิ้งและของใช้ส่วนตัว', '👟', '', 'ใช้งาน', ts, ts],
  ['EXP-033', 'เครื่องสำอางและสกินแคร์', 'กลุ่มช้อปปิ้งและของใช้ส่วนตัว', '💄', '', 'ใช้งาน', ts, ts],
  ['EXP-034', 'อุปกรณ์ไอที / แกดเจ็ต', 'กลุ่มช้อปปิ้งและของใช้ส่วนตัว', '🎧', '', 'ใช้งาน', ts, ts],
  ['EXP-035', 'ของใช้ส่วนตัว', 'กลุ่มช้อปปิ้งและของใช้ส่วนตัว', '🧴', '', 'ใช้งาน', ts, ts],
  // 9. กลุ่มบันเทิงและไลฟ์สไตล์
  ['EXP-036', 'ดูหนังและคอนเสิร์ต', 'กลุ่มบันเทิงและไลฟ์สไตล์', '🎟️', '', 'ใช้งาน', ts, ts],
  ['EXP-037', 'ท่องเที่ยวและที่พัก', 'กลุ่มบันเทิงและไลฟ์สไตล์', '🏖️', '', 'ใช้งาน', ts, ts],
  ['EXP-038', 'เกมและแอปพลิเคชัน', 'กลุ่มบันเทิงและไลฟ์สไตล์', '🎮', '', 'ใช้งาน', ts, ts],
  ['EXP-039', 'งานอดิเรกและสะสม', 'กลุ่มบันเทิงและไลฟ์สไตล์', '🎨', '', 'ใช้งาน', ts, ts],
  // 10. กลุ่มการศึกษาและพัฒนาตัวเอง
  ['EXP-040', 'คอร์สเรียนและอบรม', 'กลุ่มการศึกษาและพัฒนาตัวเอง', '🎓', '', 'ใช้งาน', ts, ts],
  ['EXP-041', 'หนังสือและบทความ', 'กลุ่มการศึกษาและพัฒนาตัวเอง', '📚', '', 'ใช้งาน', ts, ts],
  ['EXP-042', 'ค่าเทอม / อุปกรณ์เรียน', 'กลุ่มการศึกษาและพัฒนาตัวเอง', '✏️', '', 'ใช้งาน', ts, ts],
  // 11. กลุ่มธุรกิจ / การทำงาน
  ['EXP-043', 'ซอฟต์แวร์ทำงาน', 'กลุ่มธุรกิจ / การทำงาน', '💻', '', 'ใช้งาน', ts, ts],
  ['EXP-044', 'ค่าโฆษณา / ยิงแอด', 'กลุ่มธุรกิจ / การทำงาน', '📢', '', 'ใช้งาน', ts, ts],
  ['EXP-045', 'ค่าอุปกรณ์สำนักงาน', 'กลุ่มธุรกิจ / การทำงาน', '🖨️', '', 'ใช้งาน', ts, ts],
  ['EXP-046', 'ค่าเดินทางติดต่องาน', 'กลุ่มธุรกิจ / การทำงาน', '💼', '', 'ใช้งาน', ts, ts],
  // 12. กลุ่มภาษีและค่าธรรมเนียม
  ['EXP-047', 'ภาษีเงินได้', 'กลุ่มภาษีและค่าธรรมเนียม', '🧾', '', 'ใช้งาน', ts, ts],
  ['EXP-048', 'ภาษีที่ดิน', 'กลุ่มภาษีและค่าธรรมเนียม', '🏛️', '', 'ใช้งาน', ts, ts],
  ['EXP-049', 'ค่าธรรมเนียมธนาคาร', 'กลุ่มภาษีและค่าธรรมเนียม', '💳', '', 'ใช้งาน', ts, ts],
  // 13. กลุ่มสมาชิกและ Subscription
  ['EXP-050', 'Netflix / สตรีมมิ่งวิดีโอ', 'กลุ่มสมาชิกและ Subscription', '🎬', '', 'ใช้งาน', ts, ts],
  ['EXP-051', 'Spotify / Apple Music', 'กลุ่มสมาชิกและ Subscription', '🎵', '', 'ใช้งาน', ts, ts],
  ['EXP-052', 'YouTube Premium', 'กลุ่มสมาชิกและ Subscription', '📺', '', 'ใช้งาน', ts, ts],
  ['EXP-053', 'iCloud / Google One', 'กลุ่มสมาชิกและ Subscription', '☁️', '', 'ใช้งาน', ts, ts],
  ['EXP-054', 'ChatGPT / AI Tools', 'กลุ่มสมาชิกและ Subscription', '🤖', '', 'ใช้งาน', ts, ts],
  // 14. กลุ่มของขวัญ / บริจาค
  ['EXP-055', 'เงินทำบุญและบริจาค', 'กลุ่มของขวัญ / บริจาค', '🕊️', '', 'ใช้งาน', ts, ts],
  ['EXP-056', 'ของขวัญวันเกิด / เทศกาล', 'กลุ่มของขวัญ / บริจาค', '🎁', '', 'ใช้งาน', ts, ts],
  ['EXP-057', 'ซองงานแต่ง / งานบวช / งานศพ', 'กลุ่มของขวัญ / บริจาค', '💌', '', 'ใช้งาน', ts, ts],
  // 15. กลุ่มรายจ่ายอื่น ๆ
  ['EXP-058', 'ค่าใช้จ่ายฉุกเฉิน', 'กลุ่มรายจ่ายอื่น ๆ', '🚨', '', 'ใช้งาน', ts, ts],
  ['EXP-059', 'รายจ่ายเบ็ดเตล็ด', 'กลุ่มรายจ่ายอื่น ๆ', '📦', '', 'ใช้งาน', ts, ts],
];

// 3. Create a new Google Sheet database with all tabs & headers
export const createDatabaseSheet = async (accessToken: string, customName?: string): Promise<SheetMetadata> => {
  const sheetTitle = customName || SHEET_NAME_PREFIX;

  const sheetsToCreate = [
    { title: SHEET_TABS.TRANSACTIONS, headers: TX_COLUMNS },
    { title: SHEET_TABS.ACCOUNTS, headers: ACCOUNT_COLUMNS },
    { title: SHEET_TABS.INCOME_CATS, headers: CAT_COLUMNS },
    { title: SHEET_TABS.EXPENSE_CATS, headers: CAT_COLUMNS },
    { title: SHEET_TABS.PROJECTS, headers: PROJECT_COLUMNS },
    { title: SHEET_TABS.BUDGETS, headers: BUDGET_COLUMNS },
    { title: SHEET_TABS.DEBTS, headers: DEBT_COLUMNS },
    { title: SHEET_TABS.RECEIVABLES, headers: RECEIVABLE_COLUMNS },
    { title: SHEET_TABS.GOALS, headers: GOAL_COLUMNS },
    { title: SHEET_TABS.RECURRING, headers: RECURRING_COLUMNS },
    { title: SHEET_TABS.ASSETS, headers: ASSET_COLUMNS },
    { title: SHEET_TABS.ASSET_CATS, headers: ASSET_CAT_COLUMNS },
    { title: SHEET_TABS.SETTINGS, headers: ['key', 'value', 'updatedAt'] },
  ];

  const payload = {
    properties: {
      title: sheetTitle,
      locale: 'th_TH',
      timeZone: 'Asia/Bangkok',
    },
    sheets: sheetsToCreate.map((s, index) => ({
      properties: {
        sheetId: index + 1,
        title: s.title,
        gridProperties: {
          frozenRowCount: 1,
        },
      },
    })),
  };

  const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`สร้าง Google Sheet ไม่สำเร็จ: ${errorText}`);
  }

  const created = await res.json();
  const spreadsheetId = created.spreadsheetId;

  // Insert headers and default seeds
  const ts = now();
  const defaultIncome = getDefaultIncomeCategories(ts);
  const defaultExpense = getDefaultExpenseCategories(ts);

  const defaultAssetCats = DEFAULT_ASSET_CATEGORIES.map((ac, idx) => [
    `ACAT-${String(idx + 1).padStart(3, '0')}`,
    ac.name,
    ac.icon,
    'ใช้งาน',
    ts,
    ts,
  ]);

  const seedData = [
    {
      range: `${SHEET_TABS.TRANSACTIONS}!A1:U1`,
      values: [TX_COLUMNS],
    },
    {
      range: `${SHEET_TABS.ACCOUNTS}!A1:H3`,
      values: [
        ACCOUNT_COLUMNS,
        ['ACC-0001', 'เงินสด', 'เงินสด', 0, 'เงินสดในกระเป๋า', 'ใช้งาน', ts, ts],
        ['ACC-0002', 'บัญชีธนาคาร', 'ธนาคาร', 0, 'บัญชีธนาคารหลัก', 'ใช้งาน', ts, ts],
      ],
    },
    {
      range: `${SHEET_TABS.INCOME_CATS}!A1:H${defaultIncome.length + 1}`,
      values: [CAT_COLUMNS, ...defaultIncome],
    },
    {
      range: `${SHEET_TABS.EXPENSE_CATS}!A1:H${defaultExpense.length + 1}`,
      values: [CAT_COLUMNS, ...defaultExpense],
    },
    {
      range: `${SHEET_TABS.ASSET_CATS}!A1:F${defaultAssetCats.length + 1}`,
      values: [ASSET_CAT_COLUMNS, ...defaultAssetCats],
    },
    {
      range: `${SHEET_TABS.PROJECTS}!A1:I1`,
      values: [PROJECT_COLUMNS],
    },
    {
      range: `${SHEET_TABS.BUDGETS}!A1:G1`,
      values: [BUDGET_COLUMNS],
    },
    {
      range: `${SHEET_TABS.DEBTS}!A1:L1`,
      values: [DEBT_COLUMNS],
    },
    {
      range: `${SHEET_TABS.RECEIVABLES}!A1:H1`,
      values: [RECEIVABLE_COLUMNS],
    },
    {
      range: `${SHEET_TABS.GOALS}!A1:I1`,
      values: [GOAL_COLUMNS],
    },
    {
      range: `${SHEET_TABS.RECURRING}!A1:N1`,
      values: [RECURRING_COLUMNS],
    },
    {
      range: `${SHEET_TABS.ASSETS}!A1:I1`,
      values: [ASSET_COLUMNS],
    },
    {
      range: `${SHEET_TABS.SETTINGS}!A1:C3`,
      values: [
        ['key', 'value', 'updatedAt'],
        ['app_name', 'จดตังค์ (JODTANG)', ts],
        ['created_by', 'JODTANG Web App', ts],
      ],
    },
  ];

  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      valueInputOption: 'USER_ENTERED',
      data: seedData,
    }),
  });

  return {
    id: spreadsheetId,
    name: sheetTitle,
    webViewLink: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
    createdTime: new Date().toISOString(),
  };
};

// Tab configuration for columns and default initial seed data
export const TAB_CONFIGS: Record<string, { headers: string[]; getInitialRows?: (ts: string) => any[][] }> = {
  [SHEET_TABS.TRANSACTIONS]: { headers: TX_COLUMNS },
  [SHEET_TABS.ACCOUNTS]: { 
    headers: ACCOUNT_COLUMNS, 
    getInitialRows: (ts) => [
      ['ACC-0001', 'เงินสด', 'เงินสด', 0, 'เงินสดในกระเป๋า', 'ใช้งาน', ts, ts],
      ['ACC-0002', 'บัญชีธนาคาร', 'ธนาคาร', 0, 'บัญชีธนาคารหลัก', 'ใช้งาน', ts, ts],
    ] 
  },
  [SHEET_TABS.PROJECTS]: { headers: PROJECT_COLUMNS },
  [SHEET_TABS.INCOME_CATS]: { headers: CAT_COLUMNS, getInitialRows: (ts) => getDefaultIncomeCategories(ts) },
  [SHEET_TABS.EXPENSE_CATS]: { headers: CAT_COLUMNS, getInitialRows: (ts) => getDefaultExpenseCategories(ts) },
  [SHEET_TABS.ASSET_CATS]: {
    headers: ASSET_CAT_COLUMNS,
    getInitialRows: (ts) => DEFAULT_ASSET_CATEGORIES.map((ac, idx) => [
      `ACAT-${String(idx + 1).padStart(3, '0')}`,
      ac.name,
      ac.icon,
      'ใช้งาน',
      ts,
      ts,
    ])
  },
  [SHEET_TABS.BUDGETS]: { headers: BUDGET_COLUMNS },
  [SHEET_TABS.DEBTS]: { headers: DEBT_COLUMNS },
  [SHEET_TABS.RECEIVABLES]: { headers: RECEIVABLE_COLUMNS },
  [SHEET_TABS.GOALS]: { headers: GOAL_COLUMNS },
  [SHEET_TABS.RECURRING]: { headers: RECURRING_COLUMNS },
  [SHEET_TABS.ASSETS]: { headers: ASSET_COLUMNS },
  [SHEET_TABS.SETTINGS]: {
    headers: ['key', 'value', 'updatedAt'],
    getInitialRows: (ts) => [
      ['app_name', 'จดตังค์ (JODTANG)', ts],
      ['created_by', 'JODTANG Web App', ts],
    ]
  },
};

/**
 * Ensures required tabs exist in the user's spreadsheet.
 * If any tab is missing (e.g. from an older version of the spreadsheet),
 * it dynamically creates them with headers and default seed data in a single batch.
 */
export const ensureSheetTabs = async (
  spreadsheetId: string,
  accessToken: string,
  requiredTabNames?: string[]
): Promise<Set<string>> => {
  const tabsToCheck = requiredTabNames || Object.values(SHEET_TABS);
  try {
    const metaRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties.title`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!metaRes.ok) return new Set();

    const meta = await metaRes.json();
    const existingTitles = new Set<string>(meta.sheets?.map((s: any) => s.properties?.title) || []);

    const missingTabs = tabsToCheck.filter(name => !existingTitles.has(name));
    if (missingTabs.length === 0) return existingTitles;

    // Create missing sheets in one batchUpdate request
    const addSheetRequests = missingTabs.map(tabName => ({
      addSheet: {
        properties: {
          title: tabName,
          gridProperties: { frozenRowCount: 1 },
        },
      },
    }));

    const updateRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requests: addSheetRequests }),
      }
    );

    if (updateRes.ok) {
      missingTabs.forEach(name => existingTitles.add(name));

      // Populate headers and default rows for newly created tabs
      const curTs = now();
      const valueData = missingTabs.map(tabName => {
        const config = TAB_CONFIGS[tabName];
        const headers = config?.headers || ['id', 'name'];
        const initialRows = config?.getInitialRows ? config.getInitialRows(curTs) : [];
        return {
          range: `${tabName}!A1`,
          values: [headers, ...initialRows],
        };
      });

      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            valueInputOption: 'USER_ENTERED',
            data: valueData,
          }),
        }
      );
    }

    return existingTitles;
  } catch (err) {
    console.warn('ensureSheetTabs warning (proceeding safely):', err);
    return new Set();
  }
};

// 4. Batch Read All Data from Spreadsheet
export interface AllSheetData {
  transactions: Transaction[];
  accounts: Account[];
  projects: Project[];
  incomeCats: Category[];
  expenseCats: Category[];
  budgets: Budget[];
  debts: Debt[];
  receivables: Receivable[];
  goals: Goal[];
  recurring: Recurring[];
  assets: Asset[];
  assetCats: AssetCategory[];
}

export const fetchAllDataFromSheet = async (
  spreadsheetId: string, 
  accessToken: string
): Promise<AllSheetData> => {
  // 1. Ensure all expected tabs exist (creates any missing tabs like หมวดหมู่สินทรัพย์ automatically)
  const existingTabs = await ensureSheetTabs(spreadsheetId, accessToken);

  // 2. Define tab queries with safe fallback
  const tabQueries: { key: keyof AllSheetData; tab: string; range: string }[] = [
    { key: 'transactions', tab: SHEET_TABS.TRANSACTIONS, range: `${SHEET_TABS.TRANSACTIONS}!A2:U` },
    { key: 'accounts', tab: SHEET_TABS.ACCOUNTS, range: `${SHEET_TABS.ACCOUNTS}!A2:H` },
    { key: 'projects', tab: SHEET_TABS.PROJECTS, range: `${SHEET_TABS.PROJECTS}!A2:I` },
    { key: 'incomeCats', tab: SHEET_TABS.INCOME_CATS, range: `${SHEET_TABS.INCOME_CATS}!A2:H` },
    { key: 'expenseCats', tab: SHEET_TABS.EXPENSE_CATS, range: `${SHEET_TABS.EXPENSE_CATS}!A2:H` },
    { key: 'budgets', tab: SHEET_TABS.BUDGETS, range: `${SHEET_TABS.BUDGETS}!A2:G` },
    { key: 'debts', tab: SHEET_TABS.DEBTS, range: `${SHEET_TABS.DEBTS}!A2:L` },
    { key: 'receivables', tab: SHEET_TABS.RECEIVABLES, range: `${SHEET_TABS.RECEIVABLES}!A2:H` },
    { key: 'goals', tab: SHEET_TABS.GOALS, range: `${SHEET_TABS.GOALS}!A2:I` },
    { key: 'recurring', tab: SHEET_TABS.RECURRING, range: `${SHEET_TABS.RECURRING}!A2:N` },
    { key: 'assets', tab: SHEET_TABS.ASSETS, range: `${SHEET_TABS.ASSETS}!A2:I` },
    { key: 'assetCats', tab: SHEET_TABS.ASSET_CATS, range: `${SHEET_TABS.ASSET_CATS}!A2:F` },
  ];

  // Only query ranges for sheets that actually exist in the spreadsheet to prevent HTTP 400
  const activeQueries = existingTabs.size > 0 
    ? tabQueries.filter(q => existingTabs.has(q.tab))
    : tabQueries;

  let valueRanges: any[] = [];
  if (activeQueries.length > 0) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?${activeQueries.map(r => `ranges=${encodeURIComponent(r.range)}`).join('&')}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`ไม่สามารถอ่านข้อมูลจาก Google Sheets ได้ (${res.status}): ${errorText}`);
    }

    const data = await res.json();
    valueRanges = data.valueRanges || [];
  }

  // Map result rows by key
  const rowsByKey: Record<keyof AllSheetData, any[][]> = {
    transactions: [],
    accounts: [],
    projects: [],
    incomeCats: [],
    expenseCats: [],
    budgets: [],
    debts: [],
    receivables: [],
    goals: [],
    recurring: [],
    assets: [],
    assetCats: [],
  };

  activeQueries.forEach((q, idx) => {
    rowsByKey[q.key] = valueRanges[idx]?.values || [];
  });

  const parseTransactions = (rows: any[][]): Transaction[] => {
    return (rows || []).map((r) => ({
      id: String(r[0] || ''),
      date: String(r[1] || ''),
      type: (r[2] || 'expense') as any,
      accountId: String(r[3] || ''),
      toAccountId: r[4] ? String(r[4]) : undefined,
      projectId: r[5] ? String(r[5]) : undefined,
      categoryId: r[6] ? String(r[6]) : undefined,
      description: String(r[7] || ''),
      amount: parseFloat(r[8]) || 0,
      currency: String(r[9] || 'THB'),
      debtId: r[10] ? String(r[10]) : undefined,
      principal: r[11] ? parseFloat(r[11]) : undefined,
      interest: r[12] ? parseFloat(r[12]) : undefined,
      receivableId: r[13] ? String(r[13]) : undefined,
      goalId: r[14] ? String(r[14]) : undefined,
      subscriptionId: r[15] ? String(r[15]) : undefined,
      recurringId: r[16] ? String(r[16]) : undefined,
      status: (r[17] || 'ใช้งาน') as any,
      createdAt: String(r[18] || ''),
      updatedAt: String(r[19] || ''),
      deletedAt: r[20] ? String(r[20]) : undefined,
    })).filter(t => t.id && t.status !== 'ลบแล้ว');
  };

  const parseAccounts = (rows: any[][]): Account[] => {
    return (rows || []).map((r) => {
      const id = String(r[0] || '');
      const name = String(r[1] || '');
      const type = String(r[2] || 'เงินสด');
      const opening = parseFloat(r[3]) || 0;
      const rawNote = r[4] ? String(r[4]) : undefined;
      const status = (r[5] || 'ใช้งาน') as any;
      const createdAt = String(r[6] || '');
      const updatedAt = String(r[7] || '');
      const meta = parseAccountNote(rawNote, name, type);

      return {
        id,
        name,
        type,
        opening,
        note: rawNote,
        status,
        createdAt,
        updatedAt,
        ...meta,
      };
    }).filter(a => a.id);
  };

  const parseProjects = (rows: any[][]): Project[] => {
    return (rows || []).map((r) => ({
      id: String(r[0] || ''),
      name: String(r[1] || ''),
      type: String(r[2] || 'ทั่วไป'),
      budget: parseFloat(r[3]) || 0,
      startDate: r[4] ? String(r[4]) : undefined,
      endDate: r[5] ? String(r[5]) : undefined,
      note: r[6] ? String(r[6]) : undefined,
      status: (r[7] || 'ใช้งาน') as any,
      createdAt: String(r[8] || ''),
      updatedAt: String(r[9] || ''),
    })).filter(p => p.id);
  };

  const parseCategories = (rows: any[][]): Category[] => {
    return (rows || []).map((r) => ({
      id: String(r[0] || ''),
      name: String(r[1] || ''),
      group: String(r[2] || 'ทั่วไป'),
      icon: r[3] ? String(r[3]) : '🏷️',
      note: r[4] ? String(r[4]) : undefined,
      status: (r[5] || 'ใช้งาน') as any,
      createdAt: String(r[6] || ''),
      updatedAt: String(r[7] || ''),
    })).filter(c => c.id && c.status !== 'ลบแล้ว');
  };

  const parseBudgets = (rows: any[][]): Budget[] => {
    return (rows || []).map((r) => ({
      id: String(r[0] || ''),
      month: String(r[1] || ''),
      categoryId: String(r[2] || ''),
      amount: parseFloat(r[3]) || 0,
      status: (r[4] || 'ใช้งาน') as any,
      createdAt: String(r[5] || ''),
      updatedAt: String(r[6] || ''),
    })).filter(b => b.id);
  };

  const parseDebts = (rows: any[][]): Debt[] => {
    return (rows || []).map((r) => ({
      id: String(r[0] || ''),
      name: String(r[1] || ''),
      category: String(r[2] || ''),
      creditor: String(r[3] || ''),
      initial: parseFloat(r[4]) || 0,
      interest: parseFloat(r[5]) || 0,
      minPay: parseFloat(r[6]) || 0,
      dueDate: r[7] ? String(r[7]) : undefined,
      note: r[8] ? String(r[8]) : undefined,
      accountId: r[9] ? String(r[9]) : undefined,
      status: (r[10] || 'ใช้งาน') as any,
      createdAt: String(r[11] || ''),
      updatedAt: String(r[12] || ''),
    })).filter(d => d.id);
  };

  const parseReceivables = (rows: any[][]): Receivable[] => {
    return (rows || []).map((r) => ({
      id: String(r[0] || ''),
      name: String(r[1] || ''),
      category: String(r[2] || ''),
      initial: parseFloat(r[3]) || 0,
      dueDate: r[4] ? String(r[4]) : undefined,
      note: r[5] ? String(r[5]) : undefined,
      status: (r[6] || 'ใช้งาน') as any,
      createdAt: String(r[7] || ''),
      updatedAt: String(r[8] || ''),
    })).filter(rc => rc.id);
  };

  const parseGoals = (rows: any[][]): Goal[] => {
    return (rows || []).map((r) => ({
      id: String(r[0] || ''),
      name: String(r[1] || ''),
      category: String(r[2] || ''),
      target: parseFloat(r[3]) || 0,
      deadline: r[4] ? String(r[4]) : undefined,
      accountId: r[5] ? String(r[5]) : undefined,
      note: r[6] ? String(r[6]) : undefined,
      status: (r[7] || 'ใช้งาน') as any,
      createdAt: String(r[8] || ''),
      updatedAt: String(r[9] || ''),
    })).filter(g => g.id);
  };

  const parseRecurring = (rows: any[][]): Recurring[] => {
    return (rows || []).map((r) => ({
      id: String(r[0] || ''),
      name: String(r[1] || ''),
      type: (r[2] || 'รายจ่าย') as any,
      amount: parseFloat(r[3]) || 0,
      freq: (r[4] || 'รายเดือน') as any,
      nextDate: String(r[5] || ''),
      startDate: r[6] ? String(r[6]) : undefined,
      endDate: r[7] ? String(r[7]) : undefined,
      accountId: r[8] ? String(r[8]) : undefined,
      projectId: r[9] ? String(r[9]) : undefined,
      categoryId: r[10] ? String(r[10]) : undefined,
      note: r[11] ? String(r[11]) : undefined,
      status: (r[12] || 'ใช้งาน') as any,
      createdAt: String(r[13] || ''),
      updatedAt: String(r[14] || ''),
    })).filter(rc => rc.id);
  };

  const parseAssets = (rows: any[][]): Asset[] => {
    return (rows || []).map((r) => ({
      id: String(r[0] || ''),
      name: String(r[1] || ''),
      category: String(r[2] || ''),
      cost: parseFloat(r[3]) || 0,
      value: parseFloat(r[4]) || 0,
      buyDate: r[5] ? String(r[5]) : undefined,
      accountId: r[6] ? String(r[6]) : undefined,
      note: r[7] ? String(r[7]) : undefined,
      status: (r[8] || 'ใช้งาน') as any,
      createdAt: String(r[9] || ''),
      updatedAt: String(r[10] || ''),
    })).filter(ast => ast.id);
  };

  const parseAssetCategories = (rows: any[][]): AssetCategory[] => {
    return (rows || []).map((r) => ({
      id: String(r[0] || ''),
      name: String(r[1] || ''),
      icon: r[2] ? String(r[2]) : '📦',
      status: (r[3] || 'ใช้งาน') as any,
      createdAt: String(r[4] || ''),
      updatedAt: String(r[5] || ''),
    })).filter(ac => ac.id);
  };

  // If income / expense categories in sheet were empty, fallback to rich defaults
  const parsedIncome = parseCategories(rowsByKey.incomeCats);
  const parsedExpense = parseCategories(rowsByKey.expenseCats);
  const parsedAssetCats = parseAssetCategories(rowsByKey.assetCats);

  const curTs = now();
  const finalIncome = parsedIncome.length > 0 ? parsedIncome : getDefaultIncomeCategories(curTs).map(r => ({
    id: r[0], name: r[1], group: r[2], icon: r[3], note: r[4], status: r[5] as any, createdAt: r[6], updatedAt: r[7]
  }));

  const finalExpense = parsedExpense.length > 0 ? parsedExpense : getDefaultExpenseCategories(curTs).map(r => ({
    id: r[0], name: r[1], group: r[2], icon: r[3], note: r[4], status: r[5] as any, createdAt: r[6], updatedAt: r[7]
  }));

  const finalAssetCats = parsedAssetCats.length > 0 ? parsedAssetCats : DEFAULT_ASSET_CATEGORIES.map((ac, idx) => ({
    id: `ACAT-${String(idx + 1).padStart(3, '0')}`,
    name: ac.name,
    icon: ac.icon,
    status: 'ใช้งาน' as const,
    createdAt: curTs,
    updatedAt: curTs,
  }));

  return {
    transactions: parseTransactions(rowsByKey.transactions),
    accounts: parseAccounts(rowsByKey.accounts),
    projects: parseProjects(rowsByKey.projects),
    incomeCats: finalIncome,
    expenseCats: finalExpense,
    budgets: parseBudgets(rowsByKey.budgets),
    debts: parseDebts(rowsByKey.debts),
    receivables: parseReceivables(rowsByKey.receivables),
    goals: parseGoals(rowsByKey.goals),
    recurring: parseRecurring(rowsByKey.recurring),
    assets: parseAssets(rowsByKey.assets),
    assetCats: finalAssetCats,
  };
};

// 5. Append Transaction to Google Sheet
export const appendTransactionToSheet = async (
  spreadsheetId: string, 
  accessToken: string, 
  tx: Transaction
) => {
  const row = [
    tx.id,
    tx.date,
    tx.type,
    tx.accountId,
    tx.toAccountId || '',
    tx.projectId || '',
    tx.categoryId || '',
    tx.description,
    tx.amount,
    tx.currency || 'THB',
    tx.debtId || '',
    tx.principal != null ? tx.principal : '',
    tx.interest != null ? tx.interest : '',
    tx.receivableId || '',
    tx.goalId || '',
    tx.subscriptionId || '',
    tx.recurringId || '',
    tx.status || 'ใช้งาน',
    tx.createdAt || now(),
    tx.updatedAt || now(),
    tx.deletedAt || '',
  ];

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(SHEET_TABS.TRANSACTIONS)}!A:U:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [row],
      }),
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`บันทึกรายการลง Google Sheets ไม่สำเร็จ: ${errorText}`);
  }
};

// 6. Update Transaction in Google Sheet
export const updateTransactionInSheet = async (
  spreadsheetId: string,
  accessToken: string,
  tx: Transaction
) => {
  const searchRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(SHEET_TABS.TRANSACTIONS)}!A:A`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!searchRes.ok) throw new Error('ไม่สามารถค้นหารายการใน Google Sheets');

  const searchData = await searchRes.json();
  const rows = searchData.values || [];
  const rowIndex = rows.findIndex((r: any[]) => r[0] === tx.id);

  if (rowIndex === -1) {
    return appendTransactionToSheet(spreadsheetId, accessToken, tx);
  }

  const sheetRowNumber = rowIndex + 1;
  const row = [
    tx.id,
    tx.date,
    tx.type,
    tx.accountId,
    tx.toAccountId || '',
    tx.projectId || '',
    tx.categoryId || '',
    tx.description,
    tx.amount,
    tx.currency || 'THB',
    tx.debtId || '',
    tx.principal != null ? tx.principal : '',
    tx.interest != null ? tx.interest : '',
    tx.receivableId || '',
    tx.goalId || '',
    tx.subscriptionId || '',
    tx.recurringId || '',
    tx.status,
    tx.createdAt,
    tx.updatedAt || now(),
    tx.deletedAt || '',
  ];

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(SHEET_TABS.TRANSACTIONS)}!A${sheetRowNumber}:U${sheetRowNumber}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [row],
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`อัปเดตรายการใน Google Sheets ไม่สำเร็จ: ${err}`);
  }
};

// 7. Generic Append or Update for Master Data
export const saveMasterToSheet = async (
  spreadsheetId: string,
  accessToken: string,
  tabName: string,
  id: string,
  rowValues: any[]
) => {
  // Ensure the target sheet tab exists before querying/saving
  await ensureSheetTabs(spreadsheetId, accessToken, [tabName]);

  const searchRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(tabName)}!A:A`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  let rows: any[][] = [];
  if (searchRes.ok) {
    const searchData = await searchRes.json();
    rows = searchData.values || [];
  } else {
    // If search still failed, try to ensure again
    await ensureSheetTabs(spreadsheetId, accessToken, [tabName]);
  }

  const rowIndex = rows.findIndex((r: any[]) => r[0] === id);

  if (rowIndex === -1) {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(tabName)}!A:Z:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [rowValues],
        }),
      }
    );
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`ไม่สามารถบันทึก ${tabName} ไปยัง Google Sheets: ${err}`);
    }
  } else {
    const rowNum = rowIndex + 1;
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(tabName)}!A${rowNum}:Z${rowNum}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [rowValues],
        }),
      }
    );
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`ไม่สามารถอัปเดต ${tabName} ใน Google Sheets: ${err}`);
    }
  }
};
