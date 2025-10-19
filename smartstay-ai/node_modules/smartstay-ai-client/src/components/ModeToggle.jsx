import React from 'react'
import { useMode } from '../context/ModeContext.jsx'

export default function ModeToggle() {
  const { mode, switchMode, isTransitioning } = useMode()
  const isDark = mode === 'dark'
  
  const handleToggle = () => {
    if (isTransitioning) return
    switchMode(isDark ? 'light' : 'dark')
  }
  
  return (
    <button
      onClick={handleToggle}
      className={`aero-btn-secondary px-3 py-2 transition-all duration-200 ${
        isTransitioning ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105'
      }`}
      aria-label="Toggle Theme"
      disabled={isTransitioning}
    >
      <span className={`flex items-center gap-2 body-small transition-all duration-200 ${
        isTransitioning ? 'animate-pulse' : ''
      }`}>
        {isDark ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className={`opacity-90 transition-transform duration-200 ${
            isTransitioning ? 'rotate-12 scale-110' : ''
          }`}>
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className={`opacity-90 transition-transform duration-200 ${
            isTransitioning ? 'rotate-180 scale-110' : ''
          }`}>
            <path d="M6.76 4.84l-1.8-1.79L3.17 4.84l1.79 1.8 1.8-1.8zM1 13h3v-2H1v2zm10 10h2v-3h-2v3zm9-10v2h3v-2h-3zm-1.76 7.16l1.8 1.8 1.79-1.8-1.79-1.79-1.8 1.79zM13 1h-2v3h2V1zm4.24 3.05l1.79-1.8-1.79-1.79-1.8 1.79 1.8 1.8zM4.24 19.95l-1.8 1.79 1.8 1.8 1.79-1.8-1.79-1.79z"/>
          </svg>
        )}
        {isDark ? 'Dark' : 'Light'}
      </span>
    </button>
  )
}
