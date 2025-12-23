
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

export const checkGameState = async () => {
  const res = await api.get('/game-state');
  return res.data;
};

export const startGame = async () => {
  const res = await api.post('/start');
  return res.data;
};

export const resetGame = async () => {
  const res = await api.post('/reset');
  return res.data;
};

export const getResults = async () => {
  const res = await api.get('/results');
  return res.data;
};


