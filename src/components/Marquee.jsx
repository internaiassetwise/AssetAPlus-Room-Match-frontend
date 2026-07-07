// Marquee — thin top border, slow scroll, calm type, no sparkle icons
const ITEMS = [
  'ถ่ายรูปห้องฟรี',
  'ลงประกาศ 10+ ช่องทาง',
  'คัดกรองผู้เช่า',
  'สัญญามาตรฐาน',
  'รายงานรายเดือน',
  'ไม่มีค่าลงทะเบียน',
  'ประกันค่าเช่า',
  'ทีมงานมืออาชีพ',
]

export default function Marquee() {
  const doubled = [...ITEMS, ...ITEMS]
  return (
    <div className="bg-navy-700 text-white py-4 overflow-hidden border-y border-navy-800">
      <div className="flex gap-14 animate-marquee whitespace-nowrap">
        {doubled.map((t, i) => (
          <div key={i} className="flex items-center gap-3.5 text-[15px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-ember-400" />
            <span>{t}</span>
          </div>
        ))}
      </div>
    </div>
  )
}