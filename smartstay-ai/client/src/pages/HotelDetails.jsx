import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../lib/api'

export default function HotelDetails() {
  const { id } = useParams()
  const [hotel, setHotel] = useState(null)
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function run() {
      setLoading(true)
      try {
        const { data } = await api.get(`/liteapi/hotels/${id}`)
        setHotel(data)
        try {
          const { data: s } = await api.post('/gemini/summarize-hotel', { hotel: data })
          setSummary(s.summary)
        } catch {
          setSummary('AI summary unavailable.')
        }
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [id])

  if (loading) return <div className="max-w-5xl mx-auto px-4 py-6">Loading…</div>
  if (!hotel) return <div className="max-w-5xl mx-auto px-4 py-6">Hotel not found.</div>

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-4">
        {hotel.images?.[0] && <img src={hotel.images[0]} alt={hotel.name} className="w-full rounded" />}
        <h1 className="text-2xl font-semibold">{hotel.name}</h1>
        <div className="text-gray-600">{hotel.location || hotel.address?.full}</div>
        <div>⭐ {hotel.rating ?? hotel.stars ?? 'N/A'}</div>
        <div className="prose whitespace-pre-wrap bg-gray-50 p-3 rounded">{summary}</div>
        <div>
          <h3 className="font-semibold mb-1">Nearby</h3>
          <p className="text-sm text-gray-600">Use AI Mode to ask for nearby attractions and restaurants.</p>
        </div>
      </div>
      <aside className="space-y-3">
        <div className="border rounded p-3 bg-white">
          <div className="font-semibold">Book this hotel</div>
          <button className="btn w-full mt-2" onClick={()=>alert('Booking through /api/liteapi/book (stub).')}>Proceed to Book</button>
        </div>
        <div className="border rounded p-3 bg-white">
          <div className="font-semibold mb-2">Amenities</div>
          <ul className="text-sm list-disc pl-5">
            {(hotel.amenities || []).slice(0,8).map((a,i)=>(<li key={i}>{a}</li>))}
          </ul>
        </div>
      </aside>
    </div>
  )
}
