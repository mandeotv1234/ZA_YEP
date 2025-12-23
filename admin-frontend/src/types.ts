
export enum GameStatus {
  IDLE = 'IDLE',
  VOTING = 'VOTING',
  FINISHED = 'FINISHED'
}

export interface Vote {
  id: string;
  voterDomain: string;
  mrName: string;
  mrsName: string;
  timestamp: number;
}

export interface GameState {
  status: GameStatus;
  startTime: number | null;
  durationMs: number;
  votes: Vote[];
}

export interface User {
  domain: string;
  hasVoted: boolean;
}

export interface Winner {
  name: string;
  count: number;
}

export interface Result {
  mrWinner: Winner | null;
  mrsWinner: Winner | null;
}
