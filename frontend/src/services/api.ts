
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

export const checkGameState = async (domain?: string) => {
  const res = await api.get(`/game-state${domain ? `?domain=${domain}` : ''}`);
  return res.data;
};

export const startGame = async () => {
  const res = await api.post('/start');
  return res.data;
};

export const submitVote = async (domain: string, mrName: string, mrsName: string) => {
  const res = await api.post('/vote', { domain, mrName, mrsName });
  return res.data;
};

export const getResults = async () => {
  const res = await api.get('/results');
  return res.data;
};

