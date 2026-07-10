// src/components/admin/AdminRoomsList.jsx — Table of all rooms with edit/delete actions.
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Pencil, Trash, Eye, Plus, Bed, Bath, Ruler, Clock } from '../icons.jsx'
import { ConfirmDialog } from '../Modal.jsx'
import { useApi } from '../../hooks/useApi.js'
import { api, ApiError } from '../../api/client.js'

const STATUS_TONE = {
  available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  reserved:  'bg-ember-50   text-ember-700   border-ember-200',
  matched:   'bg-navy-50    text-navy-700    border-navy-200',
  inactive:  'bg-navy-50    text-muted       border-navy-200',
}

const STATUS_LABEL = {
  available: 'ว่าง',
  reserved:  'จองแล้ว',
  matched:   'มีผู้เช่า',
  inactive:  'ปิด',
}

export default function AdminRoomsList() {
  const navigate = useNavigate()
  const { data: rooms, loading, error, refetch } = useApi(() => api.listRooms({ limit: 200 }), [])
  const [confirming, setConfirming] = useState(null)   // room object being deleted
  const [deleting,   setDeleting]   = useState(false)
  const [delError,   setDelError]   = useState('')

  async function handleDelete() {
    if (!confirming) return
    setDeleting(true)
    setDelError('')
    try {
      await api.deleteRoom(confirming.id)
      setConfirming(null)
      refetch()
    } catch (err) {
      setDelError(err instanceof ApiError ? err.message : 'ลบไม่สำเร็จ')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
        <div>
          <span className="eyebrow-navy">จัดการห้อง</span>
          <h1 className="mt-3 font-bold text-navy-700 text-3xl sm:text-4xl tracking-tight">
            ห้องทั้งหมด
          </h1>
          <p className="mt-2 text-muted">
            เพิ่ม แก้ไข หรือลบประกาศห้องเช่า
          </p>
        </div>
        <Link to="/admin/rooms/new" className="btn btn-primary">
          <Plus size={18} /> เพิ่มห้องใหม่
        </Link>
      </div>

      {error && (
        <div className="card p-6 text-ember-700 text-sm">
          โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-navy-50/60 border-b border-line text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-5 py-3.5 font-semibold">ห้อง</th>
                <th className="px-5 py-3.5 font-semibold">โซน</th>
                <th className="px-5 py-3.5 font-semibold text-right">ราคา/ด.</th>
                <th className="px-5 py-3.5 font-semibold text-center">สถานะ</th>
                <th className="px-5 py-3.5 font-semibold text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {loading && (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              )}
              {!loading && rooms && rooms.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-muted">
                    ยังไม่มีห้องในระบบ กดปุ่ม "เพิ่มห้องใหม่" เพื่อเริ่มต้น
                  </td>
                </tr>
              )}
              {!loading && rooms && rooms.map((r) => (
                <tr key={r.id} className="hover:bg-navy-50/40 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-navy-700 line-clamp-1">{r.title}</div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted">
                      <span className="inline-flex items-center gap-1"><Bed size={12} /> {r.beds}</span>
                      <span className="inline-flex items-center gap-1"><Bath size={12} /> {r.baths}</span>
                      <span className="inline-flex items-center gap-1"><Ruler size={12} /> {r.sqm} ตร.ม.</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-navy-700">{r.zone}</td>
                  <td className="px-5 py-4 text-right font-bold text-navy-700 tabular-nums">
                    ฿{Number(r.price).toLocaleString()}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_TONE[r.status] || STATUS_TONE.inactive}`}>
                      {STATUS_LABEL[r.status] || r.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <a
                        href={`/rooms/${r.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-9 h-9 grid place-items-center rounded-lg text-muted hover:bg-navy-50 hover:text-navy-700"
                        aria-label="ดูหน้าเว็บ"
                      >
                        <Eye size={16} />
                      </a>
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/rooms/${r.id}/edit`)}
                        className="w-9 h-9 grid place-items-center rounded-lg text-navy-700 hover:bg-navy-50"
                        aria-label="แก้ไข"
                      >
                        <Pencil size={16} />
                      </button>
                      <Link
                        to={`/admin/rooms/${r.id}/slots`}
                        className="w-9 h-9 grid place-items-center rounded-lg text-navy-700 hover:bg-navy-50"
                        aria-label="เวลานัดชม"
                      >
                        <Clock size={16} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => { setDelError(''); setConfirming(r) }}
                        className="w-9 h-9 grid place-items-center rounded-lg text-ember-700 hover:bg-ember-50"
                        aria-label="ลบ"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={!!confirming}
        title="ลบห้องนี้?"
        message={confirming ? `"${confirming.title}" จะถูกลบออกจากระบบ การกระทำนี้ไม่สามารถยกเลิกได้` : ''}
        confirmLabel={deleting ? 'กำลังลบ…' : 'ลบเลย'}
        danger
        onCancel={() => { if (!deleting) { setConfirming(null); setDelError('') } }}
        onConfirm={handleDelete}
      />
      {delError && (
        <div className="mt-4 text-ember-700 text-sm bg-ember-50 border border-ember-200 rounded-lg px-3 py-2">
          {delError}
        </div>
      )}
    </section>
  )
}

function SkeletonRow() {
  return (
    <tr>
      <td className="px-5 py-4"><div className="h-4 w-3/4 bg-navy-100 rounded animate-pulse" /></td>
      <td className="px-5 py-4"><div className="h-4 w-20 bg-navy-100 rounded animate-pulse" /></td>
      <td className="px-5 py-4"><div className="h-4 w-16 bg-navy-100 rounded animate-pulse ml-auto" /></td>
      <td className="px-5 py-4"><div className="h-6 w-14 bg-navy-100 rounded-full animate-pulse mx-auto" /></td>
      <td className="px-5 py-4"><div className="h-4 w-20 bg-navy-100 rounded animate-pulse ml-auto" /></td>
    </tr>
  )
}