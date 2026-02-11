export interface DailyData {
  id: string;
  date: string; // ISO String YYYY-MM-DD
  jalaliDate: string; // YYYY/MM/DD
  sleepTime: string; // HH:mm
  wakeTime: string; // HH:mm
  sleepHours: number;
  workHours: number;
  exerciseMinutes: number;
  studyMinutes: number;
  phoneMinutes: number;
  weight: number;
  notes: string;
}

export interface CalculatedScore {
  totalScore: number;
  productivityPercentage: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
}

export interface ScoringConfig {
  workWeight: number; // Points per hour
  exerciseWeight: number; // Points per minute
  studyWeight: number; // Points per minute
  phonePenalty: number; // Points deducted per minute
  sleepTarget: number; // Ideal hours
  sleepWeight: number; // Points for hitting target
  dailyTargetScore: number;
}

export type TimeRange = '7d' | '14d' | '30d';

export interface ChartDataPoint {
  date: string;
  score: number;
  productivity: number;
  work: number;
  exercise: number;
  study: number;
  phone: number;
  weight: number;
}