// src/data/content.en.js — English mirror of content.js.
//
// MUST export the same names with the same shapes as content.js: useContent()
// swaps one module for the other wholesale, so a missing key renders as
// `undefined` on the page rather than falling back to Thai.
//
// Translated, not transliterated. Thai marketing copy is more effusive than the
// English equivalent reads, so a few lines are shortened to what a native
// English speaker would actually write.

import { LINE_OA_DISPLAY, lineUrlWithMessage } from '../config/line.js'

export const ZONES = []

export const HOW_TENANT_STEPS = [
  {
    num: '01',
    icon: 'form',
    title: 'Find a room, or tell us what you want',
    desc: 'Register your requirements — it takes under a minute.',
  },
  {
    num: '02',
    icon: 'phone',
    title: 'Our team calls you back',
    desc: 'We call within 1–2 business days with rooms that match what you asked for.',
  },
  {
    num: '03',
    icon: 'heart',
    title: 'View the room and sign',
    desc: 'Arrange a viewing with the agent, then close the deal. Simple, at a fair price.',
  },
]

export const HOW_LANDLORD_STEPS = [
  {
    num: '01',
    icon: 'chat',
    title: 'Send us the details',
    desc: `Message us on LINE ${LINE_OA_DISPLAY} with your room details and our team will list it for you.`,
  },
  {
    num: '02',
    icon: 'bell',
    title: 'Tenants pick your room',
    desc: 'We match tenants to your room and keep you posted on LINE at every step.',
  },
  {
    num: '03',
    icon: 'check',
    title: 'Close the deal',
    desc: 'Deal directly with the tenant, agree the terms, and sign within 7 days.',
  },
]

export const LANDLORD_BENEFITS = [
  { icon: 'free',   title: 'Free to list',          desc: 'No signup fee, no monthly fee.' },
  { icon: 'target', title: 'Quality tenant matches', desc: 'Filtered by area and budget before they reach you.' },
  { icon: 'bell',   title: 'LINE notifications',     desc: 'Hear the moment someone is interested in your room.' },
  { icon: 'fast',   title: 'Let it faster',          desc: 'Typically within 7 days.' },
]

// Area names stay in Thai on purpose — these are Bangkok districts a tenant
// searches by, and an English speaker in Bangkok looks for "ลาดพร้าว" the same
// way. Translating them would break recognition and the search that uses them.
export const TENANT_ZONES = [
  'ลาดพร้าว',
  'รัชดา-ห้วยขวาง',
  'อ่อนนุช',
  'เกษตร',
  'แจ้งวัฒนะ',
  'ศาลายา',
  'ศรีสมาน',
  'นครปฐม',
  'Other',
]

export const TENANT_PROPERTY_TYPES = [
  { value: 'STUDIO',              label: 'STUDIO' },
  { value: '1 BEDROOM',           label: '1 BEDROOM' },
  { value: '1 BEDROOM EXCLUSIVE', label: '1 BEDROOM EXCLUSIVE' },
  { value: '1 BEDROOM EXTRA',     label: '1 BEDROOM EXTRA' },
  { value: '1 BEDROOM PLUS',      label: '1 BEDROOM PLUS' },
]

export const TENANT_MOVE_IN_OPTIONS = [
  { value: '1month',     label: 'Within 1 month' },
  { value: '1to3month',  label: '1–3 months' },
  { value: '3to6month',  label: '3–6 months' },
  { value: '6to12month', label: '6–12 months' },
]

export const FAQS = [
  {
    q: 'Are there any fees for tenants?',
    a: 'None. The service is completely free for tenants — no commission, no booking fee. You pay rent directly to the owner.',
  },
  {
    q: 'How do I rent a room?',
    a: 'Search the listings, or send us your requirements — preferred area, monthly budget, room type, when you want to move in, your name and a contact number. Press "Submit" and our team will call you back within 1–2 business days with rooms that suit you.',
  },
  {
    q: 'How often is the available / reserved status updated?',
    a: 'Weekly. For the very latest, contact our rental team on the number above or on LINE.',
  },
  {
    q: 'I want to list my room for rent. How?',
    a: `Message us on LINE ${LINE_OA_DISPLAY} with your room details. Our team will list it for you and tenants will see it straight away.`,
  },
  {
    q: 'Which areas do you cover in Bangkok?',
    a: '8 areas across Bangkok and the surrounding provinces: Lat Phrao, Ratchada–Huai Khwang, On Nut, Kaset, Chaeng Watthana, Salaya, Si Saman and Nakhon Pathom.',
  },
]

export const STATS_LANDING = [
  { key: 'rooms_available', unit: 'rooms', label: 'in stock' },
  { key: 'matches_signed',  unit: 'rooms', label: 'matched' },
  { value: '4.9',           label: 'satisfaction', isStar: true },
]

export const HERO = {
  eyebrow: '',
  title: [
    { text: 'Roommatch', tone: 'plain' },
  ],
  body: 'The platform that matches tenants with landlords, start to finish. Room availability kept current, and an admin on LINE whenever you need one.',
  primaryCta: {
    text: 'List your room',
    href: lineUrlWithMessage("Hello, I'd like to list a room for rent."),
  },
  secondaryCta: {
    text: 'Find your room',
    to:   '/search',
  },
}

export const HOW_SECTION = {
  tenant:   { eyebrow: 'How it works', title: 'Just three steps', lede: '' },
  landlord: { eyebrow: 'How it works', title: 'Just three steps', lede: '' },
}

// Colour tokens — identical to the Thai bundle. Kept here rather than imported
// so the two modules stay interchangeable in shape.
export const PERSONA_THEME = {
  tenant:   { sectionBg: 'bg-[#C2DDF9]', accentBg: 'bg-[#003299]', accentText: 'text-[#003299]', accentSolid: 'bg-[#003299]' },
  landlord: { sectionBg: 'bg-[#FFEDBC]', accentBg: 'bg-[#FF6600]', accentText: 'text-[#FF6600]', accentSolid: 'bg-[#FF6600]' },
}

export const LISTINGS_SECTION = {
  tenant: {
    eyebrow: 'Available now',
    titleA:  'Rooms available',
    titleAccent: 'today',
    titleB:  '',
    matchLabel: 'rooms available now',
    searchLabel: 'Search',
    lastUpdated: 'Last updated:',
  },
  landlord: {
    eyebrow: 'Available now',
    titleA:  'Rooms available',
    titleAccent: 'today',
    titleB:  '',
    matchLabel: 'rooms available now',
    searchLabel: 'Search',
    lastUpdated: 'Last updated:',
  },
}

export const TENANT_FORM = {
  eyebrow: 'Register your interest',
  title:   'Tell us what you need and we will call you',
  body:    'Send us your requirements and our team will shortlist rooms that fit.',
  bullets: [
    'Tell us your area, budget and the room type you want',
    'Our team calls you back within 1–2 business days',
    'Get rooms that actually match what you asked for',
  ],
  submit: 'See all rooms →',
  form: {
    submitText: 'Submit',
    fields: {
      zone: 'Preferred area',
      budget: 'Monthly budget (THB)',
      propertyType: 'Room type',
      moveIn: 'When do you want to move in?',
      fullName: 'Your name',
      phone: 'Contact number',
    },
    success: 'Thank you — our team will contact you within 1–2 business days.',
    requiredHint: 'Name and phone number are required',
    zoneHelp: 'You can pick more than one',
  },
}

export const LANDLORD_CTA = {
  eyebrow: 'For landlords',
  titleA: 'Got a room',
  titleAccent: 'to let?',
  body: '',
  primary: '+ List your room, free',
  primaryHref: lineUrlWithMessage("Hello, I'd like to list a room for rent."),
  secondary: 'Watch the walkthrough',
  helper:   'Admin replies within a day',
}

export const BOTTOM_CTA = {
  eyebrow: 'Contact us',
  title: [
    { text: 'Get in touch', tone: 'plain' },
  ],
  body: 'Room details, viewings, listing a room or changing one — our admins handle all of it, on whichever channel suits you.',
  trust: ['No registration fee', 'Reply within a day', 'Standard contract'],
}

export const NAV_MARKETING = [
  { text: 'Home',         href: '/#hero' },
  { text: 'How it works', href: '/#how-it-works' },
  { text: 'Rooms',        href: '/#listings' },
  { text: 'For landlords',href: '/#landlords' },
  { text: 'FAQ',          href: '/#faq' },
]

// Strings that live inside components rather than in a content block.
export const UI = {
  flowHeadline: 'Tell us what you need',
  faqHeadline: 'Questions?',
  signOutTenant: 'Sign out (tenant)',
  signOutLandlord: 'Sign out (landlord)',
  switchRole: 'Add / switch role',
  navSearch: 'Search',
  navMyRooms: 'My rooms',
  navViewings: 'Viewings',
  callShort: 'Call',
  lineChatShort: 'LINE chat',
  personaChooseAria: 'Choose who you are',
  personaIWantRent: 'I want to rent',
  personaIWantLet: 'I want to let',
  stepLabel: 'Step',
  flowIntro: 'Send us your requirements and our team will shortlist rooms that fit.',
  flowBullet1: 'Tell us your area, budget and the room type you want',
  flowBullet2: 'Our team calls you back within 1–2 business days',
  flowBullet3: 'Get rooms that match what you asked for, sent to you directly',
  ctaLineChat: 'LINE chat',
  ctaAllChannels: 'See all contact options',
  footerTagline: 'Tenant matching and rental management by the Asset Wise team.',
  filtersToggle: 'Filters',
  filtersClear: 'Clear filters',
  filterZone: 'Area',
  filterAll: 'All',
  filterRoomType: 'Room type',
  filterAllTypes: 'All types',
  filterMinBudget: 'Min budget (THB)',
  filterMaxBudget: 'Max budget (THB)',
  listLoadFailed: 'Could not load rooms. Please try again.',
  listEmptyTitle: 'No rooms match these filters',
  listEmptyBody: 'Try adjusting the filters, or tell us what you are looking for.',
  searchPlaceholder: 'Search e.g. Lat Phrao, studio…',
  searchAria: 'Search rooms',
  copyLink: 'Copy link',
  copiedLink: 'Copied',
  copyLinkAria: 'Copy a link to these search results',
  copyLinkPrompt: 'Copy this link',
  monthNames: ['January','February','March','April','May','June','July','August','September','October','November','December'],
  signIn: 'Sign in',
  navHome: 'Home',
  menuOpen: 'Open menu',
  menuClose: 'Close menu',
  personaTenant: 'Tenant',
  personaLandlord: 'Landlord',

  heroPrevImage: 'Previous image',
  heroNextImage: 'Next image',
  heroNoPhotos: 'No room photos yet',
  heroAvailableNow: 'Available now',
  heroRoomAlt: 'Available room',
  statRoomsUnit: 'rooms',

  flowTellUs: 'Tell us what you need',
  flowWeCallBack: 'We call you back',

  faqEyebrow: 'Frequently asked',
  faqTitle: 'We have answers',

  ctaAdminLine: 'Everything goes through an admin',

  footerContact: 'Contact',
  footerHours: 'Mon–Sat 9:00–18:00',
  footerMenu: 'Menu',
  footerHome: 'Home',
  footerSearch: 'Find a room',
  footerHow: 'How it works',
  footerRooms: 'Rooms',
  footerLandlords: 'For landlords',
  footerFaq: 'FAQ',

  lineChat: 'LINE chat',
  lineContactAdmin: 'Contact an admin on LINE',
  lineAskAboutRoom: 'Ask about this room on LINE',
  lineGreeting: 'Hello',

  formSendFailed: 'Could not send',
  formSending: 'Sending…',
  formCallbackNote: 'Our team will call you with the closest matches to what you asked for.',
  formBudgetPlaceholder: 'e.g. 15000',
  formSelectRoomType: 'Select a room type',
  formNamePlaceholder: 'e.g. John Smith',
  formPhonePlaceholder: 'e.g. 081-234-5678',

  landlordFaster: 'Let your room faster / typically within 7 days',
  landlordWatchVideo: 'Watch the walkthrough',
  landlordRealRooms: 'Real rooms on the platform',
  landlordLineGreeting: "Hello, I'd like to list a room for rent.",
}
