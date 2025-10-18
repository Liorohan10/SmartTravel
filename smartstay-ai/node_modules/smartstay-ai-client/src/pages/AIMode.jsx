import React from 'react'
import ChatAssistant from '../components/ChatAssistant.jsx'

export default function AIMode() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4 text-neon-500">AI Conversational Travel Planner</h1>
      <ChatAssistant />
    </div>
  )
}
