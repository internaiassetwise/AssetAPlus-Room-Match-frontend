// src/data/content.js — Copy + lookup data for the landing page.
//
// Static Thai copy lives here. Backend-driven content (rooms, zones, reviews,
// stats) is fetched from `/api` via `api/client.js` — never baked into this
// file so a marketer can tweak without redeploy.

import { LINE_OA_DISPLAY, lineUrlWithMessage } from '../config/line.js'

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
    title: 'ค้นหาห้องที่สนใจ หรือ ลงทะเบียนแจ้งความสนใจ',
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
    desc: `ทัก Line ${LINE_OA_DISPLAY} แล้วแจ้งข้อมูลห้อง ทีมงานจะช่วยลงระบบให้ทันที`,
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
  'อื่นๆ',
]

export const TENANT_PROPERTY_TYPES = [
  { value: 'STUDIO',             label: 'STUDIO' },
  { value: '1 BEDROOM',          label: '1 BEDROOM' },
  { value: '1 BEDROOM EXCLUSIVE',label: '1 BEDROOM EXCLUSIVE' },
  { value: '1 BEDROOM EXTRA',    label: '1 BEDROOM EXTRA' },
  { value: '1 BEDROOM PLUS',     label: '1 BEDROOM PLUS' },
]

export const TENANT_MOVE_IN_OPTIONS = [
  { value: '1month',    label: 'ภายใน 1 เดือน' },
  { value: '1to3month', label: '1-3 เดือน' },
  { value: '3to6month', label: '3-6 เดือน' },
  { value: '6to12month',label: '6-12 เดือน' },
]

// Brief page 8 — FAQ list (ordered as in the mockup). Annotation #27:
// phone number kept inline via <span class="whitespace-nowrap">.
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
    a: 'อัพเดททุก 1 สัปดาห์ หากต้องการสอบถามข้อมูลล่าสุด สามารถติดต่อฝ่ายที่ดูแลเรื่องการเช่าได้ผ่านเบอร์ <span class="whitespace-nowrap">02-168-0000</span> และ Line @ASWROOMMATCH',
  },
  {
    q: 'อยากลงประกาศปล่อยเช่าห้อง ต้องทำยังไง?',
    a: `ทัก Line ${LINE_OA_DISPLAY} แล้วแจ้งข้อมูลห้อง ทีมงานจะช่วยลงระบบให้ ห้องของคุณก็จะขึ้นในระบบให้ผู้เช่าเห็นได้ทันที`,
  },
  {
    q: 'ครอบคลุมทำเลไหนบ้างในกรุงเทพ?',
    a: '8 ทำเลทั่ว กทม. และปริมณฑล ได้แก่ ลาดพร้าว, รัชดา-ห้วยขวาง, อ่อนนุช, เกษตร, แจ้งวัฒนะ, ศาลายา, ศรีสมาน และนครปาฐม รวมกว่า 200 ห้อง',
  },
]

// Brief page 2 — Hero stat tiles. Tile values come from one of:
//   • key:   fetched live from /api/stats (row matches stats.repo.js fields)
//   • value: literal string rendered directly (skips the API call entirely)
// `unit` renders inline next to the value ("XX ห้อง"); `label` is line 2 below.
export const STATS_LANDING = [
  { key: 'rooms_available', unit: 'ห้อง', label: 'ที่มีในสต๊อก' },
  { key: 'matches_signed',  unit: 'ห้อง', label: 'ที่ Match แล้ว' },
  { value: '4.9',           label: 'ความพึงพอใจ', isStar: true },
]

// Hero headline + sub-copy per brief page 2.
export const HERO = {
  eyebrow: '',
  title: [
    { text: 'Roommatch', tone: 'plain' },
  ],
  body: 'Platform ที่ช่วยจับคู่ผู้เช่า–ผู้ให้เช่า จบในที่เดียว อัพเดทสถานะห้องสม่ำเสมอ ติดต่อสอบถามเพิ่มเติมได้ทาง Line ทันที',
  primaryCta: {
    text: 'ลงประกาศปล่อยห้อง',
    href: lineUrlWithMessage('สวัสดีค่ะ อยากลงประกาศห้องให้เช่าค่ะ'),
  },
  secondaryCta: {
    text: 'ค้นหาห้องที่ใช่',
    to:   '/search',
  },
}

// "วิธีใช้งาน" section copy per brief page 3. Both roles share title.
export const HOW_SECTION = {
  tenant: {
    eyebrow: 'วิธีใช้งาน',
    title:   'ง่ายมากเพียง 3 ขั้นตอน',
    lede:    '',
  },
  landlord: {
    eyebrow: 'วิธีใช้งาน',
    title:   'ง่ายมากเพียง 3 ขั้นตอน',
    lede:    '',
  },
}

// Annotation #11 / #20 — persona-themed color tokens.
// tenant: navy pair (#003299 / #C2DDF9). landlord: ember pair (#FF6600 / #FFEDBC).
export const PERSONA_THEME = {
  tenant:   { sectionBg: 'bg-[#C2DDF9]', accentBg: 'bg-[#003299]', accentText: 'text-[#003299]', accentSolid: 'bg-[#003299]' },
  landlord: { sectionBg: 'bg-[#FFEDBC]', accentBg: 'bg-[#FF6600]', accentText: 'text-[#FF6600]', accentSolid: 'bg-[#FF6600]' },
}

// Brief page 4 — Listings section copy.
export const LISTINGS_SECTION = {
  tenant: {
    eyebrow: 'ห้องว่างพร้อมอยู่',
    titleA:  'ห้องในระบบ',
    titleAccent: 'ตอนนี้',
    titleB:  '',
    matchLabel: 'ห้องในระบบตอนนี้',
    searchLabel: 'ค้นหา',
    lastUpdated: 'อัพเดทล่าสุด:',
  },
  landlord: {
    eyebrow: 'ห้องว่างพร้อมอยู่',
    titleA:  'ห้องในระบบ',
    titleAccent: 'ตอนนี้',
    titleB:  '',
    matchLabel: 'ห้องในระบบตอนนี้',
    searchLabel: 'ค้นหา',
    lastUpdated: 'อัพเดทล่าสุด:',
  },
}

// Brief page 5 + 7 — form / CTA copy.
export const TENANT_FORM = {
  eyebrow: 'แจ้งความสนใจล่วงหน้า',
  title:   'บอกความต้องการ เจ้าหน้าที่ติดต่อกลับ',
  body:    'กรอกความต้องการของคุณ เจ้าหน้าที่จะคัดกรรมห้องที่เหมาะสม',
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
  body: '',
  primary: '+ ลงประกาศห้องฟรีเลย',
  primaryHref: lineUrlWithMessage('สวัสดีค่ะ อยากลงประกาศห้องให้เช่าค่ะ'),
  secondary: 'ดูวิดีโอประกาศ',
  helper:   'แอดมินตอบกลับภายใน 1 วัน',
}

// Brief page 8 — Bottom CTA strip.
export const BOTTOM_CTA = {
  eyebrow: 'ติดต่อแอดมิน',
  title: [
    { text: 'ติดต่อเรา ได้ที่', tone: 'plain' },
  ],
  body: 'ไม่ว่าจะถามรายละเอียดห้อง นัดชมห้อง ลงประกาศ หรือแก้ไขรายละเอียด แอดมินพร้อมดูแลผ่านทุกช่องทาง',
  trust: ['ไม่มีค่าลงทะเบียน', 'ตอบกลับภายใน 1 วัน', 'สัญญามาตรฐาน'],
}

// Annotation #29 — navbar marketing order.
export const NAV_MARKETING = [
  { text: 'หน้าแรก',   href: '/#hero' },
  { text: 'วิธีใช้งาน', href: '/#how-it-works' },
  { text: 'ดูห้องว่าง',  href: '/#listings' },
  { text: 'ปล่อยห้อง',  href: '/#landlords' },
  { text: 'FAQ',        href: '/#faq' },
]