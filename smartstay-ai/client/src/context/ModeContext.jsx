import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const ModeContext = createContext()

export function ModeProvider({ children }) {
  const [mode, setMode] = useState(() => sessionStorage.getItem('mode') || 'normal')

  useEffect(() => {
    sessionStorage.setItem('mode', mode)
    document.body.classList.toggle('bg-black', mode==='ai')
    document.body.classList.toggle('text-white', mode==='ai')
  }, [mode])

  const value = useMemo(() => ({ mode, setMode }), [mode])

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>
}

export function useMode() {
  const ctx = useContext(ModeContext)
  if (!ctx) throw new Error('useMode must be used within ModeProvider')
  return ctx
}
