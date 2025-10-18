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
    <div className="flex flex-col h-[70vh]">
      <div className="flex-1 overflow-y-auto space-y-3 p-3 rounded bg-black/40 border border-neon-500">
        {messages.map((m, idx) => (
          <div key={idx} className={`max-w-[80%] rounded px-3 py-2 ${m.role==='assistant'? 'bg-black/60 text-neon-500 self-start' : 'bg-neon-500 text-black ml-auto'}`}>{m.content}</div>
        ))}
        {loading && <div className="text-neon-500 animate-pulse">Assistant is typing…</div>}
        <div ref={bottomRef} />
      </div>
      <div className="mt-3 grid gap-2">
        <div className="flex gap-2">
          <input className="input flex-1" placeholder="Ask SmartStay AI…" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter'){ send(input); setInput('') } }} />
          <button className="btn" onClick={()=>{ send(input); setInput('') }}>Send</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((p,i)=>(
            <button key={i} className="btn-secondary" onClick={()=>send(p)}>{p}</button>
          ))}
        </div>
      </div>
    </div>
  )
}
