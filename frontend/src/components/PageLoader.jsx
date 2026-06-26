import React from 'react'

export const PageLoader = () => {
  return (
    <div className="flex items-center justify-center min-h-[60vh] w-full">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-10 h-10 border-4 border-slate-700 border-t-[#0ea5e9] rounded-full animate-spin shadow-[0_0_15px_rgba(14,165,233,0.3)]"></div>
        <p className="text-sm text-slate-400 font-medium tracking-wide">Loading module...</p>
      </div>
    </div>
  )
}
