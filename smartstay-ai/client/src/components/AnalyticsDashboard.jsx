import React, { useState, useEffect } from 'react'
import { api } from '../lib/api'

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState({
    weekly: null,
    market: null,
    detailed: null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadAnalytics = async () => {
    setLoading(true)
    setError('')
    
    try {
      const [weeklyRes, marketRes] = await Promise.all([
        api.get('/liteapi/analytics/weekly').catch(() => ({ data: null })),
        api.get('/liteapi/analytics/market').catch(() => ({ data: null }))
      ])

      setAnalytics({
        weekly: weeklyRes.data,
        market: marketRes.data,
        detailed: null
      })
    } catch (err) {
      console.error('Analytics load failed:', err)
      setError('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnalytics()
  }, [])

  const renderWeeklyStats = () => {
    if (!analytics.weekly) return null

    return (
      <div className="grid md:grid-cols-3 gap-4">
        <div className="glass-panel p-4 text-center">
          <div className="text-2xl font-bold text-primary-400 mb-2">
            {analytics.weekly.totalSearches || '—'}
          </div>
          <div className="body-small opacity-70">Total Searches</div>
        </div>
        
        <div className="glass-panel p-4 text-center">
          <div className="text-2xl font-bold text-success-400 mb-2">
            {analytics.weekly.totalBookings || '—'}
          </div>
          <div className="body-small opacity-70">Bookings</div>
        </div>
        
        <div className="glass-panel p-4 text-center">
          <div className="text-2xl font-bold text-warning-400 mb-2">
            {analytics.weekly.conversionRate ? `${(analytics.weekly.conversionRate * 100).toFixed(1)}%` : '—'}
          </div>
          <div className="body-small opacity-70">Conversion Rate</div>
        </div>
      </div>
    )
  }

  const renderPopularDestinations = () => {
    const destinations = analytics.market?.popularDestinations || []
    
    if (!destinations.length) return null

    return (
      <div className="space-y-3">
        {destinations.slice(0, 5).map((dest, index) => (
          <div key={index} className="flex items-center justify-between p-3 glass-panel border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center">
                <span className="text-sm font-bold">{index + 1}</span>
              </div>
              <div>
                <div className="body font-medium">{dest.city}</div>
                <div className="body-small opacity-70">{dest.country}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="body-small font-medium">{dest.searchCount}</div>
              <div className="body-small opacity-70">searches</div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderTravelInsights = () => {
    const insights = analytics.market?.insights || []
    
    if (!insights.length) return null

    return (
      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div key={index} className="glass-panel p-4 border border-primary-500/30">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">💡</span>
              </div>
              <div>
                <h4 className="body font-medium mb-1">{insight.title}</h4>
                <p className="body-small opacity-80">{insight.description}</p>
                {insight.recommendation && (
                  <div className="mt-2 p-2 bg-success-500/20 rounded-lg">
                    <p className="body-small text-success-300">
                      💡 Tip: {insight.recommendation}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="glass-panel p-8 text-center">
          <div className="animate-spin w-12 h-12 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="body">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="heading-2 mb-4">📊 Travel Analytics Dashboard</h1>
        <p className="body opacity-70 max-w-2xl mx-auto">
          Insights and trends from hotel search and booking data powered by LiteAPI analytics
        </p>
      </div>

      {error && (
        <div className="glass-panel p-6 border border-warning-500/30">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="body font-medium">Analytics Unavailable</h3>
              <p className="body-small opacity-70">{error}</p>
            </div>
          </div>
          <button 
            onClick={loadAnalytics}
            className="aero-btn-secondary mt-4"
          >
            🔄 Retry
          </button>
        </div>
      )}

      {/* Weekly Performance */}
      <div className="glass-panel p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="heading-3">📈 Weekly Performance</h2>
          <button 
            onClick={loadAnalytics}
            className="aero-btn-secondary px-4 py-2"
            disabled={loading}
          >
            🔄 Refresh
          </button>
        </div>
        {renderWeeklyStats()}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Popular Destinations */}
        <div className="glass-panel p-6">
          <h2 className="heading-3 mb-6">🌍 Trending Destinations</h2>
          {renderPopularDestinations()}
        </div>

        {/* Travel Insights */}
        <div className="glass-panel p-6">
          <h2 className="heading-3 mb-6">💡 Travel Insights</h2>
          {renderTravelInsights()}
        </div>
      </div>

      {/* Market Trends */}
      <div className="glass-panel p-6">
        <h2 className="heading-3 mb-6">📊 Market Trends</h2>
        <div className="text-center py-8 opacity-70">
          <div className="text-4xl mb-4">🚧</div>
          <p className="body">
            Advanced market analytics visualization coming soon
          </p>
          <p className="body-small mt-2">
            Connect with LiteAPI analytics endpoints for detailed market insights
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center">
        <p className="body-small opacity-50">
          Analytics data provided by LiteAPI • Updated in real-time
        </p>
      </div>
    </div>
  )
}