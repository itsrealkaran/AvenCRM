import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

export const fetchEvents = async () => {
  const response = await api.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/calender/getEvents`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    },
  });
  return response.data;
};

export const createEvent = async (eventData: any) => {
  const response = await api.post(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/calender/createEvent`,
    eventData,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    }
  );
  return response.data;
};

export const updateEvent = async (id: any, eventData: any) => {
  const response = await api.put(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/calender/update/${id}`,
    eventData,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    }
  );
  return response.data;
};

export const deleteEvent = async (id: any) => {
  const response = await api.delete(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/calender/delete/${id}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    }
  );
  return response.data;
};
