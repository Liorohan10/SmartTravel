import React from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { ModeProvider, useMode } from './context/ModeContext.jsx'
import Home from './pages/Home.jsx'
import HotelList from './pages/HotelList.jsx'
import HotelDetails from './pages/HotelDetails.jsx'
import AIMode from './pages/AIMode.jsx'
import ModeToggle from './components/ModeToggle.jsx'

function Header() {
  const { mode } = useMode()
  const location = useLocation()
  return (
    <header className={`sticky top-0 z-20 backdrop-blur bg-white/70 ${mode==='ai'?'border-b border-neon-500 shadow-[0_0_10px_#00E5FF]':''}`}>
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-semibold">SmartStay <span className="text-neon-700">AI</span></Link>
        <nav className="flex items-center gap-4">
          <Link to="/" className={location.pathname==='/'? 'font-semibold' : ''}>Home</Link>
          <Link to="/ai" className={location.pathname==='/ai'? 'font-semibold text-neon-700' : ''}>AI Mode</Link>
          <ModeToggle />
        </nav>
      </div>
    </header>
  )
}

export default function App() {
  return (
    <ModeProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/hotels" element={<HotelList />} />
            <Route path="/hotels/:id" element={<HotelDetails />} />
            <Route path="/ai" element={<AIMode />} />
          </Routes>
        </main>
        <footer className="text-center text-sm text-gray-500 py-6">© {new Date().getFullYear()} SmartStay AI</footer>
      </div>
    </ModeProvider>
  )
}
