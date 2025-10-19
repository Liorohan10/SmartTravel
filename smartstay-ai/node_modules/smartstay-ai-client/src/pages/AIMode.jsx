import React from 'react'
import ChatAssistant from '../components/ChatAssistant.jsx'

export default function AIMode() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="glass-panel p-8 animate-fade-up">
        <div className="mb-8 text-center">
          <h1 className="heading-1 mb-4">
            <span className="text-gradient">AI</span> Conversational Travel Planner
          </h1>
          <p className="body-large opacity-80 max-w-2xl mx-auto">
            Plan trips, compare hotels, and explore with SmartStay AI. 
            Your intelligent companion for seamless travel experiences.
          </p>
          <div className="glow-divider mt-6 mb-8" />
        </div>
        <ChatAssistant />
      </div>
    </div>
  )
}
