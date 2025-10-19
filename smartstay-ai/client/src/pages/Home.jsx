import React from 'react'
import SearchBar from '../components/SearchBar.jsx'
import { useMode } from '../context/ModeContext.jsx'

export default function Home() {
  const { mode } = useMode()
  return (
    <div className="max-w-6xl mx-auto space-y-16">
      {/* Hero Search Module */}
      <div className="glass-panel p-12 relative overflow-hidden animate-fade-up">
        {/* Subtle Aurora Accents */}
        <div className="absolute -top-16 -left-16 w-80 h-80 bg-aurora-vivid rounded-full blur-3xl opacity-60 animate-pulse-glow"></div>
        <div className="absolute -bottom-16 -right-16 w-96 h-96 bg-aurora-dawn rounded-full blur-3xl opacity-40" style={{ animationDelay: '1s' }}></div>
        
        <div className="relative z-10">
          <h1 className="heading-1 mb-8 text-center">
            Find your perfect stay
          </h1>
          <SearchBar />
          <p className="body mt-6 text-center opacity-80">
            Search hotels with smart filters, AI insights, and beautiful comparisons.
          </p>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <section className="grid md:grid-cols-3 gap-8">
        {[
          {
            title: 'Smart Summaries',
            description: 'AI-powered hotel summaries highlight key amenities, location benefits, and guest insights.',
            icon: '✨'
          },
          {
            title: 'Intelligent Filters', 
            description: 'Natural language search and smart filters help you find exactly what you need.',
            icon: '🎯'
          },
          {
            title: 'Personalized Tips',
            description: 'Get customized recommendations based on your preferences and travel history.',
            icon: '💡'
          }
        ].map((feature, i) => (
          <div key={i} className="aero-feature-card animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
            {/* Opaque Header for Accessibility */}
            <div className="bg-white/90 dark:bg-neutral-900/90 p-6 rounded-t-2xl border-b border-white/20">
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="heading-3">{feature.title}</h3>
            </div>
            {/* Glass Content Area */}
            <div className="p-6">
              <p className="body-small opacity-90">{feature.description}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
