import axios from 'axios'

const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api'

export const api = axios.create({ baseURL: apiBase, timeout: 20000 })

export async function smartFilter(nlQuery) {
  const { data } = await api.post('/gemini/smart-filter', { query: nlQuery })
  return data.filter
}
