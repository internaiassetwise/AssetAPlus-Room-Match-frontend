// src/components/admin/WatermarkPanel.jsx — run the watermark backfill.
//
// Photos are watermarked when they are uploaded, so every NEW photo already
// carries the mark and this panel is not needed for them. It exists for photos
// that were already on the server before watermarking existed, and for restyles:
// a file keeps whatever mark was live when it was written, so changing the
// watermark never reaches backwards on its own.

import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '../../api/client.js'

const POLL_MS = 2000

export default function WatermarkPanel() {
  const [job, setJob]       = useState(null)
  const [error, setError]   = useState('')
  const [busy, setBusy]     = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [includeLegacy, setIncludeLegacy] = useState(true)
  const timer = useRef(null)

  const load = useCallback(async () => {
    try { setJob(await api.getWatermarkJob()) } catch { /* keep last known state */ }
  }, [])

  useEffect(() => { load() }, [load])

  // Poll only while a job is actually running — this screen is otherwise idle.
  useEffect(() => {
    clearInterval(timer.current)
    if (job?.running) timer.current = setInterval(load, POLL_MS)
    return () => clearInterval(timer.current)
  }, [job?.running, load])

  async function start({ dryRun, force, reclaim }) {
    setBusy(true); setError('')
    try {
      setJob(await api.startWatermarkJob({ dryRun, force, reclaim }))
      setConfirming(false)
    } catch (err) {
      setError(err?.message || 'เริ่มงานไม่สำเร็จ')
    } finally {
      setBusy(false)
    }
  }

  const last    = job?.lastRun
  const running = Boolean(job?.running)

  return (
    <section className="card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-bold text-navy-700">ลายน้ำรูปภาพ</h2>
          <p className="text-sm text-muted mt-0.5 max-w-prose">
            รูปที่อัปโหลดใหม่จะมีลายน้ำ <span className="font-mono">@aswroommatch</span> อัตโนมัติอยู่แล้ว
            ปุ่มนี้ใช้สำหรับรูปเก่าที่อัปโหลดไว้ก่อนหน้า
          </p>
        </div>
        {running && (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            กำลังทำงาน
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          className="btn btn-ghost btn-sm"
          disabled={busy || running}
          onClick={() => start({ dryRun: true })}
        >
          ตรวจสอบก่อน (ไม่แก้ไฟล์)
        </button>
        <button
          className="btn btn-primary btn-sm"
          disabled={busy || running}
          onClick={() => setConfirming('run')}
        >
          ใส่ลายน้ำรูปเก่าทั้งหมด
        </button>
        {/* A plain run skips photos it has already done, so changing the mark's
            style would never reach them. This is the "do it again" action. */}
        <button
          className="btn btn-outline btn-sm"
          disabled={busy || running}
          onClick={() => setConfirming('force')}
        >
          ทำลายน้ำใหม่ (หลังเปลี่ยนสไตล์)
        </button>
      </div>

      {confirming && (
        <div className="mt-3 rounded-lg border border-ember-300 bg-ember-50/60 p-3">
          <p className="text-sm text-navy-700">
            {confirming === 'force'
              ? 'ระบบจะทำลายน้ำใหม่จากไฟล์ต้นฉบับที่เก็บไว้ ลายน้ำจะไม่ซ้อนกัน'
              : 'ระบบจะเขียนทับไฟล์รูปเดิม โดยเก็บต้นฉบับที่ยังไม่มีลายน้ำไว้ให้ในโฟลเดอร์ originals/ เพื่อย้อนกลับได้'}
            {' '}ต้องการดำเนินการต่อหรือไม่?
          </p>

          {/* The lossy part is opt-in and says what it costs. These photos have
              the old mark burned into the only copy that exists, so trimming it
              off is the only way to re-mark them — there is no lossless option. */}
          {confirming === 'force' && (
            <label className="mt-2 flex items-start gap-2 text-sm text-navy-700">
              <input
                type="checkbox"
                className="mt-1"
                checked={includeLegacy}
                onChange={(e) => setIncludeLegacy(e.target.checked)}
              />
              <span>
                รวมรูปที่ติดลายน้ำแบบเก่าไว้ในไฟล์ด้วย
                <span className="block text-xs text-muted">
                  รูปกลุ่มนี้ไม่มีไฟล์ต้นฉบับเหลืออยู่ ระบบจะตัดขอบล่าง (~11% ของความสูง)
                  เพื่อลบลายน้ำเดิมออกก่อนใส่ลายน้ำใหม่ — หากไม่เลือก ระบบจะข้ามและแสดงรายชื่อไว้ให้
                </span>
              </span>
            </label>
          )}

          <div className="mt-2 flex gap-2">
            <button
              className="btn btn-primary btn-sm"
              disabled={busy}
              onClick={() => start({
                force:   confirming === 'force',
                reclaim: confirming === 'force' && includeLegacy,
              })}
            >
              ยืนยัน
            </button>
            <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => setConfirming(false)}>
              ยกเลิก
            </button>
          </div>
        </div>
      )}

      {error && <p className="error mt-2">{error}</p>}

      {last && (
        <div className="mt-4 border-t border-line pt-3">
          <div className="text-xs uppercase text-muted mb-2">
            {last.dryRun ? 'ผลการตรวจสอบ (ไม่ได้แก้ไฟล์)' : 'ผลการทำงานล่าสุด'}
            {last.startedBy && ` · โดย ${last.startedBy}`}
          </div>
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
            <Cell label="รูปทั้งหมด"   value={last.scanned} />
            <Cell label="ใส่ลายน้ำแล้ว" value={last.watermarked} />
            <Cell label="ข้าม"          value={last.skipped} />
            <Cell label="ไม่สำเร็จ"     value={last.failed} tone={last.failed ? 'bad' : 'plain'} />
          </dl>

          {last.reclaimed > 0 && (
            <p className="text-xs text-muted mt-2">
              ในจำนวนนี้ {last.reclaimed} รูปถูกตัดขอบล่างเพื่อลบลายน้ำแบบเก่าออกก่อนใส่ลายน้ำใหม่
            </p>
          )}

          {last.error && <p className="error mt-2">{last.error}</p>}

          {last.alreadyMarked > 0 && (
            <div className="mt-3 rounded-lg border border-navy-200 bg-navy-50 p-3">
              <div className="text-sm font-semibold text-navy-700">
                {last.alreadyMarked} รูปมีลายน้ำแบบเก่าติดอยู่แล้ว
              </div>
              <p className="text-xs text-muted mt-1">
                รูปเหล่านี้ถูกใส่ลายน้ำตอนอัปโหลด ก่อนที่ระบบจะเริ่มเก็บต้นฉบับ
                จึงไม่มีไฟล์ต้นฉบับให้ทำใหม่ ระบบข้ามไว้เพื่อไม่ให้ลายน้ำซ้อนกัน
                หากต้องการลายน้ำแบบใหม่ ให้กด “ทำลายน้ำใหม่” แล้วติ๊กตัวเลือกรวมรูปกลุ่มนี้
                (ระบบจะตัดขอบล่างออก) หรืออัปโหลดรูปเหล่านี้ใหม่
              </p>
              <ul className="mt-2 space-y-0.5 font-mono text-[11px] text-muted max-h-32 overflow-y-auto">
                {last.alreadyMarkedFiles.map((f) => <li key={f}>{f}</li>)}
              </ul>
            </div>
          )}

          {last.failures?.length > 0 && (
            <ul className="mt-2 space-y-0.5 font-mono text-[11px] text-ember-700 max-h-32 overflow-y-auto">
              {last.failures.map((f) => <li key={f}>{f}</li>)}
            </ul>
          )}
        </div>
      )}
    </section>
  )
}

function Cell({ label, value, tone = 'plain' }) {
  return (
    <div className={`rounded-lg border px-3 py-2 ${tone === 'bad' && value > 0 ? 'border-ember-300 bg-ember-50/60' : 'border-line'}`}>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="text-lg font-bold text-navy-700 tabular-nums">{value ?? 0}</dd>
    </div>
  )
}
