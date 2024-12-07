import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

export const fetchEvents = async () => {
  const response = await api.get('/events')
  return response.data
}

export const createEvent = async (eventData: any) => {
  const response = await api.post('/events', eventData)
  return response.data
}

export const updateEvent = async (id: any, eventData: any) => {
  const response = await api.put(`/events/${id}`, eventData)
  return response.data
}

export const deleteEvent = async (id: any) => {
  const response = await api.delete(`/events/${id}`)
  return response.data
}

