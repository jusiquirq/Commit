export interface BlindLevel {
  smallBlind: number;
  bigBlind: number;
  ante?: number;
  durationMinutes: number; // Duration of this specific level
  isBreak?: boolean;
}

export enum GameStatus {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
}

export interface GameState {
  currentLevelIndex: number;
  timeLeftSeconds: number;
  status: GameStatus;
  totalElapsedTime: number;
}