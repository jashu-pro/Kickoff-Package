import React, { createContext, useContext, useState, useCallback } from 'react'
import { Icon } from './Icon'

const ToastContext = createContext(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'success') => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full no-print">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 p-4 rounded-xl border shadow-lg transition-all transform translate-y-0 duration-300 animate-slide-in ${
              toast.type === 'success'
                ? 'bg-white border-status-success/20 text-on-surface'
                : 'bg-white border-status-error/20 text-on-surface'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                toast.type === 'success' ? 'bg-status-success/10 text-status-success' : 'bg-status-error/10 text-status-error'
              }`}
            >
              <Icon name={toast.type === 'success' ? 'check_circle' : 'error'} size={20} filled />
            </div>
            <div className="flex-1 font-body-md text-body-md text-on-surface-variant">
              {toast.message}
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-outline hover:text-on-surface p-1 rounded-full transition-colors"
            >
              <Icon name="close" size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
