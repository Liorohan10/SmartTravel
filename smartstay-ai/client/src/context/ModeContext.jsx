import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const ModeContext = createContext()

export function ModeProvider({ children }) {
  // theme: 'light' | 'dark'
  const [mode, setMode] = useState(() => sessionStorage.getItem('mode') || 'light')
  const [isTransitioning, setIsTransitioning] = useState(false)

  const switchMode = (newMode) => {
    if (mode === newMode) return
    
    setIsTransitioning(true)
    
    // Add theme transition overlay
    const overlay = document.createElement('div')
    overlay.className = `fixed inset-0 z-[9999] pointer-events-none ${
      newMode === 'dark' ? 'animate-theme-transition-dark' : 'animate-theme-transition-light'
    }`
    overlay.style.background = newMode === 'dark' 
      ? 'radial-gradient(circle at center, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.3) 50%, rgba(15, 23, 42, 0.9) 100%)'
      : 'radial-gradient(circle at center, rgba(255, 255, 255, 0.8) 0%, rgba(248, 250, 252, 0.9) 50%, rgba(255, 255, 255, 1) 100%)'
    
    document.body.appendChild(overlay)
    
    // Add aurora ripple effect
    const ripple = document.createElement('div')
    ripple.className = 'fixed inset-0 z-[9998] pointer-events-none animate-aurora-ripple'
    ripple.style.background = newMode === 'dark' 
      ? 'conic-gradient(from 0deg at 50% 50%, rgba(99, 102, 241, 0.3) 0%, rgba(139, 92, 246, 0.3) 120deg, rgba(244, 63, 94, 0.2) 240deg, rgba(99, 102, 241, 0.3) 360deg)'
      : 'conic-gradient(from 0deg at 50% 50%, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 120deg, rgba(236, 72, 153, 0.15) 240deg, rgba(59, 130, 246, 0.2) 360deg)'
    
    document.body.appendChild(ripple)
    
    // Trigger actual mode change after brief delay
    setTimeout(() => {
      setMode(newMode)
    }, 100)
    
    // Clean up after animation
    setTimeout(() => {
      document.body.removeChild(overlay)
      document.body.removeChild(ripple)
      setIsTransitioning(false)
    }, 800)
  }

  useEffect(() => {
    sessionStorage.setItem('mode', mode)
    document.body.classList.toggle('dark', mode==='dark')
  }, [mode])

  const value = useMemo(() => ({ 
    mode, 
    setMode, 
    switchMode, 
    isTransitioning 
  }), [mode, isTransitioning])

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>
}

export function useMode() {
  const ctx = useContext(ModeContext)
  if (!ctx) throw new Error('useMode must be used within ModeProvider')
  return ctx
}
