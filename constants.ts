import { BlindLevel } from './types';

// Based on a standard "Regular" speed PokerStars Home Game structure
// Typically 10-15 min intervals. We default to 15.
export const DEFAULT_BLINDS: BlindLevel[] = [
  { smallBlind: 10, bigBlind: 20, durationMinutes: 15 },
  { smallBlind: 15, bigBlind: 30, durationMinutes: 15 },
  { smallBlind: 25, bigBlind: 50, durationMinutes: 15 },
  { smallBlind: 50, bigBlind: 100, durationMinutes: 15 },
  { smallBlind: 75, bigBlind: 150, durationMinutes: 15 },
  { smallBlind: 100, bigBlind: 200, durationMinutes: 15 },
  { smallBlind: 100, bigBlind: 200, ante: 20, durationMinutes: 15 },
  { smallBlind: 150, bigBlind: 300, ante: 30, durationMinutes: 15 },
  { smallBlind: 200, bigBlind: 400, ante: 40, durationMinutes: 15 },
  { smallBlind: 250, bigBlind: 500, ante: 50, durationMinutes: 15 },
  { smallBlind: 300, bigBlind: 600, ante: 60, durationMinutes: 15 },
  { smallBlind: 400, bigBlind: 800, ante: 80, durationMinutes: 15 },
  { smallBlind: 500, bigBlind: 1000, ante: 100, durationMinutes: 15 },
  { smallBlind: 600, bigBlind: 1200, ante: 120, durationMinutes: 15 },
  { smallBlind: 800, bigBlind: 1600, ante: 160, durationMinutes: 15 },
  { smallBlind: 1000, bigBlind: 2000, ante: 200, durationMinutes: 15 },
];