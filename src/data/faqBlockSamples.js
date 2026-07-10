// src/data/faqBlockSamples.js — Sample defaults + humanization + recipes for
// the FAQ block editor.
//
// Drives:
//   1) "Restore from sample" buttons on each block card (SAMPLES).
//   2) The recipe picker in the form ("เพิ่มข้อมูลอัตโนมัติ") — RECIPES.
//   3) Thai labels for tables/columns + enum value dropdowns so the marketing
//      admin never has to type raw DB values like 'available'.
//
// `SAMPLE_CONTEXT` is the hard-coded sample data the live preview pane passes
// to /api/faqs/preview so Single/List blocks show real values without a real
// viewing/tenant context.

export const SAMPLE_CONTEXT = { roomId: 1, viewingId: 1, tenantLineId: 'U-demo' }

export const SAMPLES = {
  text: {
    type: 'text',
    text: 'ตอนนี้มีห้องว่างพร้อมเข้าอยู่ค่ะ',
  },

  count: {
    type: 'count',
    table: 'rooms',
    conditions: [{ col: 'status', op: '=', value: 'available' }],
    format: '{{n}} ห้องค่ะ',
  },

  stat: {
    type: 'stat',
    table: 'rooms',
    aggregate: { fn: 'AVG', col: 'monthly_rent' },
    conditions: [{ col: 'status', op: '=', value: 'available' }],
    format: 'ค่าเช่าเฉลี่ย {{v:0,000}} บาท/เดือนค่ะ',
  },

  single: {
    type: 'single',
    table: 'viewings',
    column: 'scheduled_for',
    rowKey: 'viewingId',
    format: 'วันนัดชมของคุณคือ {{v:date}} ค่ะ',
  },

  list: {
    type: 'list',
    table: 'rooms',
    columns: ['title', 'monthly_rent', 'bedrooms'],
    conditions: [{ col: 'status', op: '=', value: 'available' }],
    orderBy: { column: 'monthly_rent', dir: 'ASC' },
    limit: 5,
    itemTemplate: '{{row.title}} — {{row.monthly_rent:0,000}} บาท ({{row.bedrooms}} ห้องนอน)',
  },

  link: {
    type: 'link',
    label: 'ดูห้องทั้งหมด',
    url: 'https://roommatch.example.com/rooms',
  },
}

// Order in the "Add block" dropdown (advanced / custom picker)
export const BLOCK_TYPES = ['text', 'count', 'stat', 'single', 'list', 'link']

// Thai labels for the dropdown + card headers
export const BLOCK_LABELS = {
  text:   { label: 'ข้อความ',     hint: 'ข้อความธรรมดา เช่น "ตอนนี้มีห้องว่างค่ะ"' },
  count:  { label: 'นับจำนวน',     hint: 'นับจำนวนแถว เช่น ห้องว่างกี่ห้อง' },
  stat:   { label: 'ค่าสถิติ',     hint: 'ค่าเฉลี่ย / ต่ำสุด / สูงสุด เช่น ค่าเช่าเฉลี่ย' },
  single: { label: 'ข้อมูล 1 ค่า', hint: 'ดึงค่าจากแถวเดียว เช่น วันนัดชมห้อง' },
  list:   { label: 'รายการ',      hint: 'รายการห้อง / รายการนัดหมาย (สูงสุด 5 แถว)' },
  link:   { label: 'ลิงก์',       hint: 'ลิงก์เว็บไซต์ เช่น ดูเพิ่มเติม' },
}

// ---------------------------------------------------------------------------
// Humanization maps — turn raw DB names/values into Thai the admin understands.
// ---------------------------------------------------------------------------

// raw column name -> Thai label (falls back to the raw name if unknown).
export const COLUMN_LABELS = {
  id: 'ไอดี',
  title: 'ชื่อห้อง',
  description: 'รายละเอียด',
  property_type: 'ประเภทห้อง',
  monthly_rent: 'ค่าเช่า/เดือน',
  bedrooms: 'ห้องนอน',
  bathrooms: 'ห้องน้ำ',
  size_sqm: 'พื้นที่ (ตร.ม.)',
  status: 'สถานะ',
  zone_id: 'ย่าน',
  landlord_id: 'เจ้าของห้อง',
  is_featured: 'ห้องแนะนำ',
  is_active: 'ใช้งานอยู่',
  available_from: 'พร้อมเข้าอยู่เมื่อ',
  created_at: 'วันที่สร้าง',
  updated_at: 'วันที่แก้ไขล่าสุด',
  room_id: 'ห้อง',
  tenant_id: 'ผู้เช่า',
  scheduled_for: 'วันที่นัดชม',
  requested_at: 'วันที่ขอ',
  full_name: 'ชื่อ',
  phone: 'เบอร์โทร',
  email: 'อีเมล',
  monthly_income: 'รายได้/เดือน',
  move_in_date: 'วันที่จะย้ายเข้า',
}
export const colLabel = (c) => COLUMN_LABELS[c] || c

// column -> [{value,label}] for the columns that are enumerations. Values must
// match the server CHECK constraints (rooms.status, property_type, viewings.status).
export const ENUM_VALUES = {
  status: [
    { value: 'available', label: 'พร้อมให้เช่า' },
    { value: 'pending',   label: 'รออนุมัติ' },
    { value: 'reserved',  label: 'จองแล้ว' },
    { value: 'matched',   label: 'จับคู่แล้ว' },
    { value: 'inactive',  label: 'ปิดประกาศ' },
    { value: 'removed',   label: 'ลบแล้ว' },
  ],
  property_type: [
    { value: 'condo',     label: 'คอนโด' },
    { value: 'house',     label: 'บ้าน' },
    { value: 'townhouse', label: 'ทาวน์เฮ้าส์' },
    { value: 'apartment', label: 'อพาร์ตเมนต์' },
    { value: 'studio',    label: 'สตูดิโอ' },
  ],
}

// SQL aggregate fn -> Thai label
export const AGG_LABELS = {
  COUNT: 'นับจำนวน',
  AVG:   'ค่าเฉลี่ย',
  MIN:   'ค่าต่ำสุด',
  MAX:   'ค่าสูงสุด',
}

// ---------------------------------------------------------------------------
// RECIPES — one-click presets that drop a pre-configured block. The marketer
// edits only the Thai sentence; the table/column/conditions are pre-set and
// hidden behind the block's "ขั้นสูง" disclosure. `custom` opens the raw
// 6-type picker for power users.
// ---------------------------------------------------------------------------

export const RECIPES = [
  {
    key: 'text',
    icon: '✍️',
    label: 'ข้อความธรรมดา',
    hint: 'พิมพ์คำตอบเป็นข้อความธรรมดา',
    make: () => ({ ...SAMPLES.text }),
  },
  {
    key: 'count_available',
    icon: '📊',
    label: 'นับจำนวนห้องว่าง',
    hint: 'บอทจะนับห้องที่พร้อมให้เช่าให้อัตโนมัติ',
    make: () => ({
      type: 'count',
      table: 'rooms',
      conditions: [{ col: 'status', op: '=', value: 'available' }],
      format: 'ตอนนี้มีห้องว่าง {{n}} ห้องค่ะ',
    }),
  },
  {
    key: 'stat_avg_rent',
    icon: '💰',
    label: 'ค่าเช่าเฉลี่ย',
    hint: 'ค่าเช่าเฉลี่ยของห้องที่พร้อมให้เช่า',
    make: () => ({
      type: 'stat',
      table: 'rooms',
      aggregate: { fn: 'AVG', col: 'monthly_rent' },
      conditions: [{ col: 'status', op: '=', value: 'available' }],
      format: 'ค่าเช่าเฉลี่ย {{v:0,000}} บาท/เดือนค่ะ',
    }),
  },
  {
    key: 'stat_min_rent',
    icon: '💰',
    label: 'ค่าเช่าต่ำสุด',
    hint: 'ค่าเช่าเริ่มต้นของห้องที่พร้อมให้เช่า',
    make: () => ({
      type: 'stat',
      table: 'rooms',
      aggregate: { fn: 'MIN', col: 'monthly_rent' },
      conditions: [{ col: 'status', op: '=', value: 'available' }],
      format: 'ค่าเช่าเริ่มต้น {{v:0,000}} บาท/เดือนค่ะ',
    }),
  },
  {
    key: 'stat_max_rent',
    icon: '💰',
    label: 'ค่าเช่าสูงสุด',
    hint: 'ค่าเช่าสูงสุดของห้องที่พร้อมให้เช่า',
    make: () => ({
      type: 'stat',
      table: 'rooms',
      aggregate: { fn: 'MAX', col: 'monthly_rent' },
      conditions: [{ col: 'status', op: '=', value: 'available' }],
      format: 'ค่าเช่าสูงสุด {{v:0,000}} บาท/เดือนค่ะ',
    }),
  },
  {
    key: 'list_rooms',
    icon: '🏠',
    label: 'รายการห้องแนะนำ',
    hint: 'แสดงรายการห้อง 5 ห้องแรกที่พร้อมให้เช่า',
    make: () => ({
      type: 'list',
      table: 'rooms',
      columns: ['title', 'monthly_rent', 'bedrooms'],
      conditions: [{ col: 'status', op: '=', value: 'available' }],
      orderBy: { column: 'monthly_rent', dir: 'ASC' },
      limit: 5,
      itemTemplate: '{{row.title}} — {{row.monthly_rent:0,000}} บาท ({{row.bedrooms}} ห้องนอน)',
    }),
  },
  {
    key: 'link',
    icon: '🔗',
    label: 'ลิงก์',
    hint: 'ลิงก์เว็บไซต์ เช่น ดูเพิ่มเติม',
    make: () => ({ ...SAMPLES.link }),
  },
  {
    key: 'custom',
    icon: '⚙️',
    label: 'กำหนดเอง (ขั้นสูง)',
    hint: 'เลือกประเภทบล็อกเอง — สำหรับผู้ใช้งานขั้นสูง',
    make: null, // sentinel: the form opens the raw type picker instead
  },
]
