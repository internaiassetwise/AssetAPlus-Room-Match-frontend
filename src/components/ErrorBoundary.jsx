// Catches render-time crashes and shows a friendly fallback so the page
// doesn't go blank during a deploy bug.
import { Component } from 'react'
import { RotateCw } from './icons.jsx'

export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, info)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white border border-line rounded-2xl shadow-lift p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-ember-50 text-ember-600 grid place-items-center mx-auto mb-4">
            <RotateCw size={20} />
          </div>
          <h1 className="font-bold text-navy-700 text-2xl tracking-tight mb-2">
            มีบางอย่างผิดพลาด
          </h1>
          <p className="text-muted mb-6 leading-relaxed">
            ขออภัยครับ หน้านี้เกิดข้อผิดพลาด ลองโหลดใหม่อีกครั้ง
            หรือกลับมาใหม่ภายหลัง
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="btn btn-ember btn-lg"
          >
            <RotateCw size={16} /> โหลดหน้านี้ใหม่
          </button>
        </div>
      </div>
    )
  }
}