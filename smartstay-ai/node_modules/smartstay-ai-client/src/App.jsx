import React from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { ModeProvider, useMode } from './context/ModeContext.jsx'
import Home from './pages/Home.jsx'
import HotelList from './pages/HotelList.jsx'
import HotelDetails from './pages/HotelDetails.jsx'
import AIMode from './pages/AIMode.jsx'
import ModeToggle from './components/ModeToggle.jsx'

function Header() {
  const { mode, isTransitioning } = useMode()
  const location = useLocation()
  return (
    <header className="glass-panel sticky top-0 z-30 mx-4 mt-4 mb-0">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="heading-3">
          SmartStay <span className="text-gradient">AI</span>
        </Link>
        <nav className="flex items-center gap-6 body">
          <Link 
            to="/" 
            className={`px-4 py-2 rounded-full transition-all duration-200 ${
              location.pathname==='/' 
                ? 'bg-primary-500 text-white shadow-glow-primary' 
                : 'hover:bg-white/20 dark:hover:bg-white/10'
            }`}
          >
            Home
          </Link>
          <Link 
            to="/ai" 
            className={`px-4 py-2 rounded-full transition-all duration-200 ${
              location.pathname==='/ai' 
                ? 'text-gradient font-medium' 
                : 'hover:bg-white/20 dark:hover:bg-white/10'
            }`}
          >
            AI Planner
          </Link>
          <ModeToggle />
        </nav>
      </div>
    </header>
  )
}

function AppContent() {
  const { isTransitioning } = useMode()
  
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Aero-Kinetik Aurora Background */}
      <div className={`aurora-layer transition-opacity duration-800 ${
        isTransitioning ? 'opacity-80 animate-pulse' : 'opacity-100'
      }`}></div>

      <Header />
      <main className="flex-1 px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/hotels" element={<HotelList />} />
          <Route path="/hotels/:id" element={<HotelDetails />} />
          <Route path="/ai" element={<AIMode />} />
        </Routes>
      </main>
      <footer className="text-center body-small opacity-70 py-8">© {new Date().getFullYear()} SmartStay AI</footer>
    </div>
  )
}

export default function App() {
  return (
    <ModeProvider>
      <AppContent />
    </ModeProvider>
  )
}