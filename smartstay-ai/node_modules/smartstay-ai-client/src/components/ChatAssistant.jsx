import React, { useEffect, useRef, useState } from 'react'
import { api } from '../lib/api'

const quickPrompts = [
  'Best time to visit this city?',
  'Show me luxury hotels with sea view.',
  'Famous dishes here?',
]

export default function ChatAssistant() {
  const [messages, setMessages] = useState([{ role: 'assistant', content: 'Hi! I\'m your SmartStay AI assistant. How can I help plan your trip today?' }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function send(msg) {
    const newMessages = [...messages, { role: 'user', content: msg }]
    setMessages(newMessages)
    setLoading(true)
    try {
      const { data } = await api.post('/gemini/chat', { messages: newMessages })
      const reply = data.reply || 'Sorry, I could not generate a response.'
      setMessages(m => [...m, { role: 'assistant', content: reply }])
    } catch (e) {
      setMessages(m => [...m, { role: 'assistant', content: 'Error contacting AI. Please try again.' }])
    } finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      {/* Chat Messages Area */}
      <div className="h-[60vh] overflow-y-auto space-y-4 pr-2">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-up`}
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            <div className={m.role === 'assistant' ? 'chat-bubble-ai' : 'chat-bubble-user'}>
              {m.content}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start animate-fade-up">
            <div className="glass-panel px-4 py-3 rounded-2xl max-w-[200px]">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <span className="body-small opacity-80">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="glass-panel p-4 space-y-4">
        <div className="flex gap-3 items-end">
          <input 
            className="aero-input flex-1" 
            placeholder="Ask SmartStay AI anything..." 
            value={input} 
            onChange={e=>setInput(e.target.value)} 
            onKeyDown={e=>{ if(e.key==='Enter' && input.trim()){ send(input.trim()); setInput('') } }} 
          />
          <button 
            className="aero-btn-primary px-6"
            onClick={()=>{ if(input.trim()) { send(input.trim()); setInput('') } }}
            disabled={!input.trim()}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
        
        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((prompt, i) => (
            <button 
              key={i} 
              className="aero-btn-secondary px-3 py-2 body-small"
              onClick={() => send(prompt)}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
