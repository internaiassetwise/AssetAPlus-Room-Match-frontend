// src/data/content.js — Copy + lookup data for the landing page.
//
// Static Thai copy lives here. Backend-driven content (rooms, zones, reviews,
// stats) is fetched from `/api` via `api/client.js` — never baked into this
// file so a marketer can tweak without redeploy.

export const ZONES = [
  { id: 'asoke',     name: 'อโศก',     count: 42 },
  { id: 'phrom',     name: 'พร้อมพงษ์', count: 38 },
  { id: 'thon',      name: 'ทองหล่อ',   count: 27 },
  { id: 'ekkamai',   name: 'เอกมัย',    count: 31 },
  { id: 'ari',       name: 'อารีย์',    count: 19 },
  { id: 'latphrao',  name: 'ลาดพร้าว',  count: 24 },
  { id: 'ratchada',  name: 'รัชดา',     count: 33 },
  { id: 'bangna',    name: 'บางนา',     count: 21 },
  { id: 'sathorn',   name: 'สาทร',      count: 16 },
  { id: 'silom',     name: 'สีลม',      count: 14 },
]

// Brief page 3 — three-step flow shown in the "วิธีใช้งาน" section, body
// copy swaps based on the persona toggle on the landing page.
export const HOW_TENANT_STEPS = [
  {
    num: '01',
    icon: 'form',
    title: 'ลงทะเบียนแจ้งความสนใจ',
    desc: 'กรอกข้อมูลแจ้งความสนใจห้องที่อยากได้ ใช้เวลาไม่ถึง 1 นาที',
  },
  {
    num: '02',
    icon: 'phone',
    title: 'เจ้าหน้าที่ติดต่อกลับ',
    desc: 'เจ้าหน้าที่จะโทรหาคุณภายใน 1-2 วันทำการ พร้อมข้อมูลห้องที่ตรงความต้องการ',
  },
  {
    num: '03',
    icon: 'heart',
    title: 'นัดดูห้องและตกลงเช่า',
    desc: 'นัดเวลาดูห้องกับผู้ดูแล ดูแล้วตกลงปิดดีลได้ ง่าย ราคาเริ่มต้นคุ้มค่า',
  },
]

export const HOW_LANDLORD_STEPS = [
  {
    num: '01',
    icon: 'chat',
    title: 'ลงข้อมูลห้อง',
    desc: 'ทัก Line @assetaplus แล้วแจ้งข้อมูลห้อง ทีมงานจะช่วยลงระบบให้ทันที',
  },
  {
    num: '02',
    icon: 'bell',
    title: 'ผู้เช่าเลือกห้องคุณ',
    desc: 'ระบบจับคู่ผู้เช่าที่ตรงกับห้องของคุณ แจ้งเตือนทุกขั้นตอนใน Line',
  },
  {
    num: '03',
    icon: 'check',
    title: 'ปิดดีล ปล่อยเช่า',
    desc: 'ติดต่อผู้เช่าโดยตรง ตกลงเงื่อนไข เซ็นสัญญาเข้าอยู่ได้ใน 7 วัน',
  },
]

// Brief page 7 — landlord CTA bullet list.
export const LANDLORD_BENEFITS = [
  {
    icon: 'free',
    title: 'ลงประกาศฟรี',
    desc: 'ไม่มีค่าสมัคร ไม่มีค่ารายเดือน',
  },
  {
    icon: 'target',
    title: 'จับคู่ผู้เช่าคุณภาพ',
    desc: 'ระบบกรองตามโซนและราคาดีคัดในบิต',
  },
  {
    icon: 'bell',
    title: 'แจ้งเตือนทาง Line',
    desc: 'เมื่อมีผู้สนใจจะแจ้งเข้าห้องของคุณทันที',
  },
  {
    icon: 'fast',
    title: 'ปล่อยห้องได้เร็วขึ้น',
    desc: 'เฉลี่ยภายใน 7 วัน',
  },
]

// Brief page 5 — tenant registration form dropdowns.
export const TENANT_ZONES = [
  'ลาดพร้าว',
  'รัชดา-ห้วยขวาง',
  'อ่อนนุช',
  'เกษตร',
  'แจ้งวัฒนะ',
  'ศาลายา',
  'ศรีสมาน',
  'นครปฐม',
]

export const TENANT_PROPERTY_TYPES = [
  { value: 'studio',     label: 'Studio' },
  { value: '1bed',       label: '1 ห้องนอน' },
  { value: '1bed_multi', label: '1 ห้องนอน 1 ห้องเอนกประสงค์' },
  { value: '2bed',       label: '2 ห้องนอน' },
]

export const TENANT_MOVE_IN_OPTIONS = [
  { value: 'immediate', label: 'เร็ว ๆ นี้' },
  { value: '1month',    label: 'ภายใน 1 เดือน' },
  { value: '1to3month', label: '1-3 เดือน' },
]

// Brief page 8 — FAQ list (ordered as in the mockup).
export const FAQS = [
  {
    q: 'ผู้เช่าต้องเสียค่าใช้จ่ายอะไรบ้างไหม?',
    a: 'ไม่มีค่าใช้จ่ายเพิ่มเติม ผู้ใช้งาน RoomMatch ฟรี 100% ไม่มีค่าธรรมเนียม ให้คุณจ่ายเฉพาะค่าเช่าให้เจ้าของห้องโดยตรง',
  },
  {
    q: 'สนใจเช่าห้อง ต้องทำยังไง?',
    a: 'ค้นหาห้องที่สนใจ หรือกรอกข้อมูลเบื้องต้น เช่น โซนที่สนใจ, งบประมาณต่อเดือน, ประเภทห้อง, ต้องการย้ายเข้าเมื่อไหร่, ชื่อของคุณ, เบอร์ติดต่อกลับ จากนั้นกด "ส่งข้อมูลลงทะเบียน" เจ้าหน้าที่จะโทรติดต่อกลับหาคุณภายใน 1-2 วันทำการ พร้อมข้อมูลห้องที่เหมาะสมกับความต้องการของคุณ',
  },
  {
    q: 'สถานะห้อง "ว่าง / จอง" อัพเดทบ่อยแค่ไหน?',
    a: 'อัพเดททุก 1 สัปดาห์ หากต้องการสอบถามข้อมูลล่าสุด สามารถติดต่อฝ่ายที่ดูแลเรื่องการเช่าได้ผ่านเบอร์ 02-168-0000 และ Line @ASWROOMMATCH',
  },
  {
    q: 'อยากลงประกาศปล่อยเช่าห้อง ต้องทำยังไง?',
    a: 'ทัก Line @assetaplus แล้วแจ้งข้อมูลห้อง ทีมงานจะช่วยลงระบบให้ ห้องของคุณก็จะขึ้นในระบบให้ผู้เช่าเห็นได้ทันที',
  },
  {
    q: 'ครอบคลุมทำเลไหนบ้างในกรุงเทพ?',
    a: '8 ทำเลทั่ว กทม. และปริมณฑล ได้แก่ ลาดพร้าว, รัชดา-ห้วยขวาง, อ่อนนุช, เกษตร, แจ้งวัฒนะ, ศาลายา, ศรีสมาน และนครปฐม รวมกว่า 200 ห้อง',
  },
]

// Brief page 2 — Hero stat tiles. XXX/XX are placeholders the user fills.
export const STATS_LANDING = [
  { num: 'XXX', label: 'ห้องในสต็อค' },
  { num: 'XX',  label: 'ห้องที่ Match แล้ว' },
  { num: '4.9', label: 'ความพึงพอใจ' },
]

// Hero headline + sub-copy per brief page 2.
export const HERO = {
  eyebrow: 'ห้องว่างพร้อมเข้าอยู่ · ดูแลโดย AssetWise',
  title: [
    { text: 'ห้องใกล้บ้านคุณ', tone: 'plain' },
    { text: 'พร้อมเข้าอยู่',     tone: 'accent' },
  ],
  body: 'ค้นหาห้องที่ใช่ หรือส่งข้อมูลความต้องการ เจ้าหน้าที่จะแนะนำห้องที่เหมาะสมให้ใน 1-2 วันทำการ',
}

// "วิธีใช้งาน" section copy per brief page 3.
export const HOW_SECTION = {
  tenant: {
    eyebrow: 'วิธีใช้งาน',
    title:   'ค้นหาห้องที่สนใจ หรือ ลงทะเบียนแจ้งความสนใจ',
    lede:    'เลือกวิธีที่ใช่สำหรับคุณ หรือ ลงทะเบียนแจ้งความสนใจไว้ ทีมงานจะคัดกรรมห้องที่เหมาะสมแนะนำเบื้องต้น',
  },
  landlord: {
    eyebrow: 'วิธีใช้งาน',
    title:   'ลงประกาศห้องให้เช่า จับคู่ผู้เช่าคุณภาพ',
    lede:    'ทัก Line แจ้งข้อมูลห้อง ทีมงานช่วยจัดการให้ครบทุกขั้นตอน',
  },
}

// Brief page 4 — Listings section copy.
export const LISTINGS_SECTION = {
  tenant: {
    eyebrow: 'ห้องในระบบตอนนี้',
    titleA:  'ห้องที่',
    titleAccent: 'Match',
    titleB:  'กับคุณ',
    matchLabel: 'ห้องที่ Match กับคุณ',
    searchLabel: 'ค้นหา',
    lastUpdated: 'อัพเดทล่าสุด:',
  },
  landlord: {
    eyebrow: 'ห้องในระบบตอนนี้',
    titleA:  'ห้องที่',
    titleAccent: 'Match',
    titleB:  'กับคุณ',
    matchLabel: 'ห้องที่ตรงกับผู้เช่าคุณ',
    searchLabel: 'ค้นหา',
    lastUpdated: 'อัพเดทล่าสุด:',
  },
}

// Brief page 5 + 7 — form / CTA copy.
export const TENANT_FORM = {
  eyebrow: 'แจ้งความสนใจล่วงหน้า',
  title:   'บอกความต้องการ เจ้าหน้าที่ติดต่อกลับ',
  body:    'กรอกความต้องการของคุณ เจ้าหน้าที่จะคัดกรรมห้องที่เหมาะสม และโทรหาติดต่อกลับภายใน 1-2 วันทำการ ไม่ต้องรอนานเหมือนเดิม',
  bullets: [
    'กรอกความต้องการ โซน งบ ประเภทห้องที่อยากได้',
    'เจ้าหน้าที่ติดต่อกลับ ภายใน 1-2 วันทำการ',
    'รับข้อมูลห้องที่เหมาะ ตรงกับความต้องการของคุณโดยตรง',
  ],
  submit: 'ดูรายการห้องทั้งหมด →',
  form: {
    submitText: 'ส่งข้อมูลลงทะเบียน',
    fields: {
      zone: 'โซนที่สนใจ',
      budget: 'งบประมาณต่อเดือน (บาท)',
      propertyType: 'ประเภทห้อง',
      moveIn: 'ต้องการย้ายเข้าเมื่อไหร่',
      fullName: 'ชื่อของคุณ',
      phone: 'เบอร์ติดต่อกลับ',
    },
    success: 'ส่งข้อมูลเรียบร้อย เจ้าหน้าที่จะติดต่อกลับภายใน 1-2 วันทำการ',
    requiredHint: 'ชื่อ-เบอร์ จำเป็นต้องกรอก',
    zoneHelp: 'เลือกได้หลายโซน',
  },
}

export const LANDLORD_CTA = {
  eyebrow: 'สำหรับเจ้าของห้อง',
  titleA: 'มีห้องว่าง',
  titleAccent: 'อยู่ไหม?',
  body: 'ลงประกาศห้องได้ฟรี มีทีมงานคุณภาพช่วยดูแล หาผู้เช่าคุณภาพให้คุณได้อย่างรวดเร็ว',
  primary: '+ ลงประกาศห้องฟรีเลย',
  secondary: 'ดูวิดีโอประกาศ',
  helper: 'กดแล้วไป line',
}

// Brief page 8 — Bottom CTA strip.
export const BOTTOM_CTA = {
  eyebrow: 'ติดต่อแอดมิน',
  title: [
    { text: 'ทุกเรื่อง ติดต่อ', tone: 'plain' },
    { text: 'ผ่านแอดมิน',     tone: 'accent' },
  ],
  body: 'ไม่ว่าจะถามรายละเอียดห้อง นัดชมห้อง ลงประกาศ หรือแก้ไขรายละเอียด แอดมินพร้อมดูแลผ่านทุกช่องทาง',
  trust: ['ไม่มีค่าลงทะเบียน', 'ตอบกลับภายใน 1 วัน', 'สัญญามาตรฐาน'],
}
