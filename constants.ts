import { BlindLevel } from './types';

// Based on a standard "Regular" speed PokerStars Home Game structure
// Scaled up to start at 100/200.
// Typically 10-15 min intervals. We default to 15.
export const DEFAULT_BLINDS: BlindLevel[] = [
  { smallBlind: 100, bigBlind: 200, durationMinutes: 15 },
  { smallBlind: 150, bigBlind: 300, durationMinutes: 15 },
  { smallBlind: 250, bigBlind: 500, durationMinutes: 15 },
  { smallBlind: 500, bigBlind: 1000, durationMinutes: 15 },
  { smallBlind: 750, bigBlind: 1500, durationMinutes: 15 },
  { smallBlind: 1000, bigBlind: 2000, durationMinutes: 15 },
  { smallBlind: 1000, bigBlind: 2000, ante: 200, durationMinutes: 15 },
  { smallBlind: 1500, bigBlind: 3000, ante: 300, durationMinutes: 15 },
  { smallBlind: 2000, bigBlind: 4000, ante: 400, durationMinutes: 15 },
  { smallBlind: 2500, bigBlind: 5000, ante: 500, durationMinutes: 15 },
  { smallBlind: 3000, bigBlind: 6000, ante: 600, durationMinutes: 15 },
  { smallBlind: 4000, bigBlind: 8000, ante: 800, durationMinutes: 15 },
  { smallBlind: 5000, bigBlind: 10000, ante: 1000, durationMinutes: 15 },
  { smallBlind: 6000, bigBlind: 12000, ante: 1200, durationMinutes: 15 },
  { smallBlind: 8000, bigBlind: 16000, ante: 1600, durationMinutes: 15 },
  { smallBlind: 10000, bigBlind: 20000, ante: 2000, durationMinutes: 15 },
];