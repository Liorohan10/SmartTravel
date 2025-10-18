import React from 'react'
import SearchBar from '../components/SearchBar.jsx'
import { useMode } from '../context/ModeContext.jsx'

export default function Home() {
  const { mode } = useMode()
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className={`rounded-xl p-8 ${mode==='ai' ? 'bg-black text-white border border-neon-500 shadow-[0_0_20px_#00E5FF]' : 'bg-white shadow'}`}>
        <h1 className="text-2xl font-semibold mb-4">Find your perfect stay</h1>
        <SearchBar />
      </div>
      <section className="mt-8 grid md:grid-cols-3 gap-6">
        {[1,2,3].map(i => (
          <div key={i} className="p-6 bg-white rounded shadow">
            <div className="font-semibold mb-2">Smart feature {i}</div>
            <div className="text-sm text-gray-600">AI summaries, smart filters, and personalized tips help you decide faster.</div>
          </div>
        ))}
      </section>
    </div>
  )
}
