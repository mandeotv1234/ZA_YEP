
import { GameState, GameStatus, Vote, Result } from '../types';

const STORAGE_KEY = 'zalo_yep_game_data';
const GAME_DURATION = 5 * 60 * 1000; // 5 minutes in ms

export const getGameState = (): GameState => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    return {
      status: GameStatus.IDLE,
      startTime: null,
      durationMs: GAME_DURATION,
      votes: []
    };
  }
  const state: GameState = JSON.parse(data);
  
  // Update status based on time
  if (state.startTime) {
    const elapsed = Date.now() - state.startTime;
    if (elapsed >= GAME_DURATION) {
      state.status = GameStatus.FINISHED;
    } else {
      state.status = GameStatus.VOTING;
    }
  }
  
  return state;
};

export const startGame = (): GameState => {
  const currentState = getGameState();
  if (currentState.status !== GameStatus.IDLE) return currentState;

  const newState: GameState = {
    ...currentState,
    status: GameStatus.VOTING,
    startTime: Date.now(),
    votes: []
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  return newState;
};

export const submitVote = (voterDomain: string, mrName: string, mrsName: string): boolean => {
  const state = getGameState();
  if (state.status !== GameStatus.VOTING) return false;
  
  // Prevent double voting
  if (state.votes.some(v => v.voterDomain === voterDomain)) return false;

  const newVote: Vote = {
    id: Math.random().toString(36).substr(2, 9),
    voterDomain,
    mrName: mrName.trim(),
    mrsName: mrsName.trim(),
    timestamp: Date.now()
  };

  state.votes.push(newVote);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  return true;
};

export const calculateResults = (): Result => {
  const state = getGameState();
  const mrCounts: Record<string, number> = {};
  const mrsCounts: Record<string, number> = {};

  state.votes.forEach(v => {
    mrCounts[v.mrName] = (mrCounts[v.mrName] || 0) + 1;
    mrsCounts[v.mrsName] = (mrsCounts[v.mrsName] || 0) + 1;
  });

  const getWinner = (counts: Record<string, number>) => {
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? { name: sorted[0][0], count: sorted[0][1] } : null;
  };

  return {
    mrWinner: getWinner(mrCounts),
    mrsWinner: getWinner(mrsCounts)
  };
};

export const resetGame = () => {
  localStorage.removeItem(STORAGE_KEY);
};
