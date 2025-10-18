import React from 'react'
import { useMode } from '../context/ModeContext.jsx'

export default function ModeToggle() {
  const { mode, setMode } = useMode()
  return (
    <button
      onClick={() => setMode(mode === 'normal' ? 'ai' : 'normal')}
      className={`relative inline-flex items-center h-9 px-3 rounded-full transition-all duration-300 ${mode==='ai' ? 'bg-black text-neon-500 ring-1 ring-neon-500 shadow-[0_0_10px_#00E5FF]' : 'bg-gray-200'}`}
      aria-label="Toggle Mode"
    >
      <span className="mr-2 text-sm">{mode === 'ai' ? 'AI Mode' : 'Normal Mode'}</span>
      <span className={`w-5 h-5 rounded-full transition-transform ${mode==='ai' ? 'bg-neon-500 translate-x-0' : 'bg-white translate-x-0'}`}></span>
    </button>
  )
}
