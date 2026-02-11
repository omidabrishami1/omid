import { ScoringConfig } from './types';

export const DEFAULT_CONFIG: ScoringConfig = {
  workWeight: 10,      // 10 points per hour
  exerciseWeight: 1,   // 1 point per minute
  studyWeight: 1.5,    // 1.5 points per minute
  phonePenalty: 0.5,   // -0.5 points per minute
  sleepTarget: 8,      // 8 hours ideal
  sleepWeight: 20,     // 20 points bonus for healthy sleep (7-9h)
  dailyTargetScore: 150 // Target score for 100% productivity
};

export const MOCK_HISTORY_LENGTH = 30; // Generate 30 days of mock data