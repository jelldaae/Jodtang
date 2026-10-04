# กฎเหล็กสำหรับ AI ในการพัฒนาต่อยอดระบบ "จดตังค์" (JODTANG)
# STRICT DATA PERSISTENCE & BACKEND STABILITY RULES

เมื่อผู้ใช้ส่งคำสั่งใดๆ มา ให้ปฏิบัติตามกฎต่อไปนี้อย่างเคร่งครัด:

1. **ห้ามแตะต้องหรือเปลี่ยนระบบข้อมูลหลังบ้าน (Preserve Backend Data Architecture)**:
   - **ห้ามแก้ไข** โครงสร้างตารางและหัวคอลัมน์ของ Google Sheets ใน `src/services/sheetsService.ts`
   - **ห้ามเปลี่ยนคีย์หรือล้างข้อมูล** ใน `src/context/AppContext.tsx` และ `localStorage`
   - ข้อมูลบัญชี (`accounts`), รายการบันทึก (`transactions`), หนี้สิน (`debts`), เงินออม (`savings`), สินทรัพย์ (`assets`), งบประมาณ (`budgets`), หมวดหมู่ (`categories`) จะต้องคงอยู่และเข้ากันได้กับข้อมูลเดิมของผู้ใช้ 100%

2. **รักษาการเชื่อมต่อ Google Sheets และ Google Account เสมอ**:
   - การซิงค์ 2-Way ระหว่าง Google Sheets กับ Client-side State จะต้องทำงานต่อเนื่อง ไม่ใช้ Mock Data ทับข้อมูลจริง

3. **เน้นการเปลี่ยนแปลงเฉพาะสิ่งที่ผู้ใช้ร้องขอ (Focused Changes Only)**:
   - หากผู้ใช้สั่งแก้ UI, สี, สไตล์, จัดตำแหน่ง, หรือเพิ่มฟังก์ชันหน้าบ้าน ให้ทำเฉพาะไฟล์ Component ที่เกี่ยวข้อง โดยคงระบบข้อมูลหลังบ้านเดิมไว้ทั้งหมด
